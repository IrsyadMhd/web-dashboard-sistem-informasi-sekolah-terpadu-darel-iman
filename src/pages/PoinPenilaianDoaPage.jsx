import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Edit3,
  FileCheck,
  Filter,
  GraduationCap,
  HelpCircle,
  Layers,
  PenTool,
  Printer,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sliders,
  Sparkles,
  UserCheck,
  Users,
  AlertTriangle,
  Check,
  X,
  RotateCcw,
  ChevronRight,
  BookOpen,
  Award,
} from 'lucide-react'
import { prayerAssessmentService } from '../services/prayerAssessmentService'
import { kelasService } from '../services/kelasService'
import { useAuthStore } from '../stores/authStore'
import { useUnitStore } from '../stores/unitStore'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { useDebounce } from '../hooks/useDebounce'
import { Pagination } from '../components/tailgrids/core/pagination'
import {
  SquircleActionButton,
  MasterDataPage,
} from '../components/master-data'

const MODERN_CARD_TONES = {
  emerald: {
    badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/20',
    iconGradient: 'from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-500/25',
    glow: 'bg-emerald-500/15 group-hover:bg-emerald-500/25',
    border: 'hover:border-emerald-400/60 dark:hover:border-emerald-500/40',
  },
  blue: {
    badgeBg: 'bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 border-sky-500/20',
    iconGradient: 'from-sky-500 via-blue-600 to-indigo-700 shadow-sky-500/25',
    glow: 'bg-sky-500/15 group-hover:bg-sky-500/25',
    border: 'hover:border-sky-400/60 dark:hover:border-sky-500/40',
  },
  purple: {
    badgeBg: 'bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border-purple-500/20',
    iconGradient: 'from-purple-500 via-violet-600 to-indigo-700 shadow-purple-500/25',
    glow: 'bg-purple-500/15 group-hover:bg-purple-500/25',
    border: 'hover:border-purple-400/60 dark:hover:border-purple-500/40',
  },
  amber: {
    badgeBg: 'bg-amber-500/10 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/20',
    iconGradient: 'from-amber-500 via-orange-600 to-amber-700 shadow-amber-500/25',
    glow: 'bg-amber-500/15 group-hover:bg-amber-500/25',
    border: 'hover:border-amber-400/60 dark:hover:border-amber-500/40',
  },
}

