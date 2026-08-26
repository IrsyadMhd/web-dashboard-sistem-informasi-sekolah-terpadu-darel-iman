import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  Layers,
  ListOrdered,
  FileText,
  Tag,
  Check,
  Ban,
  SlidersHorizontal,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { lmsAktivitasBelajarService } from '../services/lmsAktivitasBelajarService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import {
  MasterDataTable,
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'
import CsvImportModal from '../components/master-data/CsvImportModal'
import ActionDropdown from '../components/app/ActionDropdown'
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

export default function LmsAktivitasBelajarPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
  const [dataAktivitas, setDataAktivitas] = useState([])
  const [optionsModulAjar, setOptionsModulAjar] = useState([])
  const [optionsJenis, setOptionsJenis] = useState([
    'Pendahuluan',
    'Inti',
    'Penutup',
    'Diskusi',
    'Kuis',
    'Tugas',
    'Presentasi',
    'Refleksi',
    'Eksperimen',
    'Praktikum',
  ])
  const [stats, setStats] = useState({
    total: 0,
    pendahuluan: 0,
    inti: 0,
    penutup: 0,
    aktif: 0,
    draft: 0,
  })

  // KPI Modal State
  const [kpiModalOpen, setKpiModalOpen] = useState(false)
  const [kpiModalCategory, setKpiModalCategory] = useState({
    title: '',
    items: [],
  })

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Filters & Pagination
  const [search, setSearch] = useState('')
  const [selectedModulAjar, setSelectedModulAjar] = useState('')
  const [selectedJenis, setSelectedJenis] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [editId, setEditId] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const handleExportCSV = () => {
    const headers = ['NO', 'JUDUL AKTIVITAS', 'JENIS', 'MODUL AJAR', 'DURASI', 'STATUS']
    const rows = (dataAktivitas || []).map((a, i) => [
      i + 1,
      `"${(a.judul_aktivitas || a.nama_aktivitas || '').replace(/"/g, '""')}"`,
      a.jenis_aktivitas || a.jenis || '',
      `"${(a.modul_ajar?.judul_modul || '').replace(/"/g, '""')}"`,
      a.durasi_menit ? `${a.durasi_menit} Menit` : '',
      a.status === 'aktif' ? 'Aktif' : 'Draft',
    ])
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `export_aktivitas_belajar_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImport = async (parsedData) => {
    setSuccessMsg(`Berhasil mengimpor ${parsedData.length} data aktivitas belajar.`)
    fetchDaftarAktivitas()
  }

  const pageActions = (
    <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
      <SquircleActionButton variant="import" label="Import Data" onClick={() => setImportOpen(true)} />
      <SquircleActionButton variant="export" label="Export Data" onClick={handleExportCSV} />
      <SquircleActionButton variant="view" icon={Printer} label="Cetak Data" onClick={() => setIsPrintModalOpen(true)} />
      <SquircleActionButton variant="primary" label="Tambah Aktivitas" onClick={() => handleOpenCreateModal()} />
    </div>
  )

  const [formData, setFormData] = useState({
    modul_ajar_id: '',
    nama_aktivitas: '',
    jenis_aktivitas: 'Inti',
    instruksi: '',
    waktu: 15,
    urutan: 1,
    status: 'aktif',
  })

  useEffect(() => {
    fetchOptions()
    fetchStats()
  }, [])

  useEffect(() => {
    fetchData()
  }, [page, search, selectedModulAjar, selectedJenis, selectedStatus])

  const fetchStats = async () => {
    try {
      const res = await lmsAktivitasBelajarService.getStats()
      if (res.success) {
        setStats(res.data)
      }
    } catch (err) {
      console.error('Gagal mengambil statistik aktivitas:', err)
    }
  }

  const computedStats = useMemo(() => {
    return {
      total: dataAktivitas.length,
      pendahuluan: dataAktivitas.filter((a) => a.jenis_aktivitas === 'Pendahuluan').length,
      inti: dataAktivitas.filter((a) => a.jenis_aktivitas === 'Inti').length,
      penutup: dataAktivitas.filter((a) => a.jenis_aktivitas === 'Penutup' || a.jenis_aktivitas === 'Refleksi').length,
    }
  }, [dataAktivitas])

  const handleOpenKpiModal = (type) => {
    let title = ''
    let items = []

    if (type === 'total') {
      title = 'Total Aktivitas Belajar Terdaftar'
      items = dataAktivitas
    } else if (type === 'pendahuluan') {
      title = 'Daftar Aktivitas Pendahuluan (Orientasi & Apersepsi)'
      items = dataAktivitas.filter((a) => a.jenis_aktivitas === 'Pendahuluan')
    } else if (type === 'inti') {
      title = 'Daftar Aktivitas Kegiatan Inti (Eksplorasi & Praktik)'
      items = dataAktivitas.filter((a) => a.jenis_aktivitas === 'Inti')
    } else if (type === 'penutup') {
      title = 'Daftar Aktivitas Penutup & Refleksi'
      items = dataAktivitas.filter((a) => a.jenis_aktivitas === 'Penutup' || a.jenis_aktivitas === 'Refleksi')
    }

    setKpiModalCategory({ title, items })
    setKpiModalOpen(true)
  }

  const fetchOptions = async () => {
    try {
      const res = await lmsAktivitasBelajarService.getOptions()
      if (res.success) {
        if (res.data.modul_ajar) setOptionsModulAjar(res.data.modul_ajar)
        if (res.data.jenis_aktivitas) setOptionsJenis(res.data.jenis_aktivitas)
      }
    } catch (err) {
      console.error('Gagal mengambil opsi data:', err)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const params = {
        page,
        per_page: 15,
        search,
        modul_ajar_id: selectedModulAjar,
        jenis_aktivitas: selectedJenis,
        status: selectedStatus,
      }
      const res = await lmsAktivitasBelajarService.getDaftar(params)
      setDataAktivitas(res.data || [])
      if (res.meta) {
        setPagination({
          current_page: res.meta.current_page,
          last_page: res.meta.last_page,
          total: res.meta.total,
          per_page: res.meta.per_page,
        })
      }
    } catch (err) {
      console.error('Error fetching data aktivitas:', err)
      setErrorMsg('Gagal memuat data aktivitas belajar. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreateModal = () => {
    setEditId(null)
    setFormData({
      modul_ajar_id: optionsModulAjar.length > 0 ? optionsModulAjar[0].id : '',
      nama_aktivitas: '',
      jenis_aktivitas: 'Inti',
      instruksi: '',
      waktu: 15,
      urutan: dataAktivitas.length + 1,
      status: 'aktif',
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item) => {
    setEditId(item.id)
    setFormData({
      modul_ajar_id: item.modul_ajar_id || '',
      nama_aktivitas: item.nama_aktivitas || '',
      jenis_aktivitas: item.jenis_aktivitas || 'Inti',
      instruksi: item.instruksi || '',
      waktu: item.waktu || 15,
      urutan: item.urutan || 1,
      status: item.status || 'aktif',
    })
    setIsModalOpen(true)
  }

  const handleOpenDetail = (item) => {
    setSelectedDetail(item)
    setIsDetailOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      let res
      if (editId) {
        res = await lmsAktivitasBelajarService.update(editId, formData)
      } else {
        res = await lmsAktivitasBelajarService.create(formData)
      }

      if (res.success) {
        setSuccessMsg(editId ? 'Aktivitas Belajar berhasil diperbarui!' : 'Aktivitas Belajar berhasil dibuat!')
        setIsModalOpen(false)
        fetchData()
        fetchStats()
        setTimeout(() => setSuccessMsg(''), 4000)
      }
    } catch (err) {
      console.error('Error submitting form:', err)
      const errRes = err.response?.data
      if (errRes && errRes.message) {
        setErrorMsg(errRes.message)
      } else {
        setErrorMsg('Terjadi kesalahan saat menyimpan data. Periksa kembali form Anda.')
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id, nama) => {
    const result = await Swal.fire({
      title: 'Hapus Aktivitas Belajar?',
      text: `Apakah Anda yakin ingin menghapus aktivitas "${nama}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0E5C44',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-5 py-2.5 rounded-xl text-white font-medium',
        cancelButton: 'px-5 py-2.5 rounded-xl font-medium',
      },
    })

    if (result.isConfirmed) {
      try {
        const res = await lmsAktivitasBelajarService.delete(id)
        if (res.success) {
          Swal.fire({
            title: 'Terhapus!',
            text: 'Aktivitas belajar berhasil dihapus.',
            icon: 'success',
            confirmButtonColor: '#0E5C44',
            customClass: { popup: 'rounded-2xl' },
          })
          fetchData()
          fetchStats()
        }
      } catch (err) {
        console.error('Gagal menghapus aktivitas:', err)
        Swal.fire({
          title: 'Gagal!',
          text: 'Gagal menghapus data aktivitas belajar.',
          icon: 'error',
          confirmButtonColor: '#0E5C44',
        })
      }
    }
  }

  const getJenisBadgeColor = (jenis) => {
    switch (jenis) {
      case 'Pendahuluan':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      case 'Inti':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
      case 'Penutup':
      case 'Refleksi':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800'
      case 'Diskusi':
      case 'Presentasi':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
      case 'Kuis':
      case 'Tugas':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800'
      default:
        return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800'
    }
  }

  return (
    <PageContainer maxW="7xl">
      {!(embedded || hideBreadcrumb) && (
        <AppBreadcrumb items={[{ label: 'LMS & Akademik', href: '/dashboard' }, { label: 'Aktivitas Belajar' }]} />
      )}
      <div className="education-unit-page lms-aktivitas-page space-y-6">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <PrintOptionModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Aktivitas Belajar"
          onPrint={() => {
            const rowsToPrint = Array.isArray(dataAktivitas) ? dataAktivitas : []
            printCleanTable({
              title: 'Laporan Data Aktivitas Belajar',
              subtitle: 'Daftar Aktivitas Belajar Sekolah Islam Terpadu',
              headers: ['NO', 'JUDUL AKTIVITAS', 'JENIS', 'MODUL AJAR', 'DURASI', 'STATUS'],
              rows: rowsToPrint.map((row, i) => [
                i + 1,
                row.judul_aktivitas || row.nama_aktivitas || '-',
                row.jenis_aktivitas || row.jenis || '-',
                row.modul_ajar?.judul_modul || '-',
                row.durasi_menit ? `${row.durasi_menit} Menit` : '-',
                row.status === 'aktif' ? 'Aktif' : 'Draft',
              ]),
            })
          }}
          onDownload={() => {
            const rowsToPrint = Array.isArray(dataAktivitas) ? dataAktivitas : []
            downloadPdfTable({
              title: 'Laporan Data Aktivitas Belajar',
              subtitle: 'Daftar Aktivitas Belajar Sekolah Islam Terpadu',
              headers: ['NO', 'JUDUL AKTIVITAS', 'JENIS', 'MODUL AJAR', 'DURASI', 'STATUS'],
              rows: rowsToPrint.map((row, i) => [
                i + 1,
                row.judul_aktivitas || row.nama_aktivitas || '-',
                row.jenis_aktivitas || row.jenis || '-',
                row.modul_ajar?.judul_modul || '-',
                row.durasi_menit ? `${row.durasi_menit} Menit` : '-',
                row.status === 'aktif' ? 'Aktif' : 'Draft',
              ]),
              filename: 'laporan_aktivitas_belajar.pdf',
            })
          }}
        />

        <CsvImportModal
          open={importOpen}
          onClose={() => setImportOpen(false)}
          title="Aktivitas Belajar"
          onImport={handleImport}
          columns={[
            { key: 'modul_ajar_id' },
            { key: 'nama_aktivitas', required: true, example: 'Diskusi Kelompok Fiqih' },
            { key: 'jenis_aktivitas', example: 'Inti' },
            { key: 'durasi_menit', example: '30' },
            { key: 'deskripsi', example: 'Petunjuk aktivitas...' },
            { key: 'status', example: 'aktif' },
          ]}
        />
      {/* Hero Banner */}
      {!hidePageHeader && (
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 mb-6">
            <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                  <Activity className="size-6 sm:size-7 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                      <Sparkles className="size-3 text-amber-300 animate-pulse" />
                      LMS — Rencana Aktivitas Belajar
                    </span>
                  </div>
                  <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Aktivitas Belajar
                  </h1>
                  <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                    Kelola alur skenario kegiatan pembelajaran (Pendahuluan, Inti, Penutup, Diskusi, Tugas) terintegrasi Modul Ajar.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <SquircleActionButton
                  variant="primary"
                  icon={Plus}
                  label="Tambah Aktivitas"
                  onClick={handleOpenCreateModal}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Alert Messages */}
      {successMsg && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 shadow-sm dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <span className="text-sm font-medium">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTintedCard
          icon={Activity}
          label="Total Aktivitas"
          value={computedStats.total}
          subtext="Kegiatan Terdaftar"
          tone="emerald"
          onClick={() => handleOpenKpiModal('total')}
        />
        <KpiTintedCard
          icon={Clock}
          label="Pendahuluan"
          value={computedStats.pendahuluan}
          subtext="Orientasi & Apersepsi"
          tone="blue"
          onClick={() => handleOpenKpiModal('pendahuluan')}
        />
        <KpiTintedCard
          icon={Layers}
          label="Kegiatan Inti"
          value={computedStats.inti}
          subtext="Eksplorasi & Praktik"
          tone="emerald"
          onClick={() => handleOpenKpiModal('inti')}
        />
        <KpiTintedCard
          icon={Tag}
          label="Penutup & Refleksi"
          value={computedStats.penutup}
          subtext="Evaluasi & Kesimpulan"
          tone="purple"
          onClick={() => handleOpenKpiModal('penutup')}
        />
      </motion.div>

      {/* Tab Navigation Card (below KPI grid) */}
      {tabNav && (
        <motion.div variants={itemVariants}>
          {typeof tabNav === 'function' ? tabNav() : tabNav}
        </motion.div>
      )}

      {/* SEARCH & FILTER BAR (2-Row Layout) */}
      <motion.div variants={itemVariants} className="rounded-[18px] border border-slate-200/80 bg-white p-4.5 shadow-sm dark:border-slate-700/80 dark:bg-[#1B2433] space-y-3.5">
        {/* Baris 1: Field Pencarian Full-Width */}
        <div className="w-full">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama aktivitas, instruksi, atau modul..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="h-12 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-700 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
            />
          </div>
        </div>

        {/* Baris 2: Dropdown Filter & Sortir */}
        <div className="flex flex-wrap items-center gap-2.5 w-full">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
            Filter &amp; Sortir:
          </span>

          <select
            value={selectedModulAjar}
            onChange={(e) => {
              setSelectedModulAjar(e.target.value)
              setPage(1)
            }}
            className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
          >
            <option value="">-- Semua Modul Ajar --</option>
            {optionsModulAjar.map((m) => (
              <option key={m.id} value={m.id}>
                {m.judul_modul}
              </option>
            ))}
          </select>

          <select
            value={selectedJenis}
            onChange={(e) => {
              setSelectedJenis(e.target.value)
              setPage(1)
            }}
            className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
          >
            <option value="">-- Semua Jenis --</option>
            {optionsJenis.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value)
              setPage(1)
            }}
            className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
          >
            <option value="">-- Semua Status --</option>
            <option value="aktif">Aktif</option>
            <option value="draft">Draft</option>
            <option value="nonaktif">Nonaktif</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch('')
              setSelectedModulAjar('')
              setSelectedJenis('')
              setSelectedStatus('')
              setPage(1)
            }}
            className="inline-flex items-center gap-1.5 px-4 h-12 rounded-[14px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Reset Filter"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </motion.div>

      {/* DATA TABLE CONTAINER */}
      <motion.div variants={itemVariants}>
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]" aria-labelledby="aktivitas-table-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-5 py-4 sm:px-6 md:px-8 dark:border-emerald-800/40 dark:bg-gradient-to-r dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-transparent">
          <div>
            <h2 id="aktivitas-table-title" className="text-base font-extrabold text-slate-900 dark:text-white">Data Aktivitas Belajar</h2>
            <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">Daftar alur skenario kegiatan kelas terpadu per modul ajar.</p>
          </div>
          {pageActions}
        </div>

        <MasterDataTable className="!rounded-none !border-0 !shadow-none">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#F8FAFB] dark:bg-[#202B3A] border-b border-[#EDF0F4] dark:border-[#354153]">
              <tr>
                <th className="w-[6%] bg-[#F8FAFB] dark:bg-[#202B3A] px-5 sm:px-6 md:px-8 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">No</th>
                <th className="w-[8%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">Urutan</th>
                <th className="w-[28%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">Nama Aktivitas Belajar</th>
                <th className="hidden w-[14%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider sm:table-cell">Jenis Kegiatan</th>
                <th className="hidden w-[22%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider md:table-cell">Modul Ajar</th>
                <th className="hidden w-[10%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider lg:table-cell">Durasi</th>
                <th className="hidden w-[10%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider sm:table-cell">Status</th>
                <th className="w-[12%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0E5C44]" />
                    <p className="text-sm">Memuat data aktivitas belajar...</p>
                  </td>
                </tr>
              ) : dataAktivitas.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <Activity className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="text-base font-semibold text-slate-600 dark:text-slate-300">Tidak ada data aktivitas</p>
                    <p className="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau tambah data baru.</p>
                  </td>
                </tr>
              ) : (
                dataAktivitas.map((item, idx) => (
                  <tr
                    key={item.id}
                    onClick={() => handleOpenDetail(item)}
                    className="hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-5 sm:px-6 md:px-8 text-center font-medium text-slate-400">
                      {(pagination.current_page - 1) * pagination.per_page + idx + 1}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                        #{item.urutan || idx + 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">{item.nama_aktivitas}</p>
                        {item.instruksi ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-medium">{item.instruksi}</p>
                        ) : (
                          <p className="text-xs text-slate-400 italic mt-0.5">Tanpa instruksi khusus</p>
                        )}
                      </div>
                    </td>
                    <td className="hidden py-3.5 px-3 text-center sm:table-cell">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getJenisBadgeColor(item.jenis_aktivitas)}`}>
                        {item.jenis_aktivitas}
                      </span>
                    </td>
                    <td className="hidden py-3.5 px-3 md:table-cell">
                      {item.modul_ajar ? (
                        <div>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">
                            {item.modul_ajar.judul_modul}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">{item.modul_ajar.kode_modul}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">-</span>
                      )}
                    </td>
                    <td className="hidden py-3.5 px-3 text-center lg:table-cell">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-[#0E5C44]" /> {item.waktu || item.durasi_menit || 0} mnt
                      </span>
                    </td>
                    <td className="hidden py-3.5 px-3 text-center sm:table-cell">
                      {item.status === 'aktif' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <Check className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <ActionDropdown
                        onView={() => handleOpenDetail(item)}
                        onEdit={() => handleOpenEditModal(item)}
                        onDelete={() => handleDelete(item.id, item.nama_aktivitas)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </MasterDataTable>

        {/* Pagination Footer */}
        {pagination.last_page > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Menampilkan {dataAktivitas.length} dari {pagination.total} data aktivitas
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                Halaman {pagination.current_page} / {pagination.last_page}
              </span>
              <button
                disabled={page >= pagination.last_page}
                onClick={() => setPage((p) => Math.min(p + 1, pagination.last_page))}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </section>
      </motion.div>

      {/* KPI DETAIL MODAL */}
      {kpiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1B2433] w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-gradient-to-r from-[#0E5C44] to-[#1E8E5A] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <Activity className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{kpiModalCategory.title}</h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Menampilkan {kpiModalCategory.items.length} aktivitas terdaftar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setKpiModalOpen(false)}
                className="text-emerald-100 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {kpiModalCategory.items.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold text-sm">Tidak ada data aktivitas dalam kategori ini.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4 text-center w-12">No</th>
                        <th className="py-3 px-4">Nama Aktivitas</th>
                        <th className="py-3 px-4">Jenis</th>
                        <th className="py-3 px-4">Modul Ajar</th>
                        <th className="py-3 px-4 text-center">Waktu</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                      {kpiModalCategory.items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 text-center text-slate-400 text-xs font-medium">{idx + 1}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">{item.nama_aktivitas}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${getJenisBadgeColor(item.jenis_aktivitas)}`}>
                              {item.jenis_aktivitas}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                            {item.modul_ajar?.judul_modul || '-'}
                          </td>
                          <td className="py-3 px-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {item.waktu} mnt
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setKpiModalOpen(false)
                                handleOpenDetail(item)
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-[#0E5C44] dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-100 transition-colors"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/40">
              <button
                onClick={() => setKpiModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1B2433] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0E5C44] dark:text-emerald-400 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {editId ? 'Edit Aktivitas Belajar' : 'Tambah Aktivitas Belajar'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Isi kelengkapan data alur skenario pembelajaran</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Modul Ajar Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Modul Ajar <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.modul_ajar_id}
                  onChange={(e) => setFormData({ ...formData, modul_ajar_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44]"
                >
                  <option value="" disabled>
                    -- Pilih Modul Ajar --
                  </option>
                  {optionsModulAjar.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.judul_modul} ({m.kode_modul})
                    </option>
                  ))}
                </select>
              </div>

              {/* Nama Aktivitas */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Nama Aktivitas Belajar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Eksplorasi Konsep & Studi Kasus Kelompok"
                  value={formData.nama_aktivitas}
                  onChange={(e) => setFormData({ ...formData, nama_aktivitas: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44]"
                />
              </div>

              {/* Jenis Aktivitas & Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Jenis Kegiatan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.jenis_aktivitas}
                    onChange={(e) => setFormData({ ...formData, jenis_aktivitas: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44]"
                  >
                    {optionsJenis.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Status Aktivitas <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44]"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="draft">Draft</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Waktu & Urutan Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Alokasi Waktu (Menit) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="600"
                      required
                      value={formData.waktu}
                      onChange={(e) => setFormData({ ...formData, waktu: parseInt(e.target.value) || 1 })}
                      className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">menit</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Nomor Urut <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.urutan}
                    onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44]"
                  />
                </div>
              </div>

              {/* Instruksi Textarea */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Instruksi / Langkah Kegiatan
                </label>
                <textarea
                  rows="4"
                  placeholder="Tuliskan petunjuk teknis atau instruksi detail bagi guru/siswa dalam aktivitas ini..."
                  value={formData.instruksi}
                  onChange={(e) => setFormData({ ...formData, instruksi: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44]"
                ></textarea>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E5C44] text-white font-semibold text-sm shadow-md hover:bg-[#1E8E5A] disabled:opacity-50 transition-all duration-200"
                >
                  {formLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : editId ? 'Simpan Perubahan' : 'Tambah Aktivitas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail View */}
      {isDetailOpen && selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1B2433] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#0E5C44]" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Detail Aktivitas Belajar</h3>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getJenisBadgeColor(selectedDetail.jenis_aktivitas)}`}>
                  {selectedDetail.jenis_aktivitas}
                </span>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-2">{selectedDetail.nama_aktivitas}</h4>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-[#111827] text-xs">
                <div>
                  <span className="text-gray-400 block">Modul Ajar:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {selectedDetail.modul_ajar?.judul_modul || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Alokasi Waktu:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedDetail.waktu} menit</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Nomor Urutan:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Urutan ke-{selectedDetail.urutan}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Status:</span>
                  <span className="font-semibold capitalize text-emerald-600 dark:text-emerald-400">{selectedDetail.status}</span>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Instruksi Kegiatan:</h5>
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#111827] border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                  {selectedDetail.instruksi || 'Tidak ada instruksi khusus.'}
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </motion.div>
      </div>
    </PageContainer>
  )
}
