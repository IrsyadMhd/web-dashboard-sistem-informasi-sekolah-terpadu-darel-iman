import React, { useState, useEffect, useMemo } from 'react'
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
} from 'lucide-react'
import Swal from 'sweetalert2'
import ActionDropdown from '../components/app/ActionDropdown'
import { equranService } from '../services/equranService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  MasterActionButton,
  MasterDataPage,
  MasterPageHeader,
  MasterStatsGrid,
  MasterStatCard,
} from '../components/master-data'

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
      <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Doa Harian' }]} />
      <MasterDataPage className="education-unit-page doa-master-page" hideBreadcrumb>
      {/* Master Canonical Page Header */}
      <MasterPageHeader
        tone="brand"
        icon={BookOpen}
        title="Kelola Data Do'a & Dzikir"
        description="Kumpulan doa-doa harian, dzikir, dan referensi hadits terintegrasi dengan database EQuran.id."
        actions={
          <>
            <MasterActionButton variant="secondary" icon={RefreshCw} disabled={syncing} onClick={handleSync}>
              {syncing ? 'Menyinkronkan...' : 'Sync EQuran.id'}
            </MasterActionButton>
            <MasterActionButton icon={Plus} onClick={handleOpenAdd}>
              Tambah Doa Manual
            </MasterActionButton>
          </>
        }
      />

      {/* Summary Cards */}
      <MasterStatsGrid className="education-unit-kpis">
        <MasterStatCard icon={Layers} label="Total Doa DB" value={displayStats.totalDoa} description="Tersimpan di database" variant="success" delay={40} />
        <MasterStatCard icon={Bookmark} label="Kategori / Grup" value={displayStats.totalGrup} description="Grup doa harian" variant="info" delay={80} />
        <MasterStatCard icon={Tag} label="Total Tag Unik" value={displayStats.totalTag} description="Tag pencarian doa" variant="warning" delay={120} />
        <MasterStatCard icon={ShieldCheck} label="Referensi Hadits" value={displayStats.totalHadits} description="Disertai sumber hadits" variant="neutral" delay={160} />
      </MasterStatsGrid>

      {/* Toolbar Search & Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ID, judul, arab, latin, atau tag..."
            className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Grup/Kategori:</span>
            <select
              value={grupFilter}
              onChange={(e) => setGrupFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Grup</option>
              {grupOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Tag:</span>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize"
            >
              <option value="all">Semua Tag</option>
              {tagOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Data Doa */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-sm font-medium">Memuat data doa & dzikir dari database...</span>
          </div>
        ) : filteredDoas.length === 0 ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
            <BookOpen className="w-10 h-10 text-gray-300" />
            <span className="text-base font-semibold text-gray-600">Tidak ada data doa ditemukan</span>
            <p className="text-xs text-gray-400">Silakan klik "Sync Data Doa" untuk menarik daftar dari EQuran.id</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-center w-14">ID</th>
                  <th className="px-4 py-3">Nama Doa & Grup</th>
                  <th className="px-4 py-3">Teks Arab, Transliterasi & Terjemahan</th>
                  <th className="px-4 py-3">Tag Filtering</th>
                  <th className="px-4 py-3 text-center w-40">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDoas.map((doa) => (
                  <tr key={doa.id} className="hover:bg-emerald-50/40 transition-colors group">
                    <td className="px-4 py-3 font-extrabold text-emerald-800 text-center bg-gray-50/50">
                      #{doa.id}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleOpenDetail(doa)}
                        className="text-left font-bold text-gray-900 group-hover:text-emerald-700 flex flex-col hover:underline focus:outline-none"
                      >
                        <span className="text-base flex items-center gap-1.5">
                          {doa.nama}
                          <Eye className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </span>
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                          <Bookmark className="w-3 h-3" />
                          {doa.grup || 'Doa Harian'}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 max-w-md space-y-1.5">
                      {doa.ar && (
                        <div className="text-right font-semibold text-xl text-emerald-800 font-serif leading-relaxed">
                          {doa.ar}
                        </div>
                      )}
                      {doa.tr && (
                        <div className="text-xs text-emerald-950 font-semibold italic">
                          "{doa.tr}"
                        </div>
                      )}
                      {doa.idn && (
                        <div className="text-xs text-gray-600 line-clamp-2">
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
                              className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/60"
                            >
                              #{t}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
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
