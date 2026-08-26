import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Eye,
  FileText,
  LayoutGrid,
  Megaphone,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Table as TableIcon,
  User,
} from 'lucide-react'
import { ArrowBothDirectionHorizontal2 } from '@tailgrids/icons'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import api from '../../services/api'
import {
  MasterBadge,
  MasterDataPage,
  MasterDataTable,
  MasterDetailModal,
  MasterEmptyState,
  MasterErrorState,
  MasterFilterBar,
  MasterFilterSelect,
  MasterPagination,
  MasterSearchInput,
  MasterStatCard,
  MasterStatsGrid,
  masterStyles,
} from '../../components/master-data'

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

function categoryVariant(category) {
  const key = (category || '').toLowerCase()
  if (key.includes('berita')) return 'info'
  if (key.includes('agenda')) return 'warning'
  return 'success'
}

function formatFullDate(value) {
  if (!value) return 'Terbaru'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Terbaru' : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function FoundationInformationPage() {
  const [information, setInformation] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  const [activeTab, setActiveTab] = useState('all') // 'all' | 'pengumuman' | 'berita' | 'agenda'
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [viewMode, setViewMode] = useState('table') // 'table' | 'grid'
  const [sortKey, setSortKey] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  const [selectedInfo, setSelectedInfo] = useState(null)

  const fetchInformation = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setIsFetching(true)
    setError(false)
    try {
      const params = {
        search: search || undefined,
        per_page: 100,
      }
      const res = await api.get('/foundation/information', { params })
      const resData = res.data
      let list = []
      if (Array.isArray(resData)) {
        list = resData
      } else if (resData?.data) {
        list = Array.isArray(resData.data) ? resData.data : resData.data.data || []
      }
      setInformation(list)
    } catch (err) {
      console.error('Failed to fetch foundation information:', err)
      setError(true)
    } finally {
      setLoading(false)
      setIsFetching(false)
    }
  }, [search])

  useEffect(() => {
    fetchInformation()
  }, [fetchInformation])

  const filteredInfo = useMemo(() => information.filter((info) => {
    const title = (info.judul_pengumuman || info.judul || info.title || '').toString().toLowerCase()
    const content = (info.isi_pengumuman || info.content || '').toString().toLowerCase()
    const type = (info.kategori || info.jenis || 'pengumuman').toString().toLowerCase()

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'pengumuman' && type.includes('pengumuman')) ||
      (activeTab === 'berita' && type.includes('berita')) ||
      (activeTab === 'agenda' && type.includes('agenda'))

    const matchesSearch = title.includes(search.toLowerCase()) || content.includes(search.toLowerCase())

    return matchesTab && matchesSearch
  }), [information, activeTab, search])

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const sortedInfo = useMemo(() => {
    return [...filteredInfo].sort((a, b) => {
      let aVal = ''
      let bVal = ''

      if (sortKey === 'judul') {
        aVal = (a.judul_pengumuman || a.judul || a.title || '').toString().toLowerCase()
        bVal = (b.judul_pengumuman || b.judul || b.title || '').toString().toLowerCase()
      } else if (sortKey === 'kategori') {
        aVal = (a.kategori || a.jenis || '').toString().toLowerCase()
        bVal = (b.kategori || b.jenis || '').toString().toLowerCase()
      } else if (sortKey === 'penulis') {
        aVal = (a.penulis || 'Humas Yayasan').toString().toLowerCase()
        bVal = (b.penulis || 'Humas Yayasan').toString().toLowerCase()
      } else if (sortKey === 'created_at') {
        aVal = new Date(a.created_at || 0).getTime()
        bVal = new Date(b.created_at || 0).getTime()
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredInfo, sortKey, sortOrder])

  const totalItems = sortedInfo.length
  const lastPage = Math.max(1, Math.ceil(totalItems / perPage))
  const paginatedInfo = sortedInfo.slice((page - 1) * perPage, page * perPage)

  const totalCount = information.length
  const pengumumanCount = information.filter((i) => (i.kategori || i.jenis || 'pengumuman').toLowerCase().includes('pengumuman')).length
  const beritaCount = information.filter((i) => (i.kategori || i.jenis || '').toLowerCase().includes('berita')).length
  const agendaCount = information.filter((i) => (i.kategori || i.jenis || '').toLowerCase().includes('agenda')).length

  const handleRefresh = () => {
    setPage(1)
    fetchInformation(Boolean(information.length))
  }

  return (
    <MasterDataPage hideBreadcrumb className="foundation-information-page">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
        {/* Breadcrumb Navigation */}
        <motion.div variants={itemVariants} className="print:hidden">
          <AppBreadcrumb items={[{ label: 'Yayasan', href: '/dashboard/yayasan' }, { label: 'Informasi Sekolah' }]} />
        </motion.div>

        {/* Header Halaman Modern Hero Card */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden">
          {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <Megaphone className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Pusat Informasi & Pengumuman Sekolah
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Informasi Yayasan
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Publikasi pengumuman resmi, berita kegiatan sekolah, dan agenda terpadu di seluruh unit pendidikan yayasan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Informasi Realtime</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stat Cards Ringkasan Informasi */}
        <motion.div variants={itemVariants}>
          <MasterStatsGrid>
            <MasterStatCard
              icon={FileText}
              label="Total Informasi"
              value={totalCount}
              description="Semua kategori"
              variant="success"
              delay={40}
              active={activeTab === 'all'}
              onClick={() => { setActiveTab('all'); setPage(1) }}
            />
            <MasterStatCard
              icon={Megaphone}
              label="Pengumuman"
              value={pengumumanCount}
              description="Pengumuman resmi"
              variant="info"
              delay={80}
              active={activeTab === 'pengumuman'}
              onClick={() => { setActiveTab('pengumuman'); setPage(1) }}
            />
            <MasterStatCard
              icon={FileText}
              label="Berita Terbit"
              value={beritaCount}
              description="Berita sekolah"
              variant="warning"
              delay={120}
              active={activeTab === 'berita'}
              onClick={() => { setActiveTab('berita'); setPage(1) }}
            />
            <MasterStatCard
              icon={Calendar}
              label="Agenda"
              value={agendaCount}
              description="Agenda mendatang"
              variant="neutral"
              delay={160}
              active={activeTab === 'agenda'}
              onClick={() => { setActiveTab('agenda'); setPage(1) }}
            />
          </MasterStatsGrid>
        </motion.div>

        {/* Filter Bar */}
        <motion.div variants={itemVariants}>
          <MasterFilterBar
            search={<MasterSearchInput placeholder="Cari judul atau isi pengumuman/berita..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />}
            filters={
              <>
                <MasterFilterSelect value={activeTab} onChange={(e) => { setActiveTab(e.target.value); setPage(1) }} aria-label="Filter kategori">
                  <option value="all">Semua ({totalCount})</option>
                  <option value="pengumuman">Pengumuman ({pengumumanCount})</option>
                  <option value="berita">Berita ({beritaCount})</option>
                  <option value="agenda">Agenda ({agendaCount})</option>
                </MasterFilterSelect>
                <MasterFilterSelect value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1) }} aria-label="Tampilkan per halaman">
                  <option value={5}>5 per Halaman</option>
                  <option value={10}>10 per Halaman</option>
                  <option value={15}>15 per Halaman</option>
                  <option value={25}>25 per Halaman</option>
                  <option value={50}>50 per Halaman</option>
                </MasterFilterSelect>
                <a
                  href="/dashboard/berita-informasi"
                  className="inline-flex h-12 items-center justify-center gap-2 px-4 rounded-[var(--master-control-radius,14px)] bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-sm transition"
                >
                  <Megaphone className="h-4 w-4" />
                  <span>Input / Kelola Berita</span>
                </a>
                <button
                  type="button"
                  onClick={handleRefresh}
                  aria-label="Muat ulang data"
                  title="Muat ulang"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--master-control-radius,14px)] border border-slate-200 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-emerald-950/40"
                >
                  <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                </button>
              </>
            }
          />
        </motion.div>

        {/* Content DataTable / Cards */}
        <motion.div variants={itemVariants}>
          <MasterDataTable className="foundation-table">
            <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-700">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Daftar Informasi & Pengumuman</h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Data pengumuman resmi dan berita terkini yayasan.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">{totalItems} informasi</span>
                <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${viewMode === 'table' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                    title="Tampilan Tabel"
                  >
                    <TableIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Tabel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${viewMode === 'grid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                    title="Tampilan Kartu"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Kartu</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {error ? (
                <div className="p-5">
                  <MasterErrorState title="Informasi gagal dimuat" description="Periksa koneksi kemudian coba muat ulang." onRetry={handleRefresh} />
                </div>
              ) : loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                  <p className="mt-2 text-xs font-semibold text-slate-500">Memuat data informasi...</p>
                </div>
              ) : paginatedInfo.length === 0 ? (
                <div className="p-5">
                  <MasterEmptyState title="Belum ada informasi" description="Ubah filter pencarian untuk menampilkan pengumuman atau berita lain." />
                </div>
              ) : viewMode === 'table' ? (
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="border-b-2 border-emerald-200/90 bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 text-[10px] font-black uppercase tracking-[0.12em] text-slate-800 dark:text-slate-100">
                    <tr>
                      <th className="w-[5%] px-2 py-3 text-center">No</th>
                      <th className="w-[45%] px-3 py-3 font-bold">
                        <button
                          type="button"
                          onClick={() => handleSort('judul')}
                          className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                        >
                          <span>Judul & Isi Informasi</span>
                          <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'judul' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
                        </button>
                      </th>
                      <th className="w-[15%] px-3 py-3 text-center font-bold">
                        <button
                          type="button"
                          onClick={() => handleSort('kategori')}
                          className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white mx-auto"
                        >
                          <span>Kategori</span>
                          <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'kategori' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
                        </button>
                      </th>
                      <th className="hidden w-[15%] px-3 py-3 font-bold md:table-cell">
                        <button
                          type="button"
                          onClick={() => handleSort('penulis')}
                          className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                        >
                          <span>Penulis</span>
                          <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'penulis' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
                        </button>
                      </th>
                      <th className="hidden w-[12%] px-3 py-3 text-center font-bold sm:table-cell">
                        <button
                          type="button"
                          onClick={() => handleSort('created_at')}
                          className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white mx-auto"
                        >
                          <span>Tanggal</span>
                          <ArrowBothDirectionHorizontal2 className={`h-3 w-3 shrink-0 transition-transform duration-200 ${sortKey === 'created_at' ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400'}`} />
                        </button>
                      </th>
                      <th className="w-[8%] px-3 py-3 text-center font-bold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/70 text-xs">
                    {paginatedInfo.map((info, idx) => {
                      const title = info.judul_pengumuman || info.judul || info.title || 'Informasi Resmi'
                      const content = info.isi_pengumuman || info.content || 'Konten informasi sekolah.'
                      const category = info.kategori || info.jenis || 'Pengumuman'
                      return (
                        <tr key={info.id || idx} className="border-b border-slate-100/80 transition-colors hover:bg-emerald-50/40 dark:border-slate-800/70 dark:hover:bg-emerald-950/20">
                          <td className="px-2 py-3.5 text-center font-bold text-slate-500">
                            {(page - 1) * perPage + idx + 1}
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                                {title}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {content}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            <MasterBadge variant={categoryVariant(category)}>
                              {category}
                            </MasterBadge>
                          </td>
                          <td className="hidden px-3 py-3.5 text-slate-700 dark:text-slate-300 font-medium md:table-cell">
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-slate-400" />
                              <span>{info.penulis || 'Humas Yayasan'}</span>
                            </div>
                          </td>
                          <td className="hidden px-3 py-3.5 text-center text-slate-600 dark:text-slate-400 font-medium text-xs sm:table-cell">
                            <div className="flex items-center justify-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              <span>{formatFullDate(info.created_at)}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedInfo(info)}
                              className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-700/60 dark:bg-emerald-950/50 dark:text-emerald-300 cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Detail</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedInfo.map((info, idx) => {
                    const title = info.judul_pengumuman || info.judul || info.title || 'Informasi Resmi'
                    const content = info.isi_pengumuman || info.content || 'Konten informasi sekolah.'
                    const category = info.kategori || info.jenis || 'Pengumuman'
                    return (
                      <article key={info.id || idx} className={`${masterStyles.card} flex flex-col justify-between p-6 transition hover:-translate-y-0.5`}>
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <MasterBadge variant={categoryVariant(category)}>{category}</MasterBadge>
                            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatFullDate(info.created_at)}
                            </span>
                          </div>
                          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 dark:text-white">{title}</h3>
                          <p className="line-clamp-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{content}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                            <User className="h-3 w-3" />
                            {info.penulis || 'Humas Yayasan'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedInfo(info)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 cursor-pointer"
                          >
                            Baca Detail
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </div>

            {totalItems > 0 && !error && !loading && (
              <MasterPagination
                meta={{ total: totalItems, from: totalItems ? (page - 1) * perPage + 1 : 0, to: Math.min(page * perPage, totalItems), last_page: lastPage, current_page: page }}
                page={page}
                onPageChange={setPage}
                label="informasi"
              />
            )}
          </MasterDataTable>
        </motion.div>
      </motion.div>

      {/* Modal Detail Informasi */}
      <MasterDetailModal
        isOpen={Boolean(selectedInfo)}
        onClose={() => setSelectedInfo(null)}
        icon={Megaphone}
        title={selectedInfo ? (selectedInfo.kategori || selectedInfo.jenis || 'Pengumuman') : ''}
        description={selectedInfo ? formatFullDate(selectedInfo.created_at) : ''}
        maxWidth="max-w-2xl"
        footer={(
          <div className="flex justify-end">
            <button type="button" onClick={() => setSelectedInfo(null)} className="h-11 rounded-xl bg-emerald-800 px-5 text-xs font-semibold text-white transition hover:bg-emerald-900 cursor-pointer">Tutup</button>
          </div>
        )}
      >
        {selectedInfo && (
          <div className="space-y-4 p-6 text-xs text-slate-700 dark:text-slate-200">
            <h2 className="text-lg font-black leading-snug text-slate-900 dark:text-white">
              {selectedInfo.judul_pengumuman || selectedInfo.judul || selectedInfo.title}
            </h2>
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 text-[11px] text-slate-400 dark:border-slate-800">
              <span>Penulis: <strong className="text-slate-700 dark:text-slate-200">{selectedInfo.penulis || 'Humas Yayasan'}</strong></span>
              <span>•</span>
              <span>Status: <MasterBadge variant="success">Terbit Resmi</MasterBadge></span>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed">
              {selectedInfo.isi_pengumuman || selectedInfo.content || 'Konten pengumuman sekolah.'}
            </div>
          </div>
        )}
      </MasterDetailModal>
    </MasterDataPage>
  )
}
