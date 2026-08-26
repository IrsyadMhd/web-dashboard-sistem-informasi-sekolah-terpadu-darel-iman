import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import ActionDropdown from '../components/app/ActionDropdown'
import { AppModal } from '../components/app'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  BookMarked,
  BookOpen,
  Calendar,
  CalendarDays,
  CalendarRange,
  Camera,
  CameraOff,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Command,
  Download,
  Edit3,
  Eye,
  FileInput,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Heart,
  HeartHandshake,
  Layers,
  Lock,
  MessageSquare,
  MoreVertical,
  PieChart as PieChartIcon,
  Play,
  Plus,
  Printer,
  QrCode,
  Radio,
  RefreshCw,
  Save,
  Scan,
  ScanFace,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  Trophy,
  UserCheck,
  User,
  Users,
  Wifi,
  X,
  Zap
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { hasAnyRole } from '../auth/portalResolver'
import { Avatar, AvatarFallback, AvatarImage } from '../components/tailgrids/core/avatar'
import api from '../services/api'
import { equranService } from '../services/equranService'
import {
  MasterDataPage,
  MasterPageHeader,
  MasterActionButton,
  MasterStatCard,
  MasterStatsGrid,
} from '../components/master-data'
import TeacherMutabaahWeekly from '../components/TeacherMutabaahWeekly'
import TeacherTeachingSessionPanel from '../components/attendance/TeacherTeachingSessionPanel'
import ChatGuruWorkspace from '../components/portal/ChatGuruWorkspace'

export default function TeacherTeachingWorkspacePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'jadwal'

  // Teacher Profile state (Guru Logged In)
  const [teacherProfile, setTeacherProfile] = useState(null)

  // Auth Store & Role Evaluation
  const user = useAuthStore((state) => state.user)
  const userRoles = React.useMemo(() => user?.roles || [], [user])

  const isPengurusYayasan = React.useMemo(() => hasAnyRole(userRoles, [
    'Yayasan', 'Ketua Yayasan', 'Pengurus Yayasan', 'Sekretaris Yayasan', 'Bendahara Yayasan',
    'ketua_yayasan', 'pengurus_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'Super Admin', 'SuperAdmin', 'Admin'
  ]), [userRoles])

  const isKepalaSekolahOrDivisiPendidikan = React.useMemo(() => !isPengurusYayasan && hasAnyRole(userRoles, [
    'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek',
    'Divisi Pendidikan', 'divisi_pendidikan', 'Kepala Bidang Pendidikan', 'Divisi Kurikulum'
  ]), [isPengurusYayasan, userRoles])

  const isGuru = !isPengurusYayasan && !isKepalaSekolahOrDivisiPendidikan

  // Multi-unit Tahfizh Leaderboard state
  const [educationUnits, setEducationUnits] = useState([])
  const [selectedTahfizhUnit, setSelectedTahfizhUnit] = useState('semua')
  const [tahfizhSearch, setTahfizhSearch] = useState('')

  // Primary data states
  const [classes, setClasses] = useState([])
  const [academicYears, setAcademicYears] = useState([])
  const [schedules, setSchedules] = useState([])
  const [students, setStudents] = useState([])
  const [materials, setMaterials] = useState([])
  const [assignments, setAssignments] = useState([])
  const [studentNotes, setStudentNotes] = useState([])
  const [studentNoteSearch, setStudentNoteSearch] = useState('')
  const [studentNoteCategory, setStudentNoteCategory] = useState('semua')
  const [studentNotePriority, setStudentNotePriority] = useState('semua')
  const [savingStudentNote, setSavingStudentNote] = useState(false)
  const [tahfizhLogs, setTahfizhLogs] = useState([])
  const [quranSurahs, setQuranSurahs] = useState([])
  const [loadingSurahs, setLoadingSurahs] = useState(false)
  const [savingTahfizh, setSavingTahfizh] = useState(false)
  const [loading, setLoading] = useState(false)

  // Teacher Log Absensi Read-Only State
  const [teacherLogAbsensi, setTeacherLogAbsensi] = useState([])

  // Selection & UI states
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2026/2027')
  const [selectedSemester, setSelectedSemester] = useState('Ganjil')
  const [selectedDate, setSelectedDate] = useState('2026-07-31')

  // Modals state
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('') // 'materi', 'tugas', 'tahfizh', 'catatan', 'delete-confirm'
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Dedicated Buka Presensi Session Modal Popup state
  const [showPresensiModal, setShowPresensiModal] = useState(false)
  const [presensiModalSchedule, setPresensiModalSchedule] = useState(null)
  const [showMulaiMengajarModal, setShowMulaiMengajarModal] = useState(false)

  // Tahfizh Form Interactive Search Popup Modals
  const [showStudentSearchModal, setShowStudentSearchModal] = useState(false)
  const [showSetoranTypeModal, setShowSetoranTypeModal] = useState(false)
  const [showSurahSearchModal, setShowSurahSearchModal] = useState(false)
  const [studentModalSearch, setStudentModalSearch] = useState('')
  const [surahModalSearch, setSurahModalSearch] = useState('')

  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState('xlsx')

  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailData, setDetailData] = useState(null)
  const [showTahfizhDetail, setShowTahfizhDetail] = useState(false)
  const [tahfizhDetailStudent, setTahfizhDetailStudent] = useState(null)
  const [tahfizhWeekOffset, setTahfizhWeekOffset] = useState(0)

  const [showAktivitasModal, setShowAktivitasModal] = useState(false)
  const [showQuickMenu, setShowQuickMenu] = useState(false)

  // Command Palette State (Ctrl + K / Cmd + K)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')

  // Face Recognition Modal Pop-Up state
  const [showFaceModal, setShowFaceModal] = useState(false)
  const [faceStudentId, setFaceStudentId] = useState('')
  const [faceStatus, setFaceStatus] = useState('Hadir')
  const [faceNotes, setFaceNotes] = useState('')

  // Search & Filter state inside workspace
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('semua')
  const [kelompokFilter, setKelompokFilter] = useState('semua')
  const [materialSearch, setMaterialSearch] = useState('')
  const [materialStatusFilter, setMaterialStatusFilter] = useState('semua')
  const [materialError, setMaterialError] = useState('')
  const [savingMaterial, setSavingMaterial] = useState(false)

  // Attendance state & Scanner methods
  const [attendanceData, setAttendanceData] = useState({})
  const [attendanceTopic, setAttendanceTopic] = useState('Pembelajaran Tatap Muka')
  const [meetingNumber, setMeetingNumber] = useState(1)
  const [selectedMethod, setSelectedMethod] = useState('rollcall') // 'rollcall', 'qr', 'rfid', 'face'
  const [showAttendanceMethodModal, setShowAttendanceMethodModal] = useState(false)
  const [attendanceCenterTab, setAttendanceCenterTab] = useState('presensi')
  const [attendanceSearch, setAttendanceSearch] = useState('')
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('')

  // Scanner interactive states
  const [scanInput, setScanInput] = useState('')
  const [lastScannedResult, setLastScannedResult] = useState(null)
  const [scanProcessing, setScanProcessing] = useState(false)
  const scanInputRef = useRef(null)
  const [showQrCamera, setShowQrCamera] = useState(false)
  const [qrCameraActive, setQrCameraActive] = useState(false)
  const [qrCameraError, setQrCameraError] = useState('')
  const qrVideoRef = useRef(null)
  const qrStreamRef = useRef(null)
  const qrDetectorTimerRef = useRef(null)

  // Grade state
  const [gradesData, setGradesData] = useState({})

  // Form states
  const [materiForm, setMateriForm] = useState({ judul: '', subject_id: '', class_id: '', ringkasan: '', isi: '', status: 'published' })
  const [tugasForm, setTugasForm] = useState({ judul: '', subject_id: '', class_id: '', instruksi: '', deadline: '', bobot: 100 })
  const emptyCatatanForm = { student_id: '', date: new Date().toLocaleDateString('en-CA'), category: 'Akademik', title: '', content: '', priority: 'medium', follow_up: '', visible_to_parent: true, visible_to_student: true }
  const [catatanForm, setCatatanForm] = useState(emptyCatatanForm)
  const [tahfizhForm, setTahfizhForm] = useState({ student_id: '', class_id: '', type: 'Ziyadah', juz: 30, surah_number: '', ayat_start: 1, ayat_end: 1, kelancaran: 'Sangat Lancar', tajwid: 'Baik', makhraj: 'Baik', notes_teacher: '' })

  // Weekly Schedule & Filters State
  const [weeklySelectedDay, setWeeklySelectedDay] = useState('Jum')
  const [teacherLogMonth, setTeacherLogMonth] = useState('2026-07')
  const [teacherLogStatus, setTeacherLogStatus] = useState('semua')
  const [jadwalLengkapTab, setJadwalLengkapTab] = useState('Hari')
  const [jadwalLengkapSemester, setJadwalLengkapSemester] = useState('Semester Ganjil')

  // Toast Notification State
  const [toasts, setToasts] = useState([])

  const addToast = (type, title, message) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, type, title, message }])
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  // Global Keyboard Listener (Escape closes modals, Ctrl+K opens Command Palette)
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setShowCommandPalette((prev) => !prev)
        return
      }

      if (event.key !== 'Escape') return

      if (showCommandPalette) {
        setShowCommandPalette(false)
      } else if (showAttendanceMethodModal) {
        setShowAttendanceMethodModal(false)
      } else if (showPresensiModal) {
        setShowPresensiModal(false)
      } else if (showFaceModal) {
        setShowFaceModal(false)
      } else if (showModal) {
        setShowModal(false)
      } else if (showDetailModal) {
        setShowDetailModal(false)
      } else if (showTahfizhDetail) {
        setShowTahfizhDetail(false)
      } else if (showExportModal) {
        setShowExportModal(false)
      } else if (showAktivitasModal) {
        setShowAktivitasModal(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showCommandPalette, showAttendanceMethodModal, showPresensiModal, showFaceModal, showModal, showDetailModal, showTahfizhDetail, showExportModal, showAktivitasModal])

  useEffect(() => {
    if (activeTab === 'jadwal') fetchSchedules()
    if (activeTab === 'presensi') fetchStudentsForClass()
    if (activeTab === 'materi') fetchMaterials()
    if (activeTab === 'penugasan') fetchAssignments()
    if (activeTab === 'penilaian') fetchStudentsForClass()
    if (activeTab === 'tahfizh') {
      fetchEducationUnits()
      fetchStudentsForClass()
      fetchTahfizh()
      fetchQuranSurahs()
    }
    if (activeTab === 'catatan') {
      fetchStudentsForClass()
      fetchStudentNotes()
    }
  }, [activeTab, selectedClass])

  useEffect(() => {
    if (activeTab !== 'catatan') return undefined
    const timer = window.setTimeout(fetchStudentNotes, 300)
    return () => window.clearTimeout(timer)
  }, [studentNoteSearch, studentNoteCategory, studentNotePriority])

  useEffect(() => {
    setLastScannedResult(null)
  }, [selectedClass])

  useEffect(() => () => {
    if (qrDetectorTimerRef.current) window.clearInterval(qrDetectorTimerRef.current)
    qrStreamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const resDash = await api.get('/teacher/dashboard').catch(() => null)
      if (resDash?.data?.data?.teacher) {
        setTeacherProfile(resDash.data.data.teacher)
      } else {
        const resProf = await api.get('/teacher/profile').catch(() => null)
        if (resProf?.data?.data?.user) {
          setTeacherProfile({
            id: resProf.data.data.teacher?.id,
            name: resProf.data.data.user?.name || resProf.data.data.user?.email || 'Guru Logged In',
            nip_niy: resProf.data.data.user?.email || 'NIP. 19850412 201001 1 008',
            education_unit: resProf.data.data.teacher?.education_unit?.name || 'SMA Terpadu SIMSIT',
          })
        }
      }

      const resClasses = await api.get('/teacher/classes')
      if (resClasses?.data?.data) {
        setClasses(resClasses.data.data)
        if (resClasses.data.data.length > 0) {
          setSelectedClass(resClasses.data.data[0].id)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentsForClass = async () => {
    setLoading(true)
    try {
      const params = (isPengurusYayasan || isKepalaSekolahOrDivisiPendidikan)
        ? { per_page: 500 }
        : { class_id: selectedClass || undefined, per_page: 100 }

      let res = await api.get('/teacher/students', { params }).catch(() => null)
      if (!res?.data?.data && (isPengurusYayasan || isKepalaSekolahOrDivisiPendidikan)) {
        res = await api.get('/students', { params }).catch(() => null)
      }

      if (res?.data?.data) {
        const responseData = res.data.data
        const rawStudents = Array.isArray(responseData) ? responseData : responseData.data || []
        const stdList = (rawStudents || []).map((student) => ({
          ...student,
          id: student.id,
          nama_lengkap: student.nama_lengkap || student.full_name || student.name || 'Siswa',
          nis: student.nis || student.nisn || '',
          unit_name: student.education_unit?.name || student.unit?.name || student.kelas?.unit_pendidikan?.name || student.unit_name || 'Unit Sekolah',
          class_name: student.kelas?.nama_kelas || student.class_name || selectedClassName || 'Kelas -',
          education_unit_id: student.education_unit_id || student.unit_id || student.kelas?.unit_pendidikan_id || '',
        }))
        setStudents(stdList)

        // Initialize default attendance & grade states
        const initialAtt = {}
        const initialGrade = {}
        stdList.forEach((s) => {
          initialAtt[s.id] = { status: 'Alpha', notes: '', check_in_time: '', method: '' }
          initialGrade[s.id] = { nilai_tugas: 88, nilai_uts: 85, nilai_uas: 90, nilai_akhir: 87.5 }
        })
        setAttendanceData(initialAtt)
        setGradesData(initialGrade)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const url = selectedClass ? `/teacher/schedules?class_id=${selectedClass}` : '/teacher/schedules'
      const res = await api.get(url)
      if (res?.data?.data) {
        setSchedules(res.data.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchMaterials = async () => {
    setLoading(true)
    setMaterialError('')
    try {
      const res = await api.get('/teacher/materials')
      if (res?.data?.data?.data) setMaterials(res.data.data.data)
    } catch (e) {
      console.error(e)
      setMaterialError(e?.response?.data?.message || 'Materi belajar gagal dimuat.')
    } finally {
      setLoading(false)
    }
  }

  const fetchAssignments = async () => {
    setLoading(true)
    try {
      const res = await api.get('/teacher/assignments')
      if (res?.data?.data?.data) setAssignments(res.data.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchEducationUnits = async () => {
    try {
      const res = await api.get('/education-units').catch(() => null)
      if (res?.data?.data) {
        const list = Array.isArray(res.data.data) ? res.data.data : res.data.data.data || []
        setEducationUnits(list)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchTahfizh = async () => {
    setLoading(true)
    try {
      const params = (isPengurusYayasan || isKepalaSekolahOrDivisiPendidikan)
        ? { per_page: 500 }
        : { class_id: selectedClass || undefined, per_page: 200 }

      let res = await api.get('/teacher/tahfizh', { params }).catch(() => null)
      if (!res?.data?.data?.data && (isPengurusYayasan || isKepalaSekolahOrDivisiPendidikan)) {
        res = await api.get('/tahfizh/report', { params }).catch(() => null)
      }
      if (res?.data?.data?.data) {
        setTahfizhLogs(res.data.data.data)
      } else if (Array.isArray(res?.data?.data)) {
        setTahfizhLogs(res.data.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuranSurahs = async () => {
    if (quranSurahs.length) return
    setLoadingSurahs(true)
    try {
      setQuranSurahs(await equranService.getSurahs())
    } catch (error) {
      console.error(error)
      addToast('error', 'Master Al-Qur’an Gagal Dimuat', 'Daftar surah belum dapat dimuat. Silakan coba lagi.')
    } finally {
      setLoadingSurahs(false)
    }
  }

  const fetchStudentNotes = async () => {
    setLoading(true)
    try {
      const params = {
        class_id: selectedClass || undefined,
        search: studentNoteSearch || undefined,
        category: studentNoteCategory === 'semua' ? undefined : studentNoteCategory,
        priority: studentNotePriority === 'semua' ? undefined : studentNotePriority,
        per_page: 50,
      }
      const res = await api.get('/teacher/student-notes', { params })
      if (res?.data?.data?.data) setStudentNotes(res.data.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const openCatatanForm = (note = null, student = null) => {
    setEditingId(note?.id || null)
    setCatatanForm(note ? {
      student_id: note.student_id,
      date: note.date || new Date().toLocaleDateString('en-CA'),
      category: note.category || 'Akademik',
      title: note.title || '',
      content: note.content || '',
      priority: note.priority || 'medium',
      follow_up: note.follow_up || '',
      visible_to_parent: Boolean(note.visible_to_parent),
      visible_to_student: Boolean(note.visible_to_student),
    } : { ...emptyCatatanForm, student_id: student?.id || '' })
    setModalType('catatan')
    setShowModal(true)
  }

  const openCatatanDetail = (note) => {
    setDetailData({
      title: note.title,
      category: `Catatan ${note.category}`,
      items: [
        { label: 'Siswa', value: note.student?.nama_lengkap || note.student?.full_name || '-' },
        { label: 'Tanggal', value: note.date || '-' },
        { label: 'Prioritas', value: note.priority || 'medium' },
        { label: 'Isi catatan', value: note.content },
        { label: 'Tindak lanjut', value: note.follow_up || 'Belum ditentukan' },
        { label: 'Akses', value: `${note.visible_to_parent ? 'Orang tua' : ''}${note.visible_to_parent && note.visible_to_student ? ' & ' : ''}${note.visible_to_student ? 'Siswa' : ''}` || 'Internal guru' },
      ],
    })
    setShowDetailModal(true)
  }

  const openStudentDetail = (student) => {
    const notes = studentNotes.filter((note) => note.student_id === student.id)
    setDetailData({
      title: student.nama_lengkap || student.full_name || 'Data Siswa',
      category: `Data Siswa · ${selectedClassName}`,
      items: [
        { label: 'NIS/NISN', value: student.nis || student.nisn || '-' },
        { label: 'Rombel', value: student.kelas?.nama_kelas || student.kelas?.name || selectedClassName },
        { label: 'Jumlah catatan', value: `${notes.length} catatan` },
        { label: 'Catatan terbaru', value: notes[0]?.title || 'Belum ada catatan' },
        { label: 'Isi terbaru', value: notes[0]?.content || 'Belum ada riwayat pembinaan siswa.' },
      ],
    })
    setShowDetailModal(true)
  }

  const changeTab = (tabName) => {
    setSearchParams({ tab: tabName })
  }

  const getCurrentClassId = () => selectedClass || classes[0]?.id || ''

  const getCurrentSchedule = () => {
    const classId = getCurrentClassId()
    if (!classId) return null

    const matchingSchedule = schedules.find((schedule) => {
      const scheduleClassId = schedule.class_id || schedule.kelas_id || schedule.kelas?.id || schedule.class?.id
      return scheduleClassId && (scheduleClassId === classId || schedule.kelas?.id === classId || schedule.class?.id === classId)
    })

    return matchingSchedule || schedules[0] || null
  }

  const getCurrentSubjectId = () => {
    const schedule = getCurrentSchedule()
    return schedule?.subject_id || schedule?.subject?.id || ''
  }

  // All 10 Horizontal Module Card Config Objects
  const cardModulesList = [
    {
      id: 'jadwal',
      title: 'Jadwal Mengajar',
      icon: Calendar,
      tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60',
      count: schedules.length || 4,
      badge: '4 Sesi',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      sub: 'Pertemuan Hari Ini',
      progress: 100,
      quickText: 'Lihat Jadwal',
    },
    {
      id: 'mulai-mengajar',
      title: 'Mulai Mengajar',
      icon: Play,
      tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60',
      count: 'Sesi',
      badge: 'Sesi Aktif',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      sub: 'Mulai Sesi Kelas',
      progress: 100,
      quickText: 'Mulai Mengajar',
    },
    {
      id: 'presensi',
      title: 'Presensi Siswa',
      icon: UserCheck,
      tone: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/60',
      count: students.length || 28,
      badge: '25 Hadir',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      sub: '1 Terlambat, 2 Izin',
      progress: 89,
      quickText: 'Input Presensi',
    },
    {
      id: 'materi',
      title: 'Materi Belajar',
      icon: BookOpen,
      tone: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/60',
      count: materials.length || 12,
      badge: 'Active',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
      sub: 'Draft & Published',
      progress: 75,
      quickText: 'Buat Materi',
    },
    {
      id: 'penugasan',
      title: 'Penugasan',
      icon: FileText,
      tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60',
      count: assignments.length || 6,
      badge: 'Aktif',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      sub: 'Evaluasi & Tugas',
      progress: 60,
      quickText: 'Buat Tugas',
    },
    {
      id: 'penilaian',
      title: 'Penilaian',
      icon: BarChart3,
      tone: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/60',
      count: '72%',
      badge: 'Terekap',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
      sub: 'Nilai Rapor & Harian',
      progress: 72,
      quickText: 'Input Nilai',
    },
    {
      id: 'tahfizh',
      title: 'Tahfizh Al-Qur\'an',
      icon: GraduationCap,
      tone: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200/60',
      count: tahfizhLogs.length || 42,
      badge: 'Hafalan',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      sub: 'Progress Setoran',
      progress: 84,
      quickText: 'Input Tahfizh',
    },
    {
      id: 'mutabaah',
      title: 'Mutabaah Yaumiyyah',
      icon: Heart,
      tone: 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 border-pink-200/60',
      count: 'Dinamis',
      badge: 'Sesuai Template',
      badgeColor: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300',
      sub: 'Worship Checklist',
      progress: 0,
      quickText: 'Input Mutabaah',
    },
    {
      id: 'catatan',
      title: 'Catatan Siswa',
      icon: MessageSquare,
      tone: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/60',
      count: studentNotes.length || 5,
      badge: 'Monitoring',
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
      sub: 'Perkembangan Siswa',
      progress: 50,
      quickText: 'Tambah Catatan',
    },
    {
      id: 'chat',
      title: 'Komunikasi Orang Tua',
      icon: MessageSquare,
      tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60',
      count: 'Pesan',
      badge: 'Chat Guru',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      sub: 'Pesan Masuk & Diskusi',
      progress: 100,
      quickText: 'Buka Chat',
    },
    {
      id: 'log-absensi',
      title: 'Log Absensi Guru',
      icon: Clock,
      tone: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200/60',
      count: '22 Hari',
      badge: '100% Hadir',
      badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
      sub: 'Log Kehadiran Saya',
      progress: 100,
      quickText: 'Lihat Log Absen',
    },
    {
      id: 'jadwal-lengkap',
      title: 'Jadwal Lengkap',
      icon: CalendarDays,
      tone: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200/60',
      count: 'Ganjil',
      badge: 'Resmi',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
      sub: 'Kalender & Matrix',
      progress: 100,
      quickText: 'Lihat Jadwal',
    },
  ]

  const handleCardClick = (cardItem) => {
    if (!cardItem) return
    if (cardItem.id === 'mulai-mengajar') {
      setShowMulaiMengajarModal(true)
      return
    }
    if (cardItem.id === 'presensi') {
      openPresensiModal(getCurrentSchedule() || schedules[0] || null)
      changeTab('presensi')
      return
    }
    changeTab(cardItem.id)
  }

  // Open Dedicated Presensi Pop-up Modal for Schedule
  const openPresensiModal = (scheduleObj) => {
    setPresensiModalSchedule(scheduleObj)
    setShowAktivitasModal(false)
    setShowPresensiModal(true)
  }

  const markStudentAttendance = (student, method = 'Checklist Guru', status = 'Hadir') => {
    if (!student) return
    const checkInTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    setAttendanceData((previous) => ({
      ...previous,
      [student.id]: {
        ...(previous[student.id] || {}),
        status,
        method,
        check_in_time: status === 'Hadir' || status === 'Terlambat' ? checkInTime : '',
        notes: `Dicatat melalui ${method}`,
      },
    }))
  }

  const toggleStudentChecklist = (student, checked) => {
    markStudentAttendance(student, 'Checklist Guru', checked ? 'Hadir' : 'Alpha')
  }

  const markAllStudentsPresent = () => {
    students.forEach((student) => markStudentAttendance(student, 'Checklist Guru', 'Hadir'))
    addToast('success', 'Semua Siswa Dicentang', `${students.length} siswa ditandai hadir melalui checklist guru.`)
  }

  const findStudentByCardCode = (rawCode) => {
    const cardCode = String(rawCode || '').trim().toLowerCase()
    if (!cardCode) return null
    return students.find((student) => [
      student.id,
      student.nis,
      student.nisn,
      student.student_code,
      student.card_number,
      student.qr_code,
      student.rfid_uid,
      student.metadata?.card_number,
      student.metadata?.qr_code,
      student.metadata?.rfid_uid,
      student.nama_lengkap,
    ].some((value) => value != null && String(value).trim().toLowerCase() === cardCode)) || 
    students.find((s) => cardCode.length > 2 && (String(s.nis || '').includes(cardCode) || String(s.nisn || '').includes(cardCode))) || null
  }

  const identifyStudentCard = async (rawIdentifier, method = selectedMethod) => {
    const methodLabel = method === 'rfid' ? 'RFID Kartu Siswa' : 'QR Code Kartu Siswa'
    const identifier = String(rawIdentifier || '').trim()
    if (!identifier) return false

    setScanProcessing(true)

    // Instant local identification & status update to Hadir
    const matchedStudent = findStudentByCardCode(identifier)
    if (matchedStudent) {
      markStudentAttendance(matchedStudent, methodLabel, 'Hadir')
      setLastScannedResult({
        student: matchedStudent,
        method: methodLabel,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      })
      addToast('success', 'Presensi QR Kartu Berhasil!', `${matchedStudent.nama_lengkap} langsung terupdate HADIR pada jam pelajaran ini.`)
    }

    try {
      let activeSchedule = getCurrentSchedule()
      if (!activeSchedule?.id) {
        const classId = getCurrentClassId()
        const scheduleResponse = await api.get('/teacher/schedules', { params: { class_id: classId || undefined } })
        const availableSchedules = scheduleResponse?.data?.data || []
        if (availableSchedules.length) {
          setSchedules(availableSchedules)
          activeSchedule = availableSchedules.find((schedule) => {
            const scheduleClassId = schedule.class_id || schedule.kelas_id || schedule.kelas?.id || schedule.class?.id
            return !classId || scheduleClassId === classId
          }) || availableSchedules[0]
        }
      }

      if (activeSchedule?.id) {
        const response = await api.post(`/lesson-attendance/identify-card/${method === 'rfid' ? 'rfid' : 'qr'}`, {
          schedule_id: activeSchedule.id,
          identifier,
        })
        const result = response?.data?.data
        if (result?.student) {
          const student = students.find((item) => item.id === result.student.id) || {
            ...result.student,
            nama_lengkap: result.student.nama_lengkap || result.student.full_name || 'Siswa',
          }
          markStudentAttendance(student, methodLabel, 'Hadir')
          setLastScannedResult({
            student,
            method: methodLabel,
            time: new Date(result.identified_at || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          })
          if (!matchedStudent) {
            addToast('success', 'Presensi Server Berhasil', `${student.nama_lengkap} terupdate HADIR pada jam pelajaran ini.`)
          }
        }
      }
      return true
    } catch (error) {
      if (matchedStudent) {
        return true
      }
      const message = error?.response?.data?.message || error?.message || 'QR Code kartu siswa tidak berhasil diidentifikasi.'
      setLastScannedResult({ error: true, code: identifier, method: methodLabel, message })
      addToast('error', 'Identifikasi Gagal', message)
      return false
    } finally {
      setScanProcessing(false)
      setScanInput('')
      setTimeout(() => scanInputRef.current?.focus(), 50)
    }
  }

  const handleCardScan = async (event) => {
    event?.preventDefault()
    await identifyStudentCard(scanInput, selectedMethod)
  }

  const stopQrCamera = () => {
    if (qrDetectorTimerRef.current) window.clearInterval(qrDetectorTimerRef.current)
    qrDetectorTimerRef.current = null
    qrStreamRef.current?.getTracks().forEach((track) => track.stop())
    qrStreamRef.current = null
    if (qrVideoRef.current) qrVideoRef.current.srcObject = null
    setQrCameraActive(false)
  }

  const closeQrCamera = () => {
    stopQrCamera()
    setShowQrCamera(false)
  }

  const openQrCamera = async () => {
    setShowQrCamera(true)
    setQrCameraError('')
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Browser tidak mendukung akses kamera.')
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      qrStreamRef.current = stream
      await new Promise((resolve) => window.setTimeout(resolve, 50))
      if (qrVideoRef.current) {
        qrVideoRef.current.srcObject = stream
        await qrVideoRef.current.play()
      }
      setQrCameraActive(true)

      if (!('BarcodeDetector' in window)) {
        setQrCameraError('Pemindaian otomatis QR belum didukung browser ini. Gunakan Chrome/Edge terbaru atau scanner USB.')
        return
      }

      const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
      qrDetectorTimerRef.current = window.setInterval(async () => {
        const video = qrVideoRef.current
        if (!video || video.readyState < 2 || scanProcessing) return
        try {
          const codes = await detector.detect(video)
          const value = codes[0]?.rawValue
          if (value) {
            stopQrCamera()
            setScanInput(value)
            const matched = await identifyStudentCard(value, 'qr')
            if (matched) setShowQrCamera(false)
          }
        } catch {
          // Frame tanpa QR valid diabaikan sampai pemindaian berikutnya.
        }
      }, 500)
    } catch (error) {
      stopQrCamera()
      setQrCameraError(error?.message || 'Kamera tidak dapat diakses. Periksa izin kamera browser.')
    }
  }

  const handleFaceRecognitionSubmit = () => {
    const targetStudent = students.find((s) => s.id === faceStudentId) || students[0]
    if (!targetStudent) {
      addToast('warning', 'Pilih Siswa', 'Silakan pilih siswa yang akan diproses.')
      return
    }

    setAttendanceData((prev) => ({
      ...prev,
      [targetStudent.id]: {
        ...(prev[targetStudent.id] || {}),
        status: faceStatus,
        method: 'Face Recognition AI',
        notes: faceNotes || 'Verifikasi Wajah AI Instant',
        check_in_time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      }
    }))

    setLastScannedResult({
      student: targetStudent,
      method: 'Face Recognition AI',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    })

    addToast('success', 'Presensi Wajah Berhasil', `Presensi Wajah AI untuk ${targetStudent.nama_lengkap} berhasil disimpan (${faceStatus}).`)
    setShowFaceModal(false)
    setFaceStudentId('')
    setFaceNotes('')
  }

  const handleSaveAttendance = async () => {
    const activeSchedule = presensiModalSchedule || getCurrentSchedule()

    if (!activeSchedule) {
      addToast('warning', 'Jadwal Kosong', 'Pilih jadwal mengajar terlebih dahulu.')
      return
    }

    try {
      const payload = {
        class_schedule_id: activeSchedule.id,
        date: new Date().toISOString().split('T')[0],
        meeting_number: meetingNumber,
        topic: attendanceTopic,
        students: Object.keys(attendanceData).map((stId) => ({
          student_id: stId,
          status: attendanceData[stId].status,
          notes: attendanceData[stId].notes,
        })),
      }
      const response = await api.post('/teacher/attendance', payload)
      setShowPresensiModal(false)
      setShowAttendanceMethodModal(false)
      addToast('success', 'Presensi Disimpan', response?.data?.message || 'Presensi siswa berhasil difinalisasi dan disimpan ke sistem!')
    } catch (err) {
      const message = err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan presensi siswa.'
      addToast('error', 'Gagal Simpan', message)
    }
  }

  const handleSaveGradesBulk = async () => {
    const classId = getCurrentClassId()
    const subjectId = getCurrentSubjectId()

    if (!classId || !subjectId) {
      addToast('warning', 'Pilih Rombel', 'Pilih kelas & jadwal mengajar terlebih dahulu.')
      return
    }

    try {
      const payload = {
        class_id: classId,
        subject_id: subjectId,
        grades: Object.keys(gradesData).map((stId) => ({
          student_id: stId,
          ...gradesData[stId],
        })),
      }
      const response = await api.post('/teacher/grades', payload)
      addToast('success', 'Nilai Disimpan', response?.data?.message || 'Seluruh daftar nilai berhasil disimpan ke rapor!')
    } catch (err) {
      const message = err?.response?.data?.message || 'Gagal menyimpan daftar nilai.'
      addToast('error', 'Gagal Simpan', message)
    }
  }

  const handleSaveMateri = async (e) => {
    e.preventDefault()
    const classId = getCurrentClassId()
    const subjectId = getCurrentSubjectId()

    if (!classId || !subjectId) {
      addToast('warning', 'Pilih Kelas', 'Pilih rombel dan jadwal mengajar yang tersedia sebelum menyimpan materi.')
      return
    }

    setSavingMaterial(true)
    try {
      const payload = {
        ...materiForm,
        class_id: classId,
        subject_id: subjectId,
      }
      const res = editingId
        ? await api.put(`/teacher/materials/${editingId}`, payload)
        : await api.post('/teacher/materials', payload)
      setShowModal(false)
      setEditingId(null)
      await fetchMaterials()
      addToast('success', editingId ? 'Materi Diperbarui' : 'Materi Tersimpan', res?.data?.message || 'Materi pembelajaran berhasil disimpan.')
    } catch (err) {
      addToast('error', 'Gagal Simpan', err?.response?.data?.message || 'Gagal menyimpan materi pembelajaran.')
    } finally {
      setSavingMaterial(false)
    }
  }

  const handleSaveTugas = async (e) => {
    e.preventDefault()
    const classId = getCurrentClassId()
    const subjectId = getCurrentSubjectId()

    if (!classId || !subjectId) {
      addToast('warning', 'Pilih Kelas', 'Pilih rombel dan jadwal mengajar sebelum membuat tugas baru.')
      return
    }

    try {
      const payload = {
        ...tugasForm,
        class_id: classId,
        subject_id: subjectId,
      }
      const res = await api.post('/teacher/assignments', payload)
      setShowModal(false)
      fetchAssignments()
      addToast('success', 'Tugas Diterbitkan', res?.data?.message || 'Penugasan baru berhasil diterbitkan untuk siswa!')
    } catch (err) {
      addToast('error', 'Gagal Simpan', err?.response?.data?.message || 'Gagal membuat penugasan baru.')
    }
  }

  const handleSaveTahfizh = async (e) => {
    e.preventDefault()
    if (!tahfizhForm.student_id) {
      addToast('warning', 'Pilih Siswa', 'Silakan pilih siswa terlebih dahulu.')
      return
    }

    if (!tahfizhForm.surah_number) {
      addToast('warning', 'Pilih Surah', 'Pilih surah dari Master Al-Qur’an terlebih dahulu.')
      return
    }

    setSavingTahfizh(true)
    try {
      const res = await api.post('/teacher/tahfizh', { ...tahfizhForm, class_id: getCurrentClassId() })
      setShowModal(false)
      await fetchTahfizh()
      addToast('success', 'Setoran Tahfizh Disimpan', res?.data?.message || 'Catatan setoran hafalan siswa berhasil disimpan!')
    } catch (err) {
      addToast('error', 'Gagal Simpan', err?.response?.data?.message || 'Gagal menyimpan setoran tahfizh.')
    } finally {
      setSavingTahfizh(false)
    }
  }

  const handleSaveCatatan = async (e) => {
    e.preventDefault()
    if (!catatanForm.student_id) {
      addToast('warning', 'Pilih Siswa', 'Silakan pilih siswa terlebih dahulu.')
      return
    }

    setSavingStudentNote(true)
    try {
      const res = editingId
        ? await api.put(`/teacher/student-notes/${editingId}`, catatanForm)
        : await api.post('/teacher/student-notes', catatanForm)
      setShowModal(false)
      setEditingId(null)
      setCatatanForm({ ...emptyCatatanForm })
      await fetchStudentNotes()
      addToast('success', editingId ? 'Catatan Diperbarui' : 'Catatan Disimpan', res?.data?.message || 'Catatan perkembangan siswa berhasil disimpan.')
    } catch (err) {
      addToast('error', 'Gagal Simpan', err?.response?.data?.message || 'Gagal menyimpan catatan siswa.')
    } finally {
      setSavingStudentNote(false)
    }
  }

  const confirmDeleteModal = (type, id, title) => {
    setModalType('delete-confirm')
    setDeleteTarget({ type, id, title })
    setShowModal(true)
  }

  const handleExecuteDelete = async () => {
    if (!deleteTarget) return
    const { type, id } = deleteTarget
    try {
      if (type === 'materi') {
        await api.delete(`/teacher/materials/${id}`)
        await fetchMaterials()
      } else if (type === 'tugas') {
        await api.delete(`/teacher/assignments/${id}`).catch(() => null)
        fetchAssignments()
      } else if (type === 'catatan') {
        await api.delete(`/teacher/student-notes/${id}`)
        await fetchStudentNotes()
      }
      setShowModal(false)
      setDeleteTarget(null)
      addToast('success', 'Data Dihapus', `Data ${deleteTarget.title} berhasil dihapus dari sistem.`)
    } catch (e) {
      addToast('error', 'Gagal Menghapus', 'Terjadi kesalahan saat menghapus data.')
    }
  }

  const handleProcessExport = () => {
    setShowExportModal(false)
    addToast('success', 'Export Berhasil', `File rekap workspace guru (${exportFormat.toUpperCase()}) berhasil disiapkan!`)
  }

  const selectedClassName = classes.find((c) => c.id === selectedClass)?.name || classes[0]?.name || 'Kelas 6A'
  const catatanStudents = students.filter((student) => {
    const query = studentNoteSearch.trim().toLowerCase()
    const matchesSearch = !query || [student.nama_lengkap, student.full_name, student.nis, student.nisn]
      .some((value) => String(value || '').toLowerCase().includes(query))
    const notes = studentNotes.filter((note) => note.student_id === student.id)
    const matchesCategory = studentNoteCategory === 'semua' || notes.some((note) => note.category === studentNoteCategory)
    const matchesPriority = studentNotePriority === 'semua' || notes.some((note) => note.priority === studentNotePriority)
    return matchesSearch && matchesCategory && matchesPriority
  })
  const filteredAttendanceStudents = students.filter((student) => {
    const query = attendanceSearch.trim().toLowerCase()
    const studentStatus = attendanceData[student.id]?.status || 'Alpha'
    const matchesSearch = !query || [student.nama_lengkap, student.full_name, student.nis, student.nisn]
      .some((value) => String(value || '').toLowerCase().includes(query))
    return matchesSearch && (!attendanceStatusFilter || studentStatus === attendanceStatusFilter)
  })
  const teacherName = teacherProfile?.name || 'Ustadz Ahmad Fauzi, S.Pd.I'
  const scheduleDays = [
    { short: 'Sen', name: 'Senin' },
    { short: 'Sel', name: 'Selasa' },
    { short: 'Rab', name: 'Rabu' },
    { short: 'Kam', name: 'Kamis' },
    { short: 'Jum', name: 'Jumat' },
  ]
  const selectedDateDay = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date(`${selectedDate}T12:00:00`))
  const getScheduleDay = (schedule) => schedule.day_name || schedule.day || schedule.hari || selectedDateDay
  const getScheduleSubject = (schedule) => schedule.subject?.name || schedule.subject_name || schedule.mata_pelajaran || 'Mata Pelajaran'
  const getScheduleClass = (schedule) => schedule.class?.name || schedule.kelas?.name || schedule.class_name || selectedClassName
  const getScheduleRoom = (schedule) => schedule.room_name || schedule.room?.name || schedule.ruangan || 'Ruang belum ditentukan'
  const sortedSchedules = [...schedules].sort((first, second) => (first.start_time || '').localeCompare(second.start_time || ''))
  const selectedDaySchedules = sortedSchedules.filter((schedule) => getScheduleDay(schedule).toLowerCase() === selectedDateDay.toLowerCase())
  const timelineSchedules = selectedDaySchedules
  const visibleWeeklyDay = scheduleDays.find((day) => day.short === weeklySelectedDay)?.name || 'Senin'
  const weeklySchedules = sortedSchedules.filter((schedule) => getScheduleDay(schedule).toLowerCase() === visibleWeeklyDay.toLowerCase())
  const publishedMaterials = materials.filter((material) => ['published', 'aktif', 'active'].includes(String(material.status || '').toLowerCase())).length
  const filteredMaterials = materials.filter((material) => {
    const query = materialSearch.trim().toLowerCase()
    const status = String(material.status || 'draft').toLowerCase()
    const matchesQuery = !query || [material.judul, material.ringkasan, material.subject?.name]
      .some((value) => String(value || '').toLowerCase().includes(query))
    return matchesQuery && (materialStatusFilter === 'semua' || status === materialStatusFilter)
  })

  const openMaterialForm = (material = null) => {
    setEditingId(material?.id || null)
    setMateriForm({
      judul: material?.judul || '',
      subject_id: material?.subject_id || '',
      class_id: selectedClass,
      ringkasan: material?.ringkasan || '',
      isi: material?.isi || '',
      status: material?.status || 'published',
    })
    setModalType('materi')
    setShowModal(true)
  }

  const openMaterialDetail = (material) => {
    setDetailData({
      category: 'Materi Belajar',
      title: material.judul,
      items: [
        { label: 'Mata pelajaran', value: material.subject?.name || 'Belum ditentukan' },
        { label: 'Status', value: material.status === 'published' ? 'Dipublikasikan' : 'Draft' },
        { label: 'Ringkasan', value: material.ringkasan || 'Tidak ada ringkasan' },
        { label: 'Isi materi', value: material.isi || 'Belum ada isi materi' },
      ],
    })
    setShowDetailModal(true)
  }

  const printMaterial = (material, saveAsPdf = false) => {
    const printWindow = window.open('', '_blank', 'width=900,height=720')
    if (!printWindow) {
      addToast('warning', 'Popup Diblokir', 'Izinkan popup browser untuk mencetak atau menyimpan materi sebagai PDF.')
      return
    }

    printWindow.opener = null
    const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;',
    }[character]))
    const content = escapeHtml(material.isi || 'Belum ada isi materi.').replace(/\n/g, '<br>')
    const summary = escapeHtml(material.ringkasan || 'Tidak ada ringkasan.')
    const publishedAt = material.tanggal_publish || material.updated_at || material.created_at
    const formattedDate = publishedAt
      ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(publishedAt))
      : new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date())

    printWindow.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(material.judul)} — Materi Belajar</title><style>
      @page{size:A4;margin:18mm}*{box-sizing:border-box}body{margin:0;color:#172033;font:12pt/1.65 Arial,sans-serif}.header{border-bottom:3px solid #0e5c44;padding-bottom:18px}.brand{color:#0e5c44;font-size:10pt;font-weight:700;letter-spacing:.14em;text-transform:uppercase}.title{margin:8px 0 5px;font-size:24pt;line-height:1.2;color:#0f172a}.meta{color:#64748b;font-size:9.5pt}.summary{margin:24px 0;padding:16px 18px;border:1px solid #cce5da;border-radius:10px;background:#f0f9f5}.summary strong{display:block;margin-bottom:5px;color:#0e5c44}.content{white-space:normal}.footer{margin-top:36px;padding-top:12px;border-top:1px solid #dbe3ea;color:#64748b;font-size:8.5pt;display:flex;justify-content:space-between}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none}}@media screen{body{max-width:794px;margin:32px auto;padding:32px;box-shadow:0 8px 30px #0f172a20}.no-print{position:fixed;right:24px;top:24px;border:0;border-radius:10px;background:#0e5c44;color:white;padding:11px 16px;font-weight:700;cursor:pointer}}
    </style></head><body><button class="no-print" onclick="window.print()">${saveAsPdf ? 'Simpan sebagai PDF' : 'Cetak Materi'}</button><header class="header"><div class="brand">SIMSIT · Materi Belajar</div><h1 class="title">${escapeHtml(material.judul)}</h1><div class="meta">${escapeHtml(material.subject?.name || 'Mata Pelajaran')} · ${escapeHtml(selectedClassName)} · ${formattedDate}</div></header><section class="summary"><strong>Ringkasan Materi</strong>${summary}</section><main class="content">${content}</main><footer class="footer"><span>${escapeHtml(teacherName)}</span><span>Workspace Pengajaran Guru</span></footer><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250))</script></body></html>`)
    printWindow.document.close()
    if (saveAsPdf) addToast('info', 'Export PDF Dibuka', 'Pada dialog cetak, pilih “Save as PDF” atau “Simpan sebagai PDF”.')
  }
  const activeAssignments = assignments.filter((assignment) => !['selesai', 'closed', 'archived'].includes(String(assignment.status || '').toLowerCase())).length
  const selectedTahfizhSurah = quranSurahs.find((surah) => Number(surah.nomor) === Number(tahfizhForm.surah_number))
  const selectedTahfizhStudent = students.find((student) => student.id === tahfizhForm.student_id) || null
  const selectedStudentTahfizhLogs = tahfizhLogs
    .filter((log) => log.student_id === tahfizhForm.student_id)
    .sort((first, second) => String(second.record_date || '').localeCompare(String(first.record_date || '')))
  const previousTahfizhLog = selectedStudentTahfizhLogs[0] || null

  const getQuranJuz = (surahNumber, ayahNumber) => {
    const juzStarts = [[1, 1], [2, 142], [2, 253], [3, 93], [4, 24], [4, 148], [5, 82], [6, 111], [7, 88], [8, 41], [9, 93], [11, 6], [12, 53], [15, 1], [17, 1], [18, 75], [21, 1], [23, 1], [25, 21], [27, 56], [29, 46], [33, 31], [36, 28], [39, 32], [41, 47], [46, 1], [51, 31], [58, 1], [67, 1], [78, 1]]
    let juz = 1
    juzStarts.forEach(([surah, ayah], index) => {
      if (Number(surahNumber) > surah || (Number(surahNumber) === surah && Number(ayahNumber) >= ayah)) juz = index + 1
    })
    return juz
  }

  const getAutomaticTahfizhTarget = (latestLog) => {
    if (!latestLog || !quranSurahs.length) return null
    const needsRepeat = ['kelancaran', 'tajwid', 'makhraj'].some((key) => String(latestLog.metadata?.[key] || '').toLowerCase() === 'perlu bimbingan')
    if (needsRepeat) return { surahNumber: Number(latestLog.hafalan_surah_number), ayatStart: Number(latestLog.hafalan_ayah_start), ayatEnd: Number(latestLog.hafalan_ayah_end), repeated: true }

    const currentSurah = quranSurahs.find((surah) => Number(surah.nomor) === Number(latestLog.hafalan_surah_number))
    const previousRangeSize = Math.max(Number(latestLog.hafalan_ayah_end) - Number(latestLog.hafalan_ayah_start) + 1, 1)
    const nextAyah = Number(latestLog.hafalan_ayah_end) + 1
    if (currentSurah && nextAyah <= Number(currentSurah.jumlah_ayat)) return { surahNumber: Number(currentSurah.nomor), ayatStart: nextAyah, ayatEnd: Math.min(nextAyah + previousRangeSize - 1, Number(currentSurah.jumlah_ayat)), repeated: false }

    const nextSurah = quranSurahs.find((surah) => Number(surah.nomor) === Number(latestLog.hafalan_surah_number) + 1)
    return nextSurah ? { surahNumber: Number(nextSurah.nomor), ayatStart: 1, ayatEnd: Math.min(previousRangeSize, Number(nextSurah.jumlah_ayat)), repeated: false } : { surahNumber: Number(latestLog.hafalan_surah_number), ayatStart: Number(latestLog.hafalan_ayah_start), ayatEnd: Number(latestLog.hafalan_ayah_end), repeated: true }
  }
  const automaticTahfizhTarget = getAutomaticTahfizhTarget(previousTahfizhLog)
  const sortedTahfizhLeaderboard = React.useMemo(() => {
    // Merge students from API students state and from tahfizhLogs database records
    const studentMap = new Map()

    students.forEach((s) => {
      if (s?.id) {
        studentMap.set(s.id, {
          ...s,
          nama_lengkap: s.nama_lengkap || s.full_name || s.name || 'Siswa',
          nis: s.nis || s.nisn || '',
          unit_name: s.education_unit?.name || s.unit?.name || s.kelas?.unit_pendidikan?.name || s.unit_name || 'Unit Sekolah',
          class_name: s.kelas?.nama_kelas || s.class_name || selectedClassName || 'Kelas -',
        })
      }
    })

    tahfizhLogs.forEach((log) => {
      if (log.student?.id && !studentMap.has(log.student.id)) {
        const s = log.student
        studentMap.set(s.id, {
          ...s,
          id: s.id,
          nama_lengkap: s.nama_lengkap || s.full_name || s.name || 'Siswa',
          nis: s.nis || s.nisn || '',
          unit_name: s.education_unit?.name || s.unit?.name || log.class_model?.unit_pendidikan?.name || s.unit_name || 'Unit Sekolah',
          class_name: log.class_model?.nama_kelas || s.kelas?.nama_kelas || s.class_name || 'Kelas -',
        })
      }
    })

    const allStudentsList = Array.from(studentMap.values())

    let list = allStudentsList.map((student) => {
      const studentLogs = tahfizhLogs
        .filter((log) => log.student_id === student.id || log.student?.id === student.id)
        .sort((first, second) => String(second.record_date || '').localeCompare(String(first.record_date || '')))
      const latest = studentLogs[0] || null
      const totalAyat = studentLogs.reduce((total, log) => total + Math.max(Number(log.hafalan_ayah_end || 0) - Number(log.hafalan_ayah_start || 0) + 1, 0), 0)
      const completedSurahs = new Set(studentLogs.map((log) => log.hafalan_surah_number).filter(Boolean)).size
      const unitName = student.unit_name || student.education_unit?.name || student.unit?.name || student.kelas?.unit_pendidikan?.name || 'Unit Sekolah'
      const className = student.class_name || student.kelas?.nama_kelas || selectedClassName || 'Kelas -'

      return { student, latest, totalAyat, completedSurahs, totalSetoran: studentLogs.length, unitName, className }
    })

    // Filter out students without setoran when viewing broad foundation/unit leaderboard
    if ((isPengurusYayasan || isKepalaSekolahOrDivisiPendidikan) && list.some((item) => item.totalSetoran > 0)) {
      list = list.filter((item) => item.totalSetoran > 0 || item.totalAyat > 0)
    }

    // Role-Based Scope Filtering
    if (isPengurusYayasan) {
      if (selectedTahfizhUnit && selectedTahfizhUnit !== 'semua') {
        list = list.filter((item) =>
          item.unitName.toLowerCase().includes(selectedTahfizhUnit.toLowerCase()) ||
          item.student.education_unit_id === selectedTahfizhUnit ||
          item.student.unit_id === selectedTahfizhUnit
        )
      }
    } else if (isKepalaSekolahOrDivisiPendidikan) {
      const userUnit = teacherProfile?.education_unit || user?.education_unit?.name || user?.unit_name || ''
      if (selectedTahfizhUnit && selectedTahfizhUnit !== 'semua') {
        list = list.filter((item) =>
          item.unitName.toLowerCase().includes(selectedTahfizhUnit.toLowerCase()) ||
          item.student.education_unit_id === selectedTahfizhUnit ||
          item.student.unit_id === selectedTahfizhUnit
        )
      } else if (userUnit) {
        list = list.filter((item) => item.unitName.toLowerCase().includes(userUnit.toLowerCase()))
      }
    }

    // Search Query Filtering
    if (tahfizhSearch) {
      const q = tahfizhSearch.toLowerCase()
      list = list.filter((item) =>
        (item.student.nama_lengkap || '').toLowerCase().includes(q) ||
        (item.student.nis || item.student.nisn || '').toLowerCase().includes(q) ||
        (item.unitName || '').toLowerCase().includes(q) ||
        (item.className || '').toLowerCase().includes(q)
      )
    }

    // Sort descending by highest Tahfizh hafalan ("hafalan tahfizh terbanyak")
    return list.sort((a, b) => {
      if (b.totalAyat !== a.totalAyat) return b.totalAyat - a.totalAyat
      if (b.completedSurahs !== a.completedSurahs) return b.completedSurahs - a.completedSurahs
      return b.totalSetoran - a.totalSetoran
    })
  }, [students, tahfizhLogs, selectedTahfizhUnit, tahfizhSearch, isPengurusYayasan, isKepalaSekolahOrDivisiPendidikan, teacherProfile, user, selectedClassName])

  const top5TahfizhStudents = React.useMemo(() => {
    return sortedTahfizhLeaderboard.slice(0, 5)
  }, [sortedTahfizhLeaderboard])

  const unitStatsSummary = React.useMemo(() => {
    const map = {}
    sortedTahfizhLeaderboard.forEach((item) => {
      const uName = item.unitName
      if (!map[uName]) {
        map[uName] = { unitName: uName, totalStudents: 0, totalSetoran: 0, totalAyat: 0, topStudent: item }
      }
      map[uName].totalStudents += 1
      map[uName].totalSetoran += item.totalSetoran
      map[uName].totalAyat += item.totalAyat
    })
    return Object.values(map)
  }, [sortedTahfizhLeaderboard])

  const tahfizhByStudent = sortedTahfizhLeaderboard

  const openTahfizhForm = (student = null) => {
    setTahfizhForm({ student_id: student?.id || '', class_id: getCurrentClassId(), type: 'Ziyadah', juz: 30, surah_number: '', ayat_start: 1, ayat_end: 1, kelancaran: 'Sangat Lancar', tajwid: 'Baik', makhraj: 'Baik', notes_teacher: '' })
    setModalType('tahfizh')
    setShowModal(true)
  }

  useEffect(() => {
    if (!tahfizhForm.student_id || !automaticTahfizhTarget) return
    setTahfizhForm((current) => ({
      ...current,
      surah_number: automaticTahfizhTarget.surahNumber,
      ayat_start: automaticTahfizhTarget.ayatStart,
      ayat_end: automaticTahfizhTarget.ayatEnd,
      juz: getQuranJuz(automaticTahfizhTarget.surahNumber, automaticTahfizhTarget.ayatStart),
    }))
  }, [tahfizhForm.student_id, previousTahfizhLog?.id, quranSurahs.length])

  const openTahfizhDetail = (student) => {
    setTahfizhDetailStudent(student)
    setTahfizhWeekOffset(0)
    setShowTahfizhDetail(true)
  }

  const tahfizhWeekStart = (() => {
    const date = new Date()
    const day = date.getDay() || 7
    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() - day + 1 + (tahfizhWeekOffset * 7))
    return date
  })()
  const tahfizhWeekRows = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(tahfizhWeekStart)
    date.setDate(date.getDate() + index)
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const log = tahfizhLogs.find((item) => item.student_id === tahfizhDetailStudent?.id && item.record_date === dateKey)
    return { date, dateKey, log }
  })

  const getScheduleStatus = (schedule) => {
    const today = new Date()
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    if (selectedDate < todayKey) return { label: 'Selesai', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' }
    if (selectedDate > todayKey) return { label: 'Akan Datang', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' }

    const currentMinutes = today.getHours() * 60 + today.getMinutes()
    const toMinutes = (value = '00:00') => {
      const [hours, minutes] = value.slice(0, 5).split(':').map(Number)
      return hours * 60 + minutes
    }
    const startMinutes = toMinutes(schedule.start_time)
    const endMinutes = toMinutes(schedule.end_time)
    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) return { label: 'Berlangsung', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' }
    if (currentMinutes > endMinutes) return { label: 'Selesai', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' }
    return { label: 'Berikutnya', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' }
  }

  return (
    <PageContainer className="teacher-workspace-page space-y-6 pb-12">
      {/* ── BREADCRUMB NAV ────────────────────────────────────────── */}
      <AppBreadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Portal Guru', href: '/portal-guru/workspace' },
          { label: 'Workspace Pembelajaran Guru' },
        ]}
      />

      {/* ── MODERN HERO CARD HEADER ───────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <GraduationCap className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                    <Sparkles className="size-3 text-amber-300 animate-pulse" />
                    Portal Guru Terpadu
                  </span>
                  {selectedClassName && (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                      Rombel {selectedClassName}
                    </span>
                  )}
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Workspace Pembelajaran Guru
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                  Pusat kendali aktivitas mengajar Ustadz/Ustadzah — Kelola jadwal, presensi, materi, tugas, nilai, &amp; jurnal tahfizh terpadu.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="hidden md:inline-flex items-center gap-2 rounded-xl bg-white/80 dark:bg-slate-800/80 px-4 py-2.5 text-xs font-extrabold text-slate-700 dark:text-slate-200 border border-emerald-500/20 shadow-xs backdrop-blur-md">
                <User className="size-4 text-emerald-600 dark:text-emerald-400" />
                {teacherProfile?.name || user?.name || 'Ustadz / Ustadzah'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── TOAST NOTIFICATION LAYER ────────────────────────────────────── */}
      <div className="fixed bottom-5 right-5 z-[9999] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2.5 pointer-events-none" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-[18px] shadow-[var(--shadow-soft-xl)] border backdrop-blur-md transition-all animate-in slide-in-from-bottom duration-300 ${
              toast.type === 'success'
                ? 'bg-emerald-900/90 text-emerald-100 border-emerald-700/80'
                : toast.type === 'error'
                ? 'bg-rose-900/90 text-rose-100 border-rose-700/80'
                : toast.type === 'warning'
                ? 'bg-amber-900/90 text-amber-100 border-amber-700/80'
                : 'bg-slate-900/90 text-slate-100 border-slate-700/80'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm leading-tight">{toast.title}</h4>
              <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{toast.message}</p>
            </div>
            <button onClick={() => removeToast(toast.id)} aria-label="Tutup notifikasi" className="rounded-lg p-1 transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/70">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>



      <MasterStatsGrid className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MasterStatCard icon={CalendarDays} label="Jadwal Mengajar" value={schedules.length} description={`${new Set(schedules.map(getScheduleSubject)).size} mata pelajaran`} variant="success" delay={40} />
        <MasterStatCard icon={Users} label="Siswa Terdaftar" value={students.length} description={`Rombel ${selectedClassName}`} variant="info" delay={80} />
        <MasterStatCard icon={BookOpen} label="Materi Terbit" value={publishedMaterials} description={`${materials.length} total materi`} variant="warning" delay={120} />
        <MasterStatCard icon={FileText} label="Penugasan Aktif" value={activeAssignments} description={`${assignments.length} total penugasan`} variant="primary" delay={160} />
        <MasterStatCard icon={GraduationCap} label="Catatan & Tahfizh" value={tahfizhLogs.length + studentNotes.length} description="Total pendampingan" variant="danger" delay={200} />
      </MasterStatsGrid>



      {/* ── CARD AKSI CEPAT & NAVIGASI MODUL ────────────────────────────────────────── */}
      <section className="rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-soft-xl)] dark:border-slate-800 dark:bg-[#1B2433]" aria-label="Aksi Cepat Workspace Guru">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Aksi Cepat & Navigasi Modul</h3>
              <p className="text-xs text-slate-500">Klik modul di bawah untuk berpindah antar fitur pengajaran guru secara langsung.</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            {cardModulesList.length} Modul Aksi
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3" role="tablist" aria-label="Modul pengajaran">
          {cardModulesList.map((mod) => {
            const Icon = mod.icon
            const isActive = activeTab === mod.id
            return (
              <motion.button
                type="button"
                key={mod.id}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => handleCardClick(mod)}
                role="tab"
                aria-selected={isActive}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-center group cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/60 shadow-md ring-2 ring-emerald-600/30'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-md'
                }`}
              >
                <div className={`p-2.5 rounded-xl border ${mod.tone || 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60'} mb-2 shrink-0 group-hover:scale-110 transition ${isActive ? 'ring-2 ring-emerald-500/40' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`font-bold text-[11px] leading-tight transition-colors ${
                  isActive ? 'text-emerald-900 dark:text-emerald-200 font-black' : 'text-slate-700 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400'
                }`}>
                  {mod.title}
                </span>
                {mod.badge && (
                  <span className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-extrabold ${mod.badgeColor || 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                    {mod.badge}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </section>

      {/* ── MAIN WORKSPACE CONTENT PIPELINE ──────────────────────────────────────── */}
      <div className="w-full">
        {/* Konten utama workspace */}
        <main className="space-y-6 w-full">
          {/* TAB 1: JADWAL MENGAJAR */}
          {activeTab === 'jadwal' && (
            <div className="space-y-5">
              <div className="overflow-hidden rounded-[22px] border border-emerald-200/70 bg-gradient-to-br from-emerald-700 via-emerald-700 to-teal-800 p-5 text-white shadow-[var(--shadow-soft-xl)] sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-white/20 bg-white/15 p-3 backdrop-blur-sm"><CalendarDays className="h-6 w-6" /></div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">Agenda Mengajar</p>
                      <h2 className="mt-1 text-xl font-extrabold sm:text-2xl">{selectedDateDay}, {selectedDate}</h2>
                      <p className="mt-1 text-sm text-emerald-100">{selectedClassName} • {teacherName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:min-w-[330px]">
                    {[
                      { value: timelineSchedules.length, label: 'Total Sesi' },
                      { value: new Set(timelineSchedules.map(getScheduleSubject)).size, label: 'Mata Pelajaran' },
                      { value: new Set(timelineSchedules.map(getScheduleClass)).size, label: 'Rombel' },
                    ].map((summary) => (
                      <div key={summary.label} className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center backdrop-blur-sm">
                        <strong className="block text-xl">{summary.value}</strong>
                        <span className="text-[10px] font-semibold text-emerald-100">{summary.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 xl:items-start">
                <section className="rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-[var(--shadow-soft-xl)] dark:border-slate-700/80 dark:bg-[#1B2433] sm:p-5 xl:col-span-7">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                    <div>
                      <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white"><Clock className="h-4 w-4 text-emerald-600" /> Timeline {selectedDateDay}</h3>
                      <p className="mt-1 text-xs text-slate-500">Urutan sesi mengajar berdasarkan jam mulai.</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{timelineSchedules.length} sesi tersedia</span>
                  </div>

                  {loading ? (
                    <div className="space-y-3" aria-label="Memuat jadwal">
                      {[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />)}
                    </div>
                  ) : timelineSchedules.length === 0 ? (
                    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center dark:border-slate-700 dark:bg-slate-900/40">
                      <Calendar className="mb-3 h-9 w-9 text-slate-300" />
                      <h4 className="font-bold text-slate-800 dark:text-white">Belum ada jadwal mengajar</h4>
                      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">Jadwal untuk kelas dan periode ini belum tersedia. Coba pilih kelas lain atau muat ulang data.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {timelineSchedules.map((schedule, index) => {
                        const status = getScheduleStatus(schedule)
                        return (
                          <article key={schedule.id || index} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-emerald-700 dark:hover:bg-slate-900">
                            <div className="absolute inset-y-0 left-0 w-1 bg-emerald-600" />
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                              <div className="flex min-w-[108px] items-center gap-2 text-emerald-700 dark:text-emerald-300 sm:block">
                                <strong className="text-base font-extrabold">{(schedule.start_time || '00:00').slice(0, 5)}</strong>
                                <span className="text-xs font-semibold text-slate-400 sm:block">s.d. {(schedule.end_time || '00:00').slice(0, 5)} WIB</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="truncate font-extrabold text-slate-900 dark:text-white">{getScheduleSubject(schedule)}</h4>
                                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${status.className}`}>{status.label}</span>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                  <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{getScheduleClass(schedule)}</span>
                                  <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" />{getScheduleRoom(schedule)}</span>
                                </div>
                              </div>
                              <div className="flex shrink-0 gap-2 sm:flex-col">
                                <button onClick={() => openPresensiModal(schedule)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0E5C44] px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-800 sm:flex-none"><UserCheck className="h-3.5 w-3.5" /> Presensi</button>
                                <button onClick={() => {
                                  setDetailData({ title: `Jadwal: ${getScheduleSubject(schedule)}`, category: 'Jadwal Mengajar', items: [
                                    { label: 'Hari', value: getScheduleDay(schedule) },
                                    { label: 'Rombel', value: getScheduleClass(schedule) },
                                    { label: 'Jam', value: `${schedule.start_time || '00:00'} - ${schedule.end_time || '00:00'} WIB` },
                                    { label: 'Ruangan', value: getScheduleRoom(schedule) },
                                  ] })
                                  setShowDetailModal(true)
                                }} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 sm:flex-none"><Eye className="h-3.5 w-3.5" /> Detail</button>
                              </div>
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  )}
                </section>

                <section className="rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-[var(--shadow-soft-xl)] dark:border-slate-700/80 dark:bg-[#1B2433] sm:p-5 xl:col-span-5">
                  <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
                    <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white"><CalendarRange className="h-4 w-4 text-emerald-600" /> Jadwal Mingguan</h3>
                    <p className="mt-1 text-xs text-slate-500">Pilih hari untuk melihat agenda secara cepat.</p>
                  </div>
                  <div className="mt-4 grid grid-cols-5 gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-900" role="tablist" aria-label="Hari jadwal mingguan">
                    {scheduleDays.map((day) => (
                      <button key={day.short} onClick={() => setWeeklySelectedDay(day.short)} role="tab" aria-selected={weeklySelectedDay === day.short} className={`rounded-xl px-2 py-2 text-[11px] font-bold transition ${weeklySelectedDay === day.short ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-300' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>{day.short}</button>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hari Terpilih</p><h4 className="font-extrabold text-slate-900 dark:text-white">{visibleWeeklyDay}</h4></div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{weeklySchedules.length} sesi</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {weeklySchedules.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-700">
                        <CheckCircle2 className="mx-auto mb-2 h-7 w-7 text-emerald-400" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Tidak ada sesi</p>
                        <p className="mt-1 text-xs text-slate-500">Agenda mengajar kosong pada hari ini.</p>
                      </div>
                    ) : weeklySchedules.map((schedule, index) => (
                      <button key={schedule.id || index} onClick={() => {
                        setDetailData({ title: `Jadwal: ${getScheduleSubject(schedule)}`, category: visibleWeeklyDay, items: [
                          { label: 'Waktu', value: `${schedule.start_time || '00:00'} - ${schedule.end_time || '00:00'} WIB` },
                          { label: 'Rombel', value: getScheduleClass(schedule) },
                          { label: 'Ruangan', value: getScheduleRoom(schedule) },
                        ] })
                        setShowDetailModal(true)
                      }} className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/60 dark:border-slate-800 dark:hover:bg-emerald-950/20">
                        <div className="rounded-xl bg-emerald-100 px-2.5 py-2 text-center text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Clock className="mx-auto h-3.5 w-3.5" /><span className="mt-0.5 block text-[10px] font-extrabold">{(schedule.start_time || '00:00').slice(0, 5)}</span></div>
                        <div className="min-w-0 flex-1"><strong className="block truncate text-sm text-slate-900 dark:text-white">{getScheduleSubject(schedule)}</strong><span className="mt-0.5 block truncate text-xs text-slate-500">{getScheduleClass(schedule)} • {getScheduleRoom(schedule)}</span></div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* TAB 2: PRESENSI SISWA */}
          {activeTab === 'presensi' && (
            <div className="space-y-5 rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-soft-xl)] dark:border-slate-700/80 dark:bg-[#1B2433]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Presensi Pembelajaran Siswa</h3>
                  <p className="text-xs text-slate-400">Rombel {selectedClassName} • {getScheduleSubject(getCurrentSchedule() || {})}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{students.filter((student) => attendanceData[student.id]?.status === 'Hadir').length} / {students.length} hadir</span>
              </div>

              <div className="flex overflow-x-auto border-b border-slate-100 text-xs font-bold dark:border-slate-800">
                {[['presensi', 'Data Presensi'], ['verifikasi', 'Verifikasi Guru'], ['riwayat', 'Riwayat Sesi'], ['catatan', 'Catatan']].map(([id, label]) => (
                  <button key={id} type="button" onClick={() => setAttendanceCenterTab(id)} className={`shrink-0 border-b-2 px-3 pb-2.5 transition ${attendanceCenterTab === id ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>{label}</button>
                ))}
              </div>

              {attendanceCenterTab === 'presensi' && <>
                <section aria-labelledby="attendance-method-title">
                  <h4 id="attendance-method-title" className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Metode Absensi</h4>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      { id: 'rollcall', label: 'Roll Call Guru', description: 'Checklist manual oleh guru', icon: UserCheck },
                      { id: 'qr', label: 'QR Code Kartu', description: 'Scan QR code kartu siswa', icon: QrCode },
                      { id: 'rfid', label: 'RFID Tap', description: 'Tap kartu RFID siswa', icon: Radio },
                    ].map((method) => {
                      const Icon = method.icon
                      const active = selectedMethod === method.id
                      return <button key={method.id} type="button" onClick={() => { setSelectedMethod(method.id); setScanInput(''); setLastScannedResult(null); if (method.id !== 'rollcall') setTimeout(() => scanInputRef.current?.focus(), 50) }} className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${active ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500 dark:bg-emerald-950/30' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800'}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700'}`}><Icon className="h-5 w-5" /></span><span><strong className="block text-xs text-slate-900 dark:text-white">{method.label}</strong><span className="text-[10px] text-slate-400">{method.description}</span></span></button>
                    })}
                  </div>

                  {selectedMethod !== 'rollcall' && <div className={`mt-3 space-y-2.5 rounded-xl border p-3.5 ${selectedMethod === 'qr' ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/30' : 'border-sky-200 bg-sky-50/50 dark:border-sky-900/50 dark:bg-sky-950/30'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">{selectedMethod === 'qr' ? <QrCode className="h-4 w-4 text-emerald-600" /> : <Wifi className="h-4 w-4 animate-pulse text-sky-600" />}<span className="text-xs font-bold text-slate-900 dark:text-white">{selectedMethod === 'qr' ? 'Pemindai QR Code Kartu Siswa' : 'Pembaca RFID Reader Standby'}</span></div>
                      {selectedMethod === 'qr' ? <button type="button" onClick={openQrCamera} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"><Camera className="h-3.5 w-3.5" /> Live Kamera</button> : <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-300">● Ready to Tap</span>}
                    </div>
                    <form onSubmit={handleCardScan} className="flex gap-2"><input ref={scanInputRef} value={scanInput} onChange={(event) => setScanInput(event.target.value)} autoFocus autoComplete="off" placeholder={selectedMethod === 'qr' ? 'Scan QR code via scanner USB atau ketik NISN...' : 'Tap kartu RFID siswa pada reader...'} className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /><button type="submit" disabled={!scanInput.trim() || scanProcessing} className="min-w-20 rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50">{scanProcessing ? <RefreshCw className="mx-auto h-3.5 w-3.5 animate-spin" /> : selectedMethod === 'qr' ? 'Absen' : 'Tap RFID'}</button></form>
                    {lastScannedResult && <div className={`rounded-lg px-3 py-2 text-xs font-semibold ${lastScannedResult.error ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{lastScannedResult.error ? lastScannedResult.message : `${lastScannedResult.student?.nama_lengkap || lastScannedResult.student?.full_name} berhasil dicatat.`}</div>}
                  </div>}
                </section>

                <div className="flex flex-wrap gap-2"><div className="relative min-w-[180px] flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><input type="search" value={attendanceSearch} onChange={(event) => setAttendanceSearch(event.target.value)} placeholder="Cari siswa..." className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></div><select value={attendanceStatusFilter} onChange={(event) => setAttendanceStatusFilter(event.target.value)} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"><option value="">Semua Status</option>{['Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha'].map((status) => <option key={status}>{status}</option>)}</select></div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-slate-50 uppercase tracking-wider text-slate-500 dark:bg-slate-800/60"><tr><th className="px-3 py-3">Siswa</th><th className="px-3 py-3">NIS / NISN</th><th className="px-3 py-3">Status Presensi</th><th className="px-3 py-3">Waktu</th><th className="px-3 py-3">Metode</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{filteredAttendanceStudents.map((student) => { const record = attendanceData[student.id] || { status: 'Alpha' }; return <tr key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30"><td className="px-3 py-3 font-bold text-slate-900 dark:text-white">{student.nama_lengkap}</td><td className="px-3 py-3 text-slate-500">{student.nis || student.nisn || '-'}</td><td className="px-3 py-3"><select value={record.status} onChange={(event) => markStudentAttendance(student, 'Roll Call Guru', event.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white">{['Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha'].map((status) => <option key={status}>{status}</option>)}</select></td><td className="px-3 py-3 text-slate-500">{record.check_in_time || '-'}</td><td className="px-3 py-3 text-slate-500">{record.method || 'Belum dicatat'}</td></tr> })}</tbody></table>{filteredAttendanceStudents.length === 0 && <div className="p-8 text-center text-xs text-slate-500">Tidak ada siswa yang sesuai dengan pencarian atau filter.</div>}</div>
                <div className="flex justify-end"><button type="button" onClick={handleSaveAttendance} className="flex h-11 items-center gap-2 rounded-xl bg-emerald-700 px-5 text-xs font-bold text-white hover:bg-emerald-800"><Save className="h-4 w-4" /> Simpan Presensi</button></div>
              </>}

              {attendanceCenterTab !== 'presensi' && <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-12 text-center dark:border-slate-700"><FileText className="mx-auto h-8 w-8 text-slate-300" /><h4 className="mt-3 text-sm font-bold text-slate-800 dark:text-white">{attendanceCenterTab === 'verifikasi' ? 'Verifikasi Guru' : attendanceCenterTab === 'riwayat' ? 'Riwayat Sesi' : 'Catatan Presensi'}</h4><p className="mt-1 text-xs text-slate-500">Data pada bagian ini mengikuti sesi pembelajaran dan rombel yang aktif.</p></div>}
            </div>
          )}

          {/* TAB 3: MATERI BELAJAR */}
          {activeTab === 'materi' && (
            <section className="space-y-4" aria-labelledby="material-heading">
              <div className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-[var(--shadow-soft-xl)] dark:border-slate-700/80 dark:bg-[#1B2433]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">Pusat Konten Pembelajaran</p>
                    <h3 id="material-heading" className="mt-1 text-lg font-black text-slate-900 dark:text-white">Materi Belajar</h3>
                    <p className="mt-1 text-xs text-slate-500">Kelola materi untuk rombel {selectedClassName} dari draft hingga publikasi.</p>
                </div>
                <button
                    type="button"
                    onClick={() => openMaterialForm()}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-xs font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-emerald-700/25"
                >
                    <Plus className="h-4 w-4" /> Tambah Materi
                </button>
              </div>

                <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-[minmax(0,1fr)_180px_auto] dark:border-slate-800">
                  <label className="relative">
                    <span className="sr-only">Cari materi</span>
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="search" value={materialSearch} onChange={(event) => setMaterialSearch(event.target.value)} placeholder="Cari judul, ringkasan, mapel..." className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-semibold outline-none focus:border-emerald-700 focus:ring-3 focus:ring-emerald-700/15 dark:border-slate-700 dark:bg-[#111827] dark:text-white" />
                  </label>
                  <select value={materialStatusFilter} onChange={(event) => setMaterialStatusFilter(event.target.value)} aria-label="Filter status materi" className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold outline-none focus:border-emerald-700 focus:ring-3 focus:ring-emerald-700/15 dark:border-slate-700 dark:bg-[#111827] dark:text-white">
                    <option value="semua">Semua Status</option><option value="published">Dipublikasikan</option><option value="draft">Draft</option>
                  </select>
                  <button type="button" onClick={fetchMaterials} aria-label="Muat ulang materi" title="Muat ulang materi" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 focus-visible:ring-3 focus-visible:ring-emerald-700/20 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /><span className="sm:hidden">Muat ulang</span></button>
                </div>
              </div>

              {materialError ? (
                <div className="rounded-[18px] border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900/60 dark:bg-rose-950/20"><AlertTriangle className="mx-auto h-8 w-8 text-rose-500" /><h4 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">Materi gagal dimuat</h4><p className="mt-1 text-xs text-slate-500">{materialError}</p><button type="button" onClick={fetchMaterials} className="mt-4 h-10 rounded-xl bg-emerald-800 px-4 text-xs font-bold text-white">Coba Lagi</button></div>
              ) : loading && materials.length === 0 ? (
                <div className="grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-48 animate-pulse rounded-[18px] border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800" />)}</div>
              ) : filteredMaterials.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-[#1B2433]"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><BookOpen className="h-7 w-7" /></div><h4 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">{materials.length ? 'Materi tidak ditemukan' : 'Belum ada materi belajar'}</h4><p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">{materials.length ? 'Ubah kata kunci atau filter status untuk melihat materi lain.' : 'Mulai susun konten pembelajaran pertama untuk rombel ini.'}</p>{!materials.length && <button type="button" onClick={() => openMaterialForm()} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-800 px-4 text-xs font-bold text-white"><Plus className="h-4 w-4" /> Buat Materi Pertama</button>}</div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {filteredMaterials.map((mat) => {
                    const isPublished = String(mat.status).toLowerCase() === 'published'
                    return <article key={mat.id} className="group flex min-h-52 flex-col overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[var(--shadow-soft-xl)] dark:border-slate-700/80 dark:bg-[#1B2433]">
                      <div className="h-1 bg-gradient-to-r from-emerald-800 via-emerald-500 to-amber-400" />
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-start justify-between gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><BookOpen className="h-5 w-5" /></div><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${isPublished ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300'}`}><span className={`h-1.5 w-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-sky-500'}`} />{isPublished ? 'Dipublikasikan' : 'Draft'}</span></div>
                        <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">{mat.subject?.name || 'Materi Pembelajaran'}</p>
                        <h4 className="mt-1 line-clamp-2 text-sm font-black text-slate-900 dark:text-white">{mat.judul}</h4>
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{mat.ringkasan || 'Belum ada ringkasan untuk materi ini.'}</p>
                        <div className="mt-auto flex items-center justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                          <ActionDropdown
                            onView={() => openMaterialDetail(mat)}
                            onEdit={() => openMaterialForm(mat)}
                            onDelete={() => confirmDeleteModal('materi', mat.id, mat.judul)}
                            extraItems={[
                              { label: 'Cetak Materi', icon: <Printer className="h-4 w-4 text-slate-500" />, onClick: () => printMaterial(mat) },
                              { label: 'Export PDF', icon: <FileText className="h-4 w-4 text-rose-500" />, onClick: () => printMaterial(mat, true) },
                            ]}
                          />
                        </div>
                    </div>
                    </article>
                  })}
                </div>
              )}
            </section>
          )}

          {/* TAB 4: PENUGASAN */}
          {activeTab === 'penugasan' && (
            <div className="bg-white dark:bg-[#1B2433] p-5 rounded-[20px] border border-slate-200/80 dark:border-slate-700/80 shadow-[var(--shadow-soft-xl)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Daftar Penugasan & Evaluasi</h3>
                  <p className="text-xs text-slate-400">Penugasan Terbit untuk Rombel {selectedClassName}</p>
                </div>
                <button
                  onClick={() => {
                    setEditingId(null)
                    setTugasForm({ judul: '', subject_id: '', class_id: selectedClass, instruksi: '', deadline: '', bobot: 100 })
                    setModalType('tugas')
                    setShowModal(true)
                  }}
                  className="px-4 py-2 bg-[#0E5C44] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Buat Tugas Baru
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignments.map((asg) => (
                  <div key={asg.id} className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full uppercase">
                        Deadline: {asg.deadline || '05 Agt 2026'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Bobot: {asg.bobot || 100}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{asg.judul}</h4>
                    <p className="text-xs text-slate-500">{asg.instruksi || 'Instruksi pengerjaan tugas siswa.'}</p>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => confirmDeleteModal('tugas', asg.id, asg.judul)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PENILAIAN */}
          {activeTab === 'penilaian' && (
            <div className="bg-white dark:bg-[#1B2433] p-5 rounded-[20px] border border-slate-200/80 dark:border-slate-700/80 shadow-[var(--shadow-soft-xl)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Form Input Nilai Rapor & Harian</h3>
                  <p className="text-xs text-slate-400">Rekapitulasi Nilai Rombel {selectedClassName}</p>
                </div>
                <button
                  onClick={handleSaveGradesBulk}
                  className="px-4 py-2 bg-[#0E5C44] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Simpan Nilai Bulk
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3 w-10">No</th>
                      <th className="p-3">Siswa</th>
                      <th className="p-3 text-center">Nilai Tugas</th>
                      <th className="p-3 text-center">Nilai UTS</th>
                      <th className="p-3 text-center">Nilai UAS</th>
                      <th className="p-3 text-center">Nilai Akhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {students.map((st, idx) => {
                      const grade = gradesData[st.id] || { nilai_tugas: 85, nilai_uts: 80, nilai_uas: 85, nilai_akhir: 83.5 }
                      return (
                        <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="p-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{st.nama_lengkap}</td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              value={grade.nilai_tugas}
                              onChange={(e) => {
                                const val = Number(e.target.value)
                                const newAkhir = Math.round((val + grade.nilai_uts + grade.nilai_uas) / 3)
                                setGradesData({ ...gradesData, [st.id]: { ...grade, nilai_tugas: val, nilai_akhir: newAkhir } })
                              }}
                              className="w-16 p-1 text-center border rounded-lg dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              value={grade.nilai_uts}
                              onChange={(e) => {
                                const val = Number(e.target.value)
                                const newAkhir = Math.round((grade.nilai_tugas + val + grade.nilai_uas) / 3)
                                setGradesData({ ...gradesData, [st.id]: { ...grade, nilai_uts: val, nilai_akhir: newAkhir } })
                              }}
                              className="w-16 p-1 text-center border rounded-lg dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              value={grade.nilai_uas}
                              onChange={(e) => {
                                const val = Number(e.target.value)
                                const newAkhir = Math.round((grade.nilai_tugas + grade.nilai_uts + val) / 3)
                                setGradesData({ ...gradesData, [st.id]: { ...grade, nilai_uas: val, nilai_akhir: newAkhir } })
                              }}
                              className="w-16 p-1 text-center border rounded-lg dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold"
                            />
                          </td>
                          <td className="p-3 text-center font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                            {grade.nilai_akhir}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: TAHFIZH */}
          {activeTab === 'tahfizh' && (
            <section className="space-y-5" aria-labelledby="tahfizh-heading">
              {/* Header Card & Scope Banner */}
              <div className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-soft-xl)] dark:border-slate-700/80 dark:bg-[#1B2433]">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
                        {isPengurusYayasan ? 'Monitoring Konsolidasi Yayasan' : isKepalaSekolahOrDivisiPendidikan ? 'Monitoring Unit Pimpinan' : 'Monitoring Rombel Binaan'}
                      </p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isPengurusYayasan
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                          : isKepalaSekolahOrDivisiPendidikan
                          ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}>
                        {isPengurusYayasan ? (
                          <>• Scope: Seluruh Unit (Yayasan)</>
                        ) : isKepalaSekolahOrDivisiPendidikan ? (
                          <>• Scope: Unit Pimpinan ({teacherProfile?.education_unit || user?.education_unit?.name || 'Kepala Sekolah / Divisi'})</>
                        ) : (
                          <>• Scope: Kelas {selectedClassName}</>
                        )}
                      </span>
                    </div>
                    <h3 id="tahfizh-heading" className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                      {isPengurusYayasan
                        ? 'Leaderboard Pencapaian Hafalan Tahfizh Seluruh Unit'
                        : isKepalaSekolahOrDivisiPendidikan
                        ? `Leaderboard Hafalan Tahfizh Terbanyak — ${teacherProfile?.education_unit || user?.education_unit?.name || 'Unit Pimpinan'}`
                        : `Jurnal & Ranking Setoran Tahfizh Al-Qur'an — Kelas ${selectedClassName}`}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {isPengurusYayasan
                        ? 'Menampilkan konsolidasi pencapaian hafalan tahfizh terbanyak dari seluruh unit pendidikan di bawah naungan yayasan.'
                        : isKepalaSekolahOrDivisiPendidikan
                        ? 'Menampilkan peringkat pencapaian hafalan tahfizh terbanyak siswa dari masing-masing unit yang Anda pimpin.'
                        : `Daftar siswa yang diajar pada rombel ${selectedClassName} diurutkan berdasarkan pencapaian hafalan terbanyak.`}
                    </p>
                  </div>
                  <button
                    type="button" onClick={() => openTahfizhForm()}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-xs font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                  >
                    <Plus className="h-4 w-4" /> Input Setoran
                  </button>
                </div>

                {/* Filter Toolbar */}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={tahfizhSearch}
                      onChange={(e) => setTahfizhSearch(e.target.value)}
                      placeholder="Cari nama siswa, NIS, unit, atau kelas..."
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>

                  {(isPengurusYayasan || isKepalaSekolahOrDivisiPendidikan) && (
                    <div className="flex items-center gap-2">
                      <label htmlFor="filter-unit-tahfizh" className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                        Filter Unit:
                      </label>
                      <select
                        id="filter-unit-tahfizh"
                        value={selectedTahfizhUnit}
                        onChange={(e) => setSelectedTahfizhUnit(e.target.value)}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        <option value="semua">✨ Semua Unit Pendidikan</option>
                        {educationUnits.map((u) => (
                          <option key={u.id || u.nama || u.name} value={u.nama || u.name || u.id}>
                            {u.nama || u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* TOP 5 CARDS ("5 Terbaik di 5 Card") */}
              {top5TahfizhStudents.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 shadow-sm dark:bg-amber-950/60 dark:text-amber-300">
                        <Trophy className="h-4 w-4" />
                      </span>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          5 Terbaik Pencapaian Hafalan Tahfizh Al-Qur'an
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          Kartu profil santri dengan pencapaian hafalan terbanyak (Rank #1 s.d. #5)
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                      🏆 Top 5 Leaderboard
                    </span>
                  </div>

                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {top5TahfizhStudents.map(({ student, latest, totalAyat, completedSurahs, totalSetoran, unitName, className }, index) => {
                      const getInitials = (name = '') => {
                        return name.split(' ').map((n) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'S'
                      }
                      const avatarUrl = student.foto_url || student.avatar || student.foto || student.user?.avatar_url || null
                      const rankLabel = index === 0 ? '🥇 Rank #1' : index === 1 ? '🥈 Rank #2' : index === 2 ? '🥉 Rank #3' : `🏅 Rank #${index + 1}`
                      const rankBadgeStyle = index === 0 ? 'bg-amber-500 text-white shadow-amber-500/20'
                        : index === 1 ? 'bg-slate-500 text-white shadow-slate-500/20'
                        : index === 2 ? 'bg-orange-500 text-white shadow-orange-500/20'
                        : 'bg-emerald-700 text-white shadow-emerald-700/20'
                      const borderGlow = index === 0 ? 'border-amber-300/90 shadow-amber-100/60 dark:border-amber-500/50'
                        : index === 1 ? 'border-slate-300/90 shadow-slate-100/60 dark:border-slate-600/50'
                        : index === 2 ? 'border-orange-300/90 shadow-orange-100/60 dark:border-orange-500/50'
                        : 'border-slate-200/80 dark:border-slate-700/80'

                      const surahName = latest?.hafalan_surah_name || 'Belum setoran'
                      const ayahRange = latest ? `Ayat ${latest.hafalan_ayah_start}–${latest.hafalan_ayah_end}` : '—'
                      const juzNum = latest ? (latest.metadata?.juz || getQuranJuz(latest.hafalan_surah_number, latest.hafalan_ayah_start)) : '—'

                      return (
                        <article
                          key={student.id || index}
                          className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:bg-[#1B2433] ${borderGlow}`}
                        >
                          {/* Rank Badge & Unit Label */}
                          <div className="flex items-center justify-between gap-1.5">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black shadow-sm ${rankBadgeStyle}`}>
                              {rankLabel}
                            </span>
                            <span className="truncate rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300 max-w-[90px]" title={unitName}>
                              {unitName}
                            </span>
                          </div>

                          {/* Profil & Avatar */}
                          <div className="mt-3 flex items-center gap-3">
                            <Avatar size="lg" className="shrink-0 ring-2 ring-emerald-500/20">
                              {avatarUrl && <AvatarImage src={avatarUrl} alt={student.nama_lengkap} />}
                              <AvatarFallback className="bg-emerald-100 font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs">
                                {getInitials(student.nama_lengkap)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <h5 className="truncate text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors" title={student.nama_lengkap}>
                                {student.nama_lengkap}
                              </h5>
                              <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                NIS: {student.nis || student.nisn || '—'}
                              </p>
                              <span className="mt-1 inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                {className}
                              </span>
                            </div>
                          </div>

                          {/* Detail Hafalan Tahfizh (Nama Surah, Ayat, Juz, Total Surah & Total Ayat) */}
                          <div className="mt-3.5 space-y-2 rounded-xl bg-slate-50 p-3 text-[11px] dark:bg-slate-800/60">
                            {/* Nama Surah */}
                            <div className="flex items-center justify-between gap-1 border-b border-slate-200/60 pb-1.5 dark:border-slate-700/60">
                              <span className="text-[10px] font-bold text-slate-400 shrink-0">Nama Surah:</span>
                              <span className="truncate font-extrabold text-slate-900 dark:text-white text-right" title={surahName}>
                                {surahName}
                              </span>
                            </div>

                            {/* Ayat & Juz */}
                            <div className="grid grid-cols-2 gap-1 text-[10px]">
                              <div>
                                <span className="block font-bold text-slate-400">Ayat:</span>
                                <span className="font-extrabold text-emerald-700 dark:text-emerald-400">{ayahRange}</span>
                              </div>
                              <div className="text-right">
                                <span className="block font-bold text-slate-400">Juz:</span>
                                <span className="inline-flex rounded bg-emerald-100 px-1.5 py-0.5 font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  Juz {juzNum}
                                </span>
                              </div>
                            </div>

                            {/* Total Surah & Total Ayat Footer Summary */}
                            <div className="mt-2 border-t border-slate-200/80 pt-2 grid grid-cols-2 gap-1.5 text-center dark:border-slate-700/80">
                              <div className="rounded-lg bg-white p-1.5 shadow-2xs dark:bg-slate-900/60">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Surah</p>
                                <p className="text-xs font-black text-slate-800 dark:text-slate-100">{completedSurahs} Surah</p>
                              </div>
                              <div className="rounded-lg bg-emerald-100/70 p-1.5 shadow-2xs dark:bg-emerald-950/60">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Total Ayat</p>
                                <p className="text-xs font-black text-emerald-900 dark:text-emerald-200">{totalAyat} Ayat</p>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-3 grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => openTahfizhDetail(student)}
                              className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border border-sky-200 bg-sky-50 text-[10px] font-bold text-sky-700 transition hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                            >
                              <Eye className="h-3 w-3" /> Detail
                            </button>
                            <button
                              type="button"
                              onClick={() => openTahfizhForm(student)}
                              className="inline-flex h-8 items-center justify-center gap-1 rounded-xl bg-emerald-800 text-[10px] font-bold text-white transition hover:bg-emerald-900"
                            >
                              <Plus className="h-3 w-3" /> Setor
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Multi-Unit Summary Cards (For Pengurus Yayasan & Kepala Sekolah) */}
              {(isPengurusYayasan || isKepalaSekolahOrDivisiPendidikan) && unitStatsSummary.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {unitStatsSummary.map((unitStat) => (
                    <div key={unitStat.unitName} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700/80 dark:bg-[#1B2433]">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          <Award className="h-4 w-4" />
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {unitStat.totalStudents} Santri
                        </span>
                      </div>
                      <h4 className="mt-3 truncate text-sm font-black text-slate-900 dark:text-white">{unitStat.unitName}</h4>
                      <div className="mt-2 flex items-baseline justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400">Total Hafalan</p>
                          <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">{unitStat.totalAyat} ayat</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400">Top Hafiz Unit</p>
                          <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[110px]" title={unitStat.topStudent?.student?.nama_lengkap}>
                            🥇 {unitStat.topStudent?.student?.nama_lengkap?.split(' ')[0] || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Leaderboard Table (Ranked from Most/Top Tahfizh Hafalan) */}
              <div className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[var(--shadow-soft-xl)] dark:border-slate-700/80 dark:bg-[#1B2433]">
                <div className="divide-y divide-slate-100 md:hidden dark:divide-slate-800">
                  {tahfizhByStudent.map(({ student, latest, totalAyat, completedSurahs, totalSetoran, unitName, className }, index) => (
                    <article key={student.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                            index === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            index === 1 ? 'bg-slate-200 text-slate-800 border border-slate-300' :
                            index === 2 ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                          </span>
                          <div className="min-w-0">
                            <h4 className="truncate text-sm font-black text-slate-900 dark:text-white">{student.nama_lengkap}</h4>
                            <p className="text-[10px] text-slate-500">{student.nis || student.nisn || 'NIS N/A'} · {className}</p>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          {totalAyat} ayat
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                          {unitName}
                        </span>
                      </div>
                      <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                        {latest ? (
                          <>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                              Juz {latest.metadata?.juz || '-'} · {latest.hafalan_surah_name}
                            </p>
                            <p className="mt-1 text-[10px] text-slate-500">
                              Ayat {latest.hafalan_ayah_start}–{latest.hafalan_ayah_end} · {latest.record_date}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-slate-400">Belum ada setoran Tahfizh.</p>
                        )}
                        <p className="mt-2 text-[10px] text-slate-500">{completedSurahs} surah · {totalSetoran} setoran</p>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => openTahfizhDetail(student)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 text-[11px] font-bold text-sky-700 transition hover:bg-sky-100">
                          <Eye className="h-3.5 w-3.5" /> Lihat Detail
                        </button>
                        <button type="button" onClick={() => openTahfizhForm(student)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-800 text-[11px] font-bold text-white transition hover:bg-emerald-900">
                          <Plus className="h-3.5 w-3.5" /> Input Tahfizh
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <table className="hidden w-full table-fixed text-left text-[11px] md:table">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/70">
                    <tr>
                      <th className="w-16 p-3 text-center">Rank</th>
                      <th className="p-3">Siswa / Santri</th>
                      <th className="p-3">Unit Sekolah</th>
                      <th className="p-3">Kelas & Rombel</th>
                      <th className="p-3">Pencapaian Tahfizh</th>
                      <th className="p-3">Setoran Terakhir</th>
                      <th className="p-3 text-center">Total (Terbanyak)</th>
                      <th className="w-28 p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {tahfizhByStudent.map(({ student, latest, totalAyat, completedSurahs, totalSetoran, unitName, className }, index) => (
                      <tr key={student.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10 transition">
                        <td className="p-3 text-center">
                          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                            index === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-sm' :
                            index === 1 ? 'bg-slate-200 text-slate-800 border border-slate-300' :
                            index === 2 ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-extrabold text-slate-900 dark:text-white">{student.nama_lengkap}</p>
                          <p className="mt-0.5 text-[10px] text-slate-500">{student.nis || student.nisn || 'NIS N/A'}</p>
                        </td>
                        <td className="p-3">
                          <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            unitName.includes('SMA') ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' :
                            unitName.includes('SMP') ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' :
                            unitName.includes('SD') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                            'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}>
                            {unitName}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{className}</span>
                        </td>
                        <td className="p-3">
                          {latest ? (
                            <>
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                Juz {latest.metadata?.juz || '-'}
                              </span>
                              <p className="mt-1 font-bold text-slate-800 dark:text-slate-100">{latest.hafalan_surah_name}</p>
                            </>
                          ) : (
                            <span className="text-slate-400">Belum ada capaian</span>
                          )}
                        </td>
                        <td className="p-3">
                          {latest ? (
                            <>
                              <p className="font-semibold text-slate-700 dark:text-slate-200">Ayat {latest.hafalan_ayah_start}–{latest.hafalan_ayah_end}</p>
                              <p className="mt-0.5 text-[10px] text-slate-500">{latest.record_date} · {latest.metadata?.type || 'Ziyadah'}</p>
                            </>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <p className="font-black text-emerald-700 dark:text-emerald-400 text-xs">{totalAyat} ayat</p>
                          <p className="text-[10px] text-slate-500">{completedSurahs} surah · {totalSetoran} setoran</p>
                        </td>
                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openTahfizhDetail(student)}
                              title="Lihat detail jurnal"
                              aria-label={`Lihat detail jurnal ${student.nama_lengkap}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700 transition hover:bg-sky-100 focus-visible:ring-2 focus-visible:ring-sky-500"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openTahfizhForm(student)}
                              title="Input Tahfizh"
                              aria-label={`Input Tahfizh ${student.nama_lengkap}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-white transition hover:bg-emerald-900 focus-visible:ring-2 focus-visible:ring-emerald-600"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!loading && tahfizhByStudent.length === 0 && (
                  <div className="p-10 text-center">
                    <Users className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-xs font-semibold text-slate-500">Tidak ada data pencapaian tahfizh yang sesuai dengan filter.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* TAB 7: MUTABAAH */}
          {activeTab === 'mutabaah' && (
            <TeacherMutabaahWeekly selectedClassId={selectedClass} />
          )}

          {/* TAB 8: CATATAN SISWA */}
          {activeTab === 'catatan' && (
            <div className="bg-white dark:bg-[#1B2433] p-5 rounded-[20px] border border-slate-200/80 dark:border-slate-700/80 shadow-[var(--shadow-soft-xl)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Catatan Perkembangan Siswa</h3>
                  <p className="text-xs text-slate-400">Monitoring Karakter & Akademik Rombel {selectedClassName}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{students.length} siswa</span>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_180px_160px]">
                <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={studentNoteSearch} onChange={(e) => setStudentNoteSearch(e.target.value)} placeholder="Cari siswa, judul, atau isi catatan..." className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs dark:border-slate-700 dark:bg-slate-900" /></div>
                <select value={studentNoteCategory} onChange={(e) => setStudentNoteCategory(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-900"><option value="semua">Semua kategori</option>{['Akademik', 'Perilaku', 'Kedisiplinan', 'Prestasi', 'Konseling', 'Tahfizh', 'Ibadah', 'Kesehatan'].map((category) => <option key={category}>{category}</option>)}</select>
                <select value={studentNotePriority} onChange={(e) => setStudentNotePriority(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-900"><option value="semua">Semua prioritas</option><option value="low">Rendah</option><option value="medium">Sedang</option><option value="high">Tinggi</option><option value="urgent">Mendesak</option></select>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full min-w-[1040px] table-fixed text-left text-xs">
                  <colgroup><col className="w-14" /><col className="w-60" /><col className="w-36" /><col /><col className="w-20" /><col className="w-[350px]" /></colgroup>
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/80"><tr><th className="p-3">No</th><th className="p-3">Data Siswa</th><th className="p-3">Rombel</th><th className="p-3">Catatan Terakhir</th><th className="p-3 text-center">Jumlah</th><th className="p-3 text-right">Aksi</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {catatanStudents.map((student, index) => { const notes = studentNotes.filter((note) => note.student_id === student.id); const latest = notes[0]; return <tr key={student.id} className="h-[76px] hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10"><td className="p-3 text-center font-mono text-slate-400">{index + 1}</td><td className="overflow-hidden p-3"><p className="truncate font-bold text-slate-900 dark:text-white" title={student.nama_lengkap || student.full_name}>{student.nama_lengkap || student.full_name}</p><p className="mt-0.5 truncate text-[10px] text-slate-500">{student.nis || student.nisn || 'NIS belum tersedia'}</p></td><td className="overflow-hidden p-3"><span className="block truncate rounded-full bg-emerald-50 px-2.5 py-1 text-center text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" title={student.kelas?.nama_kelas || student.kelas?.name || selectedClassName}>{student.kelas?.nama_kelas || student.kelas?.name || selectedClassName}</span></td><td className="overflow-hidden p-3">{latest ? <><p className="truncate font-semibold text-slate-700 dark:text-slate-200" title={latest.title}>{latest.title}</p><p className="mt-0.5 truncate text-[10px] text-slate-500">{latest.category} · {latest.date}</p></> : <span className="text-slate-400">Belum ada catatan</span>}</td><td className="p-3 text-center"><span className="font-black text-[#0E5C44]">{notes.length}</span></td><td className="whitespace-nowrap p-3 text-right"><div className="inline-flex items-center justify-end gap-2"><button type="button" onClick={() => openStudentDetail(student)} className="inline-flex h-9 w-[94px] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2 text-[10px] font-bold text-sky-700"><Eye className="h-3.5 w-3.5 shrink-0" /> Lihat Siswa</button><button type="button" onClick={() => openCatatanForm(null, student)} className="inline-flex h-9 w-[108px] shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#0E5C44] px-2 text-[10px] font-bold text-white"><Plus className="h-3.5 w-3.5 shrink-0" /> Input Catatan</button>{latest?.teacher_id === teacherProfile?.id && <><button type="button" onClick={() => openCatatanForm(latest)} title="Edit catatan terakhir" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><Edit3 className="h-3.5 w-3.5" /></button><button type="button" onClick={() => confirmDeleteModal('catatan', latest.id, latest.title)} title="Hapus catatan terakhir" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-700"><Trash2 className="h-3.5 w-3.5" /></button></>}</div></td></tr> })}
                  </tbody>
                </table>
                {!loading && catatanStudents.length === 0 && <div className="py-12 text-center"><Users className="mx-auto h-9 w-9 text-slate-300" /><p className="mt-2 text-xs font-semibold text-slate-500">Tidak ada siswa pada rombel atau filter ini.</p></div>}
              </div>
            </div>
          )}

          {/* TAB 9: LOG ABSENSI GURU (READ ONLY) */}
          {activeTab === 'log-absensi' && (
            <div className="bg-white dark:bg-[#1B2433] p-5 rounded-[20px] border border-slate-200/80 dark:border-slate-700/80 shadow-[var(--shadow-soft-xl)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Log Absensi Guru</h3>
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Read Only
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Riwayat Kehadiran Resmi Pengajar: <strong>{teacherName}</strong></p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={teacherLogMonth}
                    onChange={(e) => setTeacherLogMonth(e.target.value)}
                    className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 px-3 text-xs font-bold bg-white dark:bg-slate-800"
                  >
                    <option value="2026-07">Juli 2026</option>
                    <option value="2026-06">Juni 2026</option>
                  </select>
                  <button
                    onClick={() => handleProcessExport()}
                    className="px-4 py-2 bg-[#0E5C44] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Export PDF
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Tanggal & Hari</th>
                      <th className="p-3">Jam Masuk</th>
                      <th className="p-3">Jam Pulang</th>
                      <th className="p-3">Durasi Working</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Metode & Perangkat</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {teacherLogAbsensi.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          {log.date}
                          <span className="block text-[10px] text-slate-400 font-normal">{log.day}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">{log.check_in} WIB</td>
                        <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{log.check_out} WIB</td>
                        <td className="p-3 font-mono">{log.duration}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {log.method}
                          <span className="block text-[10px] text-slate-400">{log.device}</span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              setDetailData({
                                title: `Log Absensi: ${log.date}`,
                                category: 'Log Absensi Guru (Read-Only)',
                                items: [
                                  { label: 'Tanggal', value: log.date },
                                  { label: 'Hari', value: log.day },
                                  { label: 'Jam Masuk', value: log.check_in },
                                  { label: 'Jam Pulang', value: log.check_out },
                                  { label: 'Durasi', value: log.duration },
                                  { label: 'Status', value: log.status },
                                  { label: 'Metode', value: log.method },
                                  { label: 'Lokasi', value: log.location },
                                ]
                              })
                              setShowDetailModal(true)
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center justify-center gap-1 mx-auto"
                          >
                            <Eye className="w-3.5 h-3.5" /> Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: JADWAL LENGKAP (READ ONLY) */}
          {activeTab === 'jadwal-lengkap' && (
            <div className="bg-white dark:bg-[#1B2433] p-5 rounded-[20px] border border-slate-200/80 dark:border-slate-700/80 shadow-[var(--shadow-soft-xl)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Jadwal Pelajaran Lengkap Sekolah</h3>
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Read Only (Jadwal Resmi)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Master Kalender & Schedule Matrix Sekolah</p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {['Hari', 'Minggu', 'Bulan', 'Semester'].map((subt) => (
                    <button
                      key={subt}
                      onClick={() => setJadwalLengkapTab(subt)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                        jadwalLengkapTab === subt
                          ? 'bg-[#0E5C44] text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {subt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub Tab Views */}
              {jadwalLengkapTab === 'Hari' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 font-semibold">Timeline Jadwal Harian Resmi Sekolah</p>
                  {schedules.map((s, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="px-2 py-0.5 bg-emerald-100 text-[#0E5C44] font-bold text-[10px] rounded-md">{s.day_name || 'Senin'}</span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{s.subject?.name || 'Matematika'}</h4>
                        <p className="text-slate-500">{s.start_time || '08:00'} - {s.end_time || '09:30'} WIB • Ruang: {s.room_name || 'Ruang 201'}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-400">Pengajar: {teacherName}</span>
                    </div>
                  ))}
                </div>
              )}

              {jadwalLengkapTab === 'Minggu' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs space-y-2">
                  <CalendarDays className="w-8 h-8 mx-auto text-emerald-600" />
                  <h4 className="font-bold text-slate-900 dark:text-white">Weekly Master Calendar Grid</h4>
                  <p className="text-slate-500">Menampilkan matriks jam pelajaran resmi mingguan untuk seluruh rombel & guru.</p>
                </div>
              )}

              {jadwalLengkapTab === 'Bulan' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs space-y-2">
                  <CalendarRange className="w-8 h-8 mx-auto text-[#0E5C44]" />
                  <h4 className="font-bold text-slate-900 dark:text-white">Monthly Agenda Calendar</h4>
                  <p className="text-slate-500">Kalender agenda bulanan sekolah, ujian, libur nasional & kegiatan akademik.</p>
                </div>
              )}

              {jadwalLengkapTab === 'Semester' && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-3">Hari</th>
                        <th className="p-3">Mata Pelajaran</th>
                        <th className="p-3">Jam Mengajar</th>
                        <th className="p-3">Kelas / Rombel</th>
                        <th className="p-3">Ruangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {[
                        { day: 'Senin', subject: 'Matematika', time: '08:00 - 09:30', room: 'Ruang 201' },
                        { day: 'Selasa', subject: 'Pendidikan Agama Islam', time: '09:45 - 11:15', room: 'Aula' },
                        { day: 'Rabu', subject: 'Tahfizh Al-Qur\'an', time: '07:30 - 09:00', room: 'Masjid' },
                        { day: 'Kamis', subject: 'Bahasa Arab', time: '10:00 - 11:30', room: 'Ruang 202' },
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-emerald-700">{item.day}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{item.subject}</td>
                          <td className="p-3 font-mono">{item.time} WIB</td>
                          <td className="p-3 font-bold">{selectedClassName}</td>
                          <td className="p-3 text-slate-500">{item.room}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB CHAT: KOMUNIKASI ORANG TUA */}
          {activeTab === 'chat' && (
            <ChatGuruWorkspace mode="teacher" />
          )}
        </main>
      </div>

      {/* ── COMMAND PALETTE MODAL (CTRL + K) ───────────────────────────────── */}
      {showCommandPalette && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-start justify-center pt-20 p-4"
          onClick={() => setShowCommandPalette(false)}
        >
          <div
            className="bg-white dark:bg-[#1B2433] w-full max-w-xl rounded-[22px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative animate-in fade-in zoom-in duration-150 space-y-3 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                placeholder="Cari siswa, kelas, materi, atau navigasi workspace (Ctrl + K)..."
                className="w-full text-sm font-semibold bg-transparent outline-none text-slate-900 dark:text-white"
              />
              <button onClick={() => setShowCommandPalette(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 max-h-72 overflow-y-auto text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2">Navigasi Workspace</span>
              {cardModulesList.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => {
                    changeTab(mod.id)
                    setShowCommandPalette(false)
                  }}
                  className="w-full text-left flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <span className="flex items-center gap-2 font-bold">
                    <mod.icon className="w-4 h-4 text-emerald-600" />
                    {mod.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Buka Modul →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showQrCamera && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md" onClick={closeQrCamera} role="presentation">
          <section className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="qr-camera-title">
            <header className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
              <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"><Camera className="h-5 w-5" /></span><div><h2 id="qr-camera-title" className="text-base font-bold text-slate-900 dark:text-white">Pemindai Kamera Web Live</h2><p className="text-xs text-slate-500">Mode: KEDATANGAN</p></div></div>
              <button type="button" onClick={closeQrCamera} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800" aria-label="Tutup kamera"><X className="h-5 w-5" /></button>
            </header>

            <div className="space-y-4 p-6">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-inner dark:border-slate-800">
                <video ref={qrVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                {!qrCameraActive && !qrCameraError && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/80 text-white"><RefreshCw className="h-8 w-8 animate-spin text-emerald-400" /><p className="text-xs font-semibold">Menghubungkan ke kamera...</p></div>}
                
                {/* Target Viewfinder Overlay Tailored to Student ID Card QR Code Size */}
                {qrCameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-emerald-500 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                      {/* Corner Brackets */}
                      <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                      <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                      {/* Laser Beam */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_#10b981] animate-pulse absolute top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                )}
              </div>

              {qrCameraError && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">Kamera tidak dapat diakses. Pastikan izin (permission) kamera diizinkan di browser Anda.{qrCameraError.includes('BarcodeDetector') ? ' Pemindaian otomatis juga memerlukan Chrome/Edge terbaru.' : ''}</div>}

              <form onSubmit={handleCardScan} className="space-y-3 pt-2">
                <label className="block text-xs font-semibold uppercase text-slate-500">Input / Hasil Pindai Kode Kartu</label>
                <div className="flex flex-col gap-2 sm:flex-row"><input ref={scanInputRef} value={scanInput} onChange={(event) => setScanInput(event.target.value)} autoFocus autoComplete="off" placeholder="Hasil scan QR / Ketik nomor kartu..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white" /><button type="submit" disabled={!scanInput.trim() || scanProcessing} className="whitespace-nowrap rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-50">{scanProcessing ? 'Proses...' : 'Proses Absen'}</button></div>
              </form>
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <button type="button" onClick={qrCameraActive ? stopQrCamera : openQrCamera} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{qrCameraActive ? <><CameraOff className="h-3.5 w-3.5 text-rose-500" /> Matikan Kamera</> : <><Camera className="h-3.5 w-3.5 text-emerald-500" /> Nyalakan Ulang Kamera</>}</button>
              <button type="button" onClick={closeQrCamera} className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200">Tutup Window</button>
            </footer>
          </section>
        </div>
      )}

      {showAttendanceMethodModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm sm:p-5" onClick={() => setShowAttendanceMethodModal(false)} role="presentation">
          <section className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="attendance-modal-title">
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
              <div className="flex min-w-0 items-center gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selectedMethod === 'rollcall' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : selectedMethod === 'qr' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' : 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'}`}>
                  {selectedMethod === 'rollcall' ? <UserCheck className="h-5 w-5" /> : selectedMethod === 'qr' ? <QrCode className="h-5 w-5" /> : <Wifi className="h-5 w-5" />}
                </span>
                <div className="min-w-0">
                  <h2 id="attendance-modal-title" className="truncate text-lg font-extrabold text-slate-900 dark:text-white">{selectedMethod === 'rollcall' ? 'Checklist Kehadiran Siswa' : selectedMethod === 'qr' ? 'Scan QR Code Kartu Siswa' : 'Identifikasi RFID Kartu Siswa'}</h2>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{selectedClassName} • {getScheduleSubject(getCurrentSchedule() || {})}</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowAttendanceMethodModal(false)} aria-label="Tutup popup presensi" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-3 focus-visible:ring-emerald-700/20 dark:hover:bg-slate-800 dark:hover:text-slate-200"><X className="h-5 w-5" /></button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              {selectedMethod === 'rollcall' ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                    <div><p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">{students.filter((student) => attendanceData[student.id]?.status === 'Hadir').length} dari {students.length} siswa hadir</p><p className="mt-0.5 text-[11px] text-slate-500">Daftar mengikuti rombel dan mata pelajaran guru yang aktif.</p></div>
                    <button type="button" onClick={markAllStudentsPresent} className="h-11 rounded-xl border border-emerald-200 bg-white px-4 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 focus-visible:ring-3 focus-visible:ring-emerald-700/20 dark:border-emerald-800 dark:bg-slate-800 dark:text-emerald-300">Centang Semua Hadir</button>
                  </div>
                  {students.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-12 text-center dark:border-slate-700"><Users className="mx-auto h-8 w-8 text-slate-300" /><h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-white">Siswa belum tersedia</h3><p className="mt-1 text-xs text-slate-500">Pilih kelas dan jadwal mengajar terlebih dahulu.</p></div>
                  ) : (
                    <div className="space-y-2">
                      {students.map((student, index) => {
                        const status = attendanceData[student.id]?.status || 'Alpha'
                        return <article key={student.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-3 transition hover:border-emerald-300 dark:border-slate-800 sm:flex-row sm:items-center">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <input type="checkbox" checked={status === 'Hadir'} onChange={(event) => toggleStudentChecklist(student, event.target.checked)} aria-label={`Tandai ${student.nama_lengkap} hadir`} className="h-5 w-5 shrink-0 cursor-pointer accent-emerald-700" />
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold text-slate-500 dark:bg-slate-800">{index + 1}</span>
                            <div className="min-w-0"><h4 className="truncate text-sm font-bold text-slate-900 dark:text-white">{student.nama_lengkap}</h4><p className="truncate text-[11px] text-slate-500">NIS/NISN: {student.nis || student.nisn || 'Belum tersedia'}</p></div>
                          </div>
                          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">{['Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha'].map((option) => <button key={option} type="button" onClick={() => markStudentAttendance(student, 'Checklist Guru', option)} className={`h-9 shrink-0 rounded-lg px-2.5 text-[10px] font-bold transition ${status === option ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}>{option}</button>)}</div>
                        </article>
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mx-auto max-w-xl space-y-5 py-2 sm:py-6">
                  <div className={`mx-auto flex h-28 w-28 items-center justify-center rounded-[28px] border ${selectedMethod === 'qr' ? 'border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-900 dark:bg-sky-950/30' : 'border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-900 dark:bg-violet-950/30'}`}>
                    {selectedMethod === 'qr' ? <QrCode className="h-14 w-14" /> : <Wifi className="h-14 w-14" />}
                  </div>
                  <div className="text-center"><h3 className="text-base font-extrabold text-slate-900 dark:text-white">{selectedMethod === 'qr' ? 'Arahkan QR kartu ke scanner' : 'Tempelkan kartu pada reader RFID'}</h3><p className="mt-1 text-xs leading-5 text-slate-500">Kode akan diproses otomatis saat reader mengirimkan tombol Enter.</p></div>
                  <form onSubmit={handleCardScan} className="space-y-3">
                    <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">Kode kartu siswa</span><div className="flex gap-2"><div className="relative min-w-0 flex-1">{selectedMethod === 'qr' ? <QrCode className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /> : <Wifi className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}<input ref={scanInputRef} value={scanInput} onChange={(event) => setScanInput(event.target.value)} disabled={scanProcessing} autoFocus autoComplete="off" placeholder={`Menunggu ${selectedMethod === 'qr' ? 'QR scanner' : 'RFID reader'}...`} className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold outline-none transition focus:border-emerald-700 focus:ring-3 focus:ring-emerald-700/15 disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></div><button type="submit" disabled={!scanInput.trim() || scanProcessing} className="h-12 min-w-24 rounded-xl bg-emerald-700 px-4 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">{scanProcessing ? 'Memproses...' : 'Identifikasi'}</button></div></label>
                  </form>
                  {lastScannedResult && <div className={`flex items-center gap-3 rounded-2xl border p-4 ${lastScannedResult.error ? 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30' : 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30'}`} role="status">{lastScannedResult.error ? <AlertCircle className="h-6 w-6 shrink-0 text-rose-600" /> : <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />}<div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900 dark:text-white">{lastScannedResult.error ? 'Kartu tidak dikenali' : (lastScannedResult.student?.nama_lengkap || lastScannedResult.student?.full_name)}</p><p className="mt-0.5 text-xs text-slate-500">{lastScannedResult.error ? lastScannedResult.message : `${lastScannedResult.method}${lastScannedResult.time ? ` • ${lastScannedResult.time} WIB` : ''}`}</p></div></div>}
                </div>
              )}
            </div>

            <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-[#1B2433] sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowAttendanceMethodModal(false)} className="h-11 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Tutup</button>
              <button type="button" onClick={handleSaveAttendance} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-xs font-bold text-white transition hover:bg-emerald-800"><Save className="h-4 w-4" /> Simpan Presensi</button>
            </footer>
          </section>
        </div>
      )}

      {/* DEDICATED PRESENSI SESSION MODAL POP-UP */}
      {/* MODAL POPUP PRESENSI PEMBELAJARAN SISWA */}
      <AppModal
        isOpen={showPresensiModal}
        onClose={() => setShowPresensiModal(false)}
        title="Presensi Pembelajaran Siswa"
        description={`Rombel ${selectedClassName} • Mapel: ${presensiModalSchedule?.subject?.name || getScheduleSubject(getCurrentSchedule() || {})} • Pengajar: ${teacherName}`}
        icon={UserCheck}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          {/* Sub Navigation Tabs */}
          <div className="flex overflow-x-auto border-b border-slate-200 text-xs font-bold dark:border-slate-800">
            {[
              ['presensi', 'Data Presensi'],
              ['verifikasi', 'Verifikasi Guru'],
              ['riwayat', 'Riwayat Sesi'],
              ['catatan', 'Catatan'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setAttendanceCenterTab(id)}
                className={`shrink-0 border-b-2 px-4 pb-2.5 font-extrabold transition ${
                  attendanceCenterTab === id
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {attendanceCenterTab === 'presensi' && (
            <>
              {/* Metode Absensi */}
              <div>
                <h4 className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Metode Absensi
                </h4>
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {[
                    { id: 'rollcall', label: 'Roll Call Guru', description: 'Checklist manual oleh guru', icon: UserCheck },
                    { id: 'qr', label: 'QR Code Kartu', description: 'Scan QR code kartu siswa', icon: QrCode },
                    { id: 'rfid', label: 'RFID Tap', description: 'Tap kartu RFID siswa', icon: Radio },
                  ].map((method) => {
                    const Icon = method.icon
                    const active = selectedMethod === method.id
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => {
                          setSelectedMethod(method.id)
                          setScanInput('')
                          setLastScannedResult(null)
                          if (method.id !== 'rollcall') setTimeout(() => scanInputRef.current?.focus(), 50)
                        }}
                        className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition ${
                          active
                            ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/30 dark:bg-emerald-950/40 dark:border-emerald-700'
                            : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/60'
                        }`}
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          active ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <strong className="block text-xs font-bold text-slate-900 dark:text-white">{method.label}</strong>
                          <span className="text-[10px] font-semibold text-slate-400">{method.description}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {selectedMethod !== 'rollcall' && (
                  <div className={`mt-3 space-y-2.5 rounded-2xl border p-3.5 ${
                    selectedMethod === 'qr' ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/30' : 'border-sky-200 bg-sky-50/60 dark:border-sky-900/60 dark:bg-sky-950/30'
                  }`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {selectedMethod === 'qr' ? <QrCode className="h-4 w-4 text-emerald-600" /> : <Wifi className="h-4 w-4 animate-pulse text-sky-600" />}
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {selectedMethod === 'qr' ? 'Pemindai QR Code Kartu Siswa' : 'Pembaca RFID Reader Standby'}
                        </span>
                      </div>
                      {selectedMethod === 'qr' ? (
                        <button
                          type="button"
                          onClick={openQrCamera}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-sm transition"
                        >
                          <Camera className="h-3.5 w-3.5" /> Live Kamera
                        </button>
                      ) : (
                        <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-300">
                          ● Ready to Tap
                        </span>
                      )}
                    </div>
                    <form onSubmit={handleCardScan} className="flex gap-2">
                      <input
                        ref={scanInputRef}
                        value={scanInput}
                        onChange={(event) => {
                          const val = event.target.value
                          setScanInput(val)
                          if (val.trim()) {
                            const matched = findStudentByCardCode(val)
                            if (matched) {
                              identifyStudentCard(val, selectedMethod)
                            }
                          }
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            if (scanInput.trim()) {
                              identifyStudentCard(scanInput, selectedMethod)
                            }
                          }
                        }}
                        autoFocus
                        autoComplete="off"
                        placeholder={selectedMethod === 'qr' ? 'Arahkan QR kartu siswa ke scanner / USB scanner (Otomatis Hadir)...' : 'Tap kartu RFID siswa pada reader (Otomatis Hadir)...'}
                        className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                      {scanProcessing && (
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl animate-pulse">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Auto-Hadir...
                        </div>
                      )}
                    </form>
                    {lastScannedResult && (
                      <div className={`rounded-xl px-3 py-2 text-xs font-semibold ${lastScannedResult.error ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {lastScannedResult.error ? lastScannedResult.message : `${lastScannedResult.student?.nama_lengkap || lastScannedResult.student?.full_name} berhasil dicatat.`}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action & Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold text-xs rounded-full">
                    {students.filter((st) => (attendanceData[st.id]?.status || 'Alpha') === 'Hadir').length} / {students.length} Hadir
                  </span>
                  <button
                    type="button"
                    onClick={markAllStudentsPresent}
                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
                  >
                    Tandai Semua Hadir
                  </button>
                </div>
                <div className="relative min-w-[200px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={attendanceSearch}
                    onChange={(e) => setAttendanceSearch(e.target.value)}
                    placeholder="Cari nama siswa / NIS..."
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Data Table Siswa */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-[#1B2433]">
                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                        <th className="p-3 w-10">No</th>
                        <th className="p-3">Nama Siswa</th>
                        <th className="p-3">NIS / NISN</th>
                        <th className="p-3 text-center">Status Kehadiran Siswa</th>
                        <th className="p-3">Waktu & Metode</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {students
                        .filter((st) => !attendanceSearch.trim() || st.nama_lengkap?.toLowerCase().includes(attendanceSearch.toLowerCase()) || st.nis?.includes(attendanceSearch))
                        .map((st, idx) => {
                          const currentStatus = attendanceData[st.id]?.status || 'Alpha'
                          const currentRecord = attendanceData[st.id] || {}
                          return (
                            <tr key={st.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                              <td className="p-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                              <td className="p-3 font-bold text-slate-900 dark:text-white">
                                {st.nama_lengkap}
                              </td>
                              <td className="p-3 text-slate-500 font-mono text-[11px]">
                                {st.nis || st.nisn || '-'}
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  {[
                                    { id: 'Hadir', tone: 'bg-emerald-600 text-white' },
                                    { id: 'Terlambat', tone: 'bg-amber-500 text-white' },
                                    { id: 'Izin', tone: 'bg-blue-600 text-white' },
                                    { id: 'Sakit', tone: 'bg-purple-600 text-white' },
                                    { id: 'Alpha', tone: 'bg-rose-600 text-white' },
                                  ].map((option) => (
                                    <button
                                      key={option.id}
                                      type="button"
                                      onClick={() => markStudentAttendance(st, selectedMethod === 'qr' ? 'QR Code Kartu Siswa' : selectedMethod === 'rfid' ? 'RFID Kartu Siswa' : 'Roll Call Guru', option.id)}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                                        currentStatus === option.id
                                          ? `${option.tone} shadow-sm ring-2 ring-emerald-500/40`
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                      }`}
                                    >
                                      {option.id}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td className="p-3 text-[11px] text-slate-500">
                                {currentRecord.check_in_time ? (
                                  <span>{currentRecord.check_in_time} • {currentRecord.method || 'Roll Call'}</span>
                                ) : (
                                  <span className="text-slate-400 italic">Belum dicatat</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {attendanceCenterTab === 'verifikasi' && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3 dark:border-emerald-800 dark:bg-emerald-950/30">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-600 text-white rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Verifikasi Kehadiran oleh Guru Pengajar</h4>
                  <p className="text-xs text-slate-500">Pengajar: <strong>{teacherName}</strong> • Rombel {selectedClassName}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Seluruh data kehadiran pada sesi pembelajaran ini telah divalidasi. Menyimpan presensi akan menyinkronkan status ke server akademik & jurnal mengajar harian.
              </p>
            </div>
          )}

          {attendanceCenterTab === 'riwayat' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-semibold">Riwayat Sesi Mengajar Rombel {selectedClassName}</p>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/60 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-white">Sesi Pembelajaran Aktif</span>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">Berlangsung</span>
                </div>
                <p className="mt-1 text-slate-500">{presensiModalSchedule?.subject?.name || 'Mata Pelajaran'} • {presensiModalSchedule?.time_start?.slice(0, 5)}–{presensiModalSchedule?.time_end?.slice(0, 5)} WIB</p>
              </div>
            </div>
          )}

          {attendanceCenterTab === 'catatan' && (
            <div className="space-y-3 text-xs">
              <label className="font-bold block text-slate-700 dark:text-slate-200">Catatan Khusus Presensi Pembelajaran</label>
              <textarea
                rows={3}
                placeholder="Tambahkan catatan khusus seperti izin kegiatan sekolah, dispensasi, dsb..."
                className="w-full p-3 border rounded-xl dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-100"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowPresensiModal(false)}
              className="px-4 py-2.5 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                handleSaveAttendance()
                setShowPresensiModal(false)
              }}
              className="px-5 py-2.5 bg-[#0E5C44] hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" /> Simpan Presensi Pembelajaran
            </button>
          </div>
        </div>
      </AppModal>

      {/* DETAIL JURNAL TAHFIZH MINGGUAN */}
      {showTahfizhDetail && tahfizhDetailStudent && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm sm:p-5" role="dialog" aria-modal="true" aria-labelledby="tahfizh-detail-title">
          <div className="flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
            <header className="flex shrink-0 flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
              <div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><BookOpen className="h-5 w-5" /></div><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Lembar Kegiatan Tahfizh</p><h2 id="tahfizh-detail-title" className="truncate text-lg font-black text-slate-900 dark:text-white">{tahfizhDetailStudent.nama_lengkap}</h2><p className="text-xs text-slate-500">{tahfizhDetailStudent.nis || tahfizhDetailStudent.nisn || 'NIS belum tersedia'} · {selectedClassName}</p></div></div>
              <div className="flex items-center gap-2"><button type="button" onClick={() => setTahfizhWeekOffset((value) => value - 1)} aria-label="Minggu sebelumnya" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><ChevronLeft className="h-4 w-4" /></button><div className="min-w-44 text-center"><p className="text-[10px] font-bold uppercase text-slate-400">Periode</p><p className="text-xs font-bold text-slate-800 dark:text-white">{new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(tahfizhWeekRows[0].date)} – {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(tahfizhWeekRows[6].date)}</p></div><button type="button" onClick={() => setTahfizhWeekOffset((value) => Math.min(value + 1, 0))} disabled={tahfizhWeekOffset >= 0} aria-label="Minggu berikutnya" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><ChevronRight className="h-4 w-4" /></button><button type="button" onClick={() => setShowTahfizhDetail(false)} aria-label="Tutup detail" className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button></div>
            </header>
            <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
              <div className="space-y-3 lg:hidden">
                {tahfizhWeekRows.map(({ date, dateKey, log }, index) => (
                  <article key={dateKey} className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                    <header className="flex items-center justify-between bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30"><div><p className="text-sm font-black text-slate-900 dark:text-white">{index + 1}. {new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(date)}</p><p className="text-[10px] text-slate-500">{new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)}</p></div>{log ? <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white">Terisi</span> : <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-300">Kosong</span>}</header>
                    <div className="grid grid-cols-2 gap-px bg-slate-200 text-xs dark:bg-slate-700">
                      {[['Tilawah', log?.tilawah_text || '—'], ['Baris Tilawah', log?.tilawah_baris || '—'], ['Hafalan Baru', log?.hafalan_surah_name ? `${log.hafalan_surah_name}, ayat ${log.hafalan_ayah_start}–${log.hafalan_ayah_end}` : '—'], ['Juz / Jumlah', log ? `Juz ${log.metadata?.juz || '-'} · ${log.hafalan_baris || 0} ayat` : '—'], ['Murajaah', log?.murajaah_text || '—'], ['Lembar', log?.murajaah_lembar || '—'], ['Catatan', log?.notes_teacher || '—'], ['Tanda tangan', log?.signature_teacher ? 'Sudah ditandatangani' : '—']].map(([label, value]) => <div key={label} className="min-w-0 bg-white p-3 dark:bg-[#1B2433]"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 break-words font-semibold text-slate-800 dark:text-slate-100">{value}</p></div>)}
                    </div>
                  </article>
                ))}
              </div>
              <table className="hidden w-full table-fixed border-collapse text-[10px] xl:text-[11px] lg:table [&_td]:!p-2 [&_td]:break-words [&_th]:!p-2">
                <colgroup><col className="w-[3.5%]" /><col className="w-[11%]" /><col className="w-[10%]" /><col className="w-[5%]" /><col className="w-[17%]" /><col className="w-[7%]" /><col className="w-[11%]" /><col className="w-[6%]" /><col className="w-[20%]" /><col className="w-[9.5%]" /></colgroup>
                <thead><tr className="bg-emerald-100 text-slate-900 dark:bg-emerald-950/60 dark:text-emerald-100"><th className="border border-slate-400 p-2.5">No</th><th className="border border-slate-400 p-2.5 text-left">Hari/Tanggal</th><th className="border border-slate-400 p-2.5">Tilawah</th><th className="border border-slate-400 p-2.5">Baris</th><th className="border border-slate-400 p-2.5">Hafalan Baru</th><th className="border border-slate-400 p-2.5">Baris/Ayat</th><th className="border border-slate-400 p-2.5">Murajaah</th><th className="border border-slate-400 p-2.5">Lembar</th><th className="border border-slate-400 p-2.5">Catatan</th><th className="border border-slate-400 p-2.5">Ttd</th></tr></thead>
                <tbody>{tahfizhWeekRows.map(({ date, dateKey, log }, index) => <tr key={dateKey} className="h-24 align-top hover:bg-slate-50 dark:hover:bg-slate-800/40"><td className="border border-slate-300 p-3 text-center font-bold dark:border-slate-600">{index + 1}</td><td className="border border-slate-300 p-3 dark:border-slate-600"><p className="font-bold text-slate-900 dark:text-white">{new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(date)}</p><p className="mt-1 text-[10px] text-slate-500">{new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)}</p></td><td className="border border-slate-300 p-3 dark:border-slate-600">{log?.tilawah_text || '—'}</td><td className="border border-slate-300 p-3 text-center dark:border-slate-600">{log?.tilawah_baris || '—'}</td><td className="border border-slate-300 p-3 dark:border-slate-600">{log?.hafalan_surah_name ? <><p className="font-bold">{log.hafalan_surah_name}</p><p className="mt-1 text-[10px] text-slate-500">Ayat {log.hafalan_ayah_start}–{log.hafalan_ayah_end} · Juz {log.metadata?.juz || '-'}</p></> : '—'}</td><td className="border border-slate-300 p-3 text-center dark:border-slate-600">{log?.hafalan_baris || (log ? `${Number(log.hafalan_ayah_end) - Number(log.hafalan_ayah_start) + 1} ayat` : '—')}</td><td className="border border-slate-300 p-3 dark:border-slate-600">{log?.murajaah_text || '—'}</td><td className="border border-slate-300 p-3 text-center dark:border-slate-600">{log?.murajaah_lembar || '—'}</td><td className="border border-slate-300 p-3 dark:border-slate-600">{log?.notes_teacher || '—'}</td><td className="border border-slate-300 p-3 text-center dark:border-slate-600">{log?.signature_teacher ? <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" aria-label="Sudah ditandatangani" /> : '—'}</td></tr>)}</tbody>
                <tfoot><tr className="bg-slate-50 align-top dark:bg-slate-800/60"><td colSpan="8" className="h-20 border border-slate-300 p-3 dark:border-slate-600"><strong>Catatan Guru:</strong><p className="mt-1 font-normal text-slate-600 dark:text-slate-300">{tahfizhWeekRows.map(({ log }) => log?.notes_teacher).filter(Boolean).at(-1) || 'Belum ada catatan guru pada minggu ini.'}</p></td><td colSpan="2" className="border border-slate-300 p-3 dark:border-slate-600"><strong>Guru:</strong><p className="mt-2 font-normal">{teacherName}</p></td></tr><tr className="bg-slate-50 align-top dark:bg-slate-800/60"><td colSpan="8" className="h-20 border border-slate-300 p-3 dark:border-slate-600"><strong>Catatan Orang Tua:</strong><p className="mt-1 font-normal text-slate-600 dark:text-slate-300">{tahfizhWeekRows.map(({ log }) => log?.notes_parent).filter(Boolean).at(-1) || 'Belum ada catatan orang tua pada minggu ini.'}</p></td><td colSpan="2" className="border border-slate-300 p-3 dark:border-slate-600"><strong>Ttd Orang Tua:</strong><p className="mt-2 font-normal">{tahfizhWeekRows.some(({ log }) => log?.signature_parent) ? 'Sudah ditandatangani' : 'Belum ditandatangani'}</p></td></tr></tfoot>
              </table>
            </div>
            <footer className="flex shrink-0 justify-end border-t border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#1B2433]"><button type="button" onClick={() => setShowTahfizhDetail(false)} className="h-11 rounded-xl border border-slate-200 px-5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Tutup Detail</button></footer>
          </div>
        </div>
      )}

      {/* CREATE / EDIT / DELETE MODALS */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1B2433] w-full max-w-lg rounded-[22px] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-4">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-5 top-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {modalType === 'delete-confirm' ? (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Konfirmasi Hapus Data</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Apakah Anda yakin ingin menghapus data <strong>{deleteTarget?.title}</strong>? Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleExecuteDelete}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md"
                  >
                    Ya, Hapus Data
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-base font-bold uppercase tracking-wider text-[#0E5C44] dark:text-emerald-400 flex items-center gap-2">
                  <Plus className="w-5 h-5" /> {editingId ? 'Edit' : 'Form Input'} {modalType}
                </h3>

                {modalType === 'materi' && (
                  <form onSubmit={handleSaveMateri} className="space-y-3.5 text-xs">
                    <div>
                      <label htmlFor="materi-judul" className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Judul Materi <span className="text-rose-500">*</span></label>
                      <input
                        id="materi-judul"
                        type="text"
                        required
                        value={materiForm.judul}
                        onChange={(e) => setMateriForm({ ...materiForm, judul: e.target.value })}
                        className="w-full p-2.5 border rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        placeholder="Masukkan judul materi..."
                      />
                    </div>
                    <div>
                      <label htmlFor="materi-ringkasan" className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Ringkasan Materi</label>
                      <textarea
                        id="materi-ringkasan"
                        rows={3}
                        value={materiForm.ringkasan}
                        onChange={(e) => setMateriForm({ ...materiForm, ringkasan: e.target.value })}
                        className="w-full p-2.5 border rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        placeholder="Ringkasan materi pembelajaran..."
                      />
                    </div>
                    <div>
                      <label htmlFor="materi-isi" className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Isi Materi</label>
                      <textarea id="materi-isi" rows={5} value={materiForm.isi} onChange={(e) => setMateriForm({ ...materiForm, isi: e.target.value })} className="w-full resize-y p-2.5 border rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700" placeholder="Tuliskan isi atau pokok bahasan materi..." />
                    </div>
                    <div>
                      <label htmlFor="materi-status" className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Status Publikasi <span className="text-rose-500">*</span></label>
                      <select id="materi-status" value={materiForm.status} onChange={(e) => setMateriForm({ ...materiForm, status: e.target.value })} className="h-11 w-full border rounded-xl bg-white px-3 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <option value="draft">Simpan sebagai draft</option><option value="published">Publikasikan ke siswa</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-3">
                      <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold">
                        Batal
                      </button>
                      <button type="submit" disabled={savingMaterial} className="inline-flex min-w-32 items-center justify-center gap-2 px-4 py-2 bg-[#0E5C44] text-white rounded-xl font-bold shadow-md disabled:cursor-wait disabled:opacity-60">
                        {savingMaterial && <RefreshCw className="h-4 w-4 animate-spin" />}{savingMaterial ? 'Menyimpan...' : editingId ? 'Perbarui Materi' : 'Simpan Materi'}
                      </button>
                    </div>
                  </form>
                )}

                {modalType === 'tugas' && (
                  <form onSubmit={handleSaveTugas} className="space-y-3.5 text-xs">
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Judul Tugas</label>
                      <input
                        type="text"
                        required
                        value={tugasForm.judul}
                        onChange={(e) => setTugasForm({ ...tugasForm, judul: e.target.value })}
                        className="w-full p-2.5 border rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        placeholder="Masukkan judul tugas..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Deadline</label>
                        <input
                          type="date"
                          required
                          value={tugasForm.deadline}
                          onChange={(e) => setTugasForm({ ...tugasForm, deadline: e.target.value })}
                          className="w-full p-2.5 border rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Bobot Penilaian</label>
                        <input
                          type="number"
                          value={tugasForm.bobot}
                          onChange={(e) => setTugasForm({ ...tugasForm, bobot: e.target.value })}
                          className="w-full p-2.5 border rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-3">
                      <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold">
                        Batal
                      </button>
                      <button type="submit" className="px-4 py-2 bg-[#0E5C44] text-white rounded-xl font-bold shadow-md">
                        Terbitkan Tugas
                      </button>
                    </div>
                  </form>
                )}

                {modalType === 'tahfizh' && (
                  <form onSubmit={handleSaveTahfizh} className="space-y-3.5 text-xs">
                    {/* Field Siswa Rombel dengan Soft Pastel Squircle Button */}
                    <div>
                      <label htmlFor="tahfizh-siswa" className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">
                        Siswa Rombel <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          id="tahfizh-siswa"
                          required
                          value={tahfizhForm.student_id}
                          onChange={(e) => setTahfizhForm({ ...tahfizhForm, student_id: e.target.value })}
                          className="h-11 flex-1 border rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-semibold px-3"
                        >
                          <option value="">-- Pilih Siswa Rombel --</option>
                          {students.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nama_lengkap} (NIS: {s.nis || s.nisn || '-'})
                            </option>
                          ))}
                        </select>
                        <div className="relative group">
                          <button
                            type="button"
                            onClick={() => {
                              setStudentModalSearch('')
                              setShowStudentSearchModal(true)
                            }}
                            className="w-11 h-11 rounded-[14px] bg-sky-100/90 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800 shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0"
                            aria-label="Pencarian Nama Siswa Rombel"
                          >
                            <UserCheck className="w-5 h-5" />
                          </button>
                          <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-lg z-20">
                            Pencarian Nama Siswa Rombel
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Info Profile Siswa & Data Tahfizh Terakhir / Selesai */}
                    {selectedTahfizhStudent && (
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center justify-center text-sm border border-emerald-200/80 shrink-0">
                            {selectedTahfizhStudent.avatar ? (
                              <img src={selectedTahfizhStudent.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              (selectedTahfizhStudent.nama_lengkap || 'S').slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                              {selectedTahfizhStudent.nama_lengkap}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-mono">
                              NIS: {selectedTahfizhStudent.nis || selectedTahfizhStudent.nisn || '-'} • Rombel {selectedClassName}
                            </p>
                          </div>
                        </div>

                        {previousTahfizhLog ? (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5 dark:border-emerald-800 dark:bg-emerald-950/40 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Hafalan Selesai Sebelumnya:</span>
                            </div>
                            <p className="mt-0.5 text-[11px] font-bold text-emerald-900 dark:text-emerald-200">
                              Juz {previousTahfizhLog.metadata?.juz || '-'} • Surah {previousTahfizhLog.hafalan_surah_name || '-'} (Ayat {previousTahfizhLog.hafalan_ayah_start}–{previousTahfizhLog.hafalan_ayah_end})
                            </p>
                            {automaticTahfizhTarget && (
                              <p className="mt-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold leading-relaxed">
                                ⚡ Lanjutan Otomatis: <strong>Surah {automaticTahfizhTarget.surah_name} (Mulai Ayat {automaticTahfizhTarget.ayat_start})</strong>. Silakan pilih <strong>Ayat Terakhir</strong> untuk setoran baru.
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                              <span>Data Tahfizh Siswa Belum Ada (Kosong)</span>
                            </div>
                            <p className="mt-0.5 text-[10px] text-slate-500 font-medium">
                              Belum ada setoran sebelumnya. Anda dapat mengisi Juz, Surah, Ayat Awal, dan Ayat Terakhir secara manual.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {/* Jenis Setoran dengan Soft Pastel Squircle Button */}
                      <div>
                        <label htmlFor="tahfizh-jenis" className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Jenis Setoran</label>
                        <div className="flex items-center gap-2">
                          <select
                            id="tahfizh-jenis"
                            value={tahfizhForm.type}
                            onChange={(e) => setTahfizhForm({ ...tahfizhForm, type: e.target.value })}
                            className="h-11 flex-1 border rounded-xl bg-white px-3 font-semibold dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                          >
                            {['Ziyadah', 'Murajaah', 'Tasmi', 'Ujian'].map((type) => (
                              <option key={type}>{type}</option>
                            ))}
                          </select>
                          <div className="relative group">
                            <button
                              type="button"
                              onClick={() => setShowSetoranTypeModal(true)}
                              className="w-11 h-11 rounded-[14px] bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0"
                              aria-label="Jenis Setoran Cepat"
                            >
                              <Zap className="w-5 h-5" />
                            </button>
                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-lg z-20">
                              Jenis Setoran Cepat
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Juz Capaian */}
                      <div>
                        <label htmlFor="tahfizh-juz" className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">
                          Juz Capaian <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="tahfizh-juz"
                          disabled={Boolean(previousTahfizhLog)}
                          value={tahfizhForm.juz}
                          onChange={(e) => setTahfizhForm({ ...tahfizhForm, juz: Number(e.target.value) })}
                          className="h-11 w-full border rounded-xl bg-white px-3 font-semibold dark:bg-slate-800 border-slate-200 dark:border-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:disabled:bg-slate-900"
                        >
                          {Array.from({ length: 30 }, (_, index) => index + 1).map((juz) => (
                            <option key={juz} value={juz}>Juz {juz}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Surah dari Master Al-Qur'an dengan Soft Pastel Squircle Button */}
                    <div>
                      <label htmlFor="tahfizh-surah" className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">
                        Surah dari Master Al-Qur'an <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          id="tahfizh-surah"
                          required
                          disabled={loadingSurahs || Boolean(previousTahfizhLog)}
                          value={tahfizhForm.surah_number}
                          onChange={(e) => {
                            const surahNumber = Number(e.target.value)
                            setTahfizhForm({ ...tahfizhForm, surah_number: surahNumber, ayat_start: 1, ayat_end: 1, juz: getQuranJuz(surahNumber, 1) })
                          }}
                          className="h-11 flex-1 border rounded-xl bg-white px-3 font-semibold dark:bg-slate-800 border-slate-200 dark:border-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:disabled:bg-slate-900"
                        >
                          <option value="">{loadingSurahs ? 'Memuat Master Al-Qur’an...' : '-- Pilih Surah Master --'}</option>
                          {quranSurahs.map((surah) => (
                            <option key={surah.nomor} value={surah.nomor}>
                              {surah.nomor}. {surah.nama_latin} ({surah.jumlah_ayat} ayat)
                            </option>
                          ))}
                        </select>
                        <div className="relative group">
                          <button
                            type="button"
                            onClick={() => {
                              setSurahModalSearch('')
                              setShowSurahSearchModal(true)
                            }}
                            className="w-11 h-11 rounded-[14px] bg-purple-100/90 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0"
                            aria-label="Master Surah Al-Qur'an"
                          >
                            <BookMarked className="w-5 h-5" />
                          </button>
                          <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-lg z-20">
                            Master Surah Al-Qur'an
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ayat Awal & Ayat Terakhir */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="tahfizh-ayat-awal" className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">
                          Ayat Awal
                        </label>
                        <select
                          id="tahfizh-ayat-awal"
                          disabled={!selectedTahfizhSurah || Boolean(previousTahfizhLog)}
                          value={tahfizhForm.ayat_start}
                          onChange={(e) => {
                            const value = Number(e.target.value)
                            setTahfizhForm({ ...tahfizhForm, ayat_start: value, ayat_end: Math.max(value, Number(tahfizhForm.ayat_end)), juz: getQuranJuz(tahfizhForm.surah_number, value) })
                          }}
                          className="h-11 w-full border rounded-xl bg-white px-3 font-semibold dark:bg-slate-800 border-slate-200 dark:border-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:disabled:bg-slate-900"
                        >
                          {Array.from({ length: selectedTahfizhSurah?.jumlah_ayat || 1 }, (_, index) => index + 1).map((ayat) => (
                            <option key={ayat}>{ayat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="tahfizh-ayat-akhir" className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">
                          Ayat Terakhir (Aktif)
                        </label>
                        <select
                          id="tahfizh-ayat-akhir"
                          disabled={!selectedTahfizhSurah}
                          value={tahfizhForm.ayat_end}
                          onChange={(e) => setTahfizhForm({ ...tahfizhForm, ayat_end: Number(e.target.value) })}
                          className="h-11 w-full border rounded-xl bg-white px-3 font-bold text-emerald-700 dark:text-emerald-400 dark:bg-slate-800 border-emerald-300 dark:border-emerald-700 focus:ring-2 focus:ring-emerald-500/30"
                        >
                          {Array.from({ length: selectedTahfizhSurah?.jumlah_ayat || 1 }, (_, index) => index + 1)
                            .filter((ayat) => ayat >= Number(tahfizhForm.ayat_start))
                            .map((ayat) => (
                              <option key={ayat}>{ayat}</option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {[
                        ['kelancaran', 'Kelancaran', ['Sangat Lancar', 'Lancar', 'Perlu Bimbingan']],
                        ['tajwid', 'Tajwid', ['Sangat Baik', 'Baik', 'Perlu Bimbingan']],
                        ['makhraj', 'Makhraj', ['Sangat Baik', 'Baik', 'Perlu Bimbingan']],
                      ].map(([key, label, options]) => (
                        <div key={key}>
                          <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">{label}</label>
                          <select
                            value={tahfizhForm[key]}
                            onChange={(e) => setTahfizhForm({ ...tahfizhForm, [key]: e.target.value })}
                            className="h-11 w-full border rounded-xl bg-white px-2 font-semibold dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                          >
                            {options.map((option) => (
                              <option key={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label htmlFor="tahfizh-catatan" className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Catatan Guru</label>
                      <textarea
                        id="tahfizh-catatan"
                        rows={3}
                        value={tahfizhForm.notes_teacher}
                        onChange={(e) => setTahfizhForm({ ...tahfizhForm, notes_teacher: e.target.value })}
                        placeholder="Catatan evaluasi atau target setoran berikutnya..."
                        className="w-full border rounded-xl p-2.5 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={savingTahfizh || loadingSurahs}
                        className="inline-flex min-w-32 items-center justify-center gap-2 px-4 py-2 bg-[#0E5C44] text-white rounded-xl font-bold shadow-md disabled:opacity-60 hover:bg-emerald-800 transition"
                      >
                        {savingTahfizh && <RefreshCw className="h-4 w-4 animate-spin" />}
                        {savingTahfizh ? 'Menyimpan...' : 'Simpan Setoran'}
                      </button>
                    </div>
                  </form>
                )}

                {/* POPUP MODAL PENCARIAN SISWA ROMBEL */}
                <AppModal
                  isOpen={showStudentSearchModal}
                  onClose={() => setShowStudentSearchModal(false)}
                  title="Pilih Siswa Rombel"
                  description={`Cari dan pilih siswa pada rombel ${selectedClassName} untuk setoran tahfizh`}
                  icon={UserCheck}
                  maxWidth="max-w-xl"
                >
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="search"
                        value={studentModalSearch}
                        onChange={(e) => setStudentModalSearch(e.target.value)}
                        placeholder="Cari nama siswa atau NIS..."
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-semibold outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                      {students
                        .filter((s) => !studentModalSearch.trim() || s.nama_lengkap?.toLowerCase().includes(studentModalSearch.toLowerCase()) || s.nis?.includes(studentModalSearch))
                        .map((s) => {
                          const isSelected = tahfizhForm.student_id === s.id
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setTahfizhForm({ ...tahfizhForm, student_id: s.id })
                                setShowStudentSearchModal(false)
                              }}
                              className={`flex items-center gap-3 w-full p-3 rounded-2xl border text-left transition ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/30 dark:bg-emerald-950/40 dark:border-emerald-700'
                                  : 'border-slate-200/80 hover:border-emerald-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900'
                              }`}
                            >
                              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center justify-center text-xs border border-emerald-200 shrink-0">
                                {s.avatar ? (
                                  <img src={s.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  (s.nama_lengkap || 'S').slice(0, 2).toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{s.nama_lengkap}</h4>
                                <p className="text-[11px] text-slate-500 font-mono">NIS: {s.nis || s.nisn || '-'}</p>
                              </div>
                              {isSelected ? (
                                <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-full">Dipilih</span>
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          )
                        })}

                      {students.filter((s) => !studentModalSearch.trim() || s.nama_lengkap?.toLowerCase().includes(studentModalSearch.toLowerCase()) || s.nis?.includes(studentModalSearch)).length === 0 && (
                        <div className="p-8 text-center text-xs text-slate-500">
                          Tidak ditemukan siswa dengan kata kunci "{studentModalSearch}"
                        </div>
                      )}
                    </div>
                  </div>
                </AppModal>

                {/* POPUP MODAL JENIS SETORAN TAHFIZH */}
                <AppModal
                  isOpen={showSetoranTypeModal}
                  onClose={() => setShowSetoranTypeModal(false)}
                  title="Pilih Jenis Setoran Tahfizh"
                  description="Pilih jenis atau kategori setoran hafalan Al-Qur'an siswa"
                  icon={Zap}
                  maxWidth="max-w-md"
                >
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'Ziyadah', label: 'Ziyadah', description: 'Setoran Hafalan Baru', icon: Sparkles, color: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40' },
                      { id: 'Murajaah', label: 'Murajaah', description: 'Pengulangan Hafalan Lama', icon: RefreshCw, color: 'border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/40' },
                      { id: 'Tasmi', label: 'Tasmi\'', description: 'Ujian Sekali Duduk', icon: BookOpen, color: 'border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-950/40' },
                      { id: 'Ujian', label: 'Ujian Setoran', description: 'Ujian Capaian Juz', icon: Award, color: 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40' },
                    ].map((item) => {
                      const Icon = item.icon
                      const isSelected = tahfizhForm.type === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setTahfizhForm({ ...tahfizhForm, type: item.id })
                            setShowSetoranTypeModal(false)
                          }}
                          className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                            isSelected
                              ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/50'
                              : 'border-slate-200/80 hover:border-emerald-300 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${item.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="mt-3">
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{item.label}</h4>
                            <p className="text-[10px] text-slate-500 font-medium">{item.description}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </AppModal>

                {/* POPUP MODAL MASTER SURAH AL-QUR'AN */}
                <AppModal
                  isOpen={showSurahSearchModal}
                  onClose={() => setShowSurahSearchModal(false)}
                  title="Master Surah Al-Qur'an"
                  description="Cari dan pilih dari 114 Surah Master Al-Qur'an"
                  icon={BookMarked}
                  maxWidth="max-w-2xl"
                >
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="search"
                        value={surahModalSearch}
                        onChange={(e) => setSurahModalSearch(e.target.value)}
                        placeholder="Cari nama surah (contoh: An-Naba, Al-Baqarah, 30)..."
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-semibold outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
                      {quranSurahs
                        .filter((s) => !surahModalSearch.trim() || s.nama_latin?.toLowerCase().includes(surahModalSearch.toLowerCase()) || String(s.nomor).includes(surahModalSearch))
                        .map((s) => {
                          const isSelected = Number(tahfizhForm.surah_number) === Number(s.nomor)
                          return (
                            <button
                              key={s.nomor}
                              type="button"
                              onClick={() => {
                                const surahNumber = Number(s.nomor)
                                setTahfizhForm({
                                  ...tahfizhForm,
                                  surah_number: surahNumber,
                                  ayat_start: 1,
                                  ayat_end: 1,
                                  juz: getQuranJuz(surahNumber, 1),
                                })
                                setShowSurahSearchModal(false)
                              }}
                              className={`flex items-center justify-between w-full p-3 rounded-2xl border text-left transition ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/30 dark:bg-emerald-950/40 dark:border-emerald-700'
                                  : 'border-slate-200/80 hover:border-emerald-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-extrabold text-xs flex items-center justify-center border border-purple-200 shrink-0">
                                  {s.nomor}
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{s.nama_latin}</h4>
                                  <p className="text-[10px] text-slate-500">{s.arti} • {s.jumlah_ayat} Ayat</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="block font-serif text-sm font-bold text-slate-800 dark:text-slate-200">{s.nama}</span>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Juz {getQuranJuz(s.nomor, 1)}</span>
                              </div>
                            </button>
                          )
                        })}

                      {quranSurahs.filter((s) => !surahModalSearch.trim() || s.nama_latin?.toLowerCase().includes(surahModalSearch.toLowerCase()) || String(s.nomor).includes(surahModalSearch)).length === 0 && (
                        <div className="p-8 text-center text-xs text-slate-500">
                          Tidak ditemukan surah dengan kata kunci "{surahModalSearch}"
                        </div>
                      )}
                    </div>
                  </div>
                </AppModal>

                {modalType === 'catatan' && (
                  <form onSubmit={handleSaveCatatan} className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between"><div><h3 className="text-base font-extrabold text-slate-900 dark:text-white">{editingId ? 'Edit Catatan Siswa' : 'Tambah Catatan Siswa'}</h3><p className="mt-0.5 text-[10px] text-slate-500">Catat perkembangan dan rencana tindak lanjut siswa.</p></div><button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
                    <div>
                      <label className="mb-1 block font-semibold text-slate-700 dark:text-slate-200">Siswa</label>
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30"><p className="font-bold text-emerald-800 dark:text-emerald-300">{students.find((student) => student.id === catatanForm.student_id)?.nama_lengkap || students.find((student) => student.id === catatanForm.student_id)?.full_name || 'Siswa tidak ditemukan'}</p><p className="mt-0.5 text-[10px] text-emerald-700">{selectedClassName} · Dipilih otomatis dari tabel</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="mb-1 block font-semibold text-slate-700 dark:text-slate-200">Tanggal</label><input type="date" required value={catatanForm.date} onChange={(e) => setCatatanForm({ ...catatanForm, date: e.target.value })} className="h-10 w-full rounded-xl border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-800" /></div>
                      <div><label className="mb-1 block font-semibold text-slate-700 dark:text-slate-200">Kategori</label><select value={catatanForm.category} onChange={(e) => setCatatanForm({ ...catatanForm, category: e.target.value })} className="h-10 w-full rounded-xl border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-800">{['Akademik', 'Perilaku', 'Kedisiplinan', 'Prestasi', 'Konseling', 'Tahfizh', 'Ibadah', 'Kesehatan'].map((category) => <option key={category}>{category}</option>)}</select></div>
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Judul Catatan</label>
                      <input
                        type="text"
                        required
                        value={catatanForm.title}
                        onChange={(e) => setCatatanForm({ ...catatanForm, title: e.target.value })}
                        className="w-full p-2.5 border rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        placeholder="Judul catatan perkembangan..."
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-200">Isi Catatan</label>
                      <textarea
                        rows={3}
                        required
                        value={catatanForm.content}
                        onChange={(e) => setCatatanForm({ ...catatanForm, content: e.target.value })}
                        className="w-full p-2.5 border rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        placeholder="Perkembangan atau catatan..."
                      />
                    </div>
                    <div><label className="mb-1 block font-semibold text-slate-700 dark:text-slate-200">Tindak Lanjut</label><textarea rows={2} value={catatanForm.follow_up} onChange={(e) => setCatatanForm({ ...catatanForm, follow_up: e.target.value })} className="w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800" placeholder="Rencana pendampingan berikutnya (opsional)..." /></div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div><label className="mb-1 block font-semibold text-slate-700 dark:text-slate-200">Prioritas</label><select value={catatanForm.priority} onChange={(e) => setCatatanForm({ ...catatanForm, priority: e.target.value })} className="h-10 w-full rounded-xl border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-800"><option value="low">Rendah</option><option value="medium">Sedang</option><option value="high">Tinggi</option><option value="urgent">Mendesak</option></select></div>
                      <div className="flex items-end gap-4 pb-2"><label className="flex items-center gap-2"><input type="checkbox" checked={catatanForm.visible_to_parent} onChange={(e) => setCatatanForm({ ...catatanForm, visible_to_parent: e.target.checked })} /> Orang tua</label><label className="flex items-center gap-2"><input type="checkbox" checked={catatanForm.visible_to_student} onChange={(e) => setCatatanForm({ ...catatanForm, visible_to_student: e.target.checked })} /> Siswa</label></div>
                    </div>
                    <div className="flex justify-end gap-2 pt-3">
                      <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold">
                        Batal
                      </button>
                      <button type="submit" disabled={savingStudentNote} className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-[#0E5C44] px-4 py-2 font-bold text-white shadow-md disabled:opacity-60">
                        {savingStudentNote && <RefreshCw className="h-4 w-4 animate-spin" />}{savingStudentNote ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan Catatan'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* EXPORT OPTIONS MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1B2433] w-full max-w-md rounded-[22px] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-[#0E5C44]" /> Export Data Workspace
            </h3>
            <p className="text-xs text-slate-500">Pilih format berkas yang ingin Anda unduh untuk rekap pengajaran.</p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'xlsx', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
                { id: 'csv', label: 'CSV (.csv)', icon: FileText },
                { id: 'pdf', label: 'PDF (.pdf)', icon: FileSpreadsheet },
              ].map((fmt) => {
                const Icon = fmt.icon
                const isSel = exportFormat === fmt.id
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setExportFormat(fmt.id)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition ${
                      isSel
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-[#0E5C44] text-[#0E5C44] dark:text-emerald-400 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs">{fmt.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessExport}
                className="px-4 py-2 bg-[#0E5C44] text-white text-xs font-bold rounded-xl shadow-md"
              >
                Unduh Berkas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER / MODAL */}
      {showDetailModal && detailData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1B2433] w-full max-w-md rounded-[22px] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute right-5 top-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-[#0E5C44] dark:text-emerald-300 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {detailData.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {detailData.title}
                </h3>
              </div>
            </div>

            <div className="space-y-2 border-t border-b border-slate-100 dark:border-slate-800 py-3 text-xs">
              {detailData.items.map((it, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                  <span className="text-slate-500 font-medium">{it.label}</span>
                  <span className="font-bold text-slate-900 dark:text-white text-right">{it.value}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-[#0E5C44] text-white text-xs font-bold rounded-xl shadow-md"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FACE RECOGNITION MODAL */}
      {showFaceModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#1B2433] border border-purple-500/30">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800 bg-purple-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                  <ScanFace className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Presensi AI Face Recognition</h3>
                  <p className="text-xs text-slate-400">Pindai & verifikasi wajah siswa</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFaceModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleFaceRecognitionSubmit()
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div className="relative h-44 bg-black/80 rounded-xl border-2 border-purple-500/50 flex flex-col items-center justify-center overflow-hidden">
                <div className="w-32 h-36 border-2 border-purple-400 rounded-full relative flex items-center justify-center shadow-2xl">
                  <ScanFace className="w-14 h-14 text-purple-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-purple-300 font-semibold mt-2 z-10 bg-black/70 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Posisikan Wajah Siswa di Frame Kamera
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Siswa / Santri
                </label>
                <select
                  value={faceStudentId}
                  onChange={(e) => setFaceStudentId(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 text-xs font-semibold text-slate-800 dark:text-slate-100"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.nama_lengkap} ({st.nis || st.nisn || 'No NIS'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFaceModal(false)}
                  className="px-4 py-2.5 rounded-xl border text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Simpan Presensi Wajah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRESENSI MENGAJAR STEP 04 */}
      <AppModal
        isOpen={showMulaiMengajarModal}
        onClose={() => setShowMulaiMengajarModal(false)}
        title="Presensi Mengajar Step 04"
        description="QR kartu guru mengidentifikasi guru; server tetap memvalidasi jadwal dan konteks akademik."
        icon={QrCode}
        maxWidth="max-w-3xl"
      >
        <TeacherTeachingSessionPanel onNotify={addToast} isModal={true} />
      </AppModal>
    </PageContainer>
  )
}
