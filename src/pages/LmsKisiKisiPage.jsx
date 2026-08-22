import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  BookOpen,
  Target,
  Award,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Layers,
  Eye,
  RefreshCw,
  X,
  HelpCircle,
  PieChart,
} from 'lucide-react'
import { lmsKisiKisiService } from '../services/lmsKisiKisiService'
import { subjectService } from '../services/subjectService'
import { useAuthStore } from '../stores/authStore'
import { useUnitStore } from '../stores/unitStore'
import ActionDropdown from '../components/app/ActionDropdown'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import {
  MasterDataTable,
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'
import CsvImportModal from '../components/master-data/CsvImportModal'
import { RotateCcw, Printer } from 'lucide-react'

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
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}

function KpiTintedCard({ icon: Icon, label, subtext, value, tone = 'emerald', onClick }) {
  const tones = {
    emerald: {
      card: 'border-emerald-100 bg-emerald-50/50 hover:border-emerald-200 dark:border-emerald-950/50 dark:bg-emerald-950/20',
      title: 'text-emerald-700 dark:text-emerald-400',
      icon: 'text-emerald-500',
      val: 'text-emerald-600 dark:text-emerald-300',
      sub: 'text-emerald-600/70 dark:text-emerald-400/70',
    },
    blue: {
      card: 'border-blue-100 bg-blue-50/50 hover:border-blue-200 dark:border-blue-950/50 dark:bg-blue-950/20',
      title: 'text-blue-700 dark:text-blue-400',
      icon: 'text-blue-500',
      val: 'text-blue-600 dark:text-blue-300',
      sub: 'text-blue-600/70 dark:text-blue-400/70',
    },
    purple: {
      card: 'border-purple-100 bg-purple-50/50 hover:border-purple-200 dark:border-purple-950/50 dark:bg-purple-950/20',
      title: 'text-purple-700 dark:text-purple-400',
      icon: 'text-purple-500',
      val: 'text-purple-600 dark:text-purple-300',
      sub: 'text-purple-600/70 dark:text-purple-400/70',
    },
    amber: {
      card: 'border-amber-100 bg-amber-50/50 hover:border-amber-200 dark:border-amber-950/50 dark:bg-amber-950/20',
      title: 'text-amber-700 dark:text-amber-400',
      icon: 'text-amber-500',
      val: 'text-amber-600 dark:text-amber-300',
      sub: 'text-amber-600/70 dark:text-amber-400/70',
    },
  }
  const t = tones[tone] || tones.emerald
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`text-left rounded-2xl border ${t.card} p-5 shadow-xs transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : 'cursor-default'} group`}
    >
      <div className="flex items-center justify-between">
        <p className={`text-xs font-semibold ${t.title}`}>{label}</p>
        <Icon className={`h-4 w-4 ${t.icon} opacity-0 group-hover:opacity-100 transition-opacity`} />
      </div>
      <p className={`mt-2 text-2xl font-extrabold ${t.val}`}>{value ?? 0}</p>
      {subtext && (
        <p className={`mt-1.5 text-[10px] font-bold ${t.sub} flex items-center gap-0.5 truncate`}>
          {subtext}
        </p>
      )}
    </motion.div>
  )
}

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  return []
}

const getSubjectLabel = (subject) =>
  subject?.label ||
  subject?.nama_mapel ||
  subject?.nama ||
  subject?.name ||
  subject?.kode_mapel ||
  'Mata Pelajaran'

