import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  Pin,
  Lock,
  Unlock,
  Send,
  GraduationCap,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Tag,
  Clock,
  SlidersHorizontal,
  CornerDownRight,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { lmsDiskusiService } from '../services/lmsDiskusiService'
import { lmsModulAjarService } from '../services/lmsModulAjarService'
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
import { RotateCcw, Printer, Eye } from 'lucide-react'

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

export default function LmsDiskusiPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
  const [dataDiskusi, setDataDiskusi] = useState([])
  const [optionsModulAjar, setOptionsModulAjar] = useState([])
  const [optionsKategori, setOptionsKategori] = useState([
    'Umum',
    'Tanya Jawab',
    'Tugas',
    'Materi',
    'Proyek',
    'Refleksi',
  ])
  const [stats, setStats] = useState({
    total_diskusi: 0,
    diskusi_aktif: 0,
    diskusi_ditutup: 0,
    diskusi_pinned: 0,
    total_komentar: 0,
    komentar_guru: 0,
    komentar_siswa: 0,
  })

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // KPI Modal State
  const [kpiModalOpen, setKpiModalOpen] = useState(false)
  const [kpiModalCategory, setKpiModalCategory] = useState({
    title: '',
    items: [],
  })

  // Filters & Pagination
  const [search, setSearch] = useState('')
  const [selectedModulAjar, setSelectedModulAjar] = useState('')
  const [selectedKategori, setSelectedKategori] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  // Modal Form State (Create / Edit Diskusi)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const handleExportCSV = () => {
    const headers = ['NO', 'JUDUL DISKUSI', 'KATEGORI', 'MODUL AJAR', 'KOMENTAR', 'STATUS']
    const rows = (dataDiskusi || []).map((d, i) => [
      i + 1,
      `"${(d.judul_diskusi || d.judul || '').replace(/"/g, '""')}"`,
      d.kategori || 'Umum',
      `"${(d.modul_ajar?.judul_modul || '').replace(/"/g, '""')}"`,
      d.total_komentar || d.komentar_count || 0,
      d.status === 'tertutup' || d.is_closed ? 'Tertutup' : 'Aktif',
    ])
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `export_forum_diskusi_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImport = async (parsedData) => {
    setSuccessMsg(`Berhasil mengimpor ${parsedData.length} topik diskusi.`)
    fetchData()
  }

  const pageActions = (
    <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
      <SquircleActionButton variant="import" label="Import Data" onClick={() => setImportOpen(true)} />
      <SquircleActionButton variant="export" label="Export Data" onClick={handleExportCSV} />
      <SquircleActionButton variant="view" icon={Printer} label="Cetak Data" onClick={() => setIsPrintModalOpen(true)} />
      <SquircleActionButton variant="primary" label="Buat Diskusi" onClick={() => handleOpenCreateModal()} />
    </div>
  )

  const [formData, setFormData] = useState({
    modul_ajar_id: '',
    judul: '',
    deskripsi: '',
    kategori: 'Umum',
    tanggal_mulai: '',
    tanggal_tutup: '',
    status: 'aktif',
  })

  // Drawer / Modal State for Comments Thread
  const [isThreadOpen, setIsThreadOpen] = useState(false)
  const [selectedDiskusi, setSelectedDiskusi] = useState(null)
  const [threadLoading, setThreadLoading] = useState(false)
  const [replyParentId, setReplyParentId] = useState(null)

  const [komentarForm, setKomentarForm] = useState({
    konten: '',
    peran_pengirim: 'Guru',
  })
  const [submittingKomentar, setSubmittingKomentar] = useState(false)

  useEffect(() => {
    fetchOptions()
    fetchStats()
  }, [])

  useEffect(() => {
    fetchData()
  }, [page, search, selectedModulAjar, selectedKategori, selectedStatus])

  const fetchStats = async () => {
    try {
      const res = await lmsDiskusiService.getStats()
      if (res.success) {
        setStats(res.data)
      }
    } catch (err) {
      console.error('Gagal mengambil statistik diskusi:', err)
    }
  }

  const computedStats = useMemo(() => {
    const total_diskusi = dataDiskusi.length
    const diskusi_aktif = dataDiskusi.filter((d) => d.status === 'aktif').length
    const diskusi_pinned = dataDiskusi.filter((d) => d.is_pinned).length
    const diskusi_ditutup = dataDiskusi.filter((d) => d.status === 'ditutup').length
    const total_komentar = dataDiskusi.reduce((acc, d) => acc + (d.komentar_count || d.komentars_count || (d.komentar ? d.komentar.length : 0)), 0)

    return {
      total_diskusi,
      diskusi_aktif,
      diskusi_pinned,
      diskusi_ditutup,
      total_komentar,
    }
  }, [dataDiskusi])

  const handleOpenKpiModal = (type) => {
    let title = ''
    let items = []

    if (type === 'total') {
      title = 'Total Forum Diskusi Kelas'
      items = dataDiskusi
    } else if (type === 'aktif') {
      title = 'Daftar Diskusi Aktif'
      items = dataDiskusi.filter((d) => d.status === 'aktif')
    } else if (type === 'komentar') {
      title = 'Daftar Diskusi Berkomentar'
      items = dataDiskusi
    } else if (type === 'interaksi') {
      title = 'Interaksi Forum Diskusi Kelas'
      items = dataDiskusi
    }

    setKpiModalCategory({ title, items })
    setKpiModalOpen(true)
  }

  const fetchOptions = async () => {
    try {
      const res = await lmsDiskusiService.getOptions()
      let modulList = []

      const rawModul = res?.data?.modul_ajar || res?.data?.modul_ajar_options || res?.modul_ajar
      if (Array.isArray(rawModul) && rawModul.length > 0) {
        modulList = rawModul.map((opt) => ({
          value: opt.value || opt.id,
          id: opt.value || opt.id,
          label: opt.label || (opt.kode_modul ? `[${opt.kode_modul}] ${opt.judul_modul || opt.judul}` : (opt.judul_modul || opt.judul)),
          judul: opt.judul_modul || opt.judul,
        }))
      } else {
        // Fallback: Fetch directly from lmsModulAjarService
        try {
          const maRes = await lmsModulAjarService.getAll({ per_page: 100 })
          const rawList = maRes?.data || maRes || []
          if (Array.isArray(rawList) && rawList.length > 0) {
            modulList = rawList.map((opt) => ({
              value: opt.id,
              id: opt.id,
              label: opt.kode_modul ? `[${opt.kode_modul}] ${opt.judul_modul || opt.judul}` : (opt.judul_modul || opt.judul),
              judul: opt.judul_modul || opt.judul,
            }))
          }
        } catch (maErr) {
          console.error('Fallback fetch modul ajar failed:', maErr)
        }
      }

      setOptionsModulAjar(modulList)
      if (res?.data?.kategori) setOptionsKategori(res.data.kategori)
    } catch (err) {
      console.error('Gagal mengambil opsi data diskusi:', err)
      try {
        const maRes = await lmsModulAjarService.getAll({ per_page: 100 })
        const rawList = maRes?.data || maRes || []
        if (Array.isArray(rawList) && rawList.length > 0) {
          const modulList = rawList.map((opt) => ({
            value: opt.id,
            id: opt.id,
            label: opt.kode_modul ? `[${opt.kode_modul}] ${opt.judul_modul || opt.judul}` : (opt.judul_modul || opt.judul),
            judul: opt.judul_modul || opt.judul,
          }))
          setOptionsModulAjar(modulList)
        }
      } catch (fallbackErr) {
        console.error('Fallback fetch modul ajar failed:', fallbackErr)
      }
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
        kategori: selectedKategori,
        status: selectedStatus,
      }
      const res = await lmsDiskusiService.getDaftar(params)
      setDataDiskusi(res.data || [])
      if (res.meta) {
        setPagination({
          current_page: res.meta.current_page,
          last_page: res.meta.last_page,
          total: res.meta.total,
          per_page: res.meta.per_page,
        })
      }
    } catch (err) {
      console.error('Error fetching data diskusi:', err)
      setErrorMsg('Gagal memuat data diskusi kelas. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreateModal = () => {
    setEditId(null)
    setFormData({
      modul_ajar_id: '',
      judul: '',
      deskripsi: '',
      kategori: 'Umum',
      tanggal_mulai: '',
      tanggal_tutup: '',
      status: 'aktif',
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item) => {
    setEditId(item.id)
    setFormData({
      modul_ajar_id: item.modul_ajar_id || '',
      judul: item.judul || '',
      deskripsi: item.deskripsi || '',
      kategori: item.kategori || 'Umum',
      tanggal_mulai: item.tanggal_mulai ? item.tanggal_mulai.replace(' ', 'T') : '',
      tanggal_tutup: item.tanggal_tutup ? item.tanggal_tutup.replace(' ', 'T') : '',
      status: item.status || 'aktif',
    })
    setIsModalOpen(true)
  }

  const handleSaveForm = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      let res
      if (editId) {
        res = await lmsDiskusiService.update(editId, formData)
      } else {
        res = await lmsDiskusiService.create(formData)
      }

      if (res.success) {
        setSuccessMsg(res.message || 'Data diskusi berhasil disimpan.')
        setIsModalOpen(false)
        fetchData()
        fetchStats()
        setTimeout(() => setSuccessMsg(''), 4000)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan data diskusi.'
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: msg,
        confirmButtonColor: '#0E5C44',
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id, judul) => {
    const result = await Swal.fire({
      title: 'Hapus Diskusi?',
      text: `Apakah Anda yakin ingin menghapus diskusi "${judul}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    })

    if (result.isConfirmed) {
      try {
        const res = await lmsDiskusiService.delete(id)
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: 'Terhapus!',
            text: res.message || 'Diskusi berhasil dihapus.',
            confirmButtonColor: '#0E5C44',
          })
          fetchData()
          fetchStats()
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: err.response?.data?.message || 'Gagal menghapus diskusi.',
          confirmButtonColor: '#0E5C44',
        })
      }
    }
  }

  const handleTogglePin = async (id) => {
    try {
      const res = await lmsDiskusiService.togglePin(id)
      if (res.success) {
        fetchData()
        fetchStats()
      }
    } catch (err) {
      console.error('Error toggling pin:', err)
    }
  }

  const handleToggleClose = async (id) => {
    try {
      const res = await lmsDiskusiService.toggleClose(id)
      if (res.success) {
        fetchData()
        fetchStats()
        if (selectedDiskusi && selectedDiskusi.id === id) {
          fetchThreadDetail(id)
        }
      }
    } catch (err) {
      console.error('Error toggling close:', err)
    }
  }

  // Open Comment Thread Detail Drawer
  const handleOpenThread = async (diskusiId) => {
    setIsThreadOpen(true)
    setReplyParentId(null)
    setKomentarForm({ konten: '', peran_pengirim: 'Guru' })
    await fetchThreadDetail(diskusiId)
  }

  const fetchThreadDetail = async (diskusiId) => {
    setThreadLoading(true)
    try {
      const res = await lmsDiskusiService.getById(diskusiId)
      if (res.success) {
        setSelectedDiskusi(res.data)
      }
    } catch (err) {
      console.error('Error fetching thread detail:', err)
    } finally {
      setThreadLoading(false)
    }
  }

  const handlePostKomentar = async (e) => {
    e.preventDefault()
    if (!komentarForm.konten.trim()) return

    setSubmittingKomentar(true)
    try {
      const payload = {
        konten: komentarForm.konten,
        peran_pengirim: komentarForm.peran_pengirim,
        parent_id: replyParentId,
      }
      const res = await lmsDiskusiService.tambahKomentar(selectedDiskusi.id, payload)
      if (res.success) {
        setKomentarForm({ ...komentarForm, konten: '' })
        setReplyParentId(null)
        await fetchThreadDetail(selectedDiskusi.id)
        fetchStats()
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.response?.data?.message || 'Gagal mengirim komentar.',
        confirmButtonColor: '#0E5C44',
      })
    } finally {
      setSubmittingKomentar(false)
    }
  }

  const handleDeleteKomentar = async (komentarId) => {
    const result = await Swal.fire({
      title: 'Hapus Komentar?',
      text: 'Apakah Anda yakin ingin menghapus komentar ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
    })

    if (result.isConfirmed) {
      try {
        const res = await lmsDiskusiService.hapusKomentar(selectedDiskusi.id, komentarId)
        if (res.success) {
          await fetchThreadDetail(selectedDiskusi.id)
          fetchStats()
        }
      } catch (err) {
        console.error('Gagal menghapus komentar:', err)
      }
    }
  }

  return (
    <PageContainer maxW="7xl">
      {!(embedded || hideBreadcrumb) && (
        <AppBreadcrumb items={[{ label: 'LMS & Akademik', href: '/dashboard' }, { label: 'Forum Diskusi Kelas' }]} />
      )}
      <div className="education-unit-page lms-diskusi-page space-y-6">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <PrintOptionModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Forum Diskusi Kelas"
          onPrint={() => {
            const rowsToPrint = Array.isArray(dataDiskusi) ? dataDiskusi : []
            printCleanTable({
              title: 'Laporan Data Forum Diskusi Kelas',
              subtitle: 'Daftar Forum Diskusi Pembelajaran Sekolah Islam Terpadu',
              headers: ['NO', 'TOPIS / JUDUL DISKUSI', 'KATEGORI', 'MODUL AJAR TERKAIT', 'KOMENTAR', 'STATUS'],
              rows: rowsToPrint.map((row, i) => [
                i + 1,
                row.judul_diskusi || row.judul || '-',
                row.kategori || 'Umum',
                row.modul_ajar?.judul_modul || '-',
                row.total_komentar || row.komentar_count || 0,
                row.status === 'tertutup' || row.is_closed ? 'Tertutup' : 'Aktif',
              ]),
            })
          }}
          onDownload={() => {
            const rowsToPrint = Array.isArray(dataDiskusi) ? dataDiskusi : []
            downloadPdfTable({
              title: 'Laporan Data Forum Diskusi Kelas',
              subtitle: 'Daftar Forum Diskusi Pembelajaran Sekolah Islam Terpadu',
              headers: ['NO', 'TOPIS / JUDUL DISKUSI', 'KATEGORI', 'MODUL AJAR TERKAIT', 'KOMENTAR', 'STATUS'],
              rows: rowsToPrint.map((row, i) => [
                i + 1,
                row.judul_diskusi || row.judul || '-',
                row.kategori || 'Umum',
                row.modul_ajar?.judul_modul || '-',
                row.total_komentar || row.komentar_count || 0,
                row.status === 'tertutup' || row.is_closed ? 'Tertutup' : 'Aktif',
              ]),
              filename: 'laporan_forum_diskusi_kelas.pdf',
            })
          }}
        />

        <CsvImportModal
          open={importOpen}
          onClose={() => setImportOpen(false)}
          title="Forum Diskusi Kelas"
          onImport={handleImport}
          columns={[
            { key: 'modul_ajar_id' },
            { key: 'judul_diskusi', required: true, example: 'Diskusi Pemahaman Hukum Fiqih' },
            { key: 'kategori', example: 'Tanya Jawab' },
            { key: 'deskripsi', example: 'Topik diskusi kelas...' },
            { key: 'status', example: 'aktif' },
          ]}
        />
      {/* Header Banner */}
      {!hidePageHeader && (
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 mb-6">
            <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                  <MessageSquare className="size-6 sm:size-7 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                      <Sparkles className="size-3 text-amber-300 animate-pulse" />
                      LMS Modul Ajar Terpadu
                    </span>
                  </div>
                  <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Forum Diskusi Kelas
                  </h1>
                  <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                    Ruang kolaborasi dan tanya jawab interaktif antara Guru dan Siswa berbasis Modul Ajar.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <SquircleActionButton
                  variant="primary"
                  icon={Plus}
                  label="Buat Diskusi Baru"
                  onClick={handleOpenCreateModal}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications Alert */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-sm animate-fadeIn">
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
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <span className="text-sm font-medium">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTintedCard
          icon={MessageSquare}
          label="Total Diskusi"
          value={computedStats.total_diskusi}
          subtext={`${computedStats.diskusi_pinned} pinned • ${computedStats.diskusi_ditutup} ditutup`}
          tone="emerald"
          onClick={() => handleOpenKpiModal('total')}
        />
        <KpiTintedCard
          icon={BookOpen}
          label="Diskusi Aktif"
          value={computedStats.diskusi_aktif}
          subtext="Siap menerima tanggapan"
          tone="emerald"
          onClick={() => handleOpenKpiModal('aktif')}
        />
        <KpiTintedCard
          icon={MessageCircle}
          label="Total Komentar"
          value={computedStats.total_komentar}
          subtext="Tanggapan & Pertanyaan"
          tone="blue"
          onClick={() => handleOpenKpiModal('komentar')}
        />
        <KpiTintedCard
          icon={GraduationCap}
          label="Interaksi Forum"
          value={`${computedStats.total_diskusi} Diskusi`}
          subtext="Keaktifan forum terpadu"
          tone="purple"
          onClick={() => handleOpenKpiModal('interaksi')}
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
              placeholder="Cari judul diskusi, deskripsi, atau kategori..."
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
            {optionsModulAjar.map((opt) => (
              <option key={opt.value || opt.id} value={opt.value || opt.id}>
                {opt.label || opt.judul_modul || opt.judul}
              </option>
            ))}
          </select>

          <select
            value={selectedKategori}
            onChange={(e) => {
              setSelectedKategori(e.target.value)
              setPage(1)
            }}
            className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
          >
            <option value="">-- Semua Kategori --</option>
            {optionsKategori.map((kat) => (
              <option key={kat} value={kat}>
                {kat}
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
              setSelectedKategori('')
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
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]" aria-labelledby="diskusi-table-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-5 py-4 sm:px-6 md:px-8 dark:border-emerald-800/40 dark:bg-gradient-to-r dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-transparent">
          <div>
            <h2 id="diskusi-table-title" className="text-base font-extrabold text-slate-900 dark:text-white">Data Forum Diskusi Kelas</h2>
            <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">Daftar topik kolaborasi dan tanya jawab interaktif per modul ajar.</p>
          </div>
          {pageActions}
        </div>

        <MasterDataTable className="!rounded-none !border-0 !shadow-none">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#F8FAFB] dark:bg-[#202B3A] border-b border-[#EDF0F4] dark:border-[#354153]">
              <tr>
                <th className="w-[32%] bg-[#F8FAFB] dark:bg-[#202B3A] px-5 sm:px-6 md:px-8 py-3.5 text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">Topik &amp; Modul Ajar</th>
                <th className="hidden w-[16%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider sm:table-cell">Kategori</th>
                <th className="hidden w-[18%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider md:table-cell">Status &amp; Akses</th>
                <th className="hidden w-[14%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider sm:table-cell">Komentar</th>
                <th className="w-[12%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0E5C44]" />
                    <p className="text-sm">Memuat data diskusi kelas...</p>
                  </td>
                </tr>
              ) : dataDiskusi.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="text-base font-semibold text-slate-600 dark:text-slate-300">Belum ada diskusi kelas</p>
                    <p className="text-xs text-slate-400 mt-0.5">Silakan buat topik diskusi baru untuk siswa.</p>
                  </td>
                </tr>
              ) : (
                dataDiskusi.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleOpenThread(item.id)}
                    className="hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-5 sm:px-6 md:px-8">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTogglePin(item.id)
                          }}
                          className={`mt-0.5 p-1 rounded-lg transition-colors ${
                            item.is_pinned
                              ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                              : 'text-slate-300 hover:text-slate-500 dark:text-slate-600'
                          }`}
                          title={item.is_pinned ? 'Lepas Pin' : 'Sematkan di Atas'}
                        >
                          <Pin className="w-4 h-4 fill-current" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                              {item.judul_diskusi || item.judul}
                            </h4>
                            {item.is_closed && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                <Lock className="w-3 h-3" /> Ditutup
                              </span>
                            )}
                          </div>
                          {item.modul_ajar ? (
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                              <BookOpen className="w-3 h-3 inline" /> {item.modul_ajar.judul_modul || item.modul_ajar.judul}
                            </p>
                          ) : (
                            <p className="text-xs text-slate-400 mt-0.5">Umum (Tanpa Modul)</p>
                          )}
                          {item.deskripsi && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 max-w-xl">
                              {item.deskripsi}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="hidden py-3.5 px-3 text-center sm:table-cell">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-[#0E5C44] dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                        <Tag className="w-3 h-3" /> {item.kategori || 'Umum'}
                      </span>
                    </td>

                    <td className="hidden py-3.5 px-3 text-center md:table-cell">
                      <div className="space-y-0.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            item.status === 'aktif'
                              ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                              : item.status === 'draft'
                              ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {item.status === 'aktif' ? 'Aktif' : item.status === 'draft' ? 'Draft' : 'Nonaktif'}
                        </span>
                        {item.created_at_formatted && (
                          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" /> {item.created_at_formatted}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="hidden py-3.5 px-3 text-center sm:table-cell">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenThread(item.id)
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-200 hover:text-[#0E5C44] dark:hover:text-emerald-400 text-xs font-bold transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{item.total_komentar || item.jumlah_komentar || 0} Komentar</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <ActionDropdown
                        onView={() => handleOpenThread(item.id)}
                        onEdit={() => handleOpenEditModal(item)}
                        onDelete={() => handleDelete(item.id, item.judul_diskusi || item.judul)}
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
          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Menampilkan Halaman <span className="font-bold">{pagination.current_page}</span> dari{' '}
              <span className="font-bold">{pagination.last_page}</span> ({pagination.total} Diskusi)
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pagination.last_page}
                onClick={() => setPage((prev) => Math.min(prev + 1, pagination.last_page))}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 transition-all"
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
                  <MessageSquare className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{kpiModalCategory.title}</h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Menampilkan {kpiModalCategory.items.length} diskusi terdaftar
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
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold text-sm">Tidak ada data diskusi dalam kategori ini.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4 text-center w-12">No</th>
                        <th className="py-3 px-4">Judul Diskusi</th>
                        <th className="py-3 px-4">Kategori</th>
                        <th className="py-3 px-4">Modul Ajar</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                      {kpiModalCategory.items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 text-center text-slate-400 text-xs font-medium">{idx + 1}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">{item.judul}</td>
                          <td className="py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                            {item.kategori || 'Umum'}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                            {item.modul_ajar?.judul_modul || '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'aktif' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                              {item.status || 'aktif'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setKpiModalOpen(false)
                                handleOpenThread(item)
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-[#0E5C44] dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-100 transition-colors"
                            >
                              Lihat Thread
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

      {/* Modal CRUD Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1B2433] rounded-[18px] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-fadeIn">
            <div className="p-6 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0E5C44] dark:text-emerald-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editId ? 'Edit Diskusi Kelas' : 'Buat Diskusi Kelas Baru'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Isi informasi diskusi untuk dipublikasikan ke forum modul ajar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Modul Ajar Relasi
                </label>
                <select
                  value={formData.modul_ajar_id}
                  onChange={(e) => setFormData({ ...formData, modul_ajar_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0E5C44] outline-none"
                >
                  <option value="">-- Tanpa Modul (Diskusi Umum) --</option>
                  {optionsModulAjar.map((opt) => (
                    <option key={opt.value || opt.id} value={opt.value || opt.id}>
                      {opt.label || opt.judul_modul || opt.judul}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Judul Diskusi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemahaman Kasus Hukum Newton II..."
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0E5C44] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Kategori Diskusi
                </label>
                <select
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0E5C44] outline-none"
                >
                  {optionsKategori.map((kat) => (
                    <option key={kat} value={kat}>
                      {kat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Deskripsi / Pertanyaan Pemicu
                </label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan petunjuk diskusi, topik utama, atau pemantik pertanyaan bagi siswa..."
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0E5C44] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Tanggal Mulai
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.tanggal_mulai}
                    onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0E5C44] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Tanggal Tutup
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.tanggal_tutup}
                    onChange={(e) => setFormData({ ...formData, tanggal_tutup: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0E5C44] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Status Diskusi
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0E5C44] outline-none"
                >
                  <option value="aktif">Aktif</option>
                  <option value="draft">Draft</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#0E5C44] hover:bg-[#0B4A36] text-white text-sm font-bold shadow-lg shadow-emerald-900/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {formLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{editId ? 'Perbarui Diskusi' : 'Simpan Diskusi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Thread & Comments Drawer/Modal */}
      {isThreadOpen && selectedDiskusi && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1B2433] w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-slideLeft">
            {/* Drawer Header */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0E5C44] dark:text-emerald-400">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Utasan Komentar Diskusi
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                    {selectedDiskusi.judul}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsThreadOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Thread Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Discussion Prompt Card */}
              <div className="p-5 rounded-[18px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-[#0E5C44] dark:text-emerald-300">
                    {selectedDiskusi.kategori}
                  </span>
                  {selectedDiskusi.modul_ajar && (
                    <span className="text-xs text-slate-500 font-medium">
                      {selectedDiskusi.modul_ajar.judul}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {selectedDiskusi.deskripsi || 'Tidak ada deskripsi rinci.'}
                </p>
                {selectedDiskusi.is_closed && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
                    <Lock className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Diskusi telah dikunci oleh pengajar. Komentar baru ditutup.</span>
                  </div>
                )}
              </div>

              {/* Comments List */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center justify-between">
                  <span>Tanggapan & Komentar ({selectedDiskusi.jumlah_komentar || 0})</span>
                  {threadLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0E5C44]" />}
                </h4>

                {selectedDiskusi.komentar && selectedDiskusi.komentar.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDiskusi.komentar.map((kom) => (
                      <div
                        key={kom.id}
                        className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                kom.peran_pengirim === 'Guru'
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-[#0E5C44] dark:text-emerald-300'
                                  : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              }`}
                            >
                              {kom.peran_pengirim}
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {kom.nama_pengirim}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span>{kom.created_at_formatted}</span>
                            <button
                              onClick={() => handleDeleteKomentar(kom.id)}
                              className="text-slate-400 hover:text-rose-500 transition-colors"
                              title="Hapus Komentar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {kom.konten}
                        </p>

                        {/* Reply Action */}
                        {!selectedDiskusi.is_closed && (
                          <button
                            onClick={() => setReplyParentId(replyParentId === kom.id ? null : kom.id)}
                            className="mt-2 text-xs font-bold text-[#0E5C44] dark:text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <CornerDownRight className="w-3.5 h-3.5" /> Balas
                          </button>
                        )}

                        {/* Nested Replies */}
                        {kom.replies && kom.replies.length > 0 && (
                          <div className="mt-3 pl-4 border-l-2 border-emerald-500/30 space-y-3">
                            {kom.replies.map((reply) => (
                              <div key={reply.id} className="pt-2">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                        reply.peran_pengirim === 'Guru'
                                          ? 'bg-emerald-100 dark:bg-emerald-950 text-[#0E5C44] dark:text-emerald-300'
                                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                      }`}
                                    >
                                      {reply.peran_pengirim}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                      {reply.nama_pengirim}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteKomentar(reply.id)}
                                    className="text-slate-400 hover:text-rose-500 transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300">
                                  {reply.konten}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6 italic">
                    Belum ada komentar pada diskusi ini. Jadilah yang pertama memberikan tanggapan!
                  </p>
                )}
              </div>
            </div>

            {/* Drawer Footer / Add Comment Form */}
            {!selectedDiskusi.is_closed && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800">
                {replyParentId && (
                  <div className="mb-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                    <span>Membalas komentar terpilih...</span>
                    <button
                      onClick={() => setReplyParentId(null)}
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      Batal
                    </button>
                  </div>
                )}

                <form onSubmit={handlePostKomentar} className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        Kirim Sebagai:
                      </span>
                      <select
                        value={komentarForm.peran_pengirim}
                        onChange={(e) =>
                          setKomentarForm({ ...komentarForm, peran_pengirim: e.target.value })
                        }
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none"
                      >
                        <option value="Guru">Guru (Pengajar)</option>
                        <option value="Siswa">Siswa (Peserta)</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Tuliskan komentar atau jawaban Anda..."
                      value={komentarForm.konten}
                      onChange={(e) =>
                        setKomentarForm({ ...komentarForm, konten: e.target.value })
                      }
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-[#0E5C44] outline-none"
                    />
                    <button
                      type="submit"
                      disabled={submittingKomentar || !komentarForm.konten.trim()}
                      className="px-5 py-2.5 rounded-xl bg-[#0E5C44] hover:bg-[#0B4A36] text-white font-bold text-sm shadow-md disabled:opacity-50 flex items-center gap-1.5 shrink-0 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {submittingKomentar ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Kirim</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
        </motion.div>
      </div>
    </PageContainer>
  )
}
