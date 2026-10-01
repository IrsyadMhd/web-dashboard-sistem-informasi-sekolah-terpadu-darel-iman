import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Compass,
  Play,
  Save,
  Database,
  RefreshCw,
  Search,
  Trash2,
  Copy,
  Check,
  MapPin,
  Calendar,
  Clock,
  Layers,
  FileCode,
  Globe,
  Sparkles,
  Server,
  Download,
  AlertTriangle,
  X,
  Printer,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Filter,
  Info,
} from 'lucide-react'
import { equranService } from '../services/equranService'
import ActionDropdown from '../components/app/ActionDropdown'
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

function HarmonizedDeleteModal({ isOpen, onClose, onConfirm, item, isSubmitting }) {
  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-rose-950/20 dark:border-slate-800 dark:bg-[#1B2433]"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-700" />
        <div className="p-6">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white shadow-md shadow-rose-500/30">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-block rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                Hapus Permanen
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                Hapus Jadwal Sholat?
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Apakah Anda yakin ingin menghapus data jadwal sholat ini dari database? Tindakan ini tidak dapat dibatalkan.
          </p>

          <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-3.5 dark:border-rose-800/60 dark:bg-rose-950/20 mb-5">
            <p className="text-xs font-black text-rose-950 dark:text-rose-100">
              {item?.kabkota_name || 'Kab/Kota'} ({item?.provinsi || 'Provinsi'})
            </p>
            <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80 mt-1">
              Tanggal: {item?.tanggal_lengkap || item?.tanggal} ({item?.hari || '-'})
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-red-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/30 hover:brightness-105 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Hapus Jadwal
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function HarmonizedSaveConfirmModal({ isOpen, onClose, onConfirm, payload, isSubmitting }) {
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
              <Database className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Simpan Database
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                Simpan Jadwal Sholat Bulanan?
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Data jadwal sholat bulanan untuk wilayah ini akan disimpan ke database master aplikasi untuk sinkronisasi otomatis absensi dan ibadah harian santri/siswa.
          </p>

          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/20 mb-5">
            <p className="text-xs font-black text-emerald-950 dark:text-emerald-100">
              {payload?.kabkota || 'Kota'} ({payload?.provinsi || 'Provinsi'})
            </p>
            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-1">
              Bulan: {payload?.bulan} / {payload?.tahun} • {payload?.totalDays || '1 Bulan Penuh'}
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

export default function MasterJadwalSholatPage() {
  // State for Interactive Testing Form
  const [activeEndpoint, setActiveEndpoint] = useState('POST_SHALAT') // GET_PROVINSI | POST_KABKOTA | POST_SHALAT
  const [provinsiList, setProvinsiList] = useState([])
  const [kabkotaList, setKabkotaList] = useState([])
  const [selectedProvinsi, setSelectedProvinsi] = useState('Jawa Barat')
  const [selectedKabkota, setSelectedKabkota] = useState('Kota Bogor')
  const [selectedBulan, setSelectedBulan] = useState(new Date().getMonth() + 1)
  const [selectedTahun, setSelectedTahun] = useState(2026)

  // Testing Response & Loading
  const [loadingTest, setLoadingTest] = useState(false)
  const [apiResponse, setApiResponse] = useState(null)
  const [savingDb, setSavingDb] = useState(false)
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false)

  // Toast notifications state
  const [toasts, setToasts] = useState([])
  const pushToast = (type, title, message = '') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, type, title, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Master Data DB Viewer State
  const [masterList, setMasterList] = useState([])
  const [masterStats, setMasterStats] = useState({ total_records: 0, total_provinsi: 0, total_kabkota: 0 })
  const [loadingMaster, setLoadingMaster] = useState(false)
  const [filterProvinsi, setFilterProvinsi] = useState('')
  const [filterKabkota, setFilterKabkota] = useState('')
  const [filterSearch, setFilterSearch] = useState('')
  const debouncedSearch = useDebounce(filterSearch, 350)
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 10

  // Load Provinces on mount
  useEffect(() => {
    fetchProvinsi()
    loadMasterFromDb()
  }, [])

  // Load Kabkota when selectedProvinsi changes
  useEffect(() => {
    if (selectedProvinsi) {
      fetchKabkota(selectedProvinsi)
    }
  }, [selectedProvinsi])

  const showToast = (msg, type = 'success') => {
    pushToast(type, type === 'error' ? 'Terjadi Kesalahan' : 'Berhasil', msg)
  }

  const fetchProvinsi = async () => {
    try {
      const res = await equranService.getProvinsi()
      if (res?.data) {
        setProvinsiList(res.data)
      }
    } catch (e) {
      console.error('Failed loading provinsi', e)
    }
  }

  const fetchKabkota = async (prov) => {
    try {
      const res = await equranService.getKabkota(prov)
      if (res?.data) {
        setKabkotaList(res.data)
        if (res.data.length > 0 && !res.data.includes(selectedKabkota)) {
          setSelectedKabkota(res.data[0])
        }
      }
    } catch (e) {
      console.error('Failed loading kabkota', e)
    }
  }

  const loadMasterFromDb = async () => {
    setLoadingMaster(true)
    try {
      const res = await equranService.getMasterShalatList({
        provinsi: filterProvinsi,
        kabkota: filterKabkota,
        search: debouncedSearch,
      })
      if (res?.data) {
        setMasterList(res.data)
        setMasterStats(res.stats || { total_records: res.data.length, total_provinsi: 0, total_kabkota: 0 })
      }
    } catch (e) {
      console.error('Failed loading master shalat from DB', e)
    } finally {
      setLoadingMaster(false)
    }
  }

  // Trigger search on debounce or filter change
  useEffect(() => {
    loadMasterFromDb()
    setCurrentPage(1)
  }, [debouncedSearch, filterProvinsi, filterKabkota])

  const handleRunTest = async () => {
    setLoadingTest(true)
    try {
      let res = null
      if (activeEndpoint === 'GET_PROVINSI') {
        res = await equranService.getProvinsi()
      } else if (activeEndpoint === 'POST_KABKOTA') {
        res = await equranService.getKabkota(selectedProvinsi)
      } else {
        res = await equranService.getJadwalShalatBulanan(
          selectedProvinsi,
          selectedKabkota,
          Number(selectedBulan),
          Number(selectedTahun)
        )
      }
      setApiResponse(res)
      showToast('Uji API berhasil dijalankan!')
    } catch (e) {
      setApiResponse({ code: 500, message: 'Gagal menjalankan uji API', error: e.message })
      showToast('Gagal menjalankan uji API', 'error')
    } finally {
      setLoadingTest(false)
    }
  }

  const handleConfirmSaveToDb = async () => {
    setSavingDb(true)
    try {
      let payload = {}
      if (apiResponse?.data?.jadwal) {
        payload = {
          provinsi: apiResponse.data.provinsi || selectedProvinsi,
          kabkota: apiResponse.data.kabkota || selectedKabkota,
          bulan: Number(apiResponse.data.bulan || selectedBulan),
          tahun: Number(apiResponse.data.tahun || selectedTahun),
          jadwal: apiResponse.data.jadwal,
        }
      } else {
        const fetched = await equranService.getJadwalShalatBulanan(
          selectedProvinsi,
          selectedKabkota,
          Number(selectedBulan),
          Number(selectedTahun)
        )
        payload = {
          provinsi: selectedProvinsi,
          kabkota: selectedKabkota,
          bulan: Number(selectedBulan),
          tahun: Number(selectedTahun),
          jadwal: fetched.data?.jadwal || [],
        }
      }

      const res = await equranService.saveMasterShalat(payload)
      if (res?.success) {
        showToast(res.message || 'Data jadwal sholat berhasil disimpan ke Database!')
        setIsConfirmSaveOpen(false)
        loadMasterFromDb()
      } else {
        showToast(res?.message || 'Gagal menyimpan data ke database', 'error')
      }
    } catch (e) {
      console.error('Error saving to DB:', e)
      const errorMsg = e.response?.data?.message || e.message || 'Gagal menyimpan data ke database'
      showToast(errorMsg, 'error')
    } finally {
      setSavingDb(false)
    }
  }

  const handleDeleteMaster = (row) => {
    setDeleteItem(row)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmHapus = async () => {
    if (!deleteItem) return
    setIsDeleting(true)
    try {
      const res = await equranService.deleteMasterShalat(deleteItem.id)
      if (res?.success) {
        showToast(res.message || 'Data jadwal sholat berhasil dihapus')
        setIsDeleteModalOpen(false)
        setDeleteItem(null)
        loadMasterFromDb()
      }
    } catch (e) {
      showToast('Gagal menghapus data master', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const exportToCsv = () => {
    if (masterList.length === 0) return
    const headers = ['Provinsi', 'KabKota', 'Tanggal', 'Hari', 'Imsak', 'Subuh', 'Terbit', 'Dhuha', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya']
    const rows = masterList.map((m) => [
      m.provinsi || '',
      m.kabkota_name || '',
      m.tanggal_lengkap || m.tanggal || '',
      m.hari || '',
      m.imsak || '',
      m.subuh || '',
      m.terbit || '',
      m.dhuha || '',
      m.dzuhur || '',
      m.ashar || '',
      m.maghrib || '',
      m.isya || '',
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Master_Jadwal_Sholat_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetFilters = () => {
    setFilterSearch('')
    setFilterProvinsi('')
    setFilterKabkota('')
    setCurrentPage(1)
  }

  const bulanNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(masterList.length / perPage))
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return masterList.slice(start, start + perPage)
  }, [masterList, currentPage, perPage])

  return (
    <PageContainer maxW="7xl">
      <AppBreadcrumb className="mb-6" items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Jadwal Sholat' }]} />

      {/* Modern Hero Header Banner */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 mb-6">
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
              <Compass className="size-6 sm:size-7 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                  <Sparkles className="size-3 text-amber-300 animate-pulse" />
                  Master Data Ibadah
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                  Waktu Sholat
                </span>
              </div>
              <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Master Jadwal Sholat
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                Pengelolaan data jadwal waktu sholat harian per kabupaten/kota seluruh Indonesia terintegrasi API EQuran.id.
              </p>
            </div>
          </div>
        </div>
      </div>

      <MasterDataPage className="education-unit-page sholat-master-page space-y-6" hideBreadcrumb>
        {/* Modern KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ModernKpiCard
            title="Rekord Jadwal Sholat"
            value={`${masterStats.total_records || masterList.length} Hari`}
            subtext="Data jadwal dalam DB"
            icon={Database}
            tone="emerald"
            tag="JADWAL SHOLAT"
          />
          <ModernKpiCard
            title="Provinsi Tercover"
            value={`${masterStats.total_provinsi || 0} / 34`}
            subtext="Seluruh provinsi Indonesia"
            icon={Globe}
            tone="blue"
            tag="WILAYAH"
          />
          <ModernKpiCard
            title="Kab/Kota Tercover"
            value={`${masterStats.total_kabkota || 0} / 517`}
            subtext="Kota dan kabupaten nasional"
            icon={MapPin}
            tone="purple"
            tag="KAB / KOTA"
          />
          <ModernKpiCard
            title="Periode Kalender Uji"
            value={`${bulanNames[selectedBulan - 1]}`}
            subtext={`Tahun ${selectedTahun}`}
            icon={Calendar}
            tone="amber"
            tag="PERIODE"
          />
        </div>

        {/* Interactive Testing & API Pull Panel (Postman-style) */}
        <div className="bg-white dark:bg-[#1B2433] rounded-[22px] border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60 dark:bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Testing Interaktif & Tarik Data API EQuran.id</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Uji semua endpoint secara real-time dan simpan hasilnya ke database master.</p>
              </div>
            </div>

            {/* Endpoint Selector Tabs */}
            <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveEndpoint('GET_PROVINSI')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeEndpoint === 'GET_PROVINSI'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Data Provinsi
              </button>
              <button
                type="button"
                onClick={() => setActiveEndpoint('POST_KABKOTA')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeEndpoint === 'POST_KABKOTA'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Data Kab/Kota
              </button>
              <button
                type="button"
                onClick={() => setActiveEndpoint('POST_SHALAT')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeEndpoint === 'POST_SHALAT'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Data Bulanan
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Controls */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-50/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" /> Parameter Permintaan
                </h3>

                {/* Provinsi Select */}
                {activeEndpoint !== 'GET_PROVINSI' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Provinsi (Wajib)
                    </label>
                    <select
                      value={selectedProvinsi}
                      onChange={(e) => setSelectedProvinsi(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {provinsiList.map((prov, i) => (
                        <option key={i} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Kabkota Select */}
                {activeEndpoint === 'POST_SHALAT' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Kabupaten / Kota (Wajib)
                    </label>
                    <select
                      value={selectedKabkota}
                      onChange={(e) => setSelectedKabkota(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {kabkotaList.map((kab, i) => (
                        <option key={i} value={kab}>
                          {kab}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Month & Year Select */}
                {activeEndpoint === 'POST_SHALAT' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        Bulan
                      </label>
                      <select
                        value={selectedBulan}
                        onChange={(e) => setSelectedBulan(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        {bulanNames.map((name, idx) => (
                          <option key={idx + 1} value={idx + 1}>
                            {idx + 1} - {name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        Tahun
                      </label>
                      <input
                        type="number"
                        value={selectedTahun}
                        onChange={(e) => setSelectedTahun(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleRunTest}
                    disabled={loadingTest}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs cursor-pointer"
                  >
                    <Play className={`w-3.5 h-3.5 ${loadingTest ? 'animate-spin' : ''}`} />
                    {loadingTest ? 'Memuat Data...' : 'Lihat Data API'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsConfirmSaveOpen(true)}
                    disabled={savingDb}
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-teal-600/25 transition-all flex items-center gap-2 disabled:opacity-50 text-xs cursor-pointer"
                    title="Simpan Jadwal Sholat ke Database Master"
                  >
                    <Save className={`w-3.5 h-3.5 ${savingDb ? 'animate-spin' : ''}`} />
                    {savingDb ? 'Menyimpan...' : 'Simpan DB'}
                  </button>
                </div>
              </div>
            </div>

            {/* Response UI/UX Data Preview */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 flex-1 flex flex-col border border-slate-800 shadow-inner min-h-[340px]">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    <span className="text-xs font-bold tracking-wider uppercase text-slate-200">
                      PRATINJAU HASIL DATA {apiResponse?.code ? `(Status: ${apiResponse.code})` : ''}
                    </span>
                  </div>
                  {apiResponse && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                      {apiResponse.message || '200 OK'}
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-auto max-h-[380px]">
                  {!apiResponse ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-12">
                      <Server className="w-12 h-12 stroke-[1.5] mb-2 opacity-40 text-emerald-500" />
                      <p className="font-semibold text-slate-400 text-xs">Pilih parameter dan klik "Lihat Data API" untuk menguji data.</p>
                    </div>
                  ) : Array.isArray(apiResponse.data) ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                        <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                          <Globe className="w-4 h-4" /> Total Data Ditemukan: {apiResponse.data.length} Wilayah
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {apiResponse.data.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 p-2.5 rounded-xl text-xs font-medium text-slate-200 flex items-center gap-2 transition-all"
                          >
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : apiResponse.data?.jadwal ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-emerald-900/60 to-teal-900/60 p-3.5 rounded-xl border border-emerald-700/40 flex flex-wrap justify-between items-center gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-emerald-200">
                            {apiResponse.data.provinsi} - {apiResponse.data.kabkota}
                          </h4>
                          <p className="text-xs text-emerald-300/80">
                            Jadwal Shalat Bulanan: {apiResponse.data.bulan_nama || `Bulan ${apiResponse.data.bulan}`} {apiResponse.data.tahun}
                          </p>
                        </div>
                        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30 font-semibold">
                          {apiResponse.data.jadwal.length} Hari
                        </span>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-800 text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-700 text-[11px]">
                            <tr>
                              <th className="py-2.5 px-3">Tgl</th>
                              <th className="py-2.5 px-3">Hari</th>
                              <th className="py-2.5 px-2 text-center text-slate-400">Imsak</th>
                              <th className="py-2.5 px-2 text-center text-emerald-400">Subuh</th>
                              <th className="py-2.5 px-2 text-center text-amber-400">Dzuhur</th>
                              <th className="py-2.5 px-2 text-center text-indigo-400">Ashar</th>
                              <th className="py-2.5 px-2 text-center text-orange-400">Maghrib</th>
                              <th className="py-2.5 px-2 text-center text-purple-400">Isya</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-mono">
                            {apiResponse.data.jadwal.slice(0, 10).map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-800/40 text-slate-300">
                                <td className="py-2 px-3 font-bold text-emerald-400">{row.tanggal}</td>
                                <td className="py-2 px-3 font-sans font-medium">{row.hari}</td>
                                <td className="py-2 px-2 text-center text-slate-400">{row.imsak}</td>
                                <td className="py-2 px-2 text-center font-semibold text-emerald-300">{row.subuh}</td>
                                <td className="py-2 px-2 text-center font-semibold text-amber-300">{row.dzuhur}</td>
                                <td className="py-2 px-2 text-center font-semibold text-indigo-300">{row.ashar}</td>
                                <td className="py-2 px-2 text-center font-semibold text-orange-300">{row.maghrib}</td>
                                <td className="py-2 px-2 text-center font-semibold text-purple-300">{row.isya}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {apiResponse.data.jadwal.length > 10 && (
                          <p className="text-center py-2 text-[11px] text-slate-400 italic bg-slate-800/30">
                            Menampilkan 10 dari {apiResponse.data.jadwal.length} hari... (Klik "Simpan DB" untuk memasukkan seluruh data ke Database Master)
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-800 rounded-xl text-xs text-slate-300">
                      <p className="font-semibold text-emerald-400">{apiResponse.message || 'Respon berhasil diterima'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Master Data Datatable Container */}
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
          {/* Toolbar Baris 1 */}
          <div className="p-5 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4 dark:border-emerald-800/40 dark:bg-gradient-to-r dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/30 border border-emerald-300/40">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Master Jadwal Sholat</h2>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {masterList.length} Tersimpan
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                  Jadwal sholat harian per wilayah yang siap digunakan modul Absensi & Mutaba'ah.
                </p>
              </div>
            </div>

            {/* 4 Soft Squircle Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
              <SquircleActionButton
                variant="print"
                icon={Printer}
                onClick={handlePrint}
                title="Cetak Jadwal Sholat"
              />
              <SquircleActionButton
                variant="export"
                icon={Download}
                onClick={exportToCsv}
                disabled={masterList.length === 0}
                title="Ekspor Jadwal Sholat ke CSV"
              />
              <SquircleActionButton
                variant="sync"
                icon={RefreshCw}
                onClick={loadMasterFromDb}
                disabled={loadingMaster}
                title="Muat Ulang Data dari Database"
              />
            </div>
          </div>

          {/* Toolbar Baris 2: Full-Width Search Input */}
          <div className="px-5 py-3.5 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-slate-900/60 dark:via-emerald-950/20 dark:to-slate-900/60">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600/70 dark:text-emerald-400/70" />
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Cari berdasarkan nama provinsi, kabupaten/kota, hari, atau tanggal..."
                className="w-full rounded-xl border border-emerald-300/80 bg-white py-2.5 pl-10 pr-10 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/60 dark:bg-slate-800/90 dark:text-white"
              />
              {filterSearch && (
                <button
                  type="button"
                  onClick={() => setFilterSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* Toolbar Baris 3: Horizontal Filters */}
          <div className="px-5 py-3 border-b border-emerald-100 dark:border-emerald-900/50 bg-slate-50/70 dark:bg-slate-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold mr-1">
                <Filter className="size-3.5 text-emerald-600" />
                <span>Filter Wilayah:</span>
              </div>

              {/* Filter Provinsi */}
              <select
                value={filterProvinsi}
                onChange={(e) => setFilterProvinsi(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Semua Provinsi</option>
                {provinsiList.map((p, idx) => (
                  <option key={idx} value={p}>{p}</option>
                ))}
              </select>

              {/* Reset Filter Button */}
              {(filterSearch || filterProvinsi || filterKabkota) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="size-3 text-emerald-600" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>

            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Menampilkan {paginatedList.length} dari {masterList.length} data
            </div>
          </div>

          {/* Master Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                <tr className="border-b-2 border-emerald-200/90 dark:border-emerald-800/80 bg-transparent text-emerald-950 dark:text-emerald-200 font-extrabold text-[11px] uppercase tracking-wider">
                  <th className="hidden sm:table-cell py-3.5 px-4 bg-transparent">Provinsi</th>
                  <th className="hidden sm:table-cell py-3.5 px-4 bg-transparent">Kab / Kota</th>
                  <th className="py-3.5 px-4 bg-transparent">Tanggal</th>
                  <th className="hidden md:table-cell py-3.5 px-4 bg-transparent">Hari</th>
                  <th className="hidden lg:table-cell py-3.5 px-3 bg-transparent text-center">Imsak</th>
                  <th className="py-3.5 px-3 bg-transparent text-center text-emerald-800 dark:text-emerald-300">Subuh</th>
                  <th className="hidden lg:table-cell py-3.5 px-3 bg-transparent text-center">Terbit</th>
                  <th className="hidden lg:table-cell py-3.5 px-3 bg-transparent text-center">Dhuha</th>
                  <th className="py-3.5 px-3 bg-transparent text-center text-blue-800 dark:text-blue-300">Dzuhur</th>
                  <th className="py-3.5 px-3 bg-transparent text-center text-indigo-800 dark:text-indigo-300">Ashar</th>
                  <th className="py-3.5 px-3 bg-transparent text-center text-orange-800 dark:text-orange-300">Maghrib</th>
                  <th className="py-3.5 px-3 bg-transparent text-center text-purple-800 dark:text-purple-300">Isya</th>
                  <th className="py-3.5 px-4 bg-transparent text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                {loadingMaster ? (
                  <tr>
                    <td colSpan="13" className="py-14 text-center text-slate-400">
                      <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-emerald-600" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Memuat data master sholat dari database...</p>
                    </td>
                  </tr>
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="py-14 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <Compass className="size-10 text-emerald-400/50 mb-2" />
                        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">Belum ada master data sholat tersimpan</p>
                        <p className="text-xs text-slate-500 max-w-sm mt-1">
                          Gunakan panel "Testing Interaktif & Tarik Data API EQuran.id" di atas lalu klik "Simpan DB".
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((row) => (
                    <tr key={row.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                      <td className="hidden sm:table-cell py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {row.provinsi || 'Jawa Barat'}
                      </td>
                      <td className="hidden sm:table-cell py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {row.kabkota_name || 'Kota Bogor'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {row.tanggal_lengkap || row.tanggal}
                        </div>
                        {/* Compact mobile metadata row */}
                        <div className="sm:hidden mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                          {row.kabkota_name || 'Kota Bogor'} • {row.provinsi || 'Jawa Barat'}
                          <span className="md:hidden"> ({row.hari || '-'})</span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {row.hari || '-'}
                      </td>
                      <td className="hidden lg:table-cell py-3 px-3 text-center font-mono text-slate-500">{row.imsak || '-'}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30">
                        {row.subuh}
                      </td>
                      <td className="hidden lg:table-cell py-3 px-3 text-center font-mono text-slate-500">{row.terbit || '-'}</td>
                      <td className="hidden lg:table-cell py-3 px-3 text-center font-mono text-amber-600 dark:text-amber-400">{row.dhuha || '-'}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30">
                        {row.dzuhur}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-medium text-indigo-600 dark:text-indigo-400">
                        {row.ashar}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/30">
                        {row.maghrib}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-medium text-purple-600 dark:text-purple-400">
                        {row.isya}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center">
                          <ActionDropdown onDelete={() => handleDeleteMaster(row)} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* TailGrids Pagination Footer */}
          {masterList.length > 0 && (
            <div className="px-5 py-3 border-t border-emerald-100 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-[#1B2433]">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Menampilkan halaman {currentPage} dari {totalPages} ({masterList.length} total data jadwal)
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

        {/* Harmonized Delete Modal */}
        <HarmonizedDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setDeleteItem(null)
          }}
          onConfirm={handleConfirmHapus}
          item={deleteItem}
          isSubmitting={isDeleting}
        />

        {/* Harmonized Save Confirmation Modal */}
        <HarmonizedSaveConfirmModal
          isOpen={isConfirmSaveOpen}
          onClose={() => setIsConfirmSaveOpen(false)}
          onConfirm={handleConfirmSaveToDb}
          payload={{
            provinsi: selectedProvinsi,
            kabkota: selectedKabkota,
            bulan: selectedBulan,
            tahun: selectedTahun,
            totalDays: apiResponse?.data?.jadwal?.length ? `${apiResponse.data.jadwal.length} Hari` : null,
          }}
          isSubmitting={savingDb}
        />

        {/* Toast Notification Stack */}
        <div className="pointer-events-none fixed bottom-5 right-5 z-[80] flex flex-col gap-2 max-w-sm w-full">
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
