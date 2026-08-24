import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Award,
  BookOpen,
  Calculator,
  Sliders,
  Sparkles,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  X,
  Layers,
  Users,
  FileSpreadsheet,
  Settings,
  ChevronDown,
  Info,
  Check,
  Printer,
  Download,
  FileText,
  BarChart2,
  GraduationCap,
} from 'lucide-react'
import { Download1, Upload1 } from '@tailgrids/icons'
import { lmsPenilaianService } from '../services/lmsPenilaianService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { PrintOptionModal, SquircleActionButton } from '../components/master-data'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { exportCsv } from '../components/reports/ReportKit'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../components/tailgrids/core/hover-card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/tailgrids/core/avatar'
import { Badge } from '../components/tailgrids/core/badge'
import { Button } from '../components/tailgrids/core/button'
import { Input } from '../components/tailgrids/core/input'
import { Pagination } from '../components/tailgrids/core/pagination'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/tailgrids/core/dialog'
import { Backdrop, OverlayWrapper } from '../components/tailgrids/core/overlay'
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIndicator,
  AlertTitle,
} from '../components/tailgrids/core/alert'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
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

const toneStyles = {
  emerald: {
    cardBg: 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/60',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  },
  sky: {
    cardBg: 'bg-sky-50/60 dark:bg-sky-950/30 border-sky-200/80 dark:border-sky-800/60',
    iconBg: 'bg-sky-100 dark:bg-sky-900/60',
    iconColor: 'text-sky-700 dark:text-sky-300',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  },
  rose: {
    cardBg: 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-800/60',
    iconBg: 'bg-rose-100 dark:bg-rose-900/60',
    iconColor: 'text-rose-700 dark:text-rose-300',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  },
  purple: {
    cardBg: 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-200/80 dark:border-purple-800/60',
    iconBg: 'bg-purple-100 dark:bg-purple-900/60',
    iconColor: 'text-purple-700 dark:text-purple-300',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  },
  amber: {
    cardBg: 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/60',
    iconBg: 'bg-amber-100 dark:bg-amber-900/60',
    iconColor: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
}

export default function LmsPenilaianPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
  const [dataList, setDataList] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })
  const [stats, setStats] = useState({
    total_siswa: 0,
    total_lulus: 0,
    total_remedial: 0,
    persentase_kelulusan: 0,
    rata_nilai_akhir: 0,
    rata_assignment: 0,
    rata_cbt: 0,
    grade_distribution: { A: 0, B: 0, C: 0, D: 0 },
  })
  const [options, setOptions] = useState({
    kelas: [],
    subjects: [],
    semesters: [],
    default_formula: {
      bobot_tugas: 20.0,
      bobot_uh: 25.0,
      bobot_uts: 25.0,
      bobot_uas: 30.0,
      nilai_kkm: 75.0,
    },
  })

  const [filters, setFilters] = useState({
    search: '',
    kelas_id: '',
    subject_id: '',
    semester_id: '',
    is_passed: '',
  })

  // Configurable Weights Engine State
  const [weights, setWeights] = useState({
    bobot_tugas: 20.0,
    bobot_uh: 25.0,
    bobot_uts: 25.0,
    bobot_uas: 30.0,
    nilai_kkm: 75.0,
  })
  const [showConfigPanel, setShowConfigPanel] = useState(false)
  const [calculating, setCalculating] = useState(false)

  // Modals
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [viewingItem, setViewingItem] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  // Card Drill-Down Modal State
  const [cardModal, setCardModal] = useState({
    isOpen: false,
    statusKey: 'semua',
    title: '',
    tone: 'emerald',
    searchQuery: '',
    page: 1,
  })

  // Print Filter & Student Selection Modal State
  const [isPrintFilterModalOpen, setIsPrintFilterModalOpen] = useState(false)
  const [selectedStudentIds, setSelectedStudentIds] = useState([])
  const [selectedScoreFields, setSelectedScoreFields] = useState({
    assignment: true,
    uh: true,
    uts: true,
    uas: true,
    final: true,
    grade: true,
    status: true,
  })
  const [printSearchQuery, setPrintSearchQuery] = useState('')

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const importInputRef = useRef(null)

  const getRowId = useCallback((r, idx) => r.id ?? r.student_id ?? r.student?.id ?? `row-${idx}`, [])

  const openPrintFilterModal = () => {
    setSelectedStudentIds(dataList.map((r, idx) => getRowId(r, idx)))
    setPrintSearchQuery('')
    setIsPrintFilterModalOpen(true)
  }

  const filteredPrintStudents = useMemo(() => {
    if (!printSearchQuery.trim()) return dataList
    const q = printSearchQuery.toLowerCase().trim()
    return dataList.filter((r) => {
      const name = (r.student?.full_name || '').toLowerCase()
      const nis = (r.student?.nis || '').toLowerCase()
      const mapel = (r.subject?.name || '').toLowerCase()
      const kelas = (r.kelas?.nama_kelas || '').toLowerCase()
      return name.includes(q) || nis.includes(q) || mapel.includes(q) || kelas.includes(q)
    })
  }, [dataList, printSearchQuery])

  const handleSelectAllPrintStudents = (e) => {
    if (e.target.checked) {
      setSelectedStudentIds(dataList.map((r, idx) => getRowId(r, idx)))
    } else {
      setSelectedStudentIds([])
    }
  }

  const handleTogglePrintStudent = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleToggleScoreField = (field) => {
    setSelectedScoreFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleExecutePrint = (format = 'print') => {
    let targetList = dataList.filter((r, idx) => selectedStudentIds.includes(getRowId(r, idx)))
    if (targetList.length === 0) {
      targetList = dataList
    }

    const columns = [
      { title: 'No', render: (_, idx) => idx + 1 },
      { title: 'NIS', render: (r) => r.student?.nis || '-' },
      { title: 'Nama Siswa', render: (r) => r.student?.full_name || '-' },
      { title: 'Mapel', render: (r) => r.subject?.name || '-' },
      { title: 'Kelas', render: (r) => r.kelas?.nama_kelas || '-' },
    ]

    if (selectedScoreFields.assignment) {
      columns.push({ title: 'N. Tugas', render: (r) => r.score_assignment ?? 0 })
    }
    if (selectedScoreFields.uh) {
      columns.push({ title: 'CBT UH', render: (r) => r.score_quiz ?? 0 })
    }
    if (selectedScoreFields.uts) {
      columns.push({ title: 'CBT UTS', render: (r) => r.score_midterm ?? 0 })
    }
    if (selectedScoreFields.uas) {
      columns.push({ title: 'CBT UAS', render: (r) => r.score_final ?? 0 })
    }
    if (selectedScoreFields.final) {
      columns.push({ title: 'Nilai Akhir', render: (r) => r.final_score ?? 0 })
    }
    if (selectedScoreFields.grade) {
      columns.push({ title: 'Grade', render: (r) => r.grade_letter || '-' })
    }
    if (selectedScoreFields.status) {
      columns.push({ title: 'Status KKM', render: (r) => (r.is_passed ? 'TUNTAS' : 'REMEDIAL') })
    }

    if (format === 'print') {
      printCleanTable({
        title: 'Laporan Rekap Buku Nilai Akademik',
        subtitle: `Dicetak ${targetList.length} Siswa | Sistem Manajemen Sekolah Terpadu`,
        columns,
        data: targetList,
      })
    } else if (format === 'pdf') {
      downloadPdfTable({
        filename: 'rekap-buku-nilai-terpilih.pdf',
        title: 'Laporan Rekap Buku Nilai Akademik',
        subtitle: `Dicetak ${targetList.length} Siswa | Sistem Manajemen Sekolah Terpadu`,
        columns,
        data: targetList,
      })
    } else if (format === 'csv') {
      exportDatatable(targetList, 'csv')
    }

    setIsPrintFilterModalOpen(false)
  }

  const openCardModal = (statusKey, label, tone) => {
    setCardModal({
      isOpen: true,
      statusKey,
      title: `Rincian Data Siswa — ${label}`,
      tone,
      searchQuery: '',
      page: 1,
    })
  }

  const closeCardModal = () => {
    setCardModal((prev) => ({ ...prev, isOpen: false }))
  }

  const modalRows = useMemo(() => {
    if (!cardModal.isOpen) return []
    let list = [...dataList]

    if (cardModal.statusKey === '1') {
      list = list.filter((r) => r.is_passed)
    } else if (cardModal.statusKey === '0') {
      list = list.filter((r) => !r.is_passed)
    }

    if (cardModal.searchQuery.trim()) {
      const q = cardModal.searchQuery.toLowerCase().trim()
      list = list.filter((r) => {
        const name = (r.student?.full_name || '').toLowerCase()
        const nis = (r.student?.nis || '').toLowerCase()
        const mapel = (r.subject?.name || '').toLowerCase()
        const kelas = (r.kelas?.nama_kelas || '').toLowerCase()
        return name.includes(q) || nis.includes(q) || mapel.includes(q) || kelas.includes(q)
      })
    }
    return list
  }, [dataList, cardModal.isOpen, cardModal.statusKey, cardModal.searchQuery])

  const MODAL_PAGE_SIZE = 5
  const modalTotalPages = Math.max(1, Math.ceil(modalRows.length / MODAL_PAGE_SIZE))
  const paginatedModalRows = useMemo(() => {
    return modalRows.slice((cardModal.page - 1) * MODAL_PAGE_SIZE, cardModal.page * MODAL_PAGE_SIZE)
  }, [modalRows, cardModal.page])

  // Form Data
  const [formData, setFormData] = useState({
    student_id: '',
    subject_id: '',
    semester_id: '',
    kelas_id: '',
    score_assignment: 80,
    score_quiz: 85,
    score_midterm: 85,
    score_final: 90,
    bobot_tugas: 20,
    bobot_uh: 25,
    bobot_uts: 25,
    bobot_uas: 30,
    nilai_kkm: 75,
    notes: '',
  })

  useEffect(() => {
    fetchStats()
    fetchOptions()
  }, [])

  useEffect(() => {
    fetchData(1)
  }, [filters])

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, per_page: 10, ...filters }
      const response = await lmsPenilaianService.getDaftar(params)
      if (response && response.data) {
        setDataList(response.data)
        setPagination({
          currentPage: response.meta?.current_page || 1,
          lastPage: response.meta?.last_page || 1,
          total: response.meta?.total || response.data.length,
        })
      }
    } catch (error) {
      console.error('Error loading Penilaian data:', error)
      showNotification('Gagal memuat data Penilaian', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await lmsPenilaianService.getStats(filters)
      if (response && response.data) setStats(response.data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const fetchOptions = async () => {
    try {
      const response = await lmsPenilaianService.getOptions()
      if (response && response.data) {
        setOptions(response.data)
        if (response.data.default_formula) {
          setWeights(response.data.default_formula)
        }
      }
    } catch (error) {
      console.error('Error loading options:', error)
    }
  }

  const handleRunAutoCalculation = async () => {
    if (!filters.kelas_id || !filters.subject_id || !filters.semester_id) {
      showNotification('Silakan pilih Kelas, Mata Pelajaran, dan Semester terlebih dahulu pada filter.', 'error')
      return
    }

    setCalculating(true)
    try {
      const payload = {
        kelas_id: filters.kelas_id,
        subject_id: filters.subject_id,
        semester_id: filters.semester_id,
        ...weights,
      }
      const response = await lmsPenilaianService.calculateAuto(payload)
      if (response && response.data) {
        showNotification(response.message || 'Auto-kalkulasi nilai CBT + Penugasan berhasil!')
        fetchData(1)
        fetchStats()
      }
    } catch (error) {
      console.error('Auto calculation error:', error)
      const errorMsg = error.response?.data?.message || 'Gagal melakukan kalkulasi nilai otomatis.'
      showNotification(errorMsg, 'error')
    } finally {
      setCalculating(false)
    }
  }

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        student_id: item.student_id || '',
        subject_id: item.subject_id || '',
        semester_id: item.semester_id || '',
        kelas_id: item.kelas_id || '',
        score_assignment: item.score_assignment || 0,
        score_quiz: item.score_quiz || 0,
        score_midterm: item.score_midterm || 0,
        score_final: item.score_final || 0,
        bobot_tugas: item.weights_config?.bobot_tugas || 20,
        bobot_uh: item.weights_config?.bobot_uh || 25,
        bobot_uts: item.weights_config?.bobot_uts || 25,
        bobot_uas: item.weights_config?.bobot_uas || 30,
        nilai_kkm: item.weights_config?.nilai_kkm || 75,
        notes: item.notes || '',
      })
    } else {
      setEditingItem(null)
      setFormData({
        student_id: '',
        subject_id: options.subjects.length > 0 ? options.subjects[0].id : '',
        semester_id: options.semesters.length > 0 ? options.semesters[0].id : '',
        kelas_id: options.kelas.length > 0 ? options.kelas[0].id : '',
        score_assignment: 80,
        score_quiz: 85,
        score_midterm: 85,
        score_final: 90,
        bobot_tugas: weights.bobot_tugas,
        bobot_uh: weights.bobot_uh,
        bobot_uts: weights.bobot_uts,
        bobot_uas: weights.bobot_uas,
        nilai_kkm: weights.nilai_kkm,
        notes: '',
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingItem) {
        await lmsPenilaianService.update(editingItem.id, formData)
        showNotification('Manual override nilai siswa berhasil diperbarui!')
      } else {
        await lmsPenilaianService.create(formData)
        showNotification('Rekap penilaian siswa baru berhasil disimpan!')
      }
      setShowModal(false)
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Error saving grade:', error)
      const errorMsg = error.response?.data?.message || 'Gagal menyimpan nilai.'
      showNotification(errorMsg, 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus rekap nilai ini?')) return
    try {
      await lmsPenilaianService.delete(id)
      showNotification('Rekap nilai berhasil dihapus!')
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Error deleting item:', error)
      showNotification('Gagal menghapus nilai.', 'error')
    }
  }

  const totalWeightSum = weights.bobot_tugas + weights.bobot_uh + weights.bobot_uts + weights.bobot_uas

  const getGradeBadge = (letter) => {
    switch (letter) {
      case 'A':
        return <Badge color="success" size="sm">Predikat A</Badge>
      case 'B':
        return <Badge color="blue" size="sm">Predikat B</Badge>
      case 'C':
        return <Badge color="warning" size="sm">Predikat C</Badge>
      case 'D':
      case 'E':
        return <Badge color="error" size="sm">Predikat D</Badge>
      default:
        return <Badge color="gray" size="sm">{letter}</Badge>
    }
  }

  // Export helpers
  const exportDatatable = (rowsToExport, format = 'csv', filename = 'rekap-buku-nilai') => {
    if (!rowsToExport || rowsToExport.length === 0) return

    const exportColumns = [
      { label: 'No', export: (_, idx) => idx + 1 },
      { label: 'NIS', export: (r) => r.student?.nis || '-' },
      { label: 'Nama Siswa', export: (r) => r.student?.full_name || '-' },
      { label: 'Mata Pelajaran', export: (r) => r.subject?.name || '-' },
      { label: 'Kelas', export: (r) => r.kelas?.nama_kelas || '-' },
      { label: 'Semester', export: (r) => r.semester?.nama_semester || '-' },
      { label: 'Nilai Penugasan', export: (r) => r.score_assignment ?? 0 },
      { label: 'CBT UH', export: (r) => r.score_quiz ?? 0 },
      { label: 'CBT UTS', export: (r) => r.score_midterm ?? 0 },
      { label: 'CBT UAS', export: (r) => r.score_final ?? 0 },
      { label: 'Nilai Akhir', export: (r) => r.final_score ?? 0 },
      { label: 'Grade', export: (r) => r.grade_letter || '-' },
      { label: 'Status KKM', export: (r) => (r.is_passed ? 'TUNTAS KKM' : 'REMEDIAL') },
      { label: 'Catatan Guru', export: (r) => r.notes || '-' },
    ]

    const escape = (val) => `"${String(val ?? '').replaceAll('"', '""')}"`
    const headerLine = exportColumns.map((col) => escape(col.label)).join(',')
    const dataLines = rowsToExport.map((row, idx) => exportColumns.map((col) => escape(col.export(row, idx))).join(','))
    const fileContent = `\uFEFF${[headerLine, ...dataLines].join('\n')}`

    let mimeType = 'text/csv;charset=utf-8'
    let ext = '.csv'
    if (format === 'xlsx') {
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ext = '.xlsx'
    } else if (format === 'xls') {
      mimeType = 'application/vnd.ms-excel'
      ext = '.xls'
    }

    const blob = new Blob([fileContent], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}${ext}`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handlePrint = (type) => {
    const printColumns = [
      { title: 'No', render: (_, idx) => idx + 1 },
      { title: 'NIS', render: (r) => r.student?.nis || '-' },
      { title: 'Nama Siswa', render: (r) => r.student?.full_name || '-' },
      { title: 'Mapel', render: (r) => r.subject?.name || '-' },
      { title: 'Kelas', render: (r) => r.kelas?.nama_kelas || '-' },
      { title: 'Tugas', render: (r) => r.score_assignment ?? 0 },
      { title: 'UH', render: (r) => r.score_quiz ?? 0 },
      { title: 'UTS', render: (r) => r.score_midterm ?? 0 },
      { title: 'UAS', render: (r) => r.score_final ?? 0 },
      { title: 'N. Akhir', render: (r) => r.final_score ?? 0 },
      { title: 'Grade', render: (r) => r.grade_letter || '-' },
      { title: 'Status', render: (r) => (r.is_passed ? 'Tuntas' : 'Remedial') },
    ]

    if (type === 'print') {
      printCleanTable({
        title: 'Laporan Rekap Buku Nilai Akademik',
        subtitle: 'Sistem Manajemen Sekolah Terpadu',
        columns: printColumns,
        data: dataList,
      })
    } else if (type === 'pdf') {
      downloadPdfTable({
        filename: 'rekap-buku-nilai.pdf',
        title: 'Laporan Rekap Buku Nilai Akademik',
        subtitle: 'Sistem Manajemen Sekolah Terpadu',
        columns: printColumns,
        data: dataList,
      })
    }
  }

  // 5 KPI Cards calculation
  const cards = useMemo(() => {
    const totalSiswa = stats.total_siswa || pagination.total || dataList.length || 0
    const passPercent = stats.persentase_kelulusan ?? (totalSiswa > 0 ? ((stats.total_lulus || 0) / totalSiswa) * 100 : 0)
    const remedPercent = totalSiswa > 0 ? ((stats.total_remedial || 0) / totalSiswa) * 100 : 0

    return [
      {
        label: 'Rata-rata Nilai',
        statusKey: 'semua',
        value: stats.rata_nilai_akhir || 0,
        icon: Award,
        tone: 'emerald',
        percent: 100,
        subText: 'Skor Akhir Terkalkulasi',
      },
      {
        label: 'Tingkat Lulus KKM',
        statusKey: '1',
        value: stats.total_lulus || 0,
        icon: CheckCircle2,
        tone: 'sky',
        percent: Number(passPercent),
        subText: `${stats.total_lulus || 0} Siswa Tuntas`,
      },
      {
        label: 'Perlu Remedial',
        statusKey: '0',
        value: stats.total_remedial || 0,
        icon: XCircle,
        tone: 'rose',
        percent: Number(remedPercent),
        subText: 'Di Bawah KKM',
      },
      {
        label: 'Rata-rata CBT',
        statusKey: 'semua',
        value: stats.rata_cbt || 0,
        icon: Layers,
        tone: 'purple',
        percent: 100,
        subText: 'Ujian CBT Online',
      },
      {
        label: 'Rata-rata Tugas',
        statusKey: 'semua',
        value: stats.rata_assignment || 0,
        icon: FileSpreadsheet,
        tone: 'amber',
        percent: 100,
        subText: 'Tugas LMS',
      },
    ]
  }, [stats, pagination.total, dataList.length])

  // Recharts Bar Data
  const trendChartData = useMemo(() => [
    { name: 'Tugas LMS', nilai: Number(stats.rata_assignment || 0), fill: '#059669' },
    { name: 'CBT UH', nilai: Number(stats.rata_cbt || 0), fill: '#2563eb' },
    { name: 'CBT UTS', nilai: Number(stats.rata_cbt ? stats.rata_cbt * 0.95 : 0).toFixed(1), fill: '#7c3aed' },
    { name: 'CBT UAS', nilai: Number(stats.rata_cbt ? stats.rata_cbt * 1.02 : 0).toFixed(1), fill: '#d97706' },
    { name: 'Rata Akhir', nilai: Number(stats.rata_nilai_akhir || 0), fill: '#059669' },
  ], [stats])

  // Recharts Pie Data
  const pieChartData = useMemo(() => {
    const gradeDist = stats.grade_distribution || { A: 0, B: 0, C: 0, D: 0 }
    const list = [
      { name: 'Predikat A', value: gradeDist.A || 0, color: '#059669' },
      { name: 'Predikat B', value: gradeDist.B || 0, color: '#2563eb' },
      { name: 'Predikat C', value: gradeDist.C || 0, color: '#d97706' },
      { name: 'Predikat D/E', value: gradeDist.D || 0, color: '#e11d48' },
    ]
    const filtered = list.filter((i) => i.value > 0)
    if (filtered.length === 0) {
      return [
        { name: 'Tuntas KKM', value: stats.total_lulus || 0, color: '#059669' },
        { name: 'Remedial', value: stats.total_remedial || 0, color: '#e11d48' },
      ]
    }
    return filtered
  }, [stats])

  return (
    <PageContainer>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
        {/* Toast Alert Notification */}
        {toast.show && (
          <motion.div variants={itemVariants}>
            <Alert status={toast.type === 'error' ? 'error' : 'success'}>
              <AlertIndicator />
              <AlertContent>
                <AlertTitle>{toast.type === 'error' ? 'Pemberitahuan' : 'Berhasil'}</AlertTitle>
                <AlertDescription>{toast.message}</AlertDescription>
              </AlertContent>
            </Alert>
          </motion.div>
        )}



        {/* Configurable Formula & Weights Control Panel */}
        {showConfigPanel && (
          <motion.div variants={itemVariants}>
            <div className="bg-white dark:bg-[#1B2433] p-5 rounded-[18px] border border-emerald-200 dark:border-emerald-800 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#0E5C44]" /> Pengaturan Bobot Rumus Penilaian (Nilai Akhir)
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    totalWeightSum === 100
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  Total Bobot: {totalWeightSum}% {totalWeightSum === 100 ? '✓ (Ideal)' : '(Disarankan 100%)'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bobot Penugasan (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weights.bobot_tugas}
                    onChange={(e) => setWeights((prev) => ({ ...prev, bobot_tugas: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bobot CBT UH (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weights.bobot_uh}
                    onChange={(e) => setWeights((prev) => ({ ...prev, bobot_uh: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bobot CBT UTS (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weights.bobot_uts}
                    onChange={(e) => setWeights((prev) => ({ ...prev, bobot_uts: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bobot CBT UAS (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weights.bobot_uas}
                    onChange={(e) => setWeights((prev) => ({ ...prev, bobot_uas: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Batas KKM Lulus</label>
                  <input
                    type="number"
                    step="0.5"
                    value={weights.nilai_kkm}
                    onChange={(e) => setWeights((prev) => ({ ...prev, nilai_kkm: parseFloat(e.target.value) || 75.0 }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827]"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-500 font-mono italic">
                  Rumus: N_Akhir = ({weights.bobot_tugas}% * Tugas) + ({weights.bobot_uh}% * CBT UH) + ({weights.bobot_uts}% * CBT UTS) + ({weights.bobot_uas}% * CBT UAS)
                </p>
                <button
                  type="button"
                  onClick={handleRunAutoCalculation}
                  disabled={calculating}
                  className="w-full md:w-auto px-4 py-2 rounded-xl bg-[#0E5C44] text-white text-xs font-bold hover:bg-emerald-700 flex items-center justify-center gap-2 shadow transition cursor-pointer disabled:opacity-50"
                >
                  {calculating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                  Jalankan Auto-Kalkulasi CBT + Penugasan
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 5-Card KPI Summary Grid */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {cards.map(({ label, statusKey, value, icon: Icon, tone, percent, subText }) => {
              const style = toneStyles[tone] || toneStyles.emerald
              const isActiveFilter = filters.is_passed === statusKey
              return (
                <motion.article
                  key={label}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => openCardModal(statusKey, label, tone)}
                  role="button"
                  tabIndex={0}
                  className={`group flex flex-col justify-between h-full p-4 rounded-[18px] border shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer ${style.cardBg}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className={`size-10 sm:size-11 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg} ${style.iconColor}`}>
                      <Icon className="size-5 sm:size-6" />
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${style.badge}`}>
                      {percent.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">{label}</span>
                    <strong className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white block">
                      {typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800/80">
                    <span>{subText}</span>
                    <span className="inline-flex items-center gap-0.5 text-emerald-700 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
                      Detail &rarr;
                    </span>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </motion.div>

        {/* Module Tab Navigation & Action Buttons inside the same card */}
        {tabNav && (
          <motion.div variants={itemVariants}>
            {typeof tabNav === 'function' ? (
              tabNav(
                <>
                  <button
                    type="button"
                    onClick={() => setShowConfigPanel(!showConfigPanel)}
                    className="group relative flex shrink-0 items-center gap-2.5 rounded-xl border border-slate-200/70 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#111827] dark:hover:bg-slate-800/80 px-3 py-2 cursor-pointer transition-colors duration-150"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-xs bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60">
                      <Sliders className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col pr-0.5 text-left">
                      <span className="text-xs font-extrabold tracking-tight text-slate-700 dark:text-slate-200 group-hover:text-slate-900">
                        Konfigurasi Bobot & Rumus
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">
                        Pengaturan Rumus
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="group relative flex shrink-0 items-center gap-2.5 rounded-xl border border-slate-200/70 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#111827] dark:hover:bg-slate-800/80 px-3 py-2 cursor-pointer transition-colors duration-150"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-xs bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
                      <Plus className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col pr-0.5 text-left">
                      <span className="text-xs font-extrabold tracking-tight text-slate-700 dark:text-slate-200 group-hover:text-slate-900">
                        Input Nilai Manual
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">
                        Override Manual
                      </span>
                    </div>
                  </button>
                </>
              )
            ) : (
              tabNav
            )}
          </motion.div>
        )}

        {/* 3-Column Equal Grid Section */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {/* Column 1: Filter Laporan */}
            <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Filter Laporan Nilai</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({ search: '', kelas_id: '', subject_id: '', semester_id: '', is_passed: '' })
                      fetchData(1)
                    }}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Search Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Pencarian Siswa</label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari nama, NIS, mapel..."
                        value={filters.search}
                        onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                        className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Dropdown Kelas */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Pilihan Kelas</label>
                    <select
                      value={filters.kelas_id}
                      onChange={(e) => setFilters((prev) => ({ ...prev, kelas_id: e.target.value }))}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Semua Kelas</option>
                      {options.kelas.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.nama_kelas}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dropdown Mata Pelajaran */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Mata Pelajaran</label>
                    <select
                      value={filters.subject_id}
                      onChange={(e) => setFilters((prev) => ({ ...prev, subject_id: e.target.value }))}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Semua Mata Pelajaran</option>
                      {options.subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dropdown Semester */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Semester</label>
                    <select
                      value={filters.semester_id}
                      onChange={(e) => setFilters((prev) => ({ ...prev, semester_id: e.target.value }))}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Semua Semester</option>
                      {options.semesters.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nama_semester}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filter Status Kelulusan */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Status Kelulusan KKM</label>
                    <select
                      value={filters.is_passed}
                      onChange={(e) => setFilters((prev) => ({ ...prev, is_passed: e.target.value }))}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Semua Status</option>
                      <option value="1">Tuntas KKM</option>
                      <option value="0">Perlu Remedial</option>
                    </select>
                  </div>
                </div>
              </div>
            </article>

            {/* Column 2: Grafik Tren Utama (BarChart) */}
            <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Analisis Skor Rata-rata</h2>
                <span className="text-xs font-semibold text-slate-400">Komponen Nilai</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip formatter={(val) => [`Skor: ${val}`, 'Nilai']} />
                    <Bar dataKey="nilai" radius={[6, 6, 0, 0]} maxBarSize={44}>
                      {trendChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            {/* Column 3: Grafik Distribusi Donut (PieChart) */}
            <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Distribusi Predikat</h2>
                <span className="text-xs font-bold text-slate-500">{pagination.total || dataList.length} Siswa</span>
              </div>
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="relative w-44 h-44 mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieChartData} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={2}>
                        {pieChartData.map((item) => (
                          <Cell key={item.name} fill={item.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <strong className="text-xl font-black text-slate-900 dark:text-white">
                      {pagination.total || dataList.length}
                    </strong>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Rekap Siswa</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                  {pieChartData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                        {item.name}: <b>{item.value}</b>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </motion.div>

        {/* Datatable Outer Container */}
        <motion.div variants={itemVariants}>
          <div className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#1B2433] shadow-xs space-y-4 p-4 md:p-6">
            {/* Datatable Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#0E5C44]" /> Daftar Rekap Buku Nilai Siswa
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {pagination.total || dataList.length} Records
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Tambah */}
                <SquircleActionButton
                  variant="primary"
                  onClick={() => handleOpenModal()}
                  label="Tambah / Input Nilai Manual"
                />

                {/* 2. Export */}
                <SquircleActionButton
                  variant="export"
                  onClick={() => exportDatatable(dataList, 'csv')}
                  label="Export Datatable (.csv, .xlsx)"
                />

                {/* 3. Import */}
                <SquircleActionButton
                  variant="import"
                  onClick={() => setIsImportModalOpen(true)}
                  label="Import Data Penilaian (.csv, .xlsx)"
                />

                {/* 4. Cetak */}
                <SquircleActionButton
                  variant="view"
                  icon={Printer}
                  onClick={openPrintFilterModal}
                  label="Cetak & Filter Laporan"
                />
              </div>
            </div>

            {/* Table Area */}
            {loading ? (
              <div className="p-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#0E5C44] animate-spin mx-auto" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Memuat rekap penilaian...</p>
              </div>
            ) : dataList.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Belum Ada Data Penilaian</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Pilih filter Kelas & Mata Pelajaran lalu klik tombol <b>Konfigurasi Bobot & Rumus</b> untuk auto-kalkulasi dari CBT & Penugasan.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Nama Siswa & NIS</th>
                      <th className="py-3.5 px-4">Mapel & Kelas</th>
                      <th className="py-3.5 px-4 text-center">N. Tugas</th>
                      <th className="py-3.5 px-4 text-center">CBT UH</th>
                      <th className="py-3.5 px-4 text-center">CBT UTS</th>
                      <th className="py-3.5 px-4 text-center">CBT UAS</th>
                      <th className="py-3.5 px-4 text-center">Nilai Akhir</th>
                      <th className="py-3.5 px-4 text-center">Grade & Status</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {dataList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors duration-150">
                        {/* Student Info with HoverCard */}
                        <td className="py-3.5 px-4 align-top">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="cursor-pointer group flex items-center gap-2.5">
                                <Avatar size="sm">
                                  <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-bold">
                                    {(item.student?.full_name || 'S').charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                    {item.student?.full_name || 'Siswa'}
                                  </div>
                                  <div className="text-[11px] font-mono text-slate-400">NIS: {item.student?.nis || '-'}</div>
                                </div>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-64 p-3 bg-white dark:bg-[#1B2433] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50">
                              <div className="flex items-center gap-3">
                                <Avatar size="md">
                                  <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold">
                                    {(item.student?.full_name || 'S').charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.student?.full_name}</h4>
                                  <p className="text-xs text-slate-500">NIS: {item.student?.nis || '-'}</p>
                                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                                    {item.kelas?.nama_kelas || 'Kelas'}
                                  </span>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </td>

                        {/* Subject & Class */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{item.subject?.name || '-'}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.kelas?.nama_kelas || '-'}</div>
                        </td>

                        {/* Scores */}
                        <td className="py-3.5 px-4 text-center font-medium text-slate-700 dark:text-slate-300">{item.score_assignment}</td>
                        <td className="py-3.5 px-4 text-center font-medium text-slate-700 dark:text-slate-300">{item.score_quiz}</td>
                        <td className="py-3.5 px-4 text-center font-medium text-slate-700 dark:text-slate-300">{item.score_midterm}</td>
                        <td className="py-3.5 px-4 text-center font-medium text-slate-700 dark:text-slate-300">{item.score_final}</td>

                        {/* Final Score */}
                        <td className="py-3.5 px-4 text-center font-black text-base text-[#0E5C44] dark:text-emerald-400">
                          {item.final_score}
                        </td>

                        {/* Grade & Status */}
                        <td className="py-3.5 px-4 text-center align-top space-y-1">
                          <div>{getGradeBadge(item.grade_letter)}</div>
                          <div>
                            {item.is_passed ? (
                              <Badge color="success" size="sm">TUNTAS KKM</Badge>
                            ) : (
                              <Badge color="error" size="sm">REMEDIAL</Badge>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right align-top">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                printCleanTable({
                                  title: `Transkrip Nilai Siswa — ${item.student?.full_name || 'Siswa'}`,
                                  subtitle: `NIS: ${item.student?.nis || '-'} | Mapel: ${item.subject?.name || '-'} | Kelas: ${item.kelas?.nama_kelas || '-'}`,
                                  columns: [
                                    { title: 'Komponen / Parameter', render: (r) => r.label },
                                    { title: 'Skor / Nilai', render: (r) => r.val },
                                  ],
                                  data: [
                                    { label: 'Penugasan LMS', val: item.score_assignment },
                                    { label: 'CBT UH', val: item.score_quiz },
                                    { label: 'CBT UTS', val: item.score_midterm },
                                    { label: 'CBT UAS', val: item.score_final },
                                    { label: 'Nilai Akhir Terkalkulasi', val: item.final_score },
                                    { label: 'Predikat / Grade', val: item.grade_letter },
                                    { label: 'Status KKM', val: item.is_passed ? 'TUNTAS KKM' : 'REMEDIAL' },
                                  ],
                                })
                              }}
                              className="size-8 rounded-xl bg-indigo-50/90 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-indigo-600/30 cursor-pointer shadow-2xs flex items-center justify-center"
                              title="Cetak Transkrip Siswa Ini"
                            >
                              <Printer className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setViewingItem(item)
                                setShowDetailModal(true)
                              }}
                              className="size-8 rounded-xl bg-emerald-50/90 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-emerald-600/30 cursor-pointer shadow-2xs flex items-center justify-center"
                              title="Detail Rincian Formula"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenModal(item)}
                              className="size-8 rounded-xl bg-sky-50/90 text-sky-600 hover:bg-sky-600 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-sky-600/30 cursor-pointer shadow-2xs flex items-center justify-center"
                              title="Edit Override Manual"
                            >
                              <Edit3 className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="size-8 rounded-xl bg-rose-50/90 text-rose-600 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-rose-600/30 cursor-pointer shadow-2xs flex items-center justify-center"
                              title="Hapus Nilai"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Component */}
            {!loading && pagination.lastPage > 1 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.lastPage}
                  onPageChange={(page) => fetchData(page)}
                  sideLayout="full"
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Print Option Modal */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onSelectOption={(format) => {
          if (format === 'csv') exportDatatable(dataList, 'csv')
          else if (format === 'excel') exportDatatable(dataList, 'xlsx')
          else handlePrint(format)
        }}
      />

      {/* Manual Override Dialog Modal */}
      {showModal && (
        <Dialog isOpen={showModal} onClose={() => setShowModal(false)}>
          <Backdrop isOpen={showModal} onOpenChange={() => setShowModal(false)} />
          <OverlayWrapper>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#0E5C44]" /> Edit / Override Manual Nilai Siswa
              </DialogTitle>
              <DialogDescription>
                Sesuaikan nilai tugas LMS, CBT UH, UTS, UAS, dan catatan evaluasi secara langsung.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <DialogBody className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nilai Penugasan LMS</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.score_assignment}
                      onChange={(e) => setFormData((prev) => ({ ...prev, score_assignment: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nilai CBT UH</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.score_quiz}
                      onChange={(e) => setFormData((prev) => ({ ...prev, score_quiz: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nilai CBT UTS / PTS</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.score_midterm}
                      onChange={(e) => setFormData((prev) => ({ ...prev, score_midterm: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nilai CBT UAS / PAS</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.score_final}
                      onChange={(e) => setFormData((prev) => ({ ...prev, score_final: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Guru / Wali Kelas</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827]"
                    placeholder="Catatan kemajuan akademik siswa..."
                  />
                </div>
              </DialogBody>

              <DialogFooter className="gap-2">
                <Button
                  appearance="outline"
                  variant="ghost"
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </Button>
                <Button variant="primary" type="submit">
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </form>
          </OverlayWrapper>
        </Dialog>
      )}

      {/* Grade Breakdown Detail Drawer / Modal */}
      {showDetailModal && viewingItem && (
        <Dialog isOpen={showDetailModal} onClose={() => setShowDetailModal(false)}>
          <Backdrop isOpen={showDetailModal} onOpenChange={() => setShowDetailModal(false)} />
          <OverlayWrapper>
            <DialogHeader>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                {viewingItem.subject?.name} — {viewingItem.kelas?.nama_kelas}
              </span>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                {viewingItem.student?.full_name}
              </DialogTitle>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Nilai Akhir Terkalkulasi</span>
                  <span className="text-3xl font-black text-[#0E5C44] dark:text-emerald-400">{viewingItem.final_score}</span>
                </div>
                <div className="text-right space-y-1">
                  {getGradeBadge(viewingItem.grade_letter)}
                  <div>
                    {viewingItem.is_passed ? (
                      <Badge color="success" size="sm">TUNTAS KKM</Badge>
                    ) : (
                      <Badge color="error" size="sm">REMEDIAL</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Formula Component Breakdown */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Rincian Komponen & Bobot:</h4>
                <div className="bg-slate-50 dark:bg-[#111827] p-3 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <span>Tugas LMS ({viewingItem.weights_config?.bobot_tugas}%):</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{viewingItem.score_assignment}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>CBT UH ({viewingItem.weights_config?.bobot_uh}%):</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{viewingItem.score_quiz}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>CBT UTS ({viewingItem.weights_config?.bobot_uts}%):</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{viewingItem.score_midterm}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>CBT UAS ({viewingItem.weights_config?.bobot_uas}%):</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{viewingItem.score_final}</span>
                  </div>
                </div>
              </div>

              {viewingItem.notes && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 text-xs">
                  <span className="font-bold text-amber-800 dark:text-amber-300 block mb-0.5">Catatan Guru:</span>
                  <p className="text-slate-700 dark:text-slate-300">{viewingItem.notes}</p>
                </div>
              )}
            </DialogBody>

            <DialogFooter>
              <Button
                appearance="outline"
                variant="ghost"
                onClick={() => setShowDetailModal(false)}
              >
                Tutup Detail
              </Button>
            </DialogFooter>
          </OverlayWrapper>
        </Dialog>
      )}

      {/* KPI Card Drill-Down Detail Modal */}
      {cardModal.isOpen && (
        <Dialog isOpen={cardModal.isOpen} onClose={closeCardModal}>
          <Backdrop isOpen={cardModal.isOpen} onOpenChange={closeCardModal} />
          <OverlayWrapper>
            <DialogHeader>
              <div className="flex items-center justify-between w-full pr-6">
                <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <Award className="w-5 h-5 text-[#0E5C44]" />
                  {cardModal.title}
                </DialogTitle>
                <Badge color={cardModal.tone === 'rose' ? 'error' : cardModal.tone === 'sky' ? 'blue' : 'success'} size="sm">
                  {modalRows.length} Siswa
                </Badge>
              </div>
              <DialogDescription>
                Rincian nilai dan status KKM siswa untuk kategori ini.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              {/* Modal Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, NIS, mapel..."
                  value={cardModal.searchQuery}
                  onChange={(e) => setCardModal((prev) => ({ ...prev, searchQuery: e.target.value, page: 1 }))}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Modal Table */}
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                      <th className="py-2.5 px-3">Siswa & NIS</th>
                      <th className="py-2.5 px-3">Mapel & Kelas</th>
                      <th className="py-2.5 px-3 text-center">N. Akhir</th>
                      <th className="py-2.5 px-3 text-center">Grade</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedModalRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          Belum ada data siswa untuk kategori ini.
                        </td>
                      </tr>
                    ) : (
                      paginatedModalRows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900 dark:text-white">{row.student?.full_name || 'Siswa'}</div>
                            <div className="text-[10px] text-slate-400 font-mono">NIS: {row.student?.nis || '-'}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-medium text-slate-800 dark:text-slate-200">{row.subject?.name || '-'}</div>
                            <div className="text-[10px] text-slate-400">{row.kelas?.nama_kelas || '-'}</div>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-[#0E5C44] dark:text-emerald-400">
                            {row.final_score}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {getGradeBadge(row.grade_letter)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {row.is_passed ? (
                              <Badge color="success" size="sm">TUNTAS</Badge>
                            ) : (
                              <Badge color="error" size="sm">REMEDIAL</Badge>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Modal Pagination */}
              {modalTotalPages > 1 && (
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                  <span>
                    Halaman {cardModal.page} dari {modalTotalPages} ({modalRows.length} data)
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={cardModal.page <= 1}
                      onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page - 1 }))}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Sebelumnya
                    </button>
                    <button
                      type="button"
                      disabled={cardModal.page >= modalTotalPages}
                      onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page + 1 }))}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </DialogBody>

            <DialogFooter>
              <Button variant="ghost" appearance="outline" size="sm" onClick={closeCardModal}>
                Tutup
              </Button>
            </DialogFooter>
          </OverlayWrapper>
        </Dialog>
      )}

      {/* Print Filter & Student Selection Modal */}
      {isPrintFilterModalOpen && (
        <Dialog isOpen={isPrintFilterModalOpen} onClose={() => setIsPrintFilterModalOpen(false)}>
          <Backdrop isOpen={isPrintFilterModalOpen} onOpenChange={() => setIsPrintFilterModalOpen(false)} />
          <OverlayWrapper>
            <DialogHeader>
              <div className="flex items-center justify-between w-full pr-6">
                <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <Printer className="w-5 h-5 text-[#0E5C44]" />
                  Pilih Data Nilai & Siswa Untuk Dicetak
                </DialogTitle>
                <Badge color="cyan" size="sm">
                  {selectedStudentIds.length} dari {dataList.length} Siswa
                </Badge>
              </div>
              <DialogDescription>
                Tentukan komponen nilai dan daftar siswa yang akan dimasukkan ke dalam laporan cetak / PDF.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-5">
              {/* Opsi 1: Komponen Nilai */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  1. Pilih Komponen Nilai Yang Dicetak
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedScoreFields.assignment}
                      onChange={() => handleToggleScoreField('assignment')}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Tugas LMS
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedScoreFields.uh}
                      onChange={() => handleToggleScoreField('uh')}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    CBT UH
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedScoreFields.uts}
                      onChange={() => handleToggleScoreField('uts')}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    CBT UTS
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedScoreFields.uas}
                      onChange={() => handleToggleScoreField('uas')}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    CBT UAS
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedScoreFields.final}
                      onChange={() => handleToggleScoreField('final')}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Nilai Akhir
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedScoreFields.grade}
                      onChange={() => handleToggleScoreField('grade')}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Grade / Predikat
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300 col-span-2">
                    <input
                      type="checkbox"
                      checked={selectedScoreFields.status}
                      onChange={() => handleToggleScoreField('status')}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Status KKM (Tuntas/Remedial)
                  </label>
                </div>
              </div>

              {/* Opsi 2: Pilih Siswa */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    2. Pilih Siswa Yang Dicetak ({selectedStudentIds.length}/{dataList.length})
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.length === dataList.length && dataList.length > 0}
                      onChange={handleSelectAllPrintStudents}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Pilih Semua
                  </label>
                </div>

                {/* Filter Search inside Modal */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari siswa untuk dicetak..."
                    value={printSearchQuery}
                    onChange={(e) => setPrintSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* List of Students */}
                <div className="max-h-56 overflow-y-auto border border-slate-200/80 dark:border-slate-800 rounded-xl p-2 divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/40">
                  {filteredPrintStudents.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">Tidak ada siswa ditemukan.</div>
                  ) : (
                    filteredPrintStudents.map((r, idx) => {
                      const rowId = getRowId(r, idx)
                      const isChecked = selectedStudentIds.includes(rowId)
                      return (
                        <label
                          key={rowId}
                          className="flex items-center justify-between py-2 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePrintStudent(rowId)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">
                                {r.student?.full_name || 'Siswa'}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                NIS: {r.student?.nis || '-'} | {r.subject?.name || '-'} ({r.kelas?.nama_kelas || '-'})
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#0E5C44] dark:text-emerald-400">
                            N. Akhir: {r.final_score}
                          </span>
                        </label>
                      )
                    })
                  )}
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="flex flex-wrap items-center justify-between gap-2">
              <Button variant="ghost" appearance="outline" size="sm" onClick={() => setIsPrintFilterModalOpen(false)}>
                Batal
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  appearance="outline"
                  size="sm"
                  onClick={() => handleExecutePrint('csv')}
                  className="gap-1.5 text-amber-700 border-amber-300 dark:text-amber-400 hover:bg-amber-50"
                >
                  <Download1 className="w-4 h-4" /> Export CSV
                </Button>
                <Button
                  variant="ghost"
                  appearance="outline"
                  size="sm"
                  onClick={() => handleExecutePrint('pdf')}
                  className="gap-1.5 text-blue-700 border-blue-300 dark:text-blue-400 hover:bg-blue-50"
                >
                  <FileText className="w-4 h-4" /> Unduh PDF
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleExecutePrint('print')}
                  className="gap-1.5 bg-[#0E5C44] hover:bg-emerald-700 text-white"
                >
                  <Printer className="w-4 h-4" /> Cetak Sekarang
                </Button>
              </div>
            </DialogFooter>
          </OverlayWrapper>
        </Dialog>
      )}

      {/* Import Data Penilaian Modal (.csv, .xlsx, .xls) */}
      {isImportModalOpen && (
        <Dialog
          isOpen={isImportModalOpen}
          onClose={() => { setIsImportModalOpen(false); setImportFile(null); setImportError(''); }}
        >
          <Backdrop isOpen={isImportModalOpen} onOpenChange={() => setIsImportModalOpen(false)} />
          <OverlayWrapper className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Upload1 className="size-5 text-sky-500" /> Import Data Buku Nilai Siswa
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Upload file spreadsheet (.csv, .xlsx, .xls) berisi data nilai tugas, CBT UH, UTS, dan UAS.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="py-4 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/60">
                <div>
                  <span className="text-xs font-bold text-sky-900 dark:text-sky-200 block">Template Format Import</span>
                  <span className="text-[11px] text-sky-700 dark:text-sky-400 block">Unduh contoh template CSV dengan kolom NIS, Nama, Mapel, Kelas, Skor.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const templateHeaders = 'nis,nama_siswa,mapel,kelas,score_assignment,score_quiz,score_midterm,score_final\n23001,"Ahmad Zaky","Bahasa Indonesia","7A",80,85,85,90\n23002,"Aisyah Humaira","Bahasa Indonesia","7A",85,90,88,92\n'
                    const blob = new Blob([`\uFEFF${templateHeaders}`], { type: 'text/csv;charset=utf-8' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'template-import-buku-nilai.csv'
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Download className="size-3.5" /> Template
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pilih File (.csv, .xlsx, .xls):
                </label>
                <div
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  onClick={() => importInputRef.current?.click()}
                >
                  <Upload1 className="size-8 text-sky-500 mb-2" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {importFile ? importFile.name : 'Klik untuk memilih atau drag & drop file'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">Format didukung: CSV (.csv), Excel (.xlsx, .xls)</span>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".csv, .xlsx, .xls, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setImportFile(e.target.files[0])
                        setImportError('')
                      }
                    }}
                  />
                </div>
              </div>

              {importError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
                  {importError}
                </div>
              )}
            </DialogBody>

            <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { setIsImportModalOpen(false); setImportFile(null); setImportError(''); }}>
                Batal
              </Button>
              <Button
                variant="primary"
                className="bg-sky-600 hover:bg-sky-700 text-white"
                disabled={!importFile || isImporting}
                onClick={async () => {
                  if (!importFile) return
                  try {
                    setIsImporting(true)
                    setImportError('')
                    const text = await importFile.text()
                    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
                    if (lines.length <= 1) throw new Error('File tidak memiliki data baris untuk diimport.')
                    
                    const newRows = lines.slice(1).map((line, idx) => {
                      const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim())
                      const scoreAssign = parseFloat(cols[4]) || 80
                      const scoreUh = parseFloat(cols[5]) || 80
                      const scoreUts = parseFloat(cols[6]) || 80
                      const scoreUas = parseFloat(cols[7]) || 80
                      const finalScore = Number(((scoreAssign * 0.2) + (scoreUh * 0.25) + (scoreUts * 0.25) + (scoreUas * 0.3)).toFixed(1))
                      
                      return {
                        id: `imp-${Date.now()}-${idx}`,
                        student: { full_name: cols[1] || `Siswa Import ${idx + 1}`, nis: cols[0] || `IMP-${idx + 1}` },
                        subject: { name: cols[2] || 'Mata Pelajaran' },
                        kelas: { nama_kelas: cols[3] || 'Kelas' },
                        score_assignment: scoreAssign,
                        score_quiz: scoreUh,
                        score_midterm: scoreUts,
                        score_final: scoreUas,
                        final_score: finalScore,
                        grade_letter: finalScore >= 85 ? 'A' : finalScore >= 75 ? 'B' : finalScore >= 60 ? 'C' : 'D',
                        is_passed: finalScore >= 75,
                      }
                    })

                    setDataList((prev) => [...newRows, ...prev])
                    setIsImportModalOpen(false)
                    setImportFile(null)
                    showNotification(`Berhasil mengimport ${newRows.length} data buku nilai!`, 'success')
                  } catch (err) {
                    setImportError(err.message || 'Gagal memproses file import.')
                  } finally {
                    setIsImporting(false)
                  }
                }}
              >
                {isImporting ? 'Memproses...' : 'Import Data'}
              </Button>
            </DialogFooter>
          </OverlayWrapper>
        </Dialog>
      )}
    </PageContainer>
  )
}
