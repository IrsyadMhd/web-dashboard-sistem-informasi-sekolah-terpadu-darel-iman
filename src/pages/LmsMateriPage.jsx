import { useState, useEffect, useMemo } from 'react'
import {
  BookOpen,
  FileText,
  Video,
  Link as LinkIcon,
  Layers,
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
  ExternalLink,
  Eye,
  FileUp,
  Hash,
  Clock,
  ArrowUpDown,
  FileCode,
  ShieldCheck,
  Paperclip,
  RotateCcw,
} from 'lucide-react'
import { lmsMateriService } from '../services/lmsMateriService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { useAuthStore } from '../stores/authStore'

export default function LmsMateriPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
  const [dataMateri, setDataMateri] = useState([])
  const [optionsModul, setOptionsModul] = useState([])
  const [tipeOptions, setTipeOptions] = useState([
    { id: 'teks', nama: 'Teks / Ringkasan' },
    { id: 'dokumen', nama: 'Dokumen / PDF' },
    { id: 'video', nama: 'Video Pembelajaran' },
    { id: 'link', nama: 'Link Eksternal' },
    { id: 'presentasi', nama: 'Slide Presentasi' },
  ])
  const [stats, setStats] = useState({
    total_materi: 0,
    materi_aktif: 0,
    materi_dokumen: 0,
    materi_video: 0,
    materi_link: 0,
    total_modul_ajar: 0,
  })
  // User Auth & Teacher Scoping
  const user = useAuthStore((state) => state.user)

  const userRoles = useMemo(() => {
    if (!user?.roles) return []
    return user.roles.map((r) => (typeof r === 'string' ? r : r.name || r.role_name || ''))
  }, [user])

  const isGuru = useMemo(() => {
    const rList = userRoles.map((r) => r.toLowerCase())
    const mainRole = String(user?.role || '').toLowerCase()
    return (
      rList.some((r) => r.includes('guru') || r.includes('wali_kelas') || r.includes('wali kelas')) ||
      mainRole.includes('guru')
    )
  }, [userRoles, user?.role])

  const teacherUnitIds = useMemo(() => {
    if (!user) return []
    const ids = []
    if (user.unit_id) ids.push(String(user.unit_id))
    if (user.unit_pendidikan_id) ids.push(String(user.unit_pendidikan_id))
    if (user.education_unit_id) ids.push(String(user.education_unit_id))
    if (user.unit?.id) ids.push(String(user.unit.id))
    if (user.school_info?.id) ids.push(String(user.school_info.id))
    if (Array.isArray(user.units)) {
      user.units.forEach((u) => ids.push(String(typeof u === 'object' ? u.id : u)))
    }
    if (Array.isArray(user.unit_ids)) {
      user.unit_ids.forEach((u) => ids.push(String(u)))
    }
    return Array.from(new Set(ids))
  }, [user])

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Filters & Pagination
  const [search, setSearch] = useState('')
  const [selectedModul, setSelectedModul] = useState('')
  const [selectedTipe, setSelectedTipe] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [denganSampah, setDenganSampah] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewItem, setPreviewItem] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  // KPI Modal State
  const [kpiModalOpen, setKpiModalOpen] = useState(false)
  const [kpiModalCategory, setKpiModalCategory] = useState({
    title: '',
    type: '',
    items: [],
    badgeColor: '',
  })

  const [formData, setFormData] = useState({
    modul_ajar_id: '',
    judul: '',
    tipe: 'teks',
    isi: '',
    file_url: '',
    video: '',
    link: '',
    urutan: 1,
    status: 'aktif',
  })

  const loadInitialOptionsAndStats = async () => {
    try {
      const [optRes, statsRes] = await Promise.all([
        lmsMateriService.getOptions(),
        lmsMateriService.getStats(),
      ])
      if (optRes?.data?.modul_ajar) {
        setOptionsModul(optRes.data.modul_ajar)
      }
      if (optRes?.data?.tipe_options) {
        setTipeOptions(optRes.data.tipe_options)
      }
      if (statsRes?.data) {
        setStats(statsRes.data)
      }
    } catch (err) {
      console.error('Gagal memuat opsi/statistik:', err)
    }
  }

  const fetchDaftarMateri = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const response = await lmsMateriService.getDaftar({
        page,
        search,
        modul_ajar_id: selectedModul,
        tipe: selectedTipe,
        status: selectedStatus,
        dengan_sampah: denganSampah ? 1 : 0,
        per_page: 15,
      })
      if (response?.data) {
        setDataMateri(response.data)
        if (response.meta) {
          setPagination({
            current_page: response.meta.current_page || 1,
            last_page: response.meta.last_page || 1,
            total: response.meta.total || 0,
            per_page: response.meta.per_page || 15,
          })
        }
        if (response.statistik) {
          setStats(response.statistik)
        }
      }
    } catch (err) {
      setErrorMsg('Gagal memuat daftar Materi Pembelajaran. Silakan coba lagi.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const computedStats = useMemo(() => {
    const total_materi = dataMateri.length
    const materi_dokumen = dataMateri.filter((m) => m.tipe === 'dokumen' || m.tipe === 'pdf' || !!m.file).length
    const materi_video = dataMateri.filter((m) => m.tipe === 'video' || !!m.video).length
    const materi_aktif = dataMateri.filter((m) => (m.status === 'aktif' || m.status === 'publish') && !m.deleted_at).length
    const uniqueModulIds = new Set(dataMateri.map((m) => m.modul_ajar_id || m.modul_ajar?.id).filter(Boolean))
    const total_modul_ajar = uniqueModulIds.size

    return {
      total_materi,
      materi_dokumen,
      materi_video,
      materi_aktif,
      total_modul_ajar,
    }
  }, [dataMateri])

  const handleOpenKpiModal = (categoryType) => {
    let filteredList = [...dataMateri]
    let title = ''
    let badgeColor = ''

    if (categoryType === 'total') {
      title = 'Total Materi Pembelajaran'
      badgeColor = 'bg-[#0E5C44]/10 text-[#0E5C44] dark:text-[#3FBF75]'
      filteredList = dataMateri
    } else if (categoryType === 'dokumen') {
      title = 'Daftar Materi Dokumen & PDF'
      badgeColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
      filteredList = dataMateri.filter((m) => m.tipe === 'dokumen' || m.tipe === 'pdf' || !!m.file)
    } else if (categoryType === 'video') {
      title = 'Daftar Video Pembelajaran'
      badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
      filteredList = dataMateri.filter((m) => m.tipe === 'video' || !!m.video)
    } else if (categoryType === 'aktif') {
      title = 'Daftar Materi Aktif'
      badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      filteredList = dataMateri.filter((m) => m.status === 'aktif' && !m.deleted_at)
    }

    setKpiModalCategory({
      title,
      type: categoryType,
      items: filteredList,
      badgeColor,
    })
    setKpiModalOpen(true)
  }

  useEffect(() => {
    loadInitialOptionsAndStats()
  }, [])

  useEffect(() => {
    fetchDaftarMateri()
  }, [page, search, selectedModul, selectedTipe, selectedStatus, denganSampah])

  const handleOpenCreateModal = () => {
    setEditingItem(null)
    setSelectedFile(null)
    setFormData({
      modul_ajar_id: optionsModul[0]?.id || '',
      judul: '',
      tipe: 'teks',
      isi: '',
      file_url: '',
      video: '',
      link: '',
      urutan: dataMateri.length + 1,
      status: 'aktif',
    })
    setModalOpen(true)
  }

  const handleOpenEditModal = (item) => {
    setEditingItem(item)
    setSelectedFile(null)
    setFormData({
      modul_ajar_id: item.modul_ajar_id || item.modul_ajar?.id || '',
      judul: item.judul || '',
      tipe: item.tipe || 'teks',
      isi: item.isi || '',
      file_url: item.file_raw || '',
      video: item.video || '',
      link: item.link || '',
      urutan: item.urutan || 1,
      status: item.status || 'aktif',
    })
    setModalOpen(true)
  }

  const handleOpenPreviewModal = (item) => {
    setPreviewItem(item)
    setPreviewModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.modul_ajar_id) {
      setErrorMsg('Pilih Modul Ajar terlebih dahulu.')
      return
    }
    if (!formData.judul.trim()) {
      setErrorMsg('Judul Materi wajib diisi.')
      return
    }

    setFormSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const payload = new FormData()
      payload.append('modul_ajar_id', formData.modul_ajar_id)
      payload.append('judul', formData.judul)
      payload.append('tipe', formData.tipe)
      payload.append('isi', formData.isi || '')
      payload.append('video', formData.video || '')
      payload.append('link', formData.link || '')
      payload.append('urutan', formData.urutan)
      payload.append('status', formData.status)

      if (selectedFile) {
        payload.append('file', selectedFile)
      }

      if (editingItem) {
        await lmsMateriService.ubah(editingItem.id, payload)
        setSuccessMsg('Materi Pembelajaran berhasil diperbarui!')
      } else {
        await lmsMateriService.simpan(payload)
        setSuccessMsg('Materi Pembelajaran baru berhasil ditambahkan!')
      }

      setModalOpen(false)
      fetchDaftarMateri()
      loadInitialOptionsAndStats()
    } catch (err) {
      const errRes = err.response?.data
      if (errRes?.message) {
        setErrorMsg(errRes.message)
      } else if (errRes?.errors) {
        const msgList = Object.values(errRes.errors).flat().join(' ')
        setErrorMsg(msgList)
      } else {
        setErrorMsg('Gagal menyimpan data Materi Pembelajaran.')
      }
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleDelete = async (id, judul) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus materi "${judul}"?`)) {
      return
    }
    try {
      await lmsMateriService.hapus(id)
      setSuccessMsg(`Materi "${judul}" berhasil dihapus.`)
      fetchDaftarMateri()
      loadInitialOptionsAndStats()
    } catch (err) {
      setErrorMsg('Gagal menghapus Materi Pembelajaran.')
    }
  }

  const handleRestore = async (id, judul) => {
    try {
      await lmsMateriService.pulihkan(id)
      setSuccessMsg(`Materi "${judul}" berhasil dipulihkan.`)
      fetchDaftarMateri()
      loadInitialOptionsAndStats()
    } catch (err) {
      setErrorMsg('Gagal memulihkan Materi Pembelajaran.')
    }
  }

  const getTipeBadge = (tipe) => {
    switch (tipe) {
      case 'video':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <Video className="w-3.5 h-3.5" /> Video
          </span>
        )
      case 'dokumen':
      case 'pdf':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <FileText className="w-3.5 h-3.5" /> Dokumen
          </span>
        )
      case 'link':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <LinkIcon className="w-3.5 h-3.5" /> Link Eksternal
          </span>
        )
      case 'presentasi':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Layers className="w-3.5 h-3.5" /> Presentasi
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <BookOpen className="w-3.5 h-3.5" /> Teks Ringkasan
          </span>
        )
    }
  }

  const getStatusBadge = (status, deletedAt) => {
    if (deletedAt) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
          Terhapus
        </span>
      )
    }
    if (status === 'draft') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          Draft
        </span>
      )
    }
    if (status === 'nonaktif') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          Nonaktif
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
        Aktif
      </span>
    )
  }

  return (
    <PageContainer maxW="7xl">
      {!(embedded || hideBreadcrumb) && (
        <AppBreadcrumb items={[{ label: 'LMS & Akademik', href: '/dashboard' }, { label: 'Materi Pembelajaran' }]} />
      )}
      <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0F172A] p-4 md:p-8 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HERO BANNER */}
        {!hidePageHeader && (
          <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-r from-[#0E5C44] via-[#1E8E5A] to-[#3FBF75] p-6 md:p-8 text-white shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium mb-3 border border-white/20">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                  LMS Terpadu Modul & Materi Pembelajaran
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Materi Pembelajaran
                </h1>
                <p className="mt-1 text-emerald-50 text-sm md:text-base max-w-2xl">
                  Kelola dokumen, video, link referensi, dan teks bahan ajar terstruktur per Modul Ajar (1 : N Materi).
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-[#0E5C44] font-semibold text-sm hover:bg-emerald-50 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Materi
                </button>
              </div>
            </div>
            {/* Background Decorative SVG */}
            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
              <BookOpen className="w-64 h-64 text-white" />
            </div>
          </div>
        )}

        {/* NOTIFICATION ALERTS */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
            <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-red-500/10 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{successMsg}</p>
            </div>
            <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-emerald-500/10 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* INTERACTIVE KPI CARDS WITH MODAL TRIGGER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => handleOpenKpiModal('total')}
            className="group p-5 rounded-[18px] bg-white dark:bg-[#1B2433] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-[#0E5C44]/40 hover:scale-[1.02] cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-[#0E5C44] transition-colors">
                Total Materi
              </span>
              <div className="p-2.5 rounded-xl bg-[#0E5C44]/10 text-[#0E5C44] dark:text-[#3FBF75] group-hover:bg-[#0E5C44] group-hover:text-white transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold mt-3 text-slate-900 dark:text-white">
              {computedStats.total_materi}
            </p>
            <div className="flex items-center justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span>Dari {computedStats.total_modul_ajar} Modul Ajar</span>
              <span className="text-[10px] font-medium text-[#0E5C44] dark:text-[#3FBF75] opacity-0 group-hover:opacity-100 transition-opacity">Lihat Modal &rarr;</span>
            </div>
          </div>

          <div
            onClick={() => handleOpenKpiModal('dokumen')}
            className="group p-5 rounded-[18px] bg-white dark:bg-[#1B2433] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-blue-500/40 hover:scale-[1.02] cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                Dokumen &amp; PDF
              </span>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold mt-3 text-slate-900 dark:text-white">
              {computedStats.materi_dokumen}
            </p>
            <div className="flex items-center justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span>Bahan ajar unduhan</span>
              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">Lihat Modal &rarr;</span>
            </div>
          </div>

          <div
            onClick={() => handleOpenKpiModal('video')}
            className="group p-5 rounded-[18px] bg-white dark:bg-[#1B2433] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-rose-500/40 hover:scale-[1.02] cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-rose-600 transition-colors">
                Video Pembelajaran
              </span>
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Video className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold mt-3 text-slate-900 dark:text-white">
              {computedStats.materi_video}
            </p>
            <div className="flex items-center justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span>Video tutorial &amp; link</span>
              <span className="text-[10px] font-medium text-rose-600 dark:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">Lihat Modal &rarr;</span>
            </div>
          </div>

          <div
            onClick={() => handleOpenKpiModal('aktif')}
            className="group p-5 rounded-[18px] bg-white dark:bg-[#1B2433] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-emerald-500/40 hover:scale-[1.02] cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">
                Materi Aktif
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold mt-3 text-slate-900 dark:text-white">
              {computedStats.materi_aktif}
            </p>
            <div className="flex items-center justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span>Siap diakses siswa</span>
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">Lihat Modal &rarr;</span>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION CARD (Rendered below KPI cards) */}
        {tabNav}

        {/* DATA TABLE CONTAINER WITH INTEGRATED TOOLBAR */}
        <div className="rounded-[18px] bg-white dark:bg-[#1B2433] border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden space-y-0">
          {/* Card Header & 2-Row Toolbar */}
          <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800/80 space-y-3.5 bg-white dark:bg-[#1B2433]">
            {/* Toolbar Row 1: Full-Width Search Input */}
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari materi pembelajaran..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
              />
            </div>

            {/* Toolbar Row 2: Filter Controls + Reset */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Filter:
                </span>

                <select
                  value={selectedModul}
                  onChange={(e) => {
                    setSelectedModul(e.target.value)
                    setPage(1)
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                >
                  <option value="">Semua Modul Ajar</option>
                  {optionsModul.map((mod) => (
                    <option key={mod.id} value={mod.id}>
                      {mod.kode_modul ? `[${mod.kode_modul}] ` : ''}{mod.judul_modul}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedTipe}
                  onChange={(e) => {
                    setSelectedTipe(e.target.value)
                    setPage(1)
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                >
                  <option value="">Semua Tipe</option>
                  {tipeOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value)
                    setPage(1)
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
                >
                  <option value="">Semua Status</option>
                  <option value="aktif">Aktif</option>
                  <option value="draft">Draft</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>

                {/* Action Icon Buttons: Trash & Reset with floating hover tooltips */}
                <div className="flex items-center gap-1.5">
                  {/* Trash / Sampah Filter Icon Button */}
                  <div className="relative group/tooltip">
                    <button
                      type="button"
                      onClick={() => {
                        setDenganSampah(!denganSampah)
                        setPage(1)
                      }}
                      className={`p-2 rounded-xl transition-all duration-200 border flex items-center justify-center ${
                        denganSampah
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 shadow-xs scale-105'
                          : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                      aria-label="Tampilkan Sampah"
                    >
                      <Trash2 className={`w-4 h-4 ${denganSampah ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`} />
                    </button>
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:flex flex-col items-center pointer-events-none z-30">
                      <span className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-semibold shadow-md">
                        {denganSampah ? 'Sembunyikan Sampah' : 'Tampilkan Sampah'}
                      </span>
                      <div className="w-2 h-2 -mt-1 rotate-45 bg-slate-900" />
                    </div>
                  </div>

                  {/* Reset Filter Icon Button */}
                  {(selectedModul || selectedTipe || selectedStatus || denganSampah || search) && (
                    <div className="relative group/tooltip">
                      <button
                        type="button"
                        onClick={() => {
                          setSearch('')
                          setSelectedModul('')
                          setSelectedTipe('')
                          setSelectedStatus('')
                          setDenganSampah(false)
                          setPage(1)
                        }}
                        className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all duration-200 flex items-center justify-center"
                        aria-label="Reset Filter"
                      >
                        <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </button>
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:flex flex-col items-center pointer-events-none z-30">
                        <span className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-semibold shadow-md">
                          Reset Filter
                        </span>
                        <div className="w-2 h-2 -mt-1 rotate-45 bg-slate-900" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 text-center w-12">No</th>
                  <th className="py-3.5 px-4">Urutan</th>
                  <th className="py-3.5 px-4">Judul Materi</th>
                  <th className="py-3.5 px-4">Modul Ajar (Relasi 1:N)</th>
                  <th className="py-3.5 px-4">Tipe</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Lampiran / Link</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-6 mx-auto"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-8"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-36"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 mx-auto"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mx-auto"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 ml-auto"></div></td>
                    </tr>
                  ))
                ) : dataMateri.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-semibold text-base">Belum Ada Materi Pembelajaran</p>
                      <p className="text-xs mt-1">Klik "Tambah Materi" untuk menambahkan bahan ajar baru.</p>
                    </td>
                  </tr>
                ) : (
                  dataMateri.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                        {(pagination.current_page - 1) * pagination.per_page + idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                          #{item.urutan}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white hover:text-[#0E5C44] transition-colors cursor-pointer" onClick={() => handleOpenPreviewModal(item)}>
                            {item.judul}
                          </p>
                          {item.isi && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {item.isi.replace(/<[^>]*>?/gm, '')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs">
                          <p className="font-semibold text-slate-700 dark:text-slate-300">
                            {item.modul_ajar?.judul_modul || 'Modul Ajar'}
                          </p>
                          <p className="text-slate-400">
                            {item.modul_ajar?.kode_modul || ''} {item.subject?.nama_mapel ? `• ${item.subject.nama_mapel}` : ''}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {getTipeBadge(item.tipe)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(item.status, item.deleted_at)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.file && (
                            <a
                              href={item.file}
                              target="_blank"
                              rel="noreferrer"
                              title="Unduh File Dokumen"
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                          )}
                          {item.video && (
                            <a
                              href={item.video}
                              target="_blank"
                              rel="noreferrer"
                              title="Buka Video"
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 hover:bg-rose-100"
                            >
                              <Video className="w-4 h-4" />
                            </a>
                          )}
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              title="Buka Link Eksternal"
                              className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {!item.file && !item.video && !item.link && (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenPreviewModal(item)}
                            title="Detail Materi"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`/dashboard/lms/media-pembelajaran?materi_id=${item.id}`}
                            title="Kelola Media Pembelajaran"
                            className="p-1.5 rounded-lg text-[#0E5C44] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                          >
                            <Paperclip className="w-4 h-4" />
                            {item.media?.length > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-[#0E5C44] dark:bg-emerald-900 dark:text-emerald-200">
                                {item.media.length}
                              </span>
                            )}
                          </a>
                          {item.deleted_at ? (
                            <button
                              onClick={() => handleRestore(item.id, item.judul)}
                              title="Pulihkan"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                title="Edit Materi"
                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id, item.judul)}
                                title="Hapus"
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {pagination.last_page > 1 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>
                Menampilkan halaman <strong>{pagination.current_page}</strong> dari <strong>{pagination.last_page}</strong> ({pagination.total} materi)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= pagination.last_page}
                  onClick={() => setPage(page + 1)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI DETAIL MODAL */}
      {kpiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1B2433] w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-gradient-to-r from-[#0E5C44] to-[#1E8E5A] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <BookOpen className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{kpiModalCategory.title}</h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Menampilkan {kpiModalCategory.items.length} materi terdaftar
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
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold text-sm">Tidak ada data materi dalam kategori ini.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4 text-center w-12">No</th>
                        <th className="py-3 px-4">Judul Materi</th>
                        <th className="py-3 px-4">Modul Ajar</th>
                        <th className="py-3 px-4">Tipe</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                      {kpiModalCategory.items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 text-center text-slate-400 text-xs font-medium">{idx + 1}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">{item.judul}</td>
                          <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                            {item.modul_ajar?.judul_modul || '-'}
                          </td>
                          <td className="py-3 px-4">{getTipeBadge(item.tipe)}</td>
                          <td className="py-3 px-4 text-center">{getStatusBadge(item.status, item.deleted_at)}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setKpiModalOpen(false)
                                handleOpenPreviewModal(item)
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

      {/* FORM MODAL (CREATE / EDIT) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1B2433] border border-slate-200 dark:border-slate-800 rounded-[22px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#0E5C44]/10 text-[#0E5C44] dark:text-[#3FBF75]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingItem ? 'Edit Materi Pembelajaran' : 'Tambah Materi Pembelajaran Baru'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tautkan materi ke Modul Ajar dan lengkapi bahan ajar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {/* Modul Ajar Select */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Modul Ajar Induk (Relasi 1:N) <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.modul_ajar_id}
                  onChange={(e) => setFormData({ ...formData, modul_ajar_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0E5C44]"
                >
                  <option value="">-- Pilih Modul Ajar --</option>
                  {optionsModul.map((mod) => (
                    <option key={mod.id} value={mod.id}>
                      {mod.kode_modul ? `[${mod.kode_modul}] ` : ''}{mod.judul_modul}
                    </option>
                  ))}
                </select>
              </div>

              {/* Judul & Urutan */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Judul Materi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pengenalan Al-Qur'an dan Hukum Tajwid"
                    value={formData.judul}
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0E5C44]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Urutan
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.urutan}
                    onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0E5C44]"
                  />
                </div>
              </div>

              {/* Tipe & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Tipe Materi
                  </label>
                  <select
                    value={formData.tipe}
                    onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0E5C44]"
                  >
                    {tipeOptions.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0E5C44]"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="draft">Draft</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Isi / Deskripsi */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Isi / Ringkasan Materi Teks
                </label>
                <textarea
                  rows={4}
                  placeholder="Tulis uraian materi atau petunjuk pembelajaran..."
                  value={formData.isi}
                  onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0E5C44]"
                ></textarea>
              </div>

              {/* File Attachment Upload */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Upload File Dokumen / PDF (Opsional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#0E5C44]/10 file:text-[#0E5C44] hover:file:bg-[#0E5C44]/20 cursor-pointer"
                />
                {editingItem?.file && !selectedFile && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    File saat ini: <a href={editingItem.file} target="_blank" rel="noreferrer" className="underline font-medium">Buka File Dokumen</a>
                  </p>
                )}
              </div>

              {/* Link Video & External Link */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    URL Video Pembelajaran (YouTube / MP4)
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.video}
                    onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0E5C44]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Link Referensi Eksternal
                  </label>
                  <input
                    type="url"
                    placeholder="https://pustaka.kemdikbud.go.id/..."
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0E5C44]"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#0E5C44] text-white font-semibold hover:bg-[#1E8E5A] transition-colors shadow-md disabled:opacity-50"
                >
                  {formSubmitting ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Tambah Materi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW DETAIL MODAL */}
      {previewModalOpen && previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1B2433] border border-slate-200 dark:border-slate-800 rounded-[22px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#0E5C44]/10 text-[#0E5C44] dark:text-[#3FBF75]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {previewItem.judul}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Modul: {previewItem.modul_ajar?.judul_modul || '-'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span>Tipe Materi: <strong>{previewItem.tipe}</strong></span>
                <span>Urutan ke-<strong>{previewItem.urutan}</strong></span>
                {getStatusBadge(previewItem.status, previewItem.deleted_at)}
              </div>

              {previewItem.isi && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Uraian Materi</h4>
                  <div className="whitespace-pre-line leading-relaxed">{previewItem.isi}</div>
                </div>
              )}

              {previewItem.file && (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-200 text-xs">File Lampiran Dokumen</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">Siap diunduh / dipelajari</p>
                    </div>
                  </div>
                  <a
                    href={previewItem.file}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors"
                  >
                    Buka Dokumen
                  </a>
                </div>
              )}

              {previewItem.video && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-rose-600" />
                    <div>
                      <p className="font-semibold text-rose-900 dark:text-rose-200 text-xs">Video Pembelajaran</p>
                      <p className="text-xs text-rose-700 dark:text-rose-300">{previewItem.video}</p>
                    </div>
                  </div>
                  <a
                    href={previewItem.video}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors"
                  >
                    Tonton Video
                  </a>
                </div>
              )}

              {previewItem.link && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-semibold text-amber-900 dark:text-amber-200 text-xs">Tautan Referensi Eksternal</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 truncate max-w-xs">{previewItem.link}</p>
                    </div>
                  </div>
                  <a
                    href={previewItem.link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition-colors"
                  >
                    Kunjungi Link
                  </a>
                </div>
              )}
            </div>

            <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </PageContainer>
  )
}
