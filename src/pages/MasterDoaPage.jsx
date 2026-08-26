import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Tag,
  X,
  Loader2,
  Layers,
  Eye,
  Hash,
  Bookmark,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import Swal from 'sweetalert2'
import ActionDropdown from '../components/app/ActionDropdown'
import { equranService } from '../services/equranService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  MasterActionButton,
  MasterDataPage,
  MasterFilterSelect,
  SquircleActionButton,
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

const emptyDoa = {
  id: '',
  nama: '',
  grup: 'Doa Harian',
  ar: '',
  tr: '',
  idn: '',
  tentang: '',
  tagInput: '',
}

export default function MasterDoaPage() {
  const [doas, setDoas] = useState([])
  const [grupOptions, setGrupOptions] = useState([])
  const [tagOptions, setTagOptions] = useState([])
  const [stats, setStats] = useState({ total_doa: 0, total_grup: 0, total_tag: 0 })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  // Filters for Master Data
  const [search, setSearch] = useState('')
  const [grupFilter, setGrupFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Modal State for Add / Edit
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState(emptyDoa)
  const [saving, setSaving] = useState(false)

  // Modal State for Reader Detail Doa
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedDoa, setSelectedDoa] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Fetch Doa list from Backend Database
  const fetchDoas = async () => {
    setLoading(true)
    try {
      const res = await equranService.getDoas({
        grup: grupFilter !== 'all' ? grupFilter : undefined,
        tag: tagFilter !== 'all' ? tagFilter : undefined,
        search: search || undefined,
      })

      if (res && res.data) {
        setDoas(res.data || [])
        setGrupOptions(res.grup_options || [])
        setTagOptions(res.tag_options || [])
        if (res.stats) {
          setStats(res.stats)
        }
      }
    } catch (e) {
      console.error('Failed loading doa data', e)
      Swal.fire('Error', 'Gagal memuat data doa dari database', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoas()
  }, [grupFilter, tagFilter])

  // Sync Doa & Dzikir items from EQuran.id API
  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await equranService.syncDoas()
      await fetchDoas()
      Swal.fire({
        icon: 'success',
        title: 'Sync Berhasil',
        text: res.message || 'Data Doa & Dzikir berhasil disinkronkan ke database!',
        timer: 1800,
        showConfirmButton: false,
      })
    } catch (e) {
      console.error(e)
      Swal.fire('Error', 'Gagal melakukan sinkronisasi data doa dengan EQuran.id', 'error')
    } finally {
      setSyncing(false)
    }
  }

  // Open Detail Reader Modal
  const handleOpenDetail = async (doa) => {
    setSelectedDoa(doa)
    setShowDetailModal(true)
    setLoadingDetail(true)

    try {
      const res = await equranService.getDoaDetail(doa.id)
      if (res && res.data) {
        setSelectedDoa(res.data)
      }
    } catch (e) {
      console.error('Failed fetching doa detail:', e)
    } finally {
      setLoadingDetail(false)
    }
  }

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null)
    const nextId = doas.length > 0 ? Math.max(...doas.map((d) => Number(d.id) || 0)) + 1 : 1
    setFormData({
      ...emptyDoa,
      id: nextId,
    })
    setShowModal(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (doa, e) => {
    e?.stopPropagation()
    setEditingItem(doa)
    const tagsArr = Array.isArray(doa.tag) ? doa.tag : []
    setFormData({
      id: doa.id || '',
      nama: doa.nama || '',
      grup: doa.grup || 'Doa Harian',
      ar: doa.ar || '',
      tr: doa.tr || '',
      idn: doa.idn || '',
      tentang: doa.tentang || '',
      tagInput: tagsArr.join(', '),
    })
    setShowModal(true)
  }

  // Save (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const tagsArray = formData.tagInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)

      const payload = {
        id: Number(formData.id),
        nama: formData.nama,
        grup: formData.grup,
        ar: formData.ar,
        tr: formData.tr,
        idn: formData.idn,
        tentang: formData.tentang,
        tag: tagsArray,
      }

      if (editingItem) {
        await equranService.updateDoa(editingItem.id, payload)
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data doa berhasil diperbarui', timer: 1400, showConfirmButton: false })
      } else {
        await equranService.createDoa(payload)
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Doa baru berhasil ditambahkan ke database', timer: 1400, showConfirmButton: false })
      }

      setShowModal(false)
      fetchDoas()
    } catch (e) {
      console.error(e)
      const errMessage = e.response?.data?.message || 'Gagal menyimpan data doa. Periksa form input.'
      Swal.fire('Error', errMessage, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Delete Doa
  const handleDelete = async (doa, e) => {
    e?.stopPropagation()
    const result = await Swal.fire({
      title: 'Hapus Doa?',
      text: `Doa "${doa.nama}" (ID: ${doa.id}) akan dihapus dari database.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    })

    if (result.isConfirmed) {
      try {
        await equranService.deleteDoa(doa.id)
        Swal.fire({ icon: 'success', title: 'Terhapus', text: 'Doa berhasil dihapus dari database', timer: 1400, showConfirmButton: false })
        fetchDoas()
      } catch (e) {
        console.error(e)
        Swal.fire('Error', 'Gagal menghapus data doa', 'error')
      }
    }
  }

  // Filtered Doa List for Search Input
  const filteredDoas = useMemo(() => {
    if (!search) return doas
    const s = search.toLowerCase()
    return doas.filter((d) => {
      const matchNama = d.nama?.toLowerCase().includes(s)
      const matchGrup = d.grup?.toLowerCase().includes(s)
      const matchLatin = d.tr?.toLowerCase().includes(s)
      const matchIdn = d.idn?.toLowerCase().includes(s)
      const matchSumber = d.tentang?.toLowerCase().includes(s)
      const matchId = String(d.id).includes(s)
      const matchTags = Array.isArray(d.tag) && d.tag.some((t) => t.toLowerCase().includes(s))
      return matchNama || matchGrup || matchLatin || matchIdn || matchSumber || matchId || matchTags
    })
  }, [doas, search])

  // Computed Stats
  const displayStats = useMemo(() => {
    const totalHadits = doas.filter((d) => d.tentang && d.tentang.trim().length > 0).length
    return {
      totalDoa: doas.length,
      totalGrup: grupOptions.length || [...new Set(doas.map((d) => d.grup).filter(Boolean))].length,
      totalTag: tagOptions.length || [...new Set(doas.flatMap((d) => d.tag || []).filter(Boolean))].length,
      totalHadits,
    }
  }, [doas, grupOptions, tagOptions])

  return (
    <PageContainer maxW="7xl">
      <AppBreadcrumb className="mb-6" items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Doa Harian' }]} />

      {/* Modern Hero Header Banner */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 mb-6">
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
              <BookOpen className="size-6 sm:size-7 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                  <Sparkles className="size-3 text-amber-300 animate-pulse" />
                  Master Data Doa & Dzikir
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                  {displayStats.totalDoa} Doa
                </span>
              </div>
              <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Master Doa & Dzikir Yaumiyah
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                Kumpulan doa harian santri/siswa beserta teks Arab, transliterasi Latin, terjemahan Indonesia, dan referensi hadits.
              </p>
            </div>
          </div>
        </div>
      </div>

      <MasterDataPage className="education-unit-page doa-master-page space-y-6" hideBreadcrumb>
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTintedCard
          label="Total Doa DB"
          value={displayStats.totalDoa}
          subtext="Tersimpan di database"
          icon={Layers}
          tone="emerald"
        />
        <KpiTintedCard
          label="Kategori / Grup"
          value={displayStats.totalGrup}
          subtext="Grup doa harian"
          icon={Bookmark}
          tone="blue"
        />
        <KpiTintedCard
          label="Total Tag Unik"
          value={displayStats.totalTag}
          subtext="Tag pencarian doa"
          icon={Tag}
          tone="purple"
        />
        <KpiTintedCard
          label="Referensi Hadits"
          value={displayStats.totalHadits}
          subtext="Disertai sumber hadits"
          icon={ShieldCheck}
          tone="amber"
        />
      </div>

      {/* Master Outer Container Datatable Emerald Zamrud Modern */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
        {/* Toolbar Header */}
        <div className="border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 sm:p-5 dark:border-emerald-800/40 dark:bg-gradient-to-r dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-transparent flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
          {/* Left Side: Search Bar */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID, judul, arab, latin, atau tag..."
              className="w-full h-10 pl-9 pr-8 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
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

          {/* Right Side: Filters & Soft Pastel Squircle Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
            {/* Grup/Kategori Filter */}
            <MasterFilterSelect
              aria-label="Filter Grup Doa"
              value={grupFilter}
              onChange={(e) => setGrupFilter(e.target.value)}
              className="!min-w-44"
            >
              <option value="all">Semua Grup</option>
              {grupOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </MasterFilterSelect>

            {/* Tag Filter */}
            <MasterFilterSelect
              aria-label="Filter Tag Doa"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="!min-w-40 capitalize"
            >
              <option value="all">Semua Tag</option>
              {tagOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </MasterFilterSelect>

            {/* Soft Pastel Squircle Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 ml-auto lg:ml-0">
              <SquircleActionButton
                variant="import"
                icon={RefreshCw}
                label="Sync EQuran.id"
                disabled={syncing}
                onClick={handleSync}
              />

              <SquircleActionButton
                variant="primary"
                icon={Plus}
                label="Tambah Doa Manual"
                onClick={handleOpenAdd}
              />
            </div>
          </div>
        </div>

        {/* Table Data Doa */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-sm font-medium">Memuat data doa & dzikir dari database...</span>
          </div>
        ) : filteredDoas.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <BookOpen className="w-10 h-10 text-slate-300" />
            <span className="text-base font-semibold text-slate-600 dark:text-slate-300">Tidak ada data doa ditemukan</span>
            <p className="text-xs text-slate-400">Silakan klik "Sync Data Doa" untuk menarik daftar dari EQuran.id</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFB] dark:bg-[#202B3A] border-b border-[#EDF0F4] dark:border-[#354153]">
                <tr>
                  <th className="w-14 bg-[#F8FAFB] dark:bg-[#202B3A] px-4 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">ID</th>
                  <th className="bg-[#F8FAFB] dark:bg-[#202B3A] px-4 py-3.5 text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">Nama Doa & Grup</th>
                  <th className="bg-[#F8FAFB] dark:bg-[#202B3A] px-4 py-3.5 text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">Teks Arab, Transliterasi & Terjemahan</th>
                  <th className="bg-[#F8FAFB] dark:bg-[#202B3A] px-4 py-3.5 text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">Tag Filtering</th>
                  <th className="w-40 bg-[#F8FAFB] dark:bg-[#202B3A] px-4 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-200">
                {filteredDoas.map((doa) => (
                  <tr key={doa.id} className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer" onClick={() => handleOpenDetail(doa)}>
                    <td className="px-4 py-3 font-black text-emerald-700 dark:text-emerald-400 text-center">
                      #{doa.id}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenDetail(doa) }}
                        className="text-left font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 flex flex-col hover:underline focus:outline-none"
                      >
                        <span className="text-sm flex items-center gap-1.5 font-extrabold">
                          {doa.nama}
                          <Eye className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Bookmark className="w-3 h-3" />
                          {doa.grup || 'Doa Harian'}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 max-w-md space-y-1.5">
                      {doa.ar && (
                        <div className="text-right font-bold text-xl text-emerald-700 dark:text-emerald-400 font-serif leading-relaxed">
                          {doa.ar}
                        </div>
                      )}
                      {doa.tr && (
                        <div className="text-xs text-slate-800 dark:text-slate-200 font-semibold italic">
                          "{doa.tr}"
                        </div>
                      )}
                      {doa.idn && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {doa.idn}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(doa.tag) && doa.tag.length > 0 ? (
                          doa.tag.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-extrabold border border-emerald-200/60 dark:border-emerald-800/60"
                            >
                              #{t}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center">
                        <ActionDropdown
                          onView={() => handleOpenDetail(doa)}
                          onEdit={(e) => handleOpenEdit(doa, e)}
                          onDelete={(e) => handleDelete(doa, e)}
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

      {/* MODAL READER DETAIL DOA (Full Arabic, Latin, Translation & Hadith) */}
      {showDetailModal && selectedDoa && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col border border-gray-100">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <Hash className="w-3.5 h-3.5" />
                  <span>ID Doa #{selectedDoa.id}</span>
                  <span>•</span>
                  <span>{selectedDoa.grup || 'Doa Harian'}</span>
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">{selectedDoa.nama}</h2>
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
              {loadingDetail ? (
                <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  <span className="text-sm font-medium">Memuat rincian doa...</span>
                </div>
              ) : (
                <>
                  {/* Teks Arab (Large Right Aligned) */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-right text-3xl font-serif leading-loose text-emerald-950 tracking-wide font-medium">
                    {selectedDoa.ar}
                  </div>

                  {/* Transliterasi Latin */}
                  <div className="bg-emerald-50/80 border-l-4 border-emerald-500 p-4 rounded-r-2xl text-emerald-950 text-sm font-semibold italic shadow-sm">
                    "{selectedDoa.tr}"
                  </div>

                  {/* Terjemahan Indonesia */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Terjemahan Bahasa Indonesia:
                    </div>
                    <div className="text-gray-800 text-sm leading-relaxed font-normal">
                      {selectedDoa.idn}
                    </div>
                  </div>

                  {/* Referensi Sumber Hadits */}
                  {selectedDoa.tentang && (
                    <div className="bg-amber-50/80 border border-amber-200/80 p-4 rounded-2xl text-amber-900 text-xs leading-relaxed space-y-1">
                      <div className="font-extrabold text-amber-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>Referensi Sumber Hadits / Keterangan:</span>
                      </div>
                      <div>{selectedDoa.tentang}</div>
                    </div>
                  )}

                  {/* Tags Badges */}
                  {Array.isArray(selectedDoa.tag) && selectedDoa.tag.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-2">
                      <span className="text-xs font-bold text-gray-400">Tag Keyword:</span>
                      {selectedDoa.tag.map((t, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-white text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 shadow-xs"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Konten Referensi Doa Resmi EQuran.id
              </span>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold rounded-xl transition-all"
              >
                Tutup Pembaca Doa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM ADD / EDIT DOA */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-300" />
                <span>{editingItem ? 'Edit Data Doa' : 'Tambah Doa Baru'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-emerald-100 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ID Doa</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Kategori / Grup Doa</label>
                  <input
                    type="text"
                    required
                    value={formData.grup}
                    onChange={(e) => setFormData({ ...formData, grup: e.target.value })}
                    placeholder="Contoh: Doa Sebelum dan Sesudah Tidur"
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Judul Doa</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Doa Sebelum Tidur"
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Teks Arab (dengan Harakat)</label>
                <textarea
                  rows="2"
                  dir="rtl"
                  value={formData.ar}
                  onChange={(e) => setFormData({ ...formData, ar: e.target.value })}
                  placeholder="بِسْمِكَ اللَّهُمَّ..."
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-serif text-right text-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Transliterasi Latin</label>
                <input
                  type="text"
                  value={formData.tr}
                  onChange={(e) => setFormData({ ...formData, tr: e.target.value })}
                  placeholder="Bismikallāhumma aḥyā..."
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Terjemahan Bahasa Indonesia</label>
                <textarea
                  rows="2"
                  value={formData.idn}
                  onChange={(e) => setFormData({ ...formData, idn: e.target.value })}
                  placeholder="Dengan nama-Mu ya Allah..."
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Referensi Sumber Hadits (Opsional)</label>
                <input
                  type="text"
                  value={formData.tentang}
                  onChange={(e) => setFormData({ ...formData, tentang: e.target.value })}
                  placeholder="Contoh: HR. Bukhari no. 6312"
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tag Keywords (pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={formData.tagInput}
                  onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                  placeholder="Contoh: tidur, malam, sebelum tidur"
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
                  <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Doa'}</span>
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
