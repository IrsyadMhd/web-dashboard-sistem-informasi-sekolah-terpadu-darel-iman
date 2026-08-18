import { useCallback, useEffect, useMemo, useState } from 'react'
import { Calendar, FileSpreadsheet, FileText, Megaphone, RefreshCcw, ShieldAlert, User } from 'lucide-react'
import api from '../../services/api'
import {
  MasterActionButton,
  MasterBadge,
  MasterDataPage,
  MasterDetailModal,
  MasterEmptyState,
  MasterErrorState,
  MasterFilterBar,
  MasterFilterSelect,
  MasterPageHeader,
  MasterPagination,
  MasterSearchInput,
  MasterStatCard,
  MasterStatsGrid,
  masterStyles,
} from '../../components/master-data'
import { FoundationExportModal } from '../../components/foundation/FoundationExportModal'

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
  const perPage = 9

  const [selectedInfo, setSelectedInfo] = useState(null)
  const [showExport, setShowExport] = useState(false)

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

  const totalItems = filteredInfo.length
  const lastPage = Math.max(1, Math.ceil(totalItems / perPage))
  const paginatedInfo = filteredInfo.slice((page - 1) * perPage, page * perPage)

  const totalCount = information.length
  const pengumumanCount = information.filter((i) => (i.kategori || i.jenis || 'pengumuman').toLowerCase().includes('pengumuman')).length
  const beritaCount = information.filter((i) => (i.kategori || i.jenis || '').toLowerCase().includes('berita')).length
  const agendaCount = information.filter((i) => (i.kategori || i.jenis || '').toLowerCase().includes('agenda')).length

  const handleRefresh = () => {
    setPage(1)
    fetchInformation(Boolean(information.length))
  }

  const exportRows = paginatedInfo.map((info, idx) => ({
    No: (page - 1) * perPage + idx + 1,
    Judul: info.judul_pengumuman || info.judul || info.title || '-',
    Kategori: info.kategori || info.jenis || 'Pengumuman',
    Penulis: info.penulis || 'Humas Yayasan',
    'Tanggal Publikasi': formatFullDate(info.created_at),
  }))

  return (
    <MasterDataPage hideBreadcrumb className="foundation-information-page">
      <MasterPageHeader
        title="Informasi Sekolah"
        description="Lihat berita, pengumuman, agenda, dan informasi resmi dari seluruh Unit Pendidikan Dar el-Iman."
        tone="brand"
        icon={Megaphone}
        actions={(
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
              <ShieldAlert className="h-3 w-3" />
              Mode Monitoring • Akses Read-Only
            </span>
            <MasterActionButton variant="export" icon={FileSpreadsheet} onClick={() => setShowExport(true)}>
              Export Data
            </MasterActionButton>
          </>
        )}
      />

      <MasterStatsGrid>
        <MasterStatCard icon={FileText} label="Total Informasi" value={totalCount} description="Semua kategori" variant="success" delay={40} />
        <MasterStatCard icon={Megaphone} label="Pengumuman" value={pengumumanCount} description="Pengumuman resmi" variant="info" delay={80} />
        <MasterStatCard icon={FileText} label="Berita Terbit" value={beritaCount} description="Berita sekolah" variant="warning" delay={120} />
        <MasterStatCard icon={Calendar} label="Agenda" value={agendaCount} description="Agenda mendatang" variant="neutral" delay={160} />
      </MasterStatsGrid>

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

      {error ? (
        <MasterErrorState title="Informasi gagal dimuat" description="Periksa koneksi kemudian coba muat ulang." onRetry={handleRefresh} />
      ) : loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`${masterStyles.card} animate-pulse p-6`}><div className="h-5 w-24 rounded-full bg-slate-100 dark:bg-slate-800" /><div className="mt-4 h-4 w-full rounded-xl bg-slate-100 dark:bg-slate-800" /><div className="mt-2 h-4 w-3/4 rounded-xl bg-slate-100 dark:bg-slate-800" /><div className="mt-6 h-8 w-28 rounded-xl bg-slate-100 dark:bg-slate-800" /></div>
          ))}
        </div>
      ) : paginatedInfo.length === 0 ? (
        <MasterEmptyState title="Belum ada informasi" description="Ubah filter pencarian untuk menampilkan pengumuman atau berita lain." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedInfo.map((info, idx) => {
              const title = info.judul_pengumuman || info.judul || info.title || 'Informasi Resmi'
              const content = info.isi_pengumuman || info.content || 'Konten informasi sekolah.'
              const category = info.kategori || info.jenis || 'Pengumuman'
              return (
                <article key={info.id || idx} className={`${masterStyles.card} ui-enter flex flex-col justify-between p-6 transition hover:-translate-y-0.5`}>
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
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                    >
                      Baca Detail
                    </button>
                  </div>
                </article>
              )
            })}
          </div>

          {totalItems > 0 && (
            <MasterPagination
              meta={{ total: totalItems, from: totalItems ? (page - 1) * perPage + 1 : 0, to: Math.min(page * perPage, totalItems), last_page: lastPage, current_page: page }}
              page={page}
              onPageChange={setPage}
              label="informasi"
            />
          )}
        </>
      )}

      <MasterDetailModal
        isOpen={Boolean(selectedInfo)}
        onClose={() => setSelectedInfo(null)}
        icon={Megaphone}
        title={selectedInfo ? (selectedInfo.kategori || selectedInfo.jenis || 'Pengumuman') : ''}
        description={selectedInfo ? formatFullDate(selectedInfo.created_at) : ''}
        maxWidth="max-w-2xl"
        footer={(
          <div className="flex justify-end">
            <button type="button" onClick={() => setSelectedInfo(null)} className="h-11 rounded-xl bg-emerald-800 px-5 text-xs font-semibold text-white transition hover:bg-emerald-900">Tutup</button>
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

      <FoundationExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        title="Informasi Sekolah Seluruh Yayasan"
        rows={exportRows}
        filename="Informasi_Sekolah_Yayasan"
      />
    </MasterDataPage>
  )
}