export default function LmsKisiKisiPage({ embedded, hidePageHeader, tabNav }) {
  const user = useAuthStore((state) => state.user)
  const activeUnit = useUnitStore((state) => state.activeUnit)

  const userUnitId = useMemo(() => {
    const candidateIds = [
      user?.unit_id,
      user?.unit_pendidikan_id,
      user?.education_unit_id,
      user?.unit?.id,
      user?.education_unit?.id,
      user?.unit_pendidikan?.id,
      user?.employee?.unit_id,
      user?.employee?.unit_pendidikan_id,
      user?.employee?.education_unit_id,
      user?.school_info?.id,
    ].filter(Boolean)
    return candidateIds.length > 0 ? String(candidateIds[0]) : null
  }, [user])

  const [dataList, setDataList] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })
  const [stats, setStats] = useState({ total: 0, aktif: 0, nonaktif: 0, total_soal_target: 0, uh: 0, pts: 0, pas: 0 })
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [options, setOptions] = useState({
    subjects: [],
    kurikulum: [],
    kelas: [],
    semesters: [],
    tahun_ajaran: [],
    guru: [],
    capaian_pembelajaran: [],
    tujuan_pembelajaran: [],
    jenis_ujian_options: [],
    level_kognitif_options: [],
  })

  const [filters, setFilters] = useState({
    search: '',
    mata_pelajaran_id: '',
    jenis_ujian: '',
    status: '',
  })

  // Print & Import State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const handleExportCSV = () => {
    if (!dataList.length) return
    const headers = ['ID', 'Judul Kisi-kisi', 'Mapel', 'Jenis Ujian', 'Jumlah Soal', 'Status']
    const rows = dataList.map((item) => [
      item.id,
      `"${(item.judul_kisi || '').replace(/"/g, '""')}"`,
      `"${(item.mata_pelajaran?.name || '').replace(/"/g, '""')}"`,
      item.jenis_ujian || '-',
      item.jumlah_soal || 0,
      item.status ? 'Aktif' : 'Nonaktif',
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `kisi_kisi_ujian_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImport = (file) => {
    alert(`File ${file.name} berhasil diproses.`)
  }

  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [viewingItem, setViewingItem] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  // Hover & Row Detail Modal State
  const [rowDetailItem, setRowDetailItem] = useState(null)
  const [showRowDetailModal, setShowRowDetailModal] = useState(false)

  const [formData, setFormData] = useState({
    judul_kisi: '',
    mata_pelajaran_id: '',
    cp_id: '',
    tp_id: '',
    kurikulum_id: '',
    kelas_id: '',
    semester_id: '',
    tahun_ajaran_id: '',
    guru_id: '',
    jenis_ujian: 'UH',
    jumlah_soal: 20,
    alokasi_waktu_menit: 60,
    kompetensi_dasar: '',
    level_kognitif: 'C3 - Mengaplikasikan',
    distribusi_bobot: { pg: 60, isian: 20, esai: 20 },
    status: true,
  })

  useEffect(() => {
    fetchStats()
    fetchOptions()
  }, [userUnitId, activeUnit])

  useEffect(() => {
    fetchData(1)
  }, [filters, userUnitId, activeUnit])

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const params = {
        page,
        per_page: 10,
        ...filters,
      }
      if (userUnitId) params.unit_pendidikan_id = userUnitId
      if (activeUnit) params.jenjang = activeUnit

      const response = await lmsKisiKisiService.getDaftar(params)
      if (response && response.data) {
        let rawData = Array.isArray(response.data) ? response.data : (response.data?.data || [])
        let filteredData = rawData.filter((item) => {
          if (!item) return false
          const itemUnitId = item.unit_pendidikan_id || item.unit_id || item.mata_pelajaran?.unit_pendidikan_id
          if (userUnitId && itemUnitId) return String(itemUnitId) === String(userUnitId)
          return true
        })
        setDataList(filteredData)
        setPagination({
          currentPage: response.meta?.current_page || 1,
          lastPage: response.meta?.last_page || 1,
          total: response.meta?.total || filteredData.length,
        })
      }
    } catch (error) {
      console.error('Gagal mengambil data kisi-kisi:', error)
      showNotification('Gagal memuat data kisi-kisi ujian.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const params = {}
      if (userUnitId) params.unit_pendidikan_id = userUnitId
      if (activeUnit) params.jenjang = activeUnit
      const response = await lmsKisiKisiService.getStats(params)
      if (response && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Gagal mengambil statistik:', error)
    }
  }

  const fetchOptions = async (mapelId = null, cpId = null) => {
    setLoadingOptions(true)
    try {
      const params = {}
      if (userUnitId) params.unit_pendidikan_id = userUnitId
      if (activeUnit) params.jenjang = activeUnit
      if (mapelId) params.mata_pelajaran_id = mapelId
      if (cpId) params.cp_id = cpId

      const [resOptions, resSubjects] = await Promise.allSettled([
        lmsKisiKisiService.getOptions(params),
        subjectService.getDaftar({ ...params, status: 1, per_page: 100 }),
      ])

      const response = resOptions.status === 'fulfilled' ? resOptions.value : {}
      const resData =
        response?.data?.data ??
        response?.data ??
        response ??
        {}

      let dbSubjectsRaw = resSubjects.status === 'fulfilled' ? resSubjects.value?.data || resSubjects.value || [] : []
      if (Array.isArray(dbSubjectsRaw?.data)) dbSubjectsRaw = dbSubjectsRaw.data

      let dbSubjects = Array.isArray(dbSubjectsRaw) ? dbSubjectsRaw.filter((s) => {
        if (!s) return false
        const sUnitId = s.unit_pendidikan_id || s.unit_id || s.education_unit_id
        if (userUnitId && sUnitId) return String(sUnitId) === String(userUnitId)
        if (activeUnit && s.jenjang) return s.jenjang === activeUnit || s.jenjang === 'All'
        return true
      }) : []

      const subjects = dbSubjects.length > 0 ? dbSubjects : normalizeArray(
        resData.subjects ??
        resData.mata_pelajaran ??
        resData.mata_pelajarans
      ).filter((s) => {
        const sUnitId = s.unit_pendidikan_id || s.unit_id
        if (userUnitId && sUnitId) return String(sUnitId) === String(userUnitId)
        return true
      })

      const cpOptions = normalizeArray(
        resData.capaian_pembelajaran ??
        resData.cp ??
        resData.learning_outcomes
      )

      const tpOptions = normalizeArray(
        resData.tujuan_pembelajaran ??
        resData.tp ??
        resData.learning_objectives
      )

      setOptions((prev) => ({
        ...prev,

        subjects:
          resData.subjects !== undefined ||
          resData.mata_pelajaran !== undefined ||
          resData.mata_pelajarans !== undefined
            ? subjects
            : prev.subjects,

        kurikulum:
          resData.kurikulum !== undefined
            ? normalizeArray(resData.kurikulum)
            : prev.kurikulum,

        kelas:
          resData.kelas !== undefined
            ? normalizeArray(resData.kelas)
            : prev.kelas,

        semesters:
          resData.semesters !== undefined
            ? normalizeArray(resData.semesters)
            : prev.semesters,

        tahun_ajaran:
          resData.tahun_ajaran !== undefined
            ? normalizeArray(resData.tahun_ajaran)
            : prev.tahun_ajaran,

        guru:
          resData.guru !== undefined
            ? normalizeArray(resData.guru)
            : prev.guru,

        capaian_pembelajaran:
          resData.capaian_pembelajaran !== undefined ||
          resData.cp !== undefined ||
          resData.learning_outcomes !== undefined
            ? cpOptions
            : prev.capaian_pembelajaran,

        tujuan_pembelajaran:
          resData.tujuan_pembelajaran !== undefined ||
          resData.tp !== undefined ||
          resData.learning_objectives !== undefined
            ? tpOptions
            : prev.tujuan_pembelajaran,

        jenis_ujian_options:
          resData.jenis_ujian_options !== undefined
            ? normalizeArray(resData.jenis_ujian_options)
            : prev.jenis_ujian_options,

        level_kognitif_options:
          resData.level_kognitif_options !== undefined
            ? normalizeArray(resData.level_kognitif_options)
            : prev.level_kognitif_options,
      }))
    } catch (error) {
      console.error(
        'Gagal mengambil opsi dropdown Kisi-kisi:',
        error?.response?.status,
        error?.response?.data ?? error
      )
      showNotification(
        error?.response?.data?.message ||
          'Gagal memuat data pilihan Kisi-kisi Ujian.',
        'error'
      )
    } finally {
      setLoadingOptions(false)
    }
  }

  const handleMataPelajaranChange = async (mapelId) => {
    setFormData((prev) => ({
      ...prev,
      mata_pelajaran_id: mapelId,
      cp_id: '',
      tp_id: '',
    }))

    setOptions((prev) => ({
      ...prev,
      capaian_pembelajaran: [],
      tujuan_pembelajaran: [],
    }))

    if (!mapelId) return

    await fetchOptions(mapelId, null)
  }

  const handleCpChange = async (cpId) => {
    setFormData((prev) => ({
      ...prev,
      cp_id: cpId,
      tp_id: '',
    }))

    setOptions((prev) => ({
      ...prev,
      tujuan_pembelajaran: [],
    }))

    if (!cpId) return

    await fetchOptions(formData.mata_pelajaran_id, cpId)
  }

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        judul_kisi: item.judul_kisi || '',
        mata_pelajaran_id: item.mata_pelajaran_id || '',
        cp_id: item.cp_id || '',
        tp_id: item.tp_id || '',
        kurikulum_id: item.kurikulum_id || '',
        kelas_id: item.kelas_id || '',
        semester_id: item.semester_id || '',
        tahun_ajaran_id: item.tahun_ajaran_id || '',
        guru_id: item.guru_id || '',
        jenis_ujian: item.jenis_ujian || 'UH',
        jumlah_soal: item.jumlah_soal || 20,
        alokasi_waktu_menit: item.alokasi_waktu_menit || 60,
        kompetensi_dasar: item.kompetensi_dasar || '',
        level_kognitif: item.level_kognitif || 'C3 - Mengaplikasikan',
        distribusi_bobot: item.distribusi_bobot || { pg: 60, isian: 20, esai: 20 },
        status: item.status !== undefined ? item.status : true,
      })
      fetchOptions(item.mata_pelajaran_id || null, item.cp_id || null)
    } else {
      setEditingItem(null)
      setFormData({
        judul_kisi: '',
        mata_pelajaran_id: '',
        cp_id: '',
        tp_id: '',
        kurikulum_id: options.kurikulum[0]?.id || '',
        kelas_id: options.kelas[0]?.id || '',
        semester_id: options.semesters[0]?.id || '',
        tahun_ajaran_id: options.tahun_ajaran[0]?.id || '',
        guru_id: options.guru[0]?.id || '',
        jenis_ujian: 'UH',
        jumlah_soal: 20,
        alokasi_waktu_menit: 60,
        kompetensi_dasar: '',
        level_kognitif: 'C3 - Mengaplikasikan',
        distribusi_bobot: { pg: 60, isian: 20, esai: 20 },
        status: true,
      })
      fetchOptions(null, null)
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await lmsKisiKisiService.update(editingItem.id, formData)
        showNotification('Kisi-kisi Ujian berhasil diperbarui.')
      } else {
        await lmsKisiKisiService.create(formData)
        showNotification('Kisi-kisi Ujian berhasil dibuat.')
      }
      setShowModal(false)
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Gagal menyimpan kisi-kisi:', error)
      showNotification('Gagal menyimpan kisi-kisi ujian. Periksa inputan Anda.', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kisi-kisi ujian ini?')) {
      try {
        await lmsKisiKisiService.delete(id)
        showNotification('Kisi-kisi Ujian berhasil dihapus.')
        fetchData(pagination.currentPage)
        fetchStats()
      } catch (error) {
        console.error('Gagal menghapus kisi-kisi:', error)
        showNotification('Gagal menghapus kisi-kisi ujian.', 'error')
      }
    }
  }

  const handleDuplicate = async (id) => {
    try {
      await lmsKisiKisiService.duplicate(id)
      showNotification('Kisi-kisi Ujian berhasil diduplikasi.')
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Gagal menduplikasi kisi-kisi:', error)
      showNotification('Gagal menduplikasi kisi-kisi ujian.', 'error')
    }
  }

  const getJenisBadgeColor = (jenis) => {
    switch (jenis) {
      case 'UH':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
      case 'PTS':
      case 'UTS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800'
      case 'PAS':
      case 'UAS':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800'
      case 'CBT':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300'
    }
  }

  const pageActions = (
    <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
      <SquircleActionButton
        variant="import"
        label="Import"
        onClick={() => setImportOpen(true)}
      />
      <SquircleActionButton
        variant="export"
        label="Export"
        onClick={handleExportCSV}
      />
      <SquircleActionButton
        variant="view"
        label="Cetak"
        icon={Printer}
        onClick={() => setIsPrintModalOpen(true)}
      />
      <SquircleActionButton
        variant="primary"
        label="Buat Kisi-kisi Baru"
        onClick={() => handleOpenModal()}
      />
    </div>
  )

  const pageContent = (
    <div className="education-unit-page lms-kisi-kisi-page space-y-6">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-white font-medium text-sm transition-all duration-200 ${
            toast.type === 'error' ? 'bg-rose-600' : 'bg-[#0E5C44]'
          }`}
        >
          {toast.type === 'error' ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero Banner (Hidden when embedded) */}
      {!embedded && !hidePageHeader && (
        <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#0E5C44] via-[#1E8E5A] to-[#3FBF75] p-8 text-white shadow-xl">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Modul Evaluasi & Penilaian LMS</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Kisi-kisi Ujian (Exam Blueprint)</h1>
              <p className="mt-2 text-emerald-100 text-sm max-w-2xl leading-relaxed">
                Kelola cetak biru kisi-kisi soal ujian terpadu dengan penyelarasan Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP), dan Taksonomi Bloom.
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0E5C44] shadow-lg hover:bg-emerald-50 active:scale-95 transition-all duration-200"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Buat Kisi-kisi Baru</span>
            </button>
          </div>
        </div>
        </motion.div>
      )}

      {/* KPI Stats Grid (Interactive Click Filters) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiTintedCard
          icon={FileText}
          label="Total Kisi-kisi"
          value={stats.total}
          subtext={`${stats.aktif} Status Aktif`}
          tone="emerald"
          onClick={() => setFilters((prev) => ({ ...prev, jenis_ujian: '', status: '' }))}
        />
        <KpiTintedCard
          icon={Target}
          label="Target Butir Soal"
          value={stats.total_soal_target}
          subtext="Accumulated Questions"
          tone="blue"
          onClick={() => setFilters((prev) => ({ ...prev, jenis_ujian: '', status: '' }))}
        />
        <KpiTintedCard
          icon={BookOpen}
          label="Kisi-kisi UH"
          value={stats.uh}
          subtext="Ulangan Harian"
          tone="purple"
          onClick={() => setFilters((prev) => ({ ...prev, jenis_ujian: 'UH' }))}
        />
        <KpiTintedCard
          icon={Award}
          label="PTS & PAS / UAS"
          value={stats.pts + stats.pas}
          subtext="Ujian Semester"
          tone="amber"
          onClick={() => setFilters((prev) => ({ ...prev, jenis_ujian: 'PTS' }))}
        />
      </motion.div>

      {/* Tab Navigation (Pindahkan di atas card datatable) */}
      {tabNav && <div className="my-2">{tabNav}</div>}

      {/* SEARCH & FILTER BAR (2-ROW LAYOUT) */}
      <motion.div variants={itemVariants} className="rounded-[18px] border border-slate-200/80 bg-white p-4.5 shadow-sm dark:border-slate-700/80 dark:bg-[#1B2433] space-y-3.5">
        {/* Baris 1: Full-width Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari judul kisi-kisi, KD, level kognitif..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="h-12 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-xs font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
          />
        </div>

        {/* Baris 2: Dropdown Filters & Reset Button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <select
              value={filters.mata_pelajaran_id}
              onChange={(e) => setFilters({ ...filters, mata_pelajaran_id: e.target.value })}
              className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
            >
              <option value="">Semua Mata Pelajaran</option>
              {options.subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {getSubjectLabel(sub)}
                </option>
              ))}
            </select>

            <select
              value={filters.jenis_ujian}
              onChange={(e) => setFilters({ ...filters, jenis_ujian: e.target.value })}
              className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
            >
              <option value="">Semua Jenis Ujian</option>
              {options.jenis_ujian_options.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nama}
                </option>
              ))}
            </select>

            {(filters.search || filters.mata_pelajaran_id || filters.jenis_ujian) && (
              <button
                type="button"
                onClick={() => {
                  setFilters({ search: '', mata_pelajaran_id: '', jenis_ujian: '', status: '' })
                  fetchData(1)
                }}
                className="inline-flex h-12 items-center gap-1.5 rounded-[14px] border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* MAIN DATATABLE SECTION */}
      <motion.div variants={itemVariants}>
      <section className="overflow-hidden rounded-[var(--master-card-radius,18px)] border border-slate-200/80 bg-white shadow-sm dark:border-slate-700 dark:bg-[#1B2433]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 px-4 py-4 sm:px-6 md:px-8 dark:border-slate-700">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              Daftar Kisi-kisi Ujian (Exam Blueprint)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cetak biru penyelarasan CP/TP dan bobot soal
            </p>
          </div>
          {pageActions}
        </div>

        <MasterDataTable className="!rounded-none !border-0 !shadow-none">

        <div className="overflow-x-auto min-h-[340px] pb-12">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-gray-300 font-semibold border-b border-gray-100 dark:border-slate-700 text-xs">
              <tr>
                <th className="px-6 py-3.5">Judul & Mata Pelajaran</th>
                <th className="px-6 py-3.5">Capaian & Tujuan (CP / TP)</th>
                <th className="px-6 py-3.5">Jenis Ujian & Kognitif</th>
                <th className="px-6 py-3.5">Jumlah Soal / Durasi</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#0E5C44]" />
                      <span>Memuat data kisi-kisi...</span>
                    </div>
                  </td>
                </tr>
              ) : dataList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500 dark:text-gray-400">
                    Belum ada data kisi-kisi ujian yang ditemukan.
                  </td>
                </tr>
              ) : (
                dataList.map((item) => (
                  <tr
                    key={item.id}
                    className="group relative hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={(e) => {
                      if (e.target.closest('button, a, [data-no-rowclick]')) return
                      setRowDetailItem(item)
                      setShowRowDetailModal(true)
                    }}
                  >
                    <td className="px-6 py-4 relative">
                      {/* Hover Card */}
                      <div className="pointer-events-none absolute left-4 top-full mt-1.5 z-50 w-64 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out">
                        <div className="bg-white dark:bg-[#1B2433] rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl p-3 space-y-1.5">
                          <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-700">
                            <HelpCircle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <p className="text-xs font-bold text-slate-800 dark:text-white line-clamp-2">{item.judul_kisi}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Mapel</p>
                              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">{item.mata_pelajaran?.name || '-'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Jenis Ujian</p>
                              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{item.jenis_ujian || '-'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Jml Soal</p>
                              <p className="text-[11px] font-bold text-violet-600">{item.jumlah_soal} Soal</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Status</p>
                              <p className={`text-[11px] font-bold ${item.status ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {item.status ? 'Aktif' : 'Nonaktif'}
                              </p>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700">Klik baris untuk detail lengkap</p>
                        </div>
                        <div className="absolute -top-1.5 left-6 border-4 border-transparent border-b-white dark:border-b-[#1B2433] drop-shadow" />
                      </div>

                      <div className="font-semibold text-slate-800 dark:text-white">{item.judul_kisi}</div>
                      <div className="text-xs text-[#0E5C44] dark:text-emerald-400 font-medium mt-0.5">
                        {item.mata_pelajaran?.name || 'Mata Pelajaran N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      {item.cp ? (
                        <div className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-lg text-xs font-medium mb-1">
                          {item.cp.kode_cp ? `CP: ${item.cp.kode_cp}` : item.cp.nama_cp}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic">CP belum ditentukan</div>
                      )}
                      {item.tp && (
                        <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
                          TP: {item.tp.kode_tp || item.tp.nama_tp}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getJenisBadgeColor(item.jenis_ujian)}`}>
                        {item.jenis_ujian}
                      </span>
                      {item.level_kognitif && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                          {item.level_kognitif}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 dark:text-white">{item.jumlah_soal} Soal</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{item.alokasi_waktu_menit} Menit</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.status ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionDropdown
                        onView={() => {
                          setViewingItem(item)
                          setShowDetailModal(true)
                        }}
                        onEdit={() => handleOpenModal(item)}
                        onDelete={() => handleDelete(item.id)}
                        extraItems={[
                          {
                            label: 'Duplikasi Kisi-kisi',
                            icon: <Copy className="size-4 text-emerald-500" />,
                            onClick: () => handleDuplicate(item.id),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Halaman {pagination.currentPage} dari {pagination.lastPage} ({pagination.total} Data Total)
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagination.currentPage <= 1}
              onClick={() => fetchData(pagination.currentPage - 1)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium disabled:opacity-50 hover:bg-gray-50 transition"
            >
              Sebelumnya
            </button>
            <button
              disabled={pagination.currentPage >= pagination.lastPage}
              onClick={() => fetchData(pagination.currentPage + 1)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium disabled:opacity-50 hover:bg-gray-50 transition"
            >
              Selanjutnya
            </button>
          </div>
        </div>
        </MasterDataTable>
      </section>
      </motion.div>

      {/* ROW DETAIL MODAL POPUP — Kisi-kisi */}
      {showRowDetailModal && rowDetailItem && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowRowDetailModal(false)}
        >
          <div
            className="bg-white dark:bg-[#1B2433] rounded-[18px] w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{rowDetailItem.judul_kisi}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {rowDetailItem.mata_pelajaran?.name || '-'} · {rowDetailItem.jenis_ujian || '-'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRowDetailModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getJenisBadgeColor(rowDetailItem.jenis_ujian)}`}>
                  {rowDetailItem.jenis_ujian}
                </span>
                {rowDetailItem.status ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Nonaktif
                  </span>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">Jumlah Soal</p>
                  <p className="text-sm font-bold text-purple-700 dark:text-purple-400 mt-0.5">{rowDetailItem.jumlah_soal} Soal</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Waktu</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{rowDetailItem.alokasi_waktu_menit} Menit</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 col-span-2">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Level Kognitif</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{rowDetailItem.level_kognitif || '-'}</p>
                </div>
              </div>

              {/* KD */}
              {rowDetailItem.kompetensi_dasar && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider mb-1">Kompetensi Dasar</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-4">{rowDetailItem.kompetensi_dasar}</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
              <button
                onClick={() => setShowRowDetailModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Tutup
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowRowDetailModal(false)
                    handleDelete(rowDetailItem.id)
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </button>
                <button
                  onClick={() => {
                    setShowRowDetailModal(false)
                    handleOpenModal(rowDetailItem)
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E5C44] text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[24px] shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingItem ? 'Edit Kisi-kisi Ujian' : 'Buat Kisi-kisi Ujian Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                  Judul Kisi-kisi Ujian *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kisi-kisi Penilaian Tengah Semester Gasal Matematika X"
                  value={formData.judul_kisi}
                  onChange={(e) => setFormData({ ...formData, judul_kisi: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0E5C44] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Mata Pelajaran *
                  </label>
                  <select
                    required
                    value={formData.mata_pelajaran_id}
                    onChange={(e) => handleMataPelajaranChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0E5C44]"
                  >
                    <option value="">-- Pilih Mata Pelajaran --</option>
                    {options.subjects && options.subjects.length > 0 ? (
                      options.subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {getSubjectLabel(sub)}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Belum ada mata pelajaran aktif</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Jenis Ujian *
                  </label>
                  <select
                    required
                    value={formData.jenis_ujian}
                    onChange={(e) => setFormData({ ...formData, jenis_ujian: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0E5C44]"
                  >
                    {options.jenis_ujian_options.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Capaian Pembelajaran (CP)
                  </label>
                  <select
                    value={formData.cp_id}
                    disabled={!formData.mata_pelajaran_id}
                    onChange={(e) => handleCpChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0E5C44] disabled:opacity-60"
                  >
                    {!formData.mata_pelajaran_id ? (
                      <option value="">Pilih mata pelajaran terlebih dahulu</option>
                    ) : loadingOptions ? (
                      <option value="">Memuat capaian pembelajaran...</option>
                    ) : options.capaian_pembelajaran && options.capaian_pembelajaran.length > 0 ? (
                      <>
                        <option value="">-- Pilih CP (Opsional) --</option>
                        {options.capaian_pembelajaran.map((cp) => {
                          const label = cp.label || (cp.kode_cp ? `[${cp.kode_cp}] ${cp.nama_cp || cp.deskripsi}` : cp.nama_cp || cp.deskripsi)
                          return (
                            <option key={cp.id} value={cp.id}>
                              {label}
                            </option>
                          )
                        })}
                      </>
                    ) : (
                      <option value="">Belum ada CP untuk mata pelajaran ini</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Tujuan Pembelajaran (TP)
                  </label>
                  <select
                    value={formData.tp_id}
                    disabled={!formData.cp_id}
                    onChange={(e) => setFormData({ ...formData, tp_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0E5C44] disabled:opacity-60"
                  >
                    {!formData.cp_id ? (
                      <option value="">Pilih CP terlebih dahulu</option>
                    ) : loadingOptions ? (
                      <option value="">Memuat tujuan pembelajaran...</option>
                    ) : options.tujuan_pembelajaran && options.tujuan_pembelajaran.length > 0 ? (
                      <>
                        <option value="">-- Pilih TP (Opsional) --</option>
                        {options.tujuan_pembelajaran.map((tp) => {
                          const label = tp.label || (tp.kode_tp ? `[${tp.kode_tp}] ${tp.nama_tp || tp.deskripsi}` : tp.nama_tp || tp.deskripsi)
                          return (
                            <option key={tp.id} value={tp.id}>
                              {label}
                            </option>
                          )
                        })}
                      </>
                    ) : (
                      <option value="">Belum ada TP untuk CP ini</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Jumlah Soal *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.jumlah_soal}
                    onChange={(e) => setFormData({ ...formData, jumlah_soal: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0E5C44]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Alokasi Waktu (Menit) *
                  </label>
                  <input
                    type="number"
                    required
                    min="5"
                    value={formData.alokasi_waktu_menit}
                    onChange={(e) => setFormData({ ...formData, alokasi_waktu_menit: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0E5C44]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                  Level Kognitif Bloom
                </label>
                <select
                  value={formData.level_kognitif}
                  onChange={(e) => setFormData({ ...formData, level_kognitif: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0E5C44]"
                >
                  {options.level_kognitif_options.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                  Uraian Indikator / Kompetensi Dasar
                </label>
                <textarea
                  rows="3"
                  placeholder="Tuliskan materi pokok atau indikator pencapaian kisi-kisi..."
                  value={formData.kompetensi_dasar}
                  onChange={(e) => setFormData({ ...formData, kompetensi_dasar: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0E5C44]"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0E5C44] text-white text-sm font-semibold rounded-xl hover:bg-[#1E8E5A] transition shadow-lg shadow-emerald-900/20"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Buat Kisi-kisi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Drawer */}
      {showDetailModal && viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-800 rounded-[24px] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Detail Kisi-kisi Ujian</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div>
                <span className="text-xs uppercase text-gray-400 font-bold">Judul Kisi-kisi</span>
                <h4 className="text-base font-bold text-slate-800 dark:text-white">{viewingItem.judul_kisi}</h4>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-900 p-4 rounded-xl">
                <div>
                  <span className="text-xs text-gray-400 font-medium">Mata Pelajaran</span>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">{viewingItem.mata_pelajaran?.name || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-medium">Jenis Ujian</span>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">{viewingItem.jenis_ujian}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-medium">Jumlah Soal</span>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">{viewingItem.jumlah_soal} Butir</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-medium">Alokasi Waktu</span>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">{viewingItem.alokasi_waktu_menit} Menit</p>
                </div>
              </div>

              {viewingItem.cp && (
                <div className="border border-emerald-100 dark:border-emerald-950 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20">
                  <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold uppercase">Capaian Pembelajaran (CP)</span>
                  <p className="mt-1 text-slate-700 dark:text-slate-200">
                    {viewingItem.cp.kode_cp ? `[${viewingItem.cp.kode_cp}] ` : ''}{viewingItem.cp.nama_cp}
                  </p>
                </div>
              )}

              {viewingItem.tp && (
                <div className="border border-blue-100 dark:border-blue-950 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20">
                  <span className="text-xs text-blue-800 dark:text-blue-300 font-bold uppercase">Tujuan Pembelajaran (TP)</span>
                  <p className="mt-1 text-slate-700 dark:text-slate-200">
                    {viewingItem.tp.kode_tp ? `[${viewingItem.tp.kode_tp}] ` : ''}{viewingItem.tp.nama_tp || viewingItem.tp.deskripsi}
                  </p>
                </div>
              )}

              {viewingItem.kompetensi_dasar && (
                <div>
                  <span className="text-xs uppercase text-gray-400 font-bold">Indikator & Level Kognitif</span>
                  <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed bg-gray-50 dark:bg-slate-900 p-3 rounded-xl">
                    {viewingItem.kompetensi_dasar}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Print Option Modal */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Opsi Cetak Data Kisi-kisi Ujian"
        subtitle="Pilih metode pencetakan atau unduh cetak biru kisi-kisi"
        onPrintClean={() => {
          printCleanTable({
            title: 'Laporan Kisi-kisi Ujian (Exam Blueprint)',
            data: dataList,
            columns: [
              { header: 'Judul Kisi-kisi', accessor: (row) => row.judul_kisi || '-' },
              { header: 'Mata Pelajaran', accessor: (row) => getSubjectLabel(row.mata_pelajaran) },
              { header: 'Jenis Ujian', accessor: (row) => row.jenis_ujian || '-' },
              { header: 'Jumlah Soal', accessor: (row) => row.jumlah_soal || 0 },
              { header: 'Status', accessor: (row) => (row.status ? 'Aktif' : 'Nonaktif') },
            ],
          })
          setIsPrintModalOpen(false)
        }}
        onDownloadPdf={() => {
          downloadPdfTable({
            title: 'Laporan Kisi-kisi Ujian (Exam Blueprint)',
            data: dataList,
            columns: [
              { header: 'Judul Kisi-kisi', accessor: (row) => row.judul_kisi || '-' },
              { header: 'Mata Pelajaran', accessor: (row) => getSubjectLabel(row.mata_pelajaran) },
              { header: 'Jenis Ujian', accessor: (row) => row.jenis_ujian || '-' },
              { header: 'Jumlah Soal', accessor: (row) => row.jumlah_soal || 0 },
              { header: 'Status', accessor: (row) => (row.status ? 'Aktif' : 'Nonaktif') },
            ],
            filename: `laporan_kisi_kisi_ujian_${new Date().toISOString().slice(0, 10)}.pdf`,
          })
          setIsPrintModalOpen(false)
        }}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import Data Kisi-kisi Ujian"
        onImport={handleImport}
        templateFields={['judul_kisi', 'mata_pelajaran_id', 'jenis_ujian', 'jumlah_soal', 'alokasi_waktu_menit', 'status']}
      />
      </motion.div>
    </div>
  )

  return <PageContainer maxW="7xl">{pageContent}</PageContainer>
}
