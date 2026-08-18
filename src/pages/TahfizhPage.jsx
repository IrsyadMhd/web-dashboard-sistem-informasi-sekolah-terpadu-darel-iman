import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  BookOpen,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  Mic,
  MicOff,
  Play,
  Pause,
  Save,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  FileText,
  Search,
  X,
  Loader2,
  UserCheck,
  Heart,
  RefreshCcw,
  Users,
  Eye,
  BookOpenCheck,
  Target,
  ArrowRight,
  GraduationCap,
  ListFilter,
  Check,
} from 'lucide-react'
import {
  Upload1,
  Download1,
  Plus,
  ArrowBothDirectionHorizontal2,
  ChevronDown,
} from '@tailgrids/icons'
import { tahfizhService } from '../services/tahfizhService'
import { equranService } from '../services/equranService'
import { kelasService } from '../services/kelasService'
import { useUnitStore } from '../stores/unitStore'
import { useAuthStore } from '../stores/authStore'

// TailGrids Core Components
import { Button } from '@/components/tailgrids/core/button'
import { Badge } from '@/components/tailgrids/core/badge'
import { Avatar, AvatarFallback } from '@/components/tailgrids/core/avatar'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/tailgrids/core/card'
import {
  TableRoot,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/tailgrids/core/table'
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

export default function TahfizhPage() {
  // State Filter & Context
  const activeUnit = useUnitStore((state) => state.activeUnit)
  const user = useAuthStore((state) => state.user)
  const activeUnitName = String(activeUnit || user?.education_unit || user?.unit_name || user?.unit || '').toLowerCase()
  const isPesantrenUnit = Boolean(
    user?.is_pesantren ||
    activeUnitName.includes('pesantren') ||
    activeUnitName.includes('ponpes') ||
    activeUnitName.includes('mahad') ||
    activeUnitName.includes('asrama')
  )

  // Roles checking
  const userRoles = useMemo(() => {
    const rList = user?.roles || []
    return rList.map((r) => (typeof r === 'string' ? r : r.name || ''))
  }, [user])

  const isSuperAdminOrAdmin = useMemo(() => {
    return userRoles.some((r) => ['Super Admin', 'SuperAdmin', 'Admin', 'admin', 'superadmin'].includes(r))
  }, [userRoles])

  const isParent = useMemo(() => {
    return userRoles.some((r) => ['Orang Tua', 'orang_tua', 'ortu', 'parent', 'Parent'].includes(r))
  }, [userRoles])

  const isMusyrif = useMemo(() => {
    return userRoles.some((r) => ['Musyrif', 'Musyrifah', 'musyrif', 'musyrifah'].includes(r))
  }, [userRoles])

  const isGuru = useMemo(() => {
    return (
      userRoles.some((r) => ['Guru', 'Guru Tahfizh', 'Wali Kelas', 'guru', 'guru_tahfizh', 'wali_kelas'].includes(r)) ||
      (!isMusyrif && !isParent)
    )
  }, [userRoles, isMusyrif, isParent])

  const [kelases, setKelases] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [students, setStudents] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState('')

  // State View Mode ('guru' | 'musyrif' | 'ortu')
  const [viewMode, setViewMode] = useState(() => {
    if (isParent && !isSuperAdminOrAdmin) return 'ortu'
    if (isMusyrif && !isGuru) return 'musyrif'
    return 'guru'
  })

  // State Date (Start of week - Monday)
  const [currentMonday, setCurrentMonday] = useState(() => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff))
    return monday.toISOString().split('T')[0]
  })

  // Data Loading & Sheet State
  const [loadingSheet, setLoadingSheet] = useState(false)
  const [savingAll, setSavingAll] = useState(false)
  const [weeklySheet, setWeeklySheet] = useState([])
  const [summaryTeacherNotes, setSummaryTeacherNotes] = useState('')
  const [summaryParentNotes, setSummaryParentNotes] = useState('')
  const [studentProgress, setStudentProgress] = useState(null)

  // Toast Notification State
  const [notification, setNotification] = useState(null)

  // Confirmation Save Dialog State
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [singleSaveIndex, setSingleSaveIndex] = useState(null)

  // Modal Pilih Siswa State
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [studentModalSearch, setStudentModalSearch] = useState('')

  // Modal Detail Kelanjutan Tahfizh State
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false)
  const [detailStudentObj, setDetailStudentObj] = useState(null)
  const [detailStudentProgress, setDetailStudentProgress] = useState(null)
  const [loadingDetailProgress, setLoadingDetailProgress] = useState(false)

  // Master Qur'an Data & Modal State
  const [quranSurahs, setQuranSurahs] = useState([])
  const [showQuranModal, setShowQuranModal] = useState(false)
  const [selectedRowIndex, setSelectedRowIndex] = useState(null)
  const [quranSearch, setQuranSearch] = useState('')

  // Modal Quran State Form
  const [modalSurah, setModalSurah] = useState(null)
  const [modalAyahStart, setModalAyahStart] = useState(1)
  const [modalAyahEnd, setModalAyahEnd] = useState(7)
  const [modalBarisCount, setModalBarisCount] = useState(5)

  // Audio Player State
  const [playingAudioUrl, setPlayingAudioUrl] = useState(null)
  const audioRef = useRef(null)

  // Live Audio Recording State (MediaRecorder)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingRowIndex, setRecordingRowIndex] = useState(null)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [uploadingAudioRow, setUploadingAudioRow] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerIntervalRef = useRef(null)

  // Clear notification timer
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4500)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Fetch Master Data Kelas & Qur'an pada mount (Scoped to teacher/musyrif assigned classes if restricted)
  useEffect(() => {
    const initMaster = async () => {
      try {
        const [kelasRes, surahRes] = await Promise.all([
          kelasService.getDaftar({ per_page: 100 }),
          equranService.getSurahs(),
        ])
        let kList = kelasRes?.data || []

        // If teacher / musyrif role is assigned specific classes in user object, scope classes
        if (!isSuperAdminOrAdmin && (user?.kelas_id || user?.assigned_classes || user?.teacher_classes)) {
          const assignedIds = Array.isArray(user?.assigned_classes)
            ? user.assigned_classes.map(String)
            : [String(user?.kelas_id || user?.teacher_classes || '')].filter(Boolean)

          if (assignedIds.length > 0) {
            const filteredK = kList.filter((k) => assignedIds.includes(String(k.id)))
            if (filteredK.length > 0) {
              kList = filteredK
            }
          }
        }

        setKelases(kList)
        if (kList.length > 0) {
          setSelectedClassId(kList[0].id)
        }
        setQuranSurahs(surahRes || [])
      } catch (e) {
        console.error('Error init master Tahfizh:', e)
      }
    }
    initMaster()
  }, [user, isSuperAdminOrAdmin])

  // Fetch Siswa saat Kelas berubah (Scoped to current selected Class / Rombel)
  useEffect(() => {
    if (!selectedClassId) return
    const fetchSiswa = async () => {
      try {
        const res = await kelasService.getSiswaRombel(selectedClassId)
        const sList = Array.isArray(res) ? res : res?.data || []
        setStudents(sList)
        if (sList.length > 0) {
          setSelectedStudentId(sList[0].id || sList[0].student_id)
        } else {
          setSelectedStudentId('')
          setWeeklySheet([])
          setStudentProgress(null)
        }
      } catch (e) {
        console.error('Error fetch siswa:', e)
      }
    }
    fetchSiswa()
  }, [selectedClassId])

  // Filtered Students list based on search inside Student Selection Modal
  const filteredStudentsInModal = useMemo(() => {
    if (!studentModalSearch.trim()) return students
    const q = studentModalSearch.toLowerCase()
    return students.filter((s) => {
      const name = (s.nama_lengkap || s.name || s.nama || '').toLowerCase()
      const nis = (s.nis || s.nisn || '').toLowerCase()
      return name.includes(q) || nis.includes(q)
    })
  }, [students, studentModalSearch])

  // Selected student object
  const currentStudentObj = useMemo(() => {
    return students.find((s) => (s.id || s.student_id) === selectedStudentId)
  }, [students, selectedStudentId])

  // Selected class object
  const currentClassObj = useMemo(() => {
    return kelases.find((k) => String(k.id) === String(selectedClassId))
  }, [kelases, selectedClassId])

  // Fetch Weekly Sheet & Progress saat Siswa atau Tanggal Minggu berubah
  const loadSheetAndProgress = async () => {
    if (!selectedStudentId) return
    setLoadingSheet(true)
    try {
      const [sheetData, progressData] = await Promise.all([
        tahfizhService.getWeeklySheet(selectedStudentId, currentMonday),
        tahfizhService.getStudentProgress(selectedStudentId),
      ])

      if (sheetData && sheetData.days) {
        const mappedDays = sheetData.days.map((dayItem) => {
          const log = dayItem.log || {}
          return {
            record_date: dayItem.record_date,
            day_name: dayItem.day_name,
            day_index: dayItem.day_index,
            tilawah_text: log.tilawah_text || '',
            tilawah_baris: log.tilawah_baris || 0,
            hafalan_surah_number: log.hafalan_surah_number || null,
            hafalan_surah_name: log.hafalan_surah_name || '',
            hafalan_ayah_start: log.hafalan_ayah_start || '',
            hafalan_ayah_end: log.hafalan_ayah_end || '',
            hafalan_baris: log.hafalan_baris || 0,
            murajaah_text: log.murajaah_text || '',
            murajaah_lembar: log.murajaah_lembar || 0,
            audio_url: log.audio_url || '',
            notes_teacher: log.notes_teacher || '',
            notes_parent: log.notes_parent || '',
            signature_teacher: log.signature_teacher || '',
            signature_parent: log.signature_parent || '',
            isSaved: !!log.id,
          }
        })
        setWeeklySheet(mappedDays)
        setSummaryTeacherNotes(sheetData.notes_teacher_summary || '')
        setSummaryParentNotes(sheetData.notes_parent_summary || '')
      } else {
        setWeeklySheet([])
      }

      setStudentProgress(progressData || null)
    } catch (e) {
      console.error('Error load weekly sheet:', e)
      setNotification({ type: 'error', message: 'Gagal memuat data lembar mingguan tahfizh.' })
    } finally {
      setLoadingSheet(false)
    }
  }

  useEffect(() => {
    loadSheetAndProgress()
  }, [selectedStudentId, currentMonday])

  // Navigasi Minggu (Prev / Next)
  const handlePrevWeek = () => {
    const curr = new Date(currentMonday)
    curr.setDate(curr.getDate() - 7)
    setCurrentMonday(curr.toISOString().split('T')[0])
  }

  const handleNextWeek = () => {
    const curr = new Date(currentMonday)
    curr.setDate(curr.getDate() + 7)
    setCurrentMonday(curr.toISOString().split('T')[0])
  }

  // Handle Cell Change in Table
  const handleCellChange = (index, field, value) => {
    const updated = [...weeklySheet]
    updated[index][field] = value
    updated[index].isModified = true
    setWeeklySheet(updated)
  }

  // Open Qur'an Master Modal for Hafalan Baru selection
  const handleOpenQuranModal = (rowIndex) => {
    setSelectedRowIndex(rowIndex)
    const currentRow = weeklySheet[rowIndex]
    if (currentRow.hafalan_surah_number) {
      const foundSurah = quranSurahs.find((s) => Number(s.nomor) === Number(currentRow.hafalan_surah_number))
      setModalSurah(foundSurah || quranSurahs[0] || null)
      setModalAyahStart(currentRow.hafalan_ayah_start || 1)
      setModalAyahEnd(currentRow.hafalan_ayah_end || (foundSurah ? foundSurah.jumlah_ayat : 7))
      setModalBarisCount(currentRow.hafalan_baris || 5)
    } else {
      setModalSurah(quranSurahs[0] || null)
      setModalAyahStart(1)
      setModalAyahEnd(7)
      setModalBarisCount(5)
    }
    setShowQuranModal(true)
  }

  // Apply Qur'an Selection to Row
  const handleApplyQuranSelection = () => {
    if (selectedRowIndex === null || !modalSurah) return
    const updated = [...weeklySheet]
    updated[selectedRowIndex].hafalan_surah_number = modalSurah.nomor
    updated[selectedRowIndex].hafalan_surah_name = modalSurah.nama_latin || modalSurah.nama
    updated[selectedRowIndex].hafalan_ayah_start = Number(modalAyahStart)
    updated[selectedRowIndex].hafalan_ayah_end = Number(modalAyahEnd)
    updated[selectedRowIndex].hafalan_baris = Number(modalBarisCount)
    updated[selectedRowIndex].isModified = true
    setWeeklySheet(updated)
    setShowQuranModal(false)
  }

  // Open Modal Detail Kelanjutan Tahfizh Siswa
  const handleOpenDetailProgressModal = async (student) => {
    const sId = student.id || student.student_id
    setDetailStudentObj(student)
    setShowStudentDetailModal(true)
    setLoadingDetailProgress(true)
    try {
      const pData = await tahfizhService.getStudentProgress(sId)
      setDetailStudentProgress(pData)
    } catch (e) {
      console.error('Error get detail progress:', e)
    } finally {
      setLoadingDetailProgress(false)
    }
  }

  // Live Audio Recording logic via Browser MediaRecorder (Hanya untuk Orang Tua / Super Admin)
  const startRecording = async (rowIndex) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioFile = new File([audioBlob], `murajaah_${Date.now()}.webm`, { type: 'audio/webm' })

        setUploadingAudioRow(rowIndex)
        try {
          const res = await tahfizhService.uploadAudio(audioFile)
          if (res && res.audio_url) {
            handleCellChange(rowIndex, 'audio_url', res.audio_url)
            setNotification({ type: 'success', message: 'Rekaman suara murajaah berhasil diunggah!' })
          }
        } catch (e) {
          console.error(e)
          setNotification({ type: 'error', message: 'Gagal mengunggah rekaman suara murajaah.' })
        } finally {
          setUploadingAudioRow(null)
        }

        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingRowIndex(rowIndex)
      setRecordingSeconds(0)

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Mic access error:', err)
      setNotification({ type: 'error', message: 'Akses mikrofon ditolak atau tidak didukung oleh perangkat ini.' })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setRecordingRowIndex(null)
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }

  // Handle File Upload Audio Murajaah (Manual)
  const handleAudioUpload = async (index, file) => {
    if (!file) return
    setUploadingAudioRow(index)
    try {
      const res = await tahfizhService.uploadAudio(file)
      if (res && res.audio_url) {
        handleCellChange(index, 'audio_url', res.audio_url)
        setNotification({ type: 'success', message: 'File rekaman suara murajaah terunggah!' })
      }
    } catch (e) {
      console.error(e)
      setNotification({ type: 'error', message: 'Gagal mengunggah file rekaman suara.' })
    } finally {
      setUploadingAudioRow(null)
    }
  }

  // Play / Pause Audio Recording
  const handlePlayAudio = (url) => {
    if (!url) return
    if (playingAudioUrl === url && audioRef.current) {
      audioRef.current.pause()
      setPlayingAudioUrl(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }

    const fullUrl = url.startsWith('http') ? url : `http://localhost:8000${url}`
    const newAudio = new Audio(fullUrl)
    newAudio.play()
    audioRef.current = newAudio
    setPlayingAudioUrl(url)

    newAudio.onended = () => {
      setPlayingAudioUrl(null)
    }
  }

  // Confirm Save Single Day or All Weekly
  const promptSaveConfirmation = (index = null) => {
    if (!selectedStudentId) {
      setNotification({ type: 'warning', message: 'Silakan pilih siswa terlebih dahulu.' })
      return
    }
    setSingleSaveIndex(index)
    setShowSaveConfirm(true)
  }

  // Execute Save Action
  const handleConfirmSave = async () => {
    setShowSaveConfirm(false)
    if (singleSaveIndex !== null) {
      const index = singleSaveIndex
      const row = weeklySheet[index]
      try {
        const payload = {
          student_id: selectedStudentId,
          class_id: selectedClassId,
          record_date: row.record_date,
          day_name: row.day_name,
          tilawah_text: row.tilawah_text,
          tilawah_baris: Number(row.tilawah_baris) || 0,
          hafalan_surah_number: row.hafalan_surah_number ? Number(row.hafalan_surah_number) : null,
          hafalan_surah_name: row.hafalan_surah_name,
          hafalan_ayah_start: row.hafalan_ayah_start ? Number(row.hafalan_ayah_start) : null,
          hafalan_ayah_end: row.hafalan_ayah_end ? Number(row.hafalan_ayah_end) : null,
          hafalan_baris: Number(row.hafalan_baris) || 0,
          murajaah_text: row.murajaah_text,
          murajaah_lembar: Number(row.murajaah_lembar) || 0,
          audio_url: row.audio_url,
          notes_teacher: summaryTeacherNotes,
          notes_parent: summaryParentNotes,
          signature_teacher: row.signature_teacher || 'Guru Verified',
          signature_parent: row.signature_parent || 'Ortu Verified',
        }

        await tahfizhService.saveDailyLog(payload)
        const updated = [...weeklySheet]
        updated[index].isSaved = true
        updated[index].isModified = false
        setWeeklySheet(updated)

        const pData = await tahfizhService.getStudentProgress(selectedStudentId)
        setStudentProgress(pData)

        setNotification({
          type: 'success',
          message: `Data Tahfizh hari ${row.day_name} (${row.record_date}) berhasil disimpan!`,
        })
      } catch (e) {
        console.error(e)
        setNotification({ type: 'error', message: 'Gagal menyimpan data log harian.' })
      }
    } else {
      setSavingAll(true)
      try {
        const savePromises = weeklySheet.map((row) => {
          const payload = {
            student_id: selectedStudentId,
            class_id: selectedClassId,
            record_date: row.record_date,
            day_name: row.day_name,
            tilawah_text: row.tilawah_text,
            tilawah_baris: Number(row.tilawah_baris) || 0,
            hafalan_surah_number: row.hafalan_surah_number ? Number(row.hafalan_surah_number) : null,
            hafalan_surah_name: row.hafalan_surah_name,
            hafalan_ayah_start: row.hafalan_ayah_start ? Number(row.hafalan_ayah_start) : null,
            hafalan_ayah_end: row.hafalan_ayah_end ? Number(row.hafalan_ayah_end) : null,
            hafalan_baris: Number(row.hafalan_baris) || 0,
            murajaah_text: row.murajaah_text,
            murajaah_lembar: Number(row.murajaah_lembar) || 0,
            audio_url: row.audio_url,
            notes_teacher: summaryTeacherNotes,
            notes_parent: summaryParentNotes,
            signature_teacher: 'Guru Verified',
            signature_parent: 'Ortu Verified',
          }
          return tahfizhService.saveDailyLog(payload)
        })

        await Promise.all(savePromises)
        await loadSheetAndProgress()

        setNotification({
          type: 'success',
          message: 'Seluruh lembar data Tahfizh pekan ini berhasil disimpan!',
        })
      } catch (e) {
        console.error(e)
        setNotification({ type: 'error', message: 'Gagal menyimpan seluruh lembar mingguan.' })
      } finally {
        setSavingAll(false)
      }
    }
  }

  // Filtered Quran list for modal
  const filteredQuranSurahs = useMemo(() => {
    if (!quranSearch) return quranSurahs
    const q = quranSearch.toLowerCase()
    return quranSurahs.filter(
      (s) =>
        s.nama_latin?.toLowerCase().includes(q) ||
        s.arti?.toLowerCase().includes(q) ||
        String(s.nomor).includes(q)
    )
  }, [quranSurahs, quranSearch])

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification Alert */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border text-sm font-bold flex items-center gap-3 transition-all animate-bounce ${
            notification.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : notification.type === 'warning'
              ? 'bg-amber-900 text-amber-100 border-amber-700'
              : 'bg-rose-900 text-rose-100 border-rose-700'
          }`}
        >
          {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {notification.type === 'warning' && <Clock className="w-5 h-5 text-amber-400" />}
          {notification.type === 'error' && <X className="w-5 h-5 text-rose-400" />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2 text-white/70 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Context Selection Toolbar & Action Squircle Buttons */}
      <Card className="rounded-[18px] border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
        <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <span>Setoran Tahfizh {isPesantrenUnit ? 'Santri' : 'Siswa'} & Murajaah Harian</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Pencatatan hafalan Al-Qur'an harian dan evaluasi murajaah secara terpadu.
            </CardDescription>
          </div>

          {/* Mode Switcher & Soft Pastel Squircle Toolbar Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex items-center gap-1 dark:bg-slate-900 dark:border-slate-800">
              {/* Button Mode Guru (Tampil jika role Guru / Admin) */}
              {(isGuru || isSuperAdminOrAdmin) && (
                <button
                  type="button"
                  onClick={() => setViewMode('guru')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                    viewMode === 'guru'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Mode Guru</span>
                </button>
              )}

              {/* Button Mode Musyrif (Tampil jika role Musyrif / Admin) */}
              {(isMusyrif || isSuperAdminOrAdmin) && (
                <button
                  type="button"
                  onClick={() => setViewMode('musyrif')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                    viewMode === 'musyrif'
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Mode Musyrif</span>
                </button>
              )}

              {/* Button Mode Orang Tua (HANYA Tampil jika role Orang Tua / Admin) */}
              {(isParent || isSuperAdminOrAdmin) && (
                <button
                  type="button"
                  onClick={() => setViewMode('ortu')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                    viewMode === 'ortu'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  <span>Mode Orang Tua</span>
                </button>
              )}
            </div>

            {/* Soft Pastel Squircle Action 1: Upload (Sky Blue) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                title="Import Log / Sound"
                className="flex size-10 items-center justify-center rounded-2xl bg-sky-100/90 text-sky-600 hover:bg-sky-200/90 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm dark:bg-sky-950/60 dark:text-sky-400"
                onClick={() => setNotification({ type: 'warning', message: 'Fitur Import Log Tahfizh dapat diakses via menu Import Master Data.' })}
              >
                <Upload1 className="size-5" />
              </button>
              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl">
                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900" />
                Import Log Tahfizh
              </div>
            </div>

            {/* Soft Pastel Squircle Action 2: Export (Amber/Orange) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                title="Export Rekap Pekanan"
                className="flex size-10 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-700 hover:bg-amber-200/90 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm dark:bg-amber-950/60 dark:text-amber-400"
                onClick={() => window.print()}
              >
                <Download1 className="size-5" />
              </button>
              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl">
                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900" />
                Cetak / Export Rekap
              </div>
            </div>

            {/* Soft Pastel Squircle Action 3: Save All (Emerald/Green) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                title="Simpan Seluruh Pekan Ini"
                disabled={savingAll || !selectedStudentId}
                className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-700 hover:bg-emerald-200/90 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm disabled:opacity-50 dark:bg-emerald-950/60 dark:text-emerald-400"
                onClick={() => promptSaveConfirmation(null)}
              >
                {savingAll ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
              </button>
              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl">
                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900" />
                Simpan Seluruh Minggu Ini
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {/* 1. Pilih Kelas / Rombel */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider dark:text-slate-300">
                1. Pilih Kelas / Rombel:
              </label>
              <div className="relative">
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full h-11 appearance-none px-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
                >
                  {kelases.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama_kelas || k.nama || `Kelas ${k.id}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* 2. Pilih Siswa / Santri (Field Indikator & Tombol Standalone Di Luar Field) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider dark:text-slate-300">
                2. Pilih Siswa / Santri:
              </label>
              <div className="flex items-center gap-2">
                {/* Field Indikator Nama Siswa */}
                <div className="flex-1 h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-2 truncate dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200">
                  <Avatar size="xs">
                    <AvatarFallback className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] dark:bg-emerald-950 dark:text-emerald-300">
                      {(currentStudentObj?.nama_lengkap || currentStudentObj?.nama || 'S').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">
                    {currentStudentObj
                      ? `${currentStudentObj.nama_lengkap || currentStudentObj.nama} ${currentStudentObj.nis ? `(${currentStudentObj.nis})` : ''}`
                      : 'Belum Memilih Siswa'}
                  </span>
                </div>

                {/* Tombol Standalone "Pilih Siswa" Di Luar Field */}
                <Button
                  type="button"
                  variant="primary"
                  appearance="fill"
                  size="sm"
                  onClick={() => setShowStudentModal(true)}
                  className="h-11 font-extrabold shrink-0 px-4"
                >
                  <Users className="w-4 h-4 mr-1.5" />
                  <span>Pilih Siswa</span>
                </Button>
              </div>
            </div>

            {/* 3. Periode Pekan (Senin - Ahad) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider dark:text-slate-300">
                3. Periode Pekan (Senin - Ahad):
              </label>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handlePrevWeek}
                  variant="ghost"
                  appearance="outline"
                  size="sm"
                  iconOnly
                  title="Pekan Sebelumnya"
                  className="h-11"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1 h-11 text-center bg-emerald-50 border border-emerald-200 px-3 rounded-xl text-xs font-extrabold text-emerald-900 flex items-center justify-center gap-2 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Senin, {currentMonday}</span>
                </div>
                <Button
                  onClick={handleNextWeek}
                  variant="ghost"
                  appearance="outline"
                  size="sm"
                  iconOnly
                  title="Pekan Selanjutnya"
                  className="h-11"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Student Summary Bar */}
          {currentStudentObj && (
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Avatar size="md" status="online">
                  <AvatarFallback className="bg-emerald-100 text-emerald-800 font-extrabold dark:bg-emerald-950 dark:text-emerald-300">
                    {(currentStudentObj.nama_lengkap || currentStudentObj.nama || 'S').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{currentStudentObj.nama_lengkap || currentStudentObj.nama}</span>
                    {currentStudentObj.nis && (
                      <Badge color="emerald" size="sm">
                        NIS: {currentStudentObj.nis}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Rombel: {currentClassObj?.nama_kelas || 'Kelas Aktif'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  appearance="outline"
                  size="xs"
                  onClick={() => handleOpenDetailProgressModal(currentStudentObj)}
                  className="font-extrabold text-sky-700 border-sky-300 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  <span>Lihat Kelanjutan Tahfizh</span>
                </Button>

                <Badge color="cyan" size="md">
                  Mode: {viewMode === 'guru' ? 'Guru' : viewMode === 'musyrif' ? 'Musyrif' : 'Orang Tua'}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CARD KHUSUS REKAP DATA & PENCAAPAIAN TAHFIZH SISWA ROMBEL GURU / MUSYRIF */}
      {(isGuru || isMusyrif || isSuperAdminOrAdmin) && (
        <Card className="rounded-[18px] border border-slate-200/80 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-[#1B2433]">
          <CardHeader className="bg-slate-50 border-b border-slate-200/80 p-5 dark:bg-slate-900 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <span>Pencapaian & Rekap Siswa Rombel ({currentClassObj?.nama_kelas || 'Rombel Saya'})</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Ringkasan pencapaian hafalan seluruh siswa pada rombel yang diampu oleh Guru / Musyrif aktif.
              </CardDescription>
            </div>

            <Badge color="emerald" size="md">
              Total {students.length} Siswa Terdaftar di Rombel Ini
            </Badge>
          </CardHeader>

          <CardContent className="p-5 space-y-5">
            {/* Grid Kartu Rincian Siswa Rombel */}
            {students.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                Belum ada siswa terdaftar di rombel ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((st, sIdx) => {
                  const sId = st.id || st.student_id
                  const isSelected = sId === selectedStudentId
                  return (
                    <div
                      key={sId}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20 dark:bg-emerald-950/40 dark:border-emerald-800'
                          : 'bg-white hover:bg-slate-50 border-slate-200/80 dark:bg-slate-900 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar size="sm">
                            <AvatarFallback className="bg-emerald-100 text-emerald-900 font-extrabold text-xs dark:bg-emerald-950 dark:text-emerald-200">
                              {(st.nama_lengkap || st.nama || 'S').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                              {st.nama_lengkap || st.nama}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              NIS: {st.nis || st.nisn || '-'}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <Badge color="success" size="sm">
                            Aktif
                          </Badge>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          appearance="outline"
                          size="xs"
                          onClick={() => handleOpenDetailProgressModal(st)}
                          className="font-extrabold text-sky-700 border-sky-300 bg-sky-50 hover:bg-sky-100 text-[11px] dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>Progress</span>
                        </Button>

                        <Button
                          type="button"
                          variant={isSelected ? 'success' : 'primary'}
                          appearance="fill"
                          size="xs"
                          onClick={() => setSelectedStudentId(sId)}
                          className="font-extrabold text-[11px]"
                        >
                          {isSelected ? 'Terpilih' : 'Pilih Input'}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progress KPI Cards Siswa Terpilih */}
      {studentProgress && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="rounded-[18px] border border-emerald-100 bg-white p-4.5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold">Total Dihafal</div>
                <div className="text-xl font-extrabold text-emerald-900 dark:text-emerald-400">
                  {studentProgress.total_ayats_memorized.toLocaleString('id-ID')}{' '}
                  <span className="text-xs font-bold text-emerald-600">Ayat</span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {studentProgress.total_surahs_memorized} Surah Dihafal
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-[18px] border border-amber-100 bg-white p-4.5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold">Sisa Belum Dihafal</div>
                <div className="text-xl font-extrabold text-amber-900 dark:text-amber-400">
                  {studentProgress.remaining_ayats.toLocaleString('id-ID')}{' '}
                  <span className="text-xs font-bold text-amber-600">Ayat</span>
                </div>
                <div className="text-[11px] text-amber-600 font-medium">
                  Sisa {studentProgress.remaining_surahs} Surah Lagi
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-[18px] border border-cyan-100 bg-white p-4.5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold">Prosentase Target</div>
                <div className="text-xl font-extrabold text-cyan-900 dark:text-cyan-400">
                  {studentProgress.progress_percentage}%
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Dari Target 30 Juz (6.236 Ayat)</div>
              </div>
            </div>
          </Card>

          <Card className="rounded-[18px] border border-indigo-100 bg-white p-4.5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
            <div className="flex flex-col justify-center gap-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-200">
                <span>Progres 30 Juz</span>
                <span className="text-indigo-600 dark:text-indigo-400">{studentProgress.progress_percentage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${studentProgress.progress_percentage}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 text-right">Target Lengkap 114 Surah</div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Datatable Container */}
      <Card className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-sm">
            <FileText className="w-4 h-4 text-emerald-300" />
            <span>Formulir Tahfizh & Murajaah Harian (Senin - Ahad)</span>
            {currentStudentObj && (
              <Badge color="emerald" size="sm" className="ml-2">
                Siswa: {currentStudentObj.nama_lengkap || currentStudentObj.nama}
              </Badge>
            )}
          </div>
          <span className="text-xs text-emerald-200 font-medium">
            Mode Aktif: <strong className="uppercase text-emerald-300 font-extrabold">{viewMode}</strong>
          </span>
        </div>

        {loadingSheet ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
            <Loader2 className="w-9 h-9 animate-spin text-emerald-600" />
            <span className="text-sm font-semibold text-slate-600">Memuat lembar data Tahfizh pekan ini...</span>
          </div>
        ) : weeklySheet.length === 0 ? (
          <div className="p-16 text-center text-slate-400 font-semibold">Silakan pilih siswa untuk melihat lembar data Tahfizh</div>
        ) : (
          <div className="px-4 sm:px-6 md:px-8 py-2 overflow-x-auto">
            <TableRoot fullBleed={false}>
              <TableHeader className="bg-emerald-100/70 border-b border-emerald-200 text-emerald-950 font-extrabold uppercase text-[11px] tracking-wider dark:bg-emerald-950/60 dark:text-emerald-200">
                <TableRow>
                  <TableHead className="px-3 py-3 text-center border-r border-emerald-200/60 w-12">No</TableHead>
                  <TableHead className="px-3 py-3 border-r border-emerald-200/60 w-36">
                    <div className="flex items-center gap-1">
                      <span>Hari / Tanggal</span>
                      <ArrowBothDirectionHorizontal2 className="h-3 w-3 shrink-0" />
                    </div>
                  </TableHead>
                  <TableHead className="px-3 py-3 border-r border-emerald-200/60 w-44">
                    Tilawah <span className="text-[10px] text-emerald-700 block font-normal">(Input Guru)</span>
                  </TableHead>
                  <TableHead className="px-2 py-3 border-r border-emerald-200/60 text-center w-16">Baris</TableHead>
                  <TableHead className="px-3 py-3 border-r border-emerald-200/60">
                    Hafalan Baru <span className="text-[10px] text-emerald-700 block font-normal">(Tarik Master Al-Qur'an)</span>
                  </TableHead>
                  <TableHead className="px-2 py-3 border-r border-emerald-200/60 text-center w-16">Baris</TableHead>
                  <TableHead className="px-3 py-3 border-r border-emerald-200/60">
                    Murajaah & Audio <span className="text-[10px] text-emerald-700 block font-normal">(Murajaah & Sound)</span>
                  </TableHead>
                  <TableHead className="px-2 py-3 border-r border-emerald-200/60 text-center w-16">Lembar</TableHead>
                  <TableHead className="px-3 py-3 border-r border-emerald-200/60 text-center w-28">Status</TableHead>
                  <TableHead className="px-3 py-3 text-center w-20">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-200 font-medium dark:divide-slate-800">
                {weeklySheet.map((row, idx) => (
                  <TableRow
                    key={row.record_date}
                    className={`transition-all duration-200 hover:bg-slate-50/90 dark:hover:bg-slate-800/50 ${
                      row.isSaved ? 'bg-emerald-50/20 dark:bg-emerald-950/20' : ''
                    }`}
                  >
                    {/* No */}
                    <TableCell className="px-3 py-3 text-center font-extrabold text-slate-700 border-r border-slate-200 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-300">
                      {idx + 1}
                    </TableCell>

                    {/* Hari / Tanggal */}
                    <TableCell className="px-3 py-3 border-r border-slate-200 font-bold text-slate-800 bg-slate-50/30 dark:bg-slate-900/30 dark:border-slate-800 dark:text-white">
                      <div className="text-sm font-extrabold text-emerald-900 dark:text-emerald-400">{row.day_name}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{row.record_date}</div>
                    </TableCell>

                    {/* Tilawah */}
                    <TableCell className="px-2 py-2 border-r border-slate-200 dark:border-slate-800">
                      <input
                        type="text"
                        value={row.tilawah_text}
                        onChange={(e) => handleCellChange(idx, 'tilawah_text', e.target.value)}
                        placeholder="Contoh: Surah 2 (Ayat 1-10)"
                        readOnly={viewMode === 'ortu'}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                      />
                    </TableCell>
                    <TableCell className="px-1.5 py-2 border-r border-slate-200 text-center dark:border-slate-800">
                      <input
                        type="number"
                        min="0"
                        value={row.tilawah_baris}
                        onChange={(e) => handleCellChange(idx, 'tilawah_baris', e.target.value)}
                        readOnly={viewMode === 'ortu'}
                        className="w-full px-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                      />
                    </TableCell>

                    {/* Hafalan Baru */}
                    <TableCell className="px-2 py-2 border-r border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Button
                          onClick={() => handleOpenQuranModal(idx)}
                          disabled={viewMode === 'ortu'}
                          variant="ghost"
                          appearance="outline"
                          size="xs"
                          className="font-extrabold text-emerald-900 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                        >
                          <BookOpen className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                          <span>{row.hafalan_surah_name ? row.hafalan_surah_name : 'Pilih Surah'}</span>
                        </Button>

                        {row.hafalan_surah_number && (
                          <Badge color="gray" size="sm">
                            Ayat {row.hafalan_ayah_start}-{row.hafalan_ayah_end}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-1.5 py-2 border-r border-slate-200 text-center dark:border-slate-800">
                      <input
                        type="number"
                        min="0"
                        value={row.hafalan_baris}
                        onChange={(e) => handleCellChange(idx, 'hafalan_baris', e.target.value)}
                        readOnly={viewMode === 'ortu'}
                        className="w-full px-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                      />
                    </TableCell>

                    {/* Murajaah & Sound Recording */}
                    <TableCell className="px-2 py-2 border-r border-slate-200 dark:border-slate-800">
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={row.murajaah_text}
                          onChange={(e) => handleCellChange(idx, 'murajaah_text', e.target.value)}
                          placeholder="Juz/Surah/Ayat Murajaah..."
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                        />

                        {/* Live Recording Toolbar (HANYA MUNCUL JIKA USER = ORANG TUA ATAU SUPER ADMIN) */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(isParent || isSuperAdminOrAdmin) && (
                            <>
                              {isRecording && recordingRowIndex === idx ? (
                                <button
                                  type="button"
                                  onClick={stopRecording}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-rose-600 text-white animate-pulse flex items-center gap-1 shadow-md"
                                >
                                  <MicOff className="w-3.5 h-3.5" />
                                  <span>Stop ({recordingSeconds}s)</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => startRecording(idx)}
                                  className="px-2 py-1 rounded-lg text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1 transition-all active:scale-95 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
                                  title="Rekam Suara Langsung lewat Mikrofon"
                                >
                                  <Mic className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Rekam Suara</span>
                                </button>
                              )}
                            </>
                          )}

                          {row.audio_url && (
                            <button
                              type="button"
                              onClick={() => handlePlayAudio(row.audio_url)}
                              className={`px-2 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all ${
                                playingAudioUrl === row.audio_url
                                  ? 'bg-indigo-600 text-white animate-pulse shadow-md'
                                  : 'bg-indigo-50 text-indigo-900 border border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900'
                              }`}
                            >
                              {playingAudioUrl === row.audio_url ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                              <span>{playingAudioUrl === row.audio_url ? 'Pause' : 'Putar Sound'}</span>
                            </button>
                          )}

                          <label className="cursor-pointer px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold border border-slate-300 flex items-center gap-1 transition-all active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                            {uploadingAudioRow === idx ? (
                              <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                            ) : (
                              <Upload1 className="w-3 h-3 text-emerald-600" />
                            )}
                            <span>{uploadingAudioRow === idx ? 'Uploading...' : 'Upload'}</span>
                            <input
                              type="file"
                              accept="audio/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleAudioUpload(idx, e.target.files[0])
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-1.5 py-2 border-r border-slate-200 text-center dark:border-slate-800">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={row.murajaah_lembar}
                        onChange={(e) => handleCellChange(idx, 'murajaah_lembar', e.target.value)}
                        className="w-full px-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                      />
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="px-2 py-2 border-r border-slate-200 text-center dark:border-slate-800">
                      {row.isSaved ? (
                        <Badge color="success" size="sm" prefixIcon={CheckCircle2}>
                          Verified
                        </Badge>
                      ) : row.isModified ? (
                        <Badge color="warning" size="sm">
                          Belum Simpan
                        </Badge>
                      ) : (
                        <Badge color="gray" size="sm">
                          Draft
                        </Badge>
                      )}
                    </TableCell>

                    {/* Aksi Simpan Per Hari */}
                    <TableCell className="px-2 py-2 text-center">
                      <Button
                        onClick={() => promptSaveConfirmation(idx)}
                        variant="primary"
                        appearance="fill"
                        size="xs"
                        iconOnly
                        title="Simpan Log Hari Ini"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableRoot>
          </div>
        )}
      </Card>

      {/* Bottom Notes & Signatures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-[18px] border border-emerald-100 bg-white p-5 shadow-sm space-y-3 dark:border-slate-800 dark:bg-[#1B2433]">
          <CardHeader className="p-0 border-b border-slate-100 pb-2 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-emerald-950 font-extrabold flex items-center gap-2 dark:text-emerald-400">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <span>Catatan Guru / Musyrif :</span>
              </CardTitle>
              <Badge color="emerald" size="sm">
                Guru 1 : Verified
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <textarea
              rows={3}
              value={summaryTeacherNotes}
              onChange={(e) => setSummaryTeacherNotes(e.target.value)}
              placeholder="Tuliskan evaluasi, tajwid, makhraj, dan catatan khusus dari Guru/Musyrif..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
            />
          </CardContent>
        </Card>

        <Card className="rounded-[18px] border border-teal-100 bg-white p-5 shadow-sm space-y-3 dark:border-slate-800 dark:bg-[#1B2433]">
          <CardHeader className="p-0 border-b border-slate-100 pb-2 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-teal-950 font-extrabold flex items-center gap-2 dark:text-teal-400">
                <Heart className="w-4 h-4 text-teal-700" />
                <span>Catatan Orang Tua :</span>
              </CardTitle>
              <Badge color="cyan" size="sm">
                Ttd Ortu : Verified
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <textarea
              rows={3}
              value={summaryParentNotes}
              onChange={(e) => setSummaryParentNotes(e.target.value)}
              placeholder="Tuliskan perkembangan murajaah anak di rumah atau pesan untuk guru..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
            />
          </CardContent>
        </Card>
      </div>

      {/* MODAL POPUP SELECTION SISWA */}
      {showStudentModal && (
        <Backdrop isOpen={showStudentModal} onOpenChange={setShowStudentModal}>
          <Dialog className="max-w-2xl w-full">
            <DialogHeader className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-t-2xl p-5">
              <DialogTitle className="text-white font-extrabold text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-300" />
                <span>Pilih Siswa / Santri - {currentClassObj?.nama_kelas || 'Kelas Rombel'}</span>
              </DialogTitle>
              <DialogDescription className="text-emerald-100/90 text-xs mt-1">
                Pilih siswa untuk mengelola log setoran hafalan & murajaah harian atau lihat kelanjutan tahfizh.
              </DialogDescription>
              <DialogClose onClick={() => setShowStudentModal(false)} />
            </DialogHeader>

            <DialogBody className="p-6 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentModalSearch}
                  onChange={(e) => setStudentModalSearch(e.target.value)}
                  placeholder="Cari nama siswa atau NIS..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                {filteredStudentsInModal.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                    Tidak ada siswa ditemukan pada rombel ini.
                  </div>
                ) : (
                  filteredStudentsInModal.map((s) => {
                    const sId = s.id || s.student_id
                    const isSelected = sId === selectedStudentId
                    return (
                      <div
                        key={sId}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 dark:bg-emerald-950/40 dark:border-emerald-800'
                            : 'bg-white hover:bg-slate-50 border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Avatar size="md" status={isSelected ? 'online' : 'offline'}>
                            <AvatarFallback className="bg-emerald-100 text-emerald-800 font-extrabold dark:bg-emerald-900 dark:text-emerald-200">
                              {(s.nama_lengkap || s.nama || 'S').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                              {s.nama_lengkap || s.nama}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>NIS: {s.nis || s.nisn || '-'}</span>
                              <span>•</span>
                              <span>{s.nama_kelas || currentClassObj?.nama_kelas || 'Kelas'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            appearance="outline"
                            size="xs"
                            onClick={() => handleOpenDetailProgressModal(s)}
                            className="font-extrabold text-sky-700 border-sky-300 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800"
                            title="Lihat Kelanjutan Tahfizh Siswa Ini"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            <span>Kelanjutan Tahfizh</span>
                          </Button>

                          <Button
                            type="button"
                            variant={isSelected ? 'success' : 'primary'}
                            appearance="fill"
                            size="xs"
                            onClick={() => {
                              setSelectedStudentId(sId)
                              setShowStudentModal(false)
                            }}
                            className="font-extrabold"
                          >
                            {isSelected ? 'Terpilih' : 'Pilih Siswa'}
                          </Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </DialogBody>

            <DialogFooter className="bg-slate-50 border-t p-4 flex items-center justify-between dark:bg-slate-900 dark:border-slate-800">
              <div className="text-xs text-slate-500 font-semibold">
                Total {filteredStudentsInModal.length} Siswa Terdaftar
              </div>
              <Button
                type="button"
                onClick={() => setShowStudentModal(false)}
                variant="ghost"
                appearance="outline"
                size="sm"
              >
                Tutup Modal
              </Button>
            </DialogFooter>
          </Dialog>
        </Backdrop>
      )}

      {/* MODAL POPUP DETAIL KELANJUTAN TAHFIZH SISWA */}
      {showStudentDetailModal && detailStudentObj && (
        <Backdrop isOpen={showStudentDetailModal} onOpenChange={setShowStudentDetailModal}>
          <Dialog className="max-w-xl w-full">
            <DialogHeader className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 text-white rounded-t-2xl p-5">
              <DialogTitle className="text-white font-extrabold text-lg flex items-center gap-2">
                <BookOpenCheck className="w-5 h-5 text-emerald-300" />
                <span>Detail Kelanjutan Tahfizh Siswa</span>
              </DialogTitle>
              <DialogDescription className="text-emerald-100/90 text-xs mt-1">
                Rincian capaian target hafalan Al-Qur'an 30 Juz dan kelanjutan setoran.
              </DialogDescription>
              <DialogClose onClick={() => setShowStudentDetailModal(false)} />
            </DialogHeader>

            <DialogBody className="p-6 space-y-4">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-center gap-3.5 dark:bg-emerald-950/40 dark:border-emerald-900">
                <Avatar size="lg" status="online">
                  <AvatarFallback className="bg-emerald-700 text-white font-black text-lg">
                    {(detailStudentObj.nama_lengkap || detailStudentObj.nama || 'S').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {detailStudentObj.nama_lengkap || detailStudentObj.nama}
                  </h4>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    NIS: {detailStudentObj.nis || '-'} • Rombel: {currentClassObj?.nama_kelas || 'Kelas'}
                  </div>
                </div>
              </div>

              {loadingDetailProgress ? (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                  <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
                  <span className="text-xs font-semibold">Memuat rincian kelanjutan tahfizh...</span>
                </div>
              ) : detailStudentProgress ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center dark:bg-slate-900 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Total Dihafal</div>
                      <div className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                        {detailStudentProgress.total_ayats_memorized || 0} <span className="text-[10px]">Ayat</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{detailStudentProgress.total_surahs_memorized || 0} Surah</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center dark:bg-slate-900 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Sisa Target</div>
                      <div className="text-base font-extrabold text-amber-700 dark:text-amber-400 mt-1">
                        {detailStudentProgress.remaining_ayats || 0} <span className="text-[10px]">Ayat</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{detailStudentProgress.remaining_surahs || 0} Surah Sisa</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center dark:bg-slate-900 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Progres Target</div>
                      <div className="text-base font-extrabold text-cyan-700 dark:text-cyan-400 mt-1">
                        {detailStudentProgress.progress_percentage || 0}%
                      </div>
                      <div className="text-[10px] text-slate-500">Dari 30 Juz</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-extrabold text-slate-700 dark:text-slate-200">
                      <span>Kelanjutan Hafalan 30 Juz</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{detailStudentProgress.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${detailStudentProgress.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Belum ada catatan kelanjutan tahfizh untuk siswa ini.
                </div>
              )}
            </DialogBody>

            <DialogFooter className="bg-slate-50 border-t p-4 flex items-center justify-between dark:bg-slate-900 dark:border-slate-800">
              <Button
                type="button"
                variant="success"
                appearance="fill"
                size="sm"
                className="font-extrabold"
                onClick={() => {
                  const sId = detailStudentObj.id || detailStudentObj.student_id
                  setSelectedStudentId(sId)
                  setShowStudentDetailModal(false)
                  setShowStudentModal(false)
                }}
              >
                <span>Kelola Setoran Siswa Ini</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button
                type="button"
                onClick={() => setShowStudentDetailModal(false)}
                variant="ghost"
                appearance="outline"
                size="sm"
              >
                Tutup
              </Button>
            </DialogFooter>
          </Dialog>
        </Backdrop>
      )}

      {/* DIALOG KONFIRMASI SIMPAN DATA */}
      {showSaveConfirm && (
        <Backdrop isOpen={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
          <Dialog className="max-w-md w-full">
            <DialogHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
              <DialogTitle className="font-extrabold text-base text-slate-900 dark:text-white">
                Konfirmasi Penyimpanan Log Tahfizh
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                {singleSaveIndex !== null
                  ? `Apakah Anda yakin ingin menyimpan log Tahfizh hari ${weeklySheet[singleSaveIndex]?.day_name} (${weeklySheet[singleSaveIndex]?.record_date})?`
                  : 'Apakah Anda yakin ingin menyimpan seluruh log Tahfizh pekan ini ke server?'}
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="p-5">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5 text-xs font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                Data setoran hafalan dan murajaah yang disimpan akan langsung diperbarui di database sistem.
              </div>
            </DialogBody>

            <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 dark:bg-slate-900 dark:border-slate-800">
              <DialogClose autoFocus appearance="outline" size="sm" onClick={() => setShowSaveConfirm(false)}>
                Batal
              </DialogClose>
              <Button variant="success" size="sm" className="font-extrabold" onClick={handleConfirmSave}>
                Ya, Simpan Log
              </Button>
            </DialogFooter>
          </Dialog>
        </Backdrop>
      )}

      {/* MODAL TARIK MASTER AL-QUR'AN */}
      {showQuranModal && (
        <Backdrop isOpen={showQuranModal} onOpenChange={setShowQuranModal}>
          <Dialog className="max-w-xl w-full">
            <DialogHeader className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-t-2xl p-5">
              <DialogTitle className="text-white font-extrabold text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-300" />
                <span>Pilih Hafalan dari Master Al-Qur'an</span>
              </DialogTitle>
              <DialogDescription className="text-emerald-100/90 text-xs mt-1">
                Pilih Surah dan tentukan rentang Ayat serta jumlah baris untuk diterapkan ke form setoran.
              </DialogDescription>
              <DialogClose onClick={() => setShowQuranModal(false)} />
            </DialogHeader>

            <DialogBody className="p-6 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={quranSearch}
                  onChange={(e) => setQuranSearch(e.target.value)}
                  placeholder="Cari nama surah atau nomor (misal: Al-Baqarah, Yasin, 114)..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 dark:text-slate-300">
                  1. Pilih Surah ({filteredQuranSurahs.length} Surah Terdaftar):
                </label>
                <div className="max-h-48 overflow-y-auto border rounded-xl divide-y divide-slate-100 bg-slate-50/50 dark:divide-slate-800 dark:bg-slate-900/50 dark:border-slate-700">
                  {filteredQuranSurahs.map((s) => (
                    <button
                      key={s.nomor}
                      type="button"
                      onClick={() => {
                        setModalSurah(s)
                        setModalAyahStart(1)
                        setModalAyahEnd(s.jumlah_ayat || 7)
                        setModalBarisCount(Math.max(1, Math.round((s.jumlah_ayat || 7) * 0.75)))
                      }}
                      className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                        modalSurah?.nomor === s.nomor
                          ? 'bg-emerald-100 font-extrabold text-emerald-950 border-l-4 border-emerald-600 dark:bg-emerald-950 dark:text-emerald-200'
                          : 'hover:bg-emerald-50 text-slate-800 dark:text-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-emerald-200/60 text-emerald-900 font-bold text-[11px] flex items-center justify-center dark:bg-emerald-900 dark:text-emerald-200">
                          {s.nomor}
                        </span>
                        <span>{s.nama_latin}</span>
                        <span className="text-[10px] text-slate-400">({s.arti})</span>
                      </div>
                      <span className="font-serif text-sm text-emerald-800 dark:text-emerald-400">{s.nama} ({s.jumlah_ayat} Ayat)</span>
                    </button>
                  ))}
                </div>
              </div>

              {modalSurah && (
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-3 dark:bg-emerald-950/30 dark:border-emerald-900">
                  <div className="text-xs font-bold text-emerald-900 flex items-center gap-2 dark:text-emerald-300">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Surah Terpilih: {modalSurah.nama_latin} ({modalSurah.jumlah_ayat} Ayat)</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 dark:text-slate-300">Ayat Awal</label>
                      <input
                        type="number"
                        min="1"
                        max={modalSurah.jumlah_ayat}
                        value={modalAyahStart}
                        onChange={(e) => setModalAyahStart(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-center focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 dark:text-slate-300">Ayat Akhir</label>
                      <input
                        type="number"
                        min={modalAyahStart}
                        max={modalSurah.jumlah_ayat}
                        value={modalAyahEnd}
                        onChange={(e) => setModalAyahEnd(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-center focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 dark:text-slate-300">Jumlah Baris</label>
                      <input
                        type="number"
                        min="1"
                        value={modalBarisCount}
                        onChange={(e) => setModalBarisCount(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-center focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}
            </DialogBody>

            <DialogFooter className="bg-slate-50 border-t p-4 flex items-center justify-end gap-2 dark:bg-slate-900 dark:border-slate-800">
              <Button
                type="button"
                onClick={() => setShowQuranModal(false)}
                variant="ghost"
                appearance="outline"
                size="sm"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleApplyQuranSelection}
                disabled={!modalSurah}
                variant="success"
                appearance="fill"
                size="sm"
                className="font-extrabold"
              >
                Terapkan ke Form Tahfizh
              </Button>
            </DialogFooter>
          </Dialog>
        </Backdrop>
      )}
    </div>
  )
}
