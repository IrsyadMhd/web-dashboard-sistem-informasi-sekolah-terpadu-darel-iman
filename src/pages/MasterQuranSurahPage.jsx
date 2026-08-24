import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Volume2,
  Sparkles,
  CheckCircle,
  FileText,
  MapPin,
  X,
  Loader2,
  Layers,
  ChevronRight,
  Play,
  Pause,
  Eye,
} from 'lucide-react'
import Swal from 'sweetalert2'
import ActionDropdown from '../components/app/ActionDropdown'
import { equranService } from '../services/equranService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  MasterActionButton,
  MasterDataPage,
  MasterStatsGrid,
  MasterStatCard,
} from '../components/master-data'

function KpiTintedCard({ icon: Icon, label, subtext, value, tone = 'emerald' }) {
  const tones = {
    emerald: {
      card: 'border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 via-emerald-50/60 to-teal-50/40 hover:bg-emerald-100/90 hover:border-emerald-300 dark:border-emerald-800/80 dark:bg-emerald-950/40',
      title: 'text-emerald-800 dark:text-emerald-300',
      iconBox: 'bg-emerald-600 text-white shadow-xs',
      val: 'text-emerald-950 dark:text-white',
      sub: 'text-emerald-700/90 dark:text-emerald-400',
    },
    blue: {
      card: 'border-sky-200/90 bg-gradient-to-br from-sky-50/90 via-sky-50/60 to-blue-50/40 hover:bg-sky-100/90 hover:border-sky-300 dark:border-sky-800/80 dark:bg-sky-950/40',
      title: 'text-sky-800 dark:text-sky-300',
      iconBox: 'bg-sky-600 text-white shadow-xs',
      val: 'text-sky-950 dark:text-white',
      sub: 'text-sky-700/90 dark:text-sky-400',
    },
    purple: {
      card: 'border-purple-200/90 bg-gradient-to-br from-purple-50/90 via-purple-50/60 to-indigo-50/40 hover:bg-purple-100/90 hover:border-purple-300 dark:border-purple-800/80 dark:bg-purple-950/40',
      title: 'text-purple-800 dark:text-purple-300',
      iconBox: 'bg-purple-600 text-white shadow-xs',
      val: 'text-purple-950 dark:text-white',
      sub: 'text-purple-700/90 dark:text-purple-400',
    },
    amber: {
      card: 'border-amber-200/90 bg-gradient-to-br from-amber-50/90 via-amber-50/60 to-yellow-50/40 hover:bg-amber-100/90 hover:border-amber-300 dark:border-amber-800/80 dark:bg-amber-950/40',
      title: 'text-amber-800 dark:text-amber-300',
      iconBox: 'bg-amber-500 text-white shadow-xs',
      val: 'text-amber-950 dark:text-white',
      sub: 'text-amber-700/90 dark:text-amber-400',
    },
  }

  const t = tones[tone] || tones.emerald

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`text-left rounded-2xl border ${t.card} p-5 shadow-xs transition-all hover:shadow-md group`}
    >
      <div className="flex items-center justify-between">
        <p className={`text-xs font-bold uppercase tracking-wider ${t.title}`}>{label}</p>
        {Icon && (
          <div className={`p-2 rounded-xl ${t.iconBox} shrink-0 transition-transform group-hover:scale-110`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className={`mt-2 text-3xl font-black ${t.val}`}>{value ?? 0}</p>
      {subtext && (
        <p className={`mt-1.5 text-xs font-semibold ${t.sub}`}>
          {subtext}
        </p>
      )}
    </motion.div>
  )
}

const emptySurah = {
  nomor: '',
  nama: '',
  nama_latin: '',
  jumlah_ayat: '',
  tempat_turun: 'Mekah',
  arti: '',
  deskripsi: '',
  audio_full: '',
}

export default function MasterQuranSurahPage() {
  const [surahs, setSurahs] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [search, setSearch] = useState('')
  const [tempatFilter, setTempatFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // State untuk Modal Form (Tambah/Edit)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState(emptySurah)
  const [saving, setSaving] = useState(false)

  // State untuk Modal Detail Surah & Rincian Ayat (Ayah Reader)
  const [showAyatModal, setShowAyatModal] = useState(false)
  const [selectedSurahDetail, setSelectedSurahDetail] = useState(null)
  const [ayats, setAyats] = useState([])
  const [loadingAyat, setLoadingAyat] = useState(false)
  const [ayatSearch, setAyatSearch] = useState('')
  const [playingAudioUrl, setPlayingAudioUrl] = useState(null)
  const [audioRef, setAudioRef] = useState(null)

  // Fetch Surah list from Backend Database
  const fetchSurahs = async () => {
    setLoading(true)
    try {
      const data = await equranService.getSurahs()
      setSurahs(data || [])
    } catch (e) {
      console.error('Failed loading surah data', e)
      Swal.fire('Error', 'Gagal memuat data surah dari database', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSurahs()
  }, [])

  // Auto Sync 114 Surah from EQuran.id API
  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await equranService.syncSurah()
      await fetchSurahs()
      Swal.fire({
        icon: 'success',
        title: 'Sync Berhasil',
        text: res.message || '114 Surah berhasil disinkronkan ke database!',
        timer: 1800,
        showConfirmButton: false,
      })
    } catch (e) {
      console.error(e)
      Swal.fire('Error', 'Gagal melakukan sinkronisasi data dengan EQuran.id', 'error')
    } finally {
      setSyncing(false)
    }
  }

  // Open Ayah Reader Modal when clicking a Surah Name
  const handleOpenAyatDetail = async (surah) => {
    setSelectedSurahDetail(surah)
    setAyats([])
    setAyatSearch('')
    setShowAyatModal(true)
    setLoadingAyat(true)

    try {
      const detail = await equranService.getSurahDetail(surah.nomor || surah.id)
      if (detail) {
        setSelectedSurahDetail(detail.surah || surah)
        setAyats(detail.ayat || [])
      }
    } catch (e) {
      console.error('Failed loading ayats:', e)
      Swal.fire('Error', 'Gagal memuat rincian ayat untuk surah ini.', 'error')
    } finally {
      setLoadingAyat(false)
    }
  }

  // Play / Pause Audio
  const handlePlayAudio = (url) => {
    if (!url) return
    if (playingAudioUrl === url && audioRef) {
      audioRef.pause()
      setPlayingAudioUrl(null)
      return
    }

    if (audioRef) {
      audioRef.pause()
    }

    const newAudio = new Audio(url)
    newAudio.play()
    setAudioRef(newAudio)
    setPlayingAudioUrl(url)

    newAudio.onended = () => {
      setPlayingAudioUrl(null)
    }
  }

  // Close Ayah Modal & Stop Audio
  const handleCloseAyatModal = () => {
    if (audioRef) {
      audioRef.pause()
    }
    setPlayingAudioUrl(null)
    setShowAyatModal(false)
  }

  // Open Create Modal
  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({
      ...emptySurah,
      nomor: surahs.length > 0 ? Math.max(...surahs.map((s) => Number(s.nomor) || 0)) + 1 : 1,
    })
    setShowModal(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (surah, e) => {
    e.stopPropagation()
    setEditingItem(surah)
    setFormData({
      nomor: surah.nomor || '',
      nama: surah.nama || '',
      nama_latin: surah.nama_latin || '',
      jumlah_ayat: surah.jumlah_ayat || '',
      tempat_turun: surah.tempat_turun || 'Mekah',
      arti: surah.arti || '',
      deskripsi: surah.deskripsi || '',
      audio_full: surah.audio_full || '',
    })
    setShowModal(true)
  }

  // Save (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...formData,
        nomor: Number(formData.nomor),
        jumlah_ayat: Number(formData.jumlah_ayat),
      }

      if (editingItem) {
        await equranService.updateSurah(editingItem.id, payload)
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data surah berhasil diperbarui', timer: 1400, showConfirmButton: false })
      } else {
        await equranService.createSurah(payload)
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Surah baru berhasil ditambahkan ke database', timer: 1400, showConfirmButton: false })
      }

      setShowModal(false)
      fetchSurahs()
    } catch (e) {
      console.error(e)
      const errMessage = e.response?.data?.message || 'Gagal menyimpan data surah. Periksa kembali form input.'
      Swal.fire('Error', errMessage, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Delete Surah
  const handleDelete = async (surah, e) => {
    e.stopPropagation()
    const result = await Swal.fire({
      title: 'Hapus Surah?',
      text: `Surah ${surah.nama_latin} (No. ${surah.nomor}) akan dihapus dari database.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    })

    if (result.isConfirmed) {
      try {
        await equranService.deleteSurah(surah.id)
        Swal.fire({ icon: 'success', title: 'Terhapus', text: 'Surah berhasil dihapus dari database', timer: 1400, showConfirmButton: false })
        fetchSurahs()
      } catch (e) {
        console.error(e)
        Swal.fire('Error', 'Gagal menghapus data surah', 'error')
      }
    }
  }

  // Filtered List Surahs
  const filteredSurahs = useMemo(() => {
    return surahs.filter((s) => {
      const matchSearch =
        search === '' ||
        s.nama_latin?.toLowerCase().includes(search.toLowerCase()) ||
        s.nama?.toLowerCase().includes(search.toLowerCase()) ||
        s.arti?.toLowerCase().includes(search.toLowerCase()) ||
        String(s.nomor).includes(search)

      const matchTempat =
        tempatFilter === 'all' || s.tempat_turun?.toLowerCase() === tempatFilter.toLowerCase()

      return matchSearch && matchTempat
    })
  }, [surahs, search, tempatFilter])

  // Filtered List Ayats in Reader Modal
  const filteredAyats = useMemo(() => {
    if (!ayatSearch) return ayats
    return ayats.filter(
      (a) =>
        String(a.nomor_ayat).includes(ayatSearch) ||
        a.teks_latin?.toLowerCase().includes(ayatSearch.toLowerCase()) ||
        a.teks_indonesia?.toLowerCase().includes(ayatSearch.toLowerCase())
    )
  }, [ayats, ayatSearch])

  // Stats Calculation (Robust for all variants of field names)
  const stats = useMemo(() => {
    let totalAyat = 0
    let makkiyah = 0
    let madaniyah = 0

    surahs.forEach((s) => {
      const ayatCount = Number(s.jumlah_ayat || s.jumlahAyat || 0)
      totalAyat += ayatCount

      const tempat = String(s.tempat_turun || s.tempatTurun || '').toLowerCase()
      if (tempat.includes('mekah') || tempat.includes('mecca') || tempat.includes('makkiyah')) {
        makkiyah++
      } else if (tempat.includes('madinah') || tempat.includes('medina') || tempat.includes('madaniyah')) {
        madaniyah++
      } else {
        // Default to Makkiyah if unspecified
        makkiyah++
      }
    })

    return { count: surahs.length, totalAyat, makkiyah, madaniyah }
  }, [surahs])

  return (
    <PageContainer maxW="7xl">
      <AppBreadcrumb className="mb-6" items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Surah Al-Qur\'an' }]} />
      <MasterDataPage className="education-unit-page quran-master-page" hideBreadcrumb>
      {/* Summary Cards Grid (Desain KpiTintedCard persis seperti /dashboard/employees) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTintedCard
          label="Total Surah DB"
          value={stats.count}
          subtext="Surah tersimpan"
          icon={Layers}
          tone="emerald"
        />
        <KpiTintedCard
          label="Total Ayat Al-Qur'an"
          value={stats.totalAyat.toLocaleString('id-ID')}
          subtext="Jumlah seluruh ayat"
          icon={FileText}
          tone="blue"
        />
        <KpiTintedCard
          label="Surah Makkiyah"
          value={stats.makkiyah}
          subtext="Turun di Mekah"
          icon={MapPin}
          tone="purple"
        />
        <KpiTintedCard
          label="Surah Madaniyah"
          value={stats.madaniyah}
          subtext="Turun di Madinah"
          icon={CheckCircle}
          tone="amber"
        />
      </div>

      {/* Toolbar Search & Filter & Actions */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3.5">
        {/* Search Input */}
        <div className="relative w-full xl:w-80 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor, nama surah, atau arti..."
            className="w-full h-10 pl-9 pr-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto justify-start xl:justify-end">
          {/* Tempat Turun Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 h-10 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Tempat:</span>
            <select
              value={tempatFilter}
              onChange={(e) => setTempatFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">Semua Tempat</option>
              <option value="mekah">Mekah (Makkiyah)</option>
              <option value="madinah">Madinah (Madaniyah)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-auto xl:ml-0">
            <MasterActionButton variant="secondary" icon={RefreshCw} disabled={syncing} onClick={handleSync}>
              {syncing ? 'Menyinkronkan...' : 'Sync EQuran.id'}
            </MasterActionButton>

            <MasterActionButton icon={Plus} onClick={handleOpenAdd}>
              Tambah Surah Manual
            </MasterActionButton>
          </div>
        </div>
      </div>

      {/* Table Data Surah */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-sm font-medium">Memuat data surah dari database...</span>
          </div>
        ) : filteredSurahs.length === 0 ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
            <BookOpen className="w-10 h-10 text-gray-300" />
            <span className="text-base font-semibold text-gray-600">Tidak ada data surah ditemukan</span>
            <p className="text-xs text-gray-400">Silakan klik "Sync EQuran.id" untuk menarik data dari EQuran.id</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-center w-14">No</th>
                  <th className="px-4 py-3">Nama Surah (Klik Rincian Ayat)</th>
                  <th className="px-4 py-3 text-right">Nama Arab</th>
                  <th className="px-4 py-3">Arti</th>
                  <th className="px-4 py-3 text-center">Ayat</th>
                  <th className="px-4 py-3 text-center w-48">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSurahs.map((s) => (
                  <tr key={s.id || s.nomor} className="hover:bg-emerald-50/50 transition-colors group">
                    <td className="px-4 py-3 font-extrabold text-emerald-800 text-center bg-gray-50/50">
                      {s.nomor}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleOpenAyatDetail(s)}
                        className="text-left font-bold text-gray-900 group-hover:text-emerald-700 flex flex-col hover:underline focus:outline-none"
                        title="Klik untuk melihat rincian ayat"
                      >
                        <span className="text-base flex items-center gap-1.5">
                          {s.nama_latin}
                          <Eye className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">Surah Ke-{s.nomor} • {s.tempat_turun}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-lg text-emerald-700 font-serif">
                      {s.nama}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-medium">
                      {s.arti}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-700">
                      <span className="bg-gray-100 px-2.5 py-1 rounded-lg text-xs border border-gray-200">
                        {s.jumlah_ayat} Ayat
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        <ActionDropdown
                          onView={() => handleOpenAyatDetail(s)}
                          onEdit={(e) => handleOpenEdit(s, e)}
                          onDelete={(e) => handleDelete(s, e)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETAIL SURAH & RINCIAN AYAT (Ayah Reader Modal) */}
      {showAyatModal && selectedSurahDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col border border-gray-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 p-6 text-white flex items-start justify-between relative">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <span>Surah No. {selectedSurahDetail.nomor}</span>
                  <span>•</span>
                  <span>{selectedSurahDetail.tempat_turun} ({selectedSurahDetail.jumlah_ayat} Ayat)</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {selectedSurahDetail.nama_latin}
                  </h2>
                  <span className="text-xl sm:text-2xl font-serif text-emerald-300">
                    ({selectedSurahDetail.nama})
                  </span>
                </div>
                <p className="text-emerald-100/90 text-sm italic">
                  "{selectedSurahDetail.arti}"
                </p>
              </div>

              <div className="flex items-center gap-3">
                {selectedSurahDetail.audio_full && (
                  <button
                    onClick={() => handlePlayAudio(selectedSurahDetail.audio_full)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-md border transition-all ${
                      playingAudioUrl === selectedSurahDetail.audio_full
                        ? 'bg-emerald-400 text-emerald-950 border-emerald-300 shadow-lg animate-pulse'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    }`}
                  >
                    {playingAudioUrl === selectedSurahDetail.audio_full ? (
                      <>
                        <Pause className="w-3.5 h-3.5" /> Pause Murottal
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" /> Full Murottal
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={handleCloseAyatModal}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Ayah Search & Toolbar */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={ayatSearch}
                  onChange={(e) => setAyatSearch(e.target.value)}
                  placeholder="Cari nomor ayat atau teks latin..."
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <span className="text-xs text-gray-500 font-semibold">
                Menampilkan {filteredAyats.length} dari {ayats.length} Ayat
              </span>
            </div>

            {/* Ayah List Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
              {loadingAyat ? (
                <div className="p-16 text-center text-gray-400 flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                  <span className="text-sm font-semibold text-gray-600">Memuat rincian ayat Al-Qur'an...</span>
                </div>
              ) : filteredAyats.length === 0 ? (
                <div className="p-16 text-center text-gray-400 flex flex-col items-center gap-2">
                  <BookOpen className="w-10 h-10 text-gray-300" />
                  <span className="text-sm font-semibold text-gray-600">Ayat tidak ditemukan</span>
                </div>
              ) : (
                filteredAyats.map((ayat) => (
                  <div
                    key={ayat.nomor_ayat}
                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-4 relative group"
                  >
                    {/* Header Item Ayat: Nomor & Action */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 font-extrabold text-sm flex items-center justify-center border border-emerald-200 shadow-inner">
                          {ayat.nomor_ayat}
                        </span>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          {selectedSurahDetail.nama_latin} : Ayat {ayat.nomor_ayat}
                        </span>
                      </div>

                      {ayat.audio && (
                        <button
                          onClick={() => handlePlayAudio(ayat.audio)}
                          className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                            playingAudioUrl === ayat.audio
                              ? 'bg-emerald-600 text-white shadow-md animate-pulse'
                              : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                          title="Dengar Audio Ayat"
                        >
                          {playingAudioUrl === ayat.audio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>Audio Ayat</span>
                        </button>
                      )}
                    </div>

                    {/* Teks Arab (Right Aligned, Large Font) */}
                    <div className="text-right text-2xl sm:text-3xl font-serif leading-loose text-gray-800 tracking-wide font-medium py-2">
                      {ayat.teks_arab}
                    </div>

                    {/* Transliterasi Latin (Highlighted Text) */}
                    <div className="bg-emerald-50/70 border-l-4 border-emerald-500 p-3 rounded-r-xl text-emerald-900 text-sm font-semibold italic">
                      "{ayat.teks_latin}"
                    </div>

                    {/* Terjemahan Indonesia */}
                    <div className="text-gray-700 text-sm leading-relaxed font-normal pl-1">
                      <span className="font-semibold text-gray-500 text-xs mr-2">Artinya:</span>
                      {ayat.teks_indonesia}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Data resmi Kementerian Agama RI via EQuran.id API
              </span>
              <button
                onClick={handleCloseAyatModal}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold rounded-xl transition-all"
              >
                Tutup Pembaca Ayat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-300" />
                <span>{editingItem ? 'Edit Data Surah' : 'Tambah Surah Baru'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-emerald-100 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nomor Surah</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.nomor}
                    onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Jumlah Ayat</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.jumlah_ayat}
                    onChange={(e) => setFormData({ ...formData, jumlah_ayat: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Latin (misal: Al-Fatihah)</label>
                  <input
                    type="text"
                    required
                    value={formData.nama_latin}
                    onChange={(e) => setFormData({ ...formData, nama_latin: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Arab (Teks Arab)</label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-serif text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Arti Surah</label>
                  <input
                    type="text"
                    required
                    value={formData.arti}
                    onChange={(e) => setFormData({ ...formData, arti: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tempat Turun</label>
                  <select
                    value={formData.tempat_turun}
                    onChange={(e) => setFormData({ ...formData, tempat_turun: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Mekah">Mekah</option>
                    <option value="Madinah">Madinah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">URL Audio MP3 (Opsional)</label>
                <input
                  type="url"
                  value={formData.audio_full}
                  onChange={(e) => setFormData({ ...formData, audio_full: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Surah'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MasterDataPage>
    </PageContainer>
  )
}