function ModernKpiCard({ title, value, subtext, icon: Icon, tone = 'emerald', tag = 'METRIK' }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`group relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-lg dark:border-slate-800/80 dark:bg-[#1B2433] ${t.border}`}
    >
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all duration-500 ${t.glow}`} />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${t.badgeBg}`}>
              {tag}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 pt-0.5">{title}</p>
        </div>
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-105 ${t.iconGradient}`}>
          {Icon && <Icon className="size-5 text-white" />}
        </div>
      </div>
      <div className="relative z-10 mt-3 flex items-baseline justify-between gap-2">
        <div>
          <p className="text-3xl sm:text-4xl font-black tabular-nums tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          {subtext && (
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{subtext}</p>
          )}
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Detail</span>
          <ChevronRight className="size-3" />
        </div>
      </div>
    </motion.div>
  )
}

function HarmonizedSaveScoresModal({ isOpen, onClose, onConfirm, studentName, classNameStr, totalEdited, isSubmitting }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#1B2433]"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
        <div className="p-6">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/30">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Simpan Penilaian
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                Simpan Nilai & Paraf Doa?
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Nilai poin capaian doa dan status paraf guru penguji untuk santri/siswa berikut akan disimpan secara permanen ke database akademik.
          </p>

          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/20 mb-5">
            <p className="text-xs font-black text-emerald-950 dark:text-emerald-100">
              {studentName || 'Nama Siswa'} ({classNameStr || 'Kelas'})
            </p>
            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-1">
              {totalEdited} Butir Penilaian Siap Diperbarui
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:brightness-105 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Konfirmasi Simpan
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function PoinPenilaianDoaPage() {
  const user = useAuthStore((state) => state.user)
  const activeUnit = useUnitStore((state) => state.activeUnit)

  // Toast notifications state
  const [toasts, setToasts] = useState([])
  const pushToast = (type, title, message = '') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, type, title, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  // Roles permission check
  const roles = useMemo(() => {
    return (user?.roles || []).map((r) => (typeof r === 'string' ? r.toLowerCase() : (r.name || '').toLowerCase()))
  }, [user])

  const canManageSettings = useMemo(() => {
    return (
      user?.is_superadmin ||
      roles.some((r) =>
        ['super admin', 'admin', 'kepala sekolah', 'kepsek', 'divisi pendidikan', 'tata usaha', 'tu'].includes(r)
      )
    )
  }, [user, roles])

  // Mode: 'scoring' vs 'settings'
  const [activeTab, setActiveTab] = useState('scoring')

  // Master Items (62 Doa) & Grade Rules
  const [items, setItems] = useState([])
  const [gradeRules, setGradeRules] = useState([])
  const [loadingItems, setLoadingItems] = useState(true)

  // Filter Siswa untuk Mode Lembar Penilaian
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [students, setStudents] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [loadingStudents, setLoadingStudents] = useState(false)

  // Lembar Penilaian Siswa
  const [studentSheet, setStudentSheet] = useState(null)
  const [editScores, setEditScores] = useState({})
  const [loadingSheet, setLoadingSheet] = useState(false)
  const [savingSheet, setSavingSheet] = useState(false)
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false)

  // State Edit Pengaturan (Mode Settings)
  const [editableItems, setEditableItems] = useState([])
  const [editableGrades, setEditableGrades] = useState([])
  const [savingSettings, setSavingSettings] = useState(false)

  // Search filter
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 350)

  // Pagination for Doa List
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 15

  // 1. Muat Master Items & Grade Rules
  const loadMasterData = async () => {
    setLoadingItems(true)
    try {
      const [itemsRes, gradeRes] = await Promise.all([
        prayerAssessmentService.getItems(),
        prayerAssessmentService.getGradeRules(),
      ])
      if (itemsRes?.success) {
        setItems(itemsRes.data || [])
        setEditableItems(JSON.parse(JSON.stringify(itemsRes.data || [])))
      }
      if (gradeRes?.success) {
        setGradeRules(gradeRes.data || [])
        setEditableGrades(JSON.parse(JSON.stringify(gradeRes.data || [])))
      }
    } catch (err) {
      console.error('Error loading master prayer data:', err)
      pushToast('error', 'Gagal Memuat Data', 'Data target doa harian belum berhasil dimuat dari server.')
    } finally {
      setLoadingItems(false)
    }
  }

  // 2. Muat Kelas
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await kelasService.getAll()
        const list = Array.isArray(res) ? res : res?.data || []
        setClasses(list)
        if (list.length > 0 && !selectedClassId) {
          setSelectedClassId(list[0].id)
        }
      } catch (err) {
        console.error('Error loading classes:', err)
      }
    }
    loadClasses()
    loadMasterData()
  }, [])

  // 3. Muat Siswa saat Kelas Dipilih
  useEffect(() => {
    if (!selectedClassId) {
      setStudents([])
      setSelectedStudentId('')
      return
    }
    const loadStudents = async () => {
      setLoadingStudents(true)
      try {
        const res = await kelasService.getById(selectedClassId)
        const studentList = res?.students || res?.data?.students || []
        setStudents(studentList)
        if (studentList.length > 0) {
          setSelectedStudentId(studentList[0].id)
        } else {
          setSelectedStudentId('')
          setStudentSheet(null)
        }
      } catch (err) {
        console.error('Error loading students for class:', err)
      } finally {
        setLoadingStudents(false)
      }
    }
    loadStudents()
  }, [selectedClassId])

  // 4. Muat Lembar Penilaian Siswa saat Siswa Dipilih
  const loadStudentAssessment = async (studentId) => {
    if (!studentId) return
    setLoadingSheet(true)
    try {
      const res = await prayerAssessmentService.getStudentSheet(studentId)
      if (res?.success) {
        setStudentSheet(res)
        const initial = {}
        ;(res.items || []).forEach((row) => {
          initial[row.id] = {
            score: row.poin !== null ? row.poin : '',
            is_paraf: false,
            notes: row.notes || '',
            originalParaf: Boolean(row.paraf_name),
          }
        })
        setEditScores(initial)
      }
    } catch (err) {
      console.error('Error loading student sheet:', err)
    } finally {
      setLoadingSheet(false)
    }
  }

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentAssessment(selectedStudentId)
    }
  }, [selectedStudentId])

  // Handler Nilai diubah
  const handleScoreChange = (itemId, val) => {
    setEditScores((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        score: val,
      },
    }))
  }

  // Handler Paraf diklik
  const handleToggleParaf = (itemId) => {
    setEditScores((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        is_paraf: !prev[itemId]?.is_paraf,
      },
    }))
  }

  // Simpan Lembar Penilaian Siswa
  const handleSaveStudentScores = async () => {
    if (!selectedStudentId) return
    setSavingSheet(true)
    try {
      const payload = Object.entries(editScores).map(([prayer_item_id, item]) => ({
        prayer_item_id,
        score: item.score !== '' && item.score !== null ? Number(item.score) : null,
        is_paraf: Boolean(item.is_paraf),
        notes: item.notes || null,
      }))

      await prayerAssessmentService.saveStudentScores(selectedStudentId, payload)
      pushToast('success', 'Berhasil Disimpan', 'Nilai poin dan paraf ujian hafalan doa telah diperbarui di database.')
      setIsConfirmSaveOpen(false)
      await loadStudentAssessment(selectedStudentId)
    } catch (err) {
      console.error('Error saving scores:', err)
      pushToast('error', 'Gagal Menyimpan', err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan nilai.')
    } finally {
      setSavingSheet(false)
    }
  }

  // Simpan Pengaturan 62 Target Doa & Skala Grade
  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      const updatePromises = editableItems.map((item) =>
        prayerAssessmentService.updateItem(item.id, {
          order_number: Number(item.order_number),
          name: item.name,
          max_score: Number(item.max_score),
          passing_score: Number(item.passing_score),
          is_active: Boolean(item.is_active),
        })
      )
      const gradePromise = prayerAssessmentService.updateGradeRules(editableGrades)

      await Promise.all([...updatePromises, gradePromise])

      pushToast('success', 'Pengaturan Tersimpan', 'Perubahan daftar 62 doa dan skala grade berhasil diperbarui.')
      await loadMasterData()
    } catch (err) {
      console.error('Error saving settings:', err)
      pushToast('error', 'Gagal Menyimpan Pengaturan', err?.response?.data?.message || 'Periksa hak akses atau format inputan Anda.')
    } finally {
      setSavingSettings(false)
    }
  }

  // Filter daftar doa
  const filteredRows = useMemo(() => {
    const list = studentSheet?.items || items || []
    if (!debouncedSearch.trim()) return list
    const q = debouncedSearch.toLowerCase()
    return list.filter(
      (r) =>
        r.nama?.toLowerCase().includes(q) ||
        r.name?.toLowerCase().includes(q) ||
        String(r.no || r.order_number).includes(q)
    )
  }, [studentSheet, items, debouncedSearch])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / perPage))
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filteredRows.slice(start, start + perPage)
  }, [filteredRows, currentPage, perPage])

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  const handlePrint = () => {
    window.print()
  }

  const selectedStudentObj = students.find((s) => s.id === selectedStudentId)
  const selectedClassObj = classes.find((c) => c.id === selectedClassId)

  return (
    <PageContainer maxW="7xl">
      {/* Breadcrumb */}
      <AppBreadcrumb
        className="mb-6 print:hidden"
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Tahfizh & Mutabaah', href: '/mutabaah' },
          { label: 'Poin Penilaian Doa' },
        ]}
      />

      {/* Modern Hero Header Card (TailGrids Standard) */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 mb-6 print:hidden">
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
              <FileCheck className="size-6 sm:size-7 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                  <Sparkles className="size-3 text-amber-300 animate-pulse" />
                  Kurikulum Doa Harian
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                  62 Target Doa
                </span>
              </div>
              <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Poin Penilaian Doa Harian
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                Dokumen resmi kurikulum evaluasi hafalan 62 doa harian, paraf guru penguji, dan kalkulasi predikat A–D.
              </p>
            </div>
          </div>

          {/* Action Buttons: Tab Switcher */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center flex-wrap">
            {canManageSettings && (
              <div className="flex rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-emerald-200/70 dark:border-emerald-800/60 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('scoring')}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'scoring'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25'
                      : 'text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300'
                  }`}
                >
                  <PenTool className="size-3.5" />
                  Lembar Penilaian
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25'
                      : 'text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300'
                  }`}
                >
                  <Settings className="size-3.5" />
                  Pengaturan Grade
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <MasterDataPage className="education-unit-page doa-points-page space-y-6" hideBreadcrumb>
        {/* Modern KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
          <ModernKpiCard
            title="Target Kurikulum Doa"
            value={`${items.length || 62} Doa`}
            subtext="Hafalan harian terstruktur"
            icon={BookOpen}
            tone="emerald"
            tag="KURIKULUM"
          />
          <ModernKpiCard
            title="Rata-rata Skor Siswa"
            value={studentSheet?.summary?.average_score !== undefined ? `${studentSheet.summary.average_score}` : '75.0'}
            subtext={studentSheet?.summary?.grade_label ? `Grade ${studentSheet.summary.grade} (${studentSheet.summary.grade_label})` : 'Standar KKM 75'}
            icon={GraduationCap}
            tone="blue"
            tag="CAPAIAN NILAI"
          />
          <ModernKpiCard
            title="Doa Tuntas (Lulus KKM)"
            value={`${studentSheet?.summary?.passed_items ?? 0} / ${studentSheet?.summary?.total_items ?? items.length ?? 62}`}
            subtext={`${Math.round(((studentSheet?.summary?.passed_items ?? 0) / (studentSheet?.summary?.total_items || items.length || 1)) * 100)}% Target Tercapai`}
            icon={CheckCircle2}
            tone="purple"
            tag="PREDIKAT"
          />
          <ModernKpiCard
            title="Siswa Terpilih"
            value={selectedStudentObj?.nama_lengkap || selectedStudentObj?.name || 'Pilih Siswa'}
            subtext={selectedClassObj?.nama_kelas ? `Kelas: ${selectedClassObj.nama_kelas}` : 'Pilih dari filter kelas'}
            icon={Users}
            tone="amber"
            tag="IDENTITAS"
          />
        </div>

        {/* MODE 1: LEMBAR PENILAIAN SISWA */}
        {activeTab === 'scoring' && (
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
            {/* Toolbar Baris 1 */}
            <div className="p-5 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4 dark:border-emerald-800/40 dark:bg-gradient-to-r dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-transparent print:hidden">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/30 border border-emerald-300/40">
                  <PenTool className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Lembar Penilaian Doa</h2>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {filteredRows.length} Butir Doa
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                    Input nilai poin 0-100 dan verifikasi paraf guru penguji per butir doa harian.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
                <SquircleActionButton
                  variant="print"
                  icon={Printer}
                  onClick={handlePrint}
                  title="Cetak Lembar Penilaian Siswa"
                />
                <SquircleActionButton
                  variant="sync"
                  icon={RefreshCw}
                  onClick={() => selectedStudentId && loadStudentAssessment(selectedStudentId)}
                  disabled={loadingSheet || !selectedStudentId}
                  title="Muat Ulang Data Siswa"
                />
                <button
                  type="button"
                  onClick={() => setIsConfirmSaveOpen(true)}
                  disabled={savingSheet || !selectedStudentId}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/25 hover:brightness-105 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Save className="size-3.5" />
                  <span>Simpan Nilai & Paraf</span>
                </button>
              </div>
            </div>

            {/* Toolbar Baris 2: Full-Width Search Input */}
            <div className="px-5 py-3.5 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-slate-900/60 dark:via-emerald-950/20 dark:to-slate-900/60 print:hidden">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600/70 dark:text-emerald-400/70" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik nama doa harian atau nomor urut..."
                  className="w-full rounded-xl border border-emerald-300/80 bg-white py-2.5 pl-10 pr-10 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/60 dark:bg-slate-800/90 dark:text-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Toolbar Baris 3: Horizontal Filters (Pilih Kelas & Siswa) */}
            <div className="px-5 py-3 border-b border-emerald-100 dark:border-emerald-900/50 bg-slate-50/70 dark:bg-slate-900/40 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold mr-1">
                  <Filter className="size-3.5 text-emerald-600" />
                  <span>Pilih Subjek:</span>
                </div>

                {/* Pilih Kelas */}
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      Kelas {c.nama_kelas} ({c.tingkat})
                    </option>
                  ))}
                </select>

                {/* Pilih Siswa */}
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  disabled={loadingStudents || students.length === 0}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-xs"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama_lengkap || s.name} (NIS: {s.nis})
                    </option>
                  ))}
                  {students.length === 0 && <option value="">Tidak ada siswa di kelas ini</option>}
                </select>
              </div>

              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Menampilkan {paginatedRows.length} dari {filteredRows.length} butir doa
              </div>
            </div>

            {/* Header Cetak Formal (Hanya Tampil Saat Print) */}
            <div className="p-6 text-center border-b border-slate-200 dark:border-slate-800 hidden print:block">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                LEMBAR PENILAIAN DOA HARIAN
              </h2>
              {studentSheet?.student && (
                <div className="mt-2 flex flex-wrap justify-center gap-6 text-xs text-slate-600">
                  <span>
                    Nama: <strong className="text-slate-900">{studentSheet.student.name}</strong>
                  </span>
                  <span>
                    Kelas: <strong className="text-slate-900">{studentSheet.student.class}</strong>
                  </span>
                  <span>
                    Tahun Ajaran: <strong className="text-slate-900">{studentSheet.student.academic_year || '2026/2027'}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Table Penilaian Doa */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                  <tr className="border-b-2 border-emerald-200/90 dark:border-emerald-800/80 bg-transparent text-emerald-950 dark:text-emerald-200 font-extrabold text-[11px] uppercase tracking-wider">
                    <th className="w-16 py-3.5 px-4 bg-transparent text-center">No</th>
                    <th className="py-3.5 px-4 bg-transparent">Doa-Doa Harian</th>
                    <th className="hidden sm:table-cell w-36 py-3.5 px-4 bg-transparent">Kelompok</th>
                    <th className="w-28 py-3.5 px-3 bg-transparent text-center">Poin (0-100)</th>
                    <th className="w-36 py-3.5 px-4 bg-transparent text-center">Paraf Penguji</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                  {loadingSheet ? (
                    <tr>
                      <td colSpan="5" className="py-14 text-center text-slate-400">
                        <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-emerald-600" />
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Memuat lembar penilaian doa siswa...</p>
                      </td>
                    </tr>
                  ) : paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-14 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center">
                          <FileCheck className="size-10 text-emerald-400/50 mb-2" />
                          <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">Tidak ada butir doa ditemukan</p>
                          <p className="text-xs text-slate-500 max-w-sm mt-1">
                            Periksa kata kunci pencarian atau muat ulang daftar master doa.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row, idx) => {
                      const scoreState = editScores[row.id] || {}
                      const currentScore = scoreState.score
                      const isParafed = scoreState.is_paraf || Boolean(row.paraf_name)

                      return (
                        <tr key={row.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                          <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-white">
                            {row.no || row.order_number || (currentPage - 1) * perPage + idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 dark:text-slate-100">{row.nama || row.name}</span>
                          </td>
                          <td className="hidden sm:table-cell py-3 px-4">
                            {row.grup || row.group ? (
                              <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60">
                                {row.grup || row.group}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="-"
                              value={currentScore !== undefined ? currentScore : ''}
                              onChange={(e) => handleScoreChange(row.id, e.target.value)}
                              className="w-20 rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-center text-xs font-black text-slate-900 shadow-xs focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                          </td>
                          <td className="py-2 px-4 text-center">
                            {row.paraf_name ? (
                              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                                <span className="truncate max-w-[120px]">{row.paraf_name}</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleParaf(row.id)}
                                className={`rounded-xl px-3 py-1.5 text-[11px] font-extrabold transition-all cursor-pointer ${
                                  scoreState.is_paraf
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                              >
                                {scoreState.is_paraf ? '✓ Siap Paraf' : 'Paraf'}
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {filteredRows.length > perPage && (
              <div className="px-5 py-3 border-t border-emerald-100 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-[#1B2433] print:hidden">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Halaman {currentPage} dari {totalPages} ({filteredRows.length} total doa)
                </p>
                <div className="flex items-center gap-1">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                    sideLayout="icon"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: PENGATURAN MASTER 62 DOA & SKALA GRADE */}
        {activeTab === 'settings' && canManageSettings && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Konfigurasi Master Target Doa & Standar Grade
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Wewenang Kepala Sekolah, Divisi Pendidikan, dan Tata Usaha (TU) untuk mengatur kurikulum poin doa.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition-all hover:brightness-105 disabled:opacity-50 cursor-pointer"
              >
                {savingSettings ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan Seluruh Perubahan
              </button>
            </div>

            {/* Skala Konversi Grade */}
            <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
              <h4 className="mb-3.5 text-xs font-black uppercase tracking-wider text-slate-500">
                1. Skala Konversi Nilai ke Grade & Predikat
              </h4>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {editableGrades.map((g, idx) => (
                  <div
                    key={g.id || idx}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-700 dark:bg-slate-800/60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-emerald-700 px-2.5 py-0.5 text-xs font-black text-white">
                        Grade {g.grade}
                      </span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Urutan: {g.order_index}
                      </span>
                    </div>
                    <div className="mt-2.5 space-y-2">
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Nama Predikat
                        <input
                          type="text"
                          value={g.label}
                          onChange={(e) => {
                            const next = [...editableGrades]
                            next[idx].label = e.target.value
                            setEditableGrades(next)
                          }}
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-bold text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="block text-[10px] font-semibold text-slate-500">
                          Skor Min
                          <input
                            type="number"
                            value={g.min_score}
                            onChange={(e) => {
                              const next = [...editableGrades]
                              next[idx].min_score = Number(e.target.value)
                              setEditableGrades(next)
                            }}
                            className="mt-0.5 w-full rounded-xl border border-slate-300 bg-white p-1.5 text-center text-xs font-bold dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                          />
                        </label>
                        <label className="block text-[10px] font-semibold text-slate-500">
                          Skor Max
                          <input
                            type="number"
                            value={g.max_score}
                            onChange={(e) => {
                              const next = [...editableGrades]
                              next[idx].max_score = Number(e.target.value)
                              setEditableGrades(next)
                            }}
                            className="mt-0.5 w-full rounded-xl border border-slate-300 bg-white p-1.5 text-center text-xs font-bold dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabel Master 62 Doa */}
            <div className="rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433] overflow-hidden">
              <div className="p-4 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  2. Daftar 62 Doa Harian & Bobot Poin Maksimum
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                    <tr className="border-b-2 border-emerald-200/90 dark:border-emerald-800/80 bg-transparent text-emerald-950 dark:text-emerald-200 font-extrabold text-[11px] uppercase tracking-wider">
                      <th className="w-16 px-3 py-3 text-center">No</th>
                      <th className="px-4 py-3">Nama Doa-Doa Harian</th>
                      <th className="w-36 px-3 py-3 text-center">Kelompok</th>
                      <th className="w-28 px-3 py-3 text-center">Poin Maks</th>
                      <th className="w-28 px-3 py-3 text-center">KKM</th>
                      <th className="w-20 px-3 py-3 text-center">Aktif</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                    {editableItems.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number"
                            value={item.order_number}
                            onChange={(e) => {
                              const next = [...editableItems]
                              next[idx].order_number = e.target.value
                              setEditableItems(next)
                            }}
                            className="w-12 rounded-lg border border-slate-300 bg-white p-1 text-center font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const next = [...editableItems]
                              next[idx].name = e.target.value
                              setEditableItems(next)
                            }}
                            className="w-full rounded-lg border border-slate-300 bg-white p-1.5 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="text"
                            value={item.group || ''}
                            onChange={(e) => {
                              const next = [...editableItems]
                              next[idx].group = e.target.value
                              setEditableItems(next)
                            }}
                            className="w-full rounded-lg border border-slate-300 bg-white p-1 text-center text-[11px] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number"
                            value={item.max_score}
                            onChange={(e) => {
                              const next = [...editableItems]
                              next[idx].max_score = e.target.value
                              setEditableItems(next)
                            }}
                            className="w-16 rounded-lg border border-slate-300 bg-white p-1 text-center font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number"
                            value={item.passing_score}
                            onChange={(e) => {
                              const next = [...editableItems]
                              next[idx].passing_score = e.target.value
                              setEditableItems(next)
                            }}
                            className="w-16 rounded-lg border border-slate-300 bg-white p-1 text-center font-bold text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={Boolean(item.is_active)}
                            onChange={(e) => {
                              const next = [...editableItems]
                              next[idx].is_active = e.target.checked
                              setEditableItems(next)
                            }}
                            className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Harmonized Save Scores Modal */}
        <HarmonizedSaveScoresModal
          isOpen={isConfirmSaveOpen}
          onClose={() => setIsConfirmSaveOpen(false)}
          onConfirm={handleSaveStudentScores}
          studentName={selectedStudentObj?.nama_lengkap || selectedStudentObj?.name}
          classNameStr={selectedClassObj?.nama_kelas}
          totalEdited={Object.keys(editScores).length}
          isSubmitting={savingSheet}
        />

        {/* Toast Notification Stack */}
        <div className="pointer-events-none fixed bottom-5 right-5 z-[80] flex flex-col gap-2 max-w-sm w-full print:hidden">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md ${
                  toast.type === 'error'
                    ? 'border-rose-200 bg-white/95 text-rose-900 dark:border-rose-800/70 dark:bg-[#1C2637]/95 dark:text-rose-200'
                    : toast.type === 'warning'
                    ? 'border-amber-200 bg-white/95 text-amber-900 dark:border-amber-800/70 dark:bg-[#1C2637]/95 dark:text-amber-200'
                    : 'border-emerald-200 bg-white/95 text-emerald-900 dark:border-emerald-800/70 dark:bg-[#1C2637]/95 dark:text-emerald-200'
                }`}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
                    toast.type === 'error'
                      ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                      : toast.type === 'warning'
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                      : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  }`}
                >
                  {toast.type === 'error' ? (
                    <AlertTriangle className="size-4.5" />
                  ) : toast.type === 'warning' ? (
                    <AlertTriangle className="size-4.5" />
                  ) : (
                    <Check className="size-4.5" />
                  )}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-xs font-bold leading-tight">{toast.title}</p>
                  {toast.message && (
                    <p className="mt-0.5 text-[11px] opacity-80 leading-normal">{toast.message}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="size-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </MasterDataPage>
    </PageContainer>
  )
}
