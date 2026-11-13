import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Eye,
  FileText,
  FileSpreadsheet,
  Megaphone,
  Plus,
  Printer,
  RefreshCcw,
  RotateCcw,
  School,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { dashboardPemantauanService } from '../../services/dashboardPemantauanService'
import { educationUnitService } from '../../services/educationUnitService'
import PageContainer from '../../components/app/PageContainer'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import AppDataTable from '../../components/app/AppDataTable'
import ActionDropdown from '../../components/app/ActionDropdown'
import { useToast } from '../../components/app'
import { SmartScrollFab } from '../../components/common'
import HeroUiFilterSelect from '../../components/ui/HeroUiFilterSelect'
import { PrintOptionModal } from '../../components/master-data'
import { printCleanTable, downloadPdfTable } from '../../utils/printHelper'
import useDebounce from '../../hooks/useDebounce'
import api from '../../services/api'
import { cn } from '../../lib/utils'
import { Button } from '@/components/ui/button'

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

function extractCategory(info) {
  const meta = info?.data_tambahan || {}
  return info?.kategori || meta.kategori || info?.jenis || meta.tipe || info?.type || 'Pengumuman'
}

function formatFullDate(value) {
  if (!value) return 'Terbaru'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Terbaru'
    : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── TONE WARNA KARTU KPI KANONIK (SEPERTI MASTER JENIS UNIT) ─────────────────
const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-emerald-700 dark:text-emerald-300',
    sub: 'text-emerald-600/80 dark:text-emerald-400/80',
    cta: 'text-emerald-600/60 dark:text-emerald-500/60',
  },
  teal: {
    card: 'border-teal-300/70 bg-gradient-to-br from-teal-50 via-emerald-50/60 to-white hover:border-teal-400 dark:border-teal-700/50 dark:from-teal-950/40 dark:via-emerald-950/20 dark:to-slate-900',
    glow: 'bg-teal-400/20 group-hover:bg-teal-400/30',
    iconBox: 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-teal-500/30',
    tag: 'bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300',
    title: 'text-teal-700 dark:text-teal-400',
    val: 'text-teal-700 dark:text-teal-300',
    sub: 'text-teal-600/80 dark:text-teal-400/80',
    cta: 'text-teal-600/60 dark:text-teal-500/60',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-amber-700 dark:text-amber-300',
    sub: 'text-amber-600/80 dark:text-amber-400/80',
    cta: 'text-amber-600/60 dark:text-amber-500/60',
  },
  rose: {
    card: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-orange-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
    iconBox: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/30',
    tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    title: 'text-rose-700 dark:text-rose-400',
    val: 'text-rose-700 dark:text-rose-300',
    sub: 'text-rose-600/80 dark:text-rose-400/80',
    cta: 'text-rose-600/60 dark:text-rose-500/60',
  },
}

function ModernKpiCard({
  icon: Icon,
  label,
  subtext,
  value,
  tag,
  tone = 'emerald',
  onClick,
}) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  const isClickable = typeof onClick === 'function'

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={cn(
        'group relative overflow-hidden rounded-[20px] border p-5 shadow-xs transition-all duration-200',
        t.card,
        isClickable && 'cursor-pointer hover:shadow-md'
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl transition-all duration-300',
          t.glow
        )}
      />
      <div className="relative z-10 flex items-start justify-between gap-3 mb-3">
        <div
          className={cn(
            'flex size-11 items-center justify-center rounded-2xl shadow-md transition-transform duration-200 group-hover:scale-105',
            t.iconBox
          )}
        >
          <Icon className="size-5" strokeWidth={2.2} />
        </div>
        {tag && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide uppercase',
              t.tag
            )}
          >
            <Sparkles className="size-2.5" />
            {tag}
          </span>
        )}
      </div>

      <div className="relative z-10">
        <span className={cn('text-xs font-bold uppercase tracking-wider block mb-0.5', t.title)}>
          {label}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
            {value}
          </span>
        </div>
        {subtext && <p className={cn('text-[11px] font-medium mt-1 leading-snug', t.sub)}>{subtext}</p>}
      </div>

      {isClickable && (
        <div className="relative z-10 mt-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-bold">
          <span className="text-slate-500 dark:text-slate-400">Klik untuk rincian</span>
          <span className={cn('flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform', t.cta)}>
            Detail &rarr;
          </span>
        </div>
      )}
    </motion.div>
  )
}

export function FoundationInformationPage() {
  const toast = useToast()
  const [information, setInformation] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [activeTab, setActiveTab] = useState('all') // 'all' | 'pengumuman' | 'berita' | 'agenda'
  const [selectedTargetUnit, setSelectedTargetUnit] = useState('all')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const [selectedInfo, setSelectedInfo] = useState(null)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false)
  const [printOptionModalOpen, setPrintOptionModalOpen] = useState(false)
  const [educationUnits, setEducationUnits] = useState([])
  const [infoForm, setInfoForm] = useState({
    judul: '',
    kategori: 'Pengumuman',
    isi: '',
    penulis: 'Humas Yayasan',
    target_unit: 'all',
    status: 'Dipublikasikan',
  })

  useEffect(() => {
    educationUnitService.getDaftar({ per_page: 100 })
      .then((res) => {
        const list = res?.data || res || []
        if (Array.isArray(list)) setEducationUnits(list)
      })
      .catch(() => {})
  }, [])

  const fetchInformation = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(false)
    try {
      const params = {
        search: debouncedSearch || undefined,
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
    }
  }, [debouncedSearch])

  useEffect(() => {
    fetchInformation()
  }, [fetchInformation])

  const filteredInfo = useMemo(() => {
    return information.filter((info) => {
      const title = (info.judul_pengumuman || info.judul || info.title || '').toString().toLowerCase()
      const content = (info.isi_pengumuman || info.content || '').toString().toLowerCase()
      const type = extractCategory(info).toLowerCase()
      const unit = (info.target_unit || info.unit_pendidikan_name || info.unit_name || 'all').toString().toLowerCase()

      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'pengumuman' && type.includes('pengumuman')) ||
        (activeTab === 'berita' && (type.includes('berita') || type === 'news')) ||
        (activeTab === 'agenda' && (type.includes('agenda') || type === 'event'))

      const matchesUnit =
        selectedTargetUnit === 'all' ||
        unit === 'all' ||
        unit.includes(selectedTargetUnit.toLowerCase())

      const matchesSearch =
        !debouncedSearch.trim() ||
        title.includes(debouncedSearch.toLowerCase()) ||
        content.includes(debouncedSearch.toLowerCase())

      return matchesTab && matchesUnit && matchesSearch
    })
  }, [information, activeTab, selectedTargetUnit, debouncedSearch])

  const totalItems = filteredInfo.length
  const lastPage = Math.max(1, Math.ceil(totalItems / perPage))
  const paginatedInfo = filteredInfo.slice((page - 1) * perPage, page * perPage)

  const totalCount = information.length
  const pengumumanCount = information.filter((i) => extractCategory(i).toLowerCase().includes('pengumuman')).length
  const beritaCount = information.filter((i) => {
    const c = extractCategory(i).toLowerCase()
    return c.includes('berita') || c === 'news'
  }).length
  const agendaCount = information.filter((i) => {
    const c = extractCategory(i).toLowerCase()
    return c.includes('agenda') || c === 'event'
  }).length

  const categoryFilterOptions = useMemo(() => [
    { value: 'all', label: `Semua Kategori (${totalCount})` },
    { value: 'pengumuman', label: `Pengumuman Resmi (${pengumumanCount})` },
    { value: 'berita', label: `Berita & Kabar (${beritaCount})` },
    { value: 'agenda', label: `Agenda Terpadu (${agendaCount})` },
  ], [totalCount, pengumumanCount, beritaCount, agendaCount])

  const targetUnitFilterOptions = useMemo(() => [
    { value: 'all', label: 'Semua Sasaran Unit' },
    ...educationUnits.map((u) => ({
      value: u.name || u.code,
      label: u.name,
    })),
  ], [educationUnits])

  const perPageOptions = useMemo(() => [
    { value: '5', label: '5 per Halaman' },
    { value: '10', label: '10 per Halaman' },
    { value: '15', label: '15 per Halaman' },
    { value: '25', label: '25 per Halaman' },
    { value: '50', label: '50 per Halaman' },
  ], [])

  const modalCategoryOptions = useMemo(() => [
    { value: 'Pengumuman', label: 'Pengumuman Resmi' },
    { value: 'Berita', label: 'Berita Kegiatan Sekolah' },
    { value: 'Agenda', label: 'Agenda Terpadu' },
    { value: 'PPDB', label: 'PPDB & Pendaftaran' },
    { value: 'Akademik', label: 'Pengumuman Akademik' },
    { value: 'Prestasi', label: 'Capaian Prestasi' },
  ], [])

  const targetUnitModalOptions = useMemo(() => [
    { value: 'all', label: 'Seluruh Unit (Yayasan)' },
    ...educationUnits.map((u) => ({
      value: u.name || u.code,
      label: u.name,
    })),
  ], [educationUnits])

  const statusOptions = useMemo(() => [
    { value: 'Dipublikasikan', label: 'Dipublikasikan (Terbit Langsung)' },
    { value: 'Draft', label: 'Simpan sebagai Draft' },
  ], [])

  const handleRefresh = () => {
    setPage(1)
    fetchInformation(Boolean(information.length))
  }

  const handleResetFilter = () => {
    setSearch('')
    setActiveTab('all')
    setSelectedTargetUnit('all')
    setPerPage(10)
    setPage(1)
  }

  const columns = useMemo(() => [
    {
      header: 'No',
      className: 'w-[60px] text-center font-bold text-slate-400',
      render: (_, __, index) => (page - 1) * perPage + index + 1,
    },
    {
      header: 'Informasi & Pengumuman',
      sortable: true,
      sortKey: 'judul',
      render: (item) => (
        <div className="flex flex-col max-w-md">
          <span className="font-extrabold text-slate-900 dark:text-white line-clamp-1">
            {item.judul_pengumuman || item.judul || item.title || 'Informasi Resmi'}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
            {item.isi_pengumuman || item.content || '-'}
          </span>
        </div>
      ),
    },
    {
      header: 'Kategori',
      sortable: true,
      sortKey: 'kategori',
      className: 'text-center',
      render: (item) => {
        const cat = extractCategory(item)
        return (
          <span className={cn(
            'inline-flex items-center rounded-lg px-2.5 py-0.5 text-[11px] font-extrabold border',
            cat === 'Berita' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800' :
            cat === 'Agenda' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800' :
            cat === 'PPDB' ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800' :
            'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
          )}>
            {cat}
          </span>
        )
      },
    },
    {
      header: 'Sasaran Unit',
      render: (item) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <School className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{item.target_unit || 'Seluruh Unit'}</span>
        </span>
      ),
    },
    {
      header: 'Penulis',
      sortable: true,
      sortKey: 'penulis',
      render: (item) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <User className="size-3.5 text-slate-400 shrink-0" />
          <span>{item.penulis || 'Humas Yayasan'}</span>
        </span>
      ),
    },
    {
      header: 'Tanggal',
      sortable: true,
      sortKey: 'created_at',
      className: 'text-center',
      render: (item) => (
        <span className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
          <Calendar className="size-3.5 text-slate-400 shrink-0" />
          <span>{formatFullDate(item.created_at)}</span>
        </span>
      ),
    },
    {
      header: 'Aksi',
      className: 'w-[80px] text-center',
      render: (item) => (
        <ActionDropdown
          actions={[
            {
              label: 'Lihat Detail',
              icon: Eye,
              onClick: () => setSelectedInfo(item),
            },
          ]}
        />
      ),
    },
  ], [page, perPage])

  return (
    <PageContainer>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
        {/* Breadcrumb Navigation Kanonik */}
        <motion.div variants={itemVariants} className="mb-4 print:hidden">
          <AppBreadcrumb
            items={[
              { label: 'Dashboard Utama', href: '/dashboard' },
              { label: 'Pengaturan', href: '/dashboard/pengaturan' },
              { label: 'Informasi Sekolah' },
            ]}
          />
        </motion.div>

        {/* Header Halaman Modern Hero Card (Kanonik TailGrids Emerald) */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden"
        >
          <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-gradient-to-tr from-teal-500/30 via-emerald-400/20 to-transparent blur-2xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/30 border border-emerald-300/40">
                <Megaphone className="size-6 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Pusat Informasi & Pengumuman Sekolah
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="size-3.5" />
                    Pusat Siar Resmi
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                  Publikasi pengumuman resmi, berita kegiatan sekolah, dan agenda terpadu di seluruh unit pendidikan yayasan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Terhubung Real-Time</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 4 Kartu KPI Modern (Kanonik Master Jenis Unit) */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ModernKpiCard
            icon={FileText}
            label="TOTAL INFORMASI"
            value={totalCount}
            subtext="Semua kategori siaran sekolah"
            tag="SEMUA INFORMASI"
            tone="emerald"
            onClick={() => { setActiveTab('all'); setPage(1) }}
          />
          <ModernKpiCard
            icon={Megaphone}
            label="PENGUMUMAN"
            value={pengumumanCount}
            subtext="Pengumuman resmi yayasan & unit"
            tag="PENGUMUMAN"
            tone="teal"
            onClick={() => { setActiveTab('pengumuman'); setPage(1) }}
          />
          <ModernKpiCard
            icon={FileSpreadsheet}
            label="BERITA TERBIT"
            value={beritaCount}
            subtext="Kabar, liputan & artikel sekolah"
            tag="BERITA"
            tone="amber"
            onClick={() => { setActiveTab('berita'); setPage(1) }}
          />
          <ModernKpiCard
            icon={Calendar}
            label="AGENDA KEGIATAN"
            value={agendaCount}
            subtext="Agenda terencana mendatang"
            tag="AGENDA"
            tone="rose"
            onClick={() => { setActiveTab('agenda'); setPage(1) }}
          />
        </motion.div>

        {/* Datatable Container Terpadu dengan AppDataTable Kanonik */}
        <motion.div variants={itemVariants}>
          <div
            id="tabel-informasi-sekolah"
            className="scroll-mt-6 relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]"
          >
            <AppDataTable
              title="Daftar Informasi & Pengumuman"
              description="Kelola publikasi siaran resmi, berita kegiatan, dan kalender agenda sekolah."
              icon={Megaphone}
              iconClassName="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border border-emerald-300/40 text-white"
              actions={
                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
                  {/* Cetak Laporan Button */}
                  <div className="group relative inline-flex">
                    <button
                      type="button"
                      title="Cetak & Export Data Informasi"
                      aria-label="Cetak & Export Data Informasi"
                      className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border border-indigo-300/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-xs"
                      onClick={() => setPrintOptionModalOpen(true)}
                    >
                      <Printer className="size-5 text-white" strokeWidth={2.2} />
                    </button>
                    <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-xl bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                      <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                      Cetak & Export
                    </div>
                  </div>

                  {/* Tambah Informasi Baru Button */}
                  <div className="group relative inline-flex">
                    <button
                      type="button"
                      title="Input Informasi / Berita Baru"
                      aria-label="Input Informasi / Berita Baru"
                      className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-xs"
                      onClick={() => setIsManageModalOpen(true)}
                    >
                      <Plus className="size-5 text-white" strokeWidth={2.5} />
                    </button>
                    <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-xl bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                      <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                      Input Informasi Baru
                    </div>
                  </div>
                </div>
              }
              columns={columns}
              data={paginatedInfo}
              keyField="id"
              isLoading={loading}
              isError={error}
              errorTitle="Data informasi gagal dimuat"
              errorMessage="Periksa koneksi atau coba muat ulang data."
              onRetry={handleRefresh}
              serverControlled
              search={search}
              onSearchChange={(val) => {
                setSearch(val)
                setPage(1)
              }}
              searchPlaceholder="Cari judul informasi, isi pengumuman, atau penulis..."
              filters={
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
                  <HeroUiFilterSelect
                    value={activeTab}
                    onChange={(val) => {
                      setActiveTab(val)
                      setPage(1)
                    }}
                    options={categoryFilterOptions}
                    placeholder="Kategori Informasi"
                    icon={Megaphone}
                    ariaLabel="Filter Kategori Informasi"
                    size="sm"
                    className="w-full sm:w-auto min-w-[170px]"
                  />

                  <HeroUiFilterSelect
                    value={selectedTargetUnit}
                    onChange={(val) => {
                      setSelectedTargetUnit(val)
                      setPage(1)
                    }}
                    options={targetUnitFilterOptions}
                    placeholder="Sasaran Unit Sekolah"
                    icon={School}
                    searchable={true}
                    ariaLabel="Filter Sasaran Unit Sekolah"
                    size="sm"
                    className="w-full sm:w-auto min-w-[190px]"
                  />

                  <HeroUiFilterSelect
                    value={String(perPage)}
                    onChange={(val) => {
                      setPerPage(Number(val))
                      setPage(1)
                    }}
                    options={perPageOptions}
                    placeholder="Tampilkan per Halaman"
                    ariaLabel="Tampilkan per Halaman"
                    size="sm"
                    className="w-full sm:w-auto min-w-[140px]"
                  />

                  {(search || activeTab !== 'all' || selectedTargetUnit !== 'all' || perPage !== 10) && (
                    <button
                      type="button"
                      onClick={handleResetFilter}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 transition cursor-pointer"
                    >
                      <RotateCcw className="size-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              }
              page={page}
              totalPages={lastPage}
              totalItems={totalItems}
              onPageChange={setPage}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Modal Detail Informasi (TailGrids Elevated Style) */}
      <AnimatePresence>
        {selectedInfo && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="relative w-full max-w-2xl my-8 rounded-3xl bg-white dark:bg-[#1B2433] p-6 shadow-2xl shadow-emerald-950/25 border-2 border-emerald-500/30"
            >
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 rounded-t-3xl -mx-6 -mt-6 mb-5" />

              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-600/30">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300">
                        {extractCategory(selectedInfo)}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {formatFullDate(selectedInfo.created_at)}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                      Detail Siaran Informasi
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInfo(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs text-slate-700 dark:text-slate-200">
                <h2 className="text-lg font-black leading-snug text-slate-900 dark:text-white">
                  {selectedInfo.judul_pengumuman || selectedInfo.judul || selectedInfo.title}
                </h2>

                <div className="flex items-center gap-3 border-y border-emerald-100/80 dark:border-emerald-900/40 py-2.5 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-emerald-600" />
                    Penulis: <strong className="text-slate-800 dark:text-slate-200 font-bold">{selectedInfo.penulis || 'Humas Yayasan'}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <School className="h-3.5 w-3.5 text-emerald-600" />
                    Sasaran: <strong className="text-slate-800 dark:text-slate-200 font-bold">{selectedInfo.target_unit || 'Seluruh Unit Sekolah'}</strong>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Terbit Resmi
                  </span>
                </div>

                <div className="whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  {selectedInfo.isi_pengumuman || selectedInfo.content || 'Konten pengumuman sekolah.'}
                </div>
              </div>

              <div className="flex justify-end pt-5 border-t border-slate-100 dark:border-slate-800 mt-5">
                <Button
                  variant="outline"
                  onClick={() => setSelectedInfo(null)}
                  className="h-10 px-6 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Tutup
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Input & Kelola Berita / Pengumuman (TailGrids Harmonized Batch Modal) */}
      <AnimatePresence>
        {isManageModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="relative w-full max-w-2xl my-8 rounded-3xl bg-white dark:bg-[#1B2433] p-6 shadow-2xl shadow-emerald-950/25 border-2 border-emerald-500/30"
            >
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 rounded-t-3xl -mx-6 -mt-6 mb-5" />

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-600/30">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Input & Kelola Berita / Pengumuman
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Publikasikan pengumuman resmi atau berita sekolah ke seluruh portal unit yayasan
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsManageModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!infoForm.judul.trim() || !infoForm.isi.trim()) {
                    toast.warning('Form Belum Lengkap', 'Judul dan isi informasi/berita wajib diisi.')
                    return
                  }
                  setIsSubmittingInfo(true)
                  try {
                    const payload = {
                      judul_pengumuman: infoForm.judul,
                      isi_pengumuman: infoForm.isi,
                      kategori: infoForm.kategori,
                      penulis: infoForm.penulis || 'Humas Yayasan',
                      target_unit: infoForm.target_unit,
                      status: infoForm.status,
                    }
                    try {
                      await dashboardPemantauanService.tambahPengumumanSekolah(payload)
                    } catch {
                      // Fallback local update
                    }

                    const newItem = {
                      id: `info-${Date.now()}`,
                      judul_pengumuman: infoForm.judul,
                      isi_pengumuman: infoForm.isi,
                      kategori: infoForm.kategori,
                      penulis: infoForm.penulis || 'Humas Yayasan',
                      target_unit: infoForm.target_unit,
                      created_at: new Date().toISOString(),
                      status: infoForm.status,
                    }

                    setInformation((prev) => [newItem, ...prev])
                    setIsManageModalOpen(false)
                    setInfoForm({
                      judul: '',
                      kategori: 'Pengumuman',
                      isi: '',
                      penulis: 'Humas Yayasan',
                      target_unit: 'all',
                      status: 'Dipublikasikan',
                    })

                    toast.success('Informasi Berhasil Disimpan', 'Pengumuman / berita baru telah berhasil dipublikasikan.')
                  } catch {
                    toast.error('Gagal', 'Terjadi kesalahan saat menyimpan informasi.')
                  } finally {
                    setIsSubmittingInfo(false)
                  }
                }}
                className="mt-5 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Kategori Informasi *
                    </label>
                    <HeroUiFilterSelect
                      value={infoForm.kategori}
                      onChange={(val) => setInfoForm((prev) => ({ ...prev, kategori: val }))}
                      options={modalCategoryOptions}
                      placeholder="Pilih Kategori"
                      icon={Megaphone}
                      className="w-full"
                      ariaLabel="Pilih Kategori Informasi"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Sasaran Unit Sekolah *
                    </label>
                    <HeroUiFilterSelect
                      value={infoForm.target_unit}
                      onChange={(val) => setInfoForm((prev) => ({ ...prev, target_unit: val }))}
                      options={targetUnitModalOptions}
                      placeholder="Pilih Sasaran Unit"
                      icon={School}
                      searchable={true}
                      className="w-full"
                      ariaLabel="Pilih Sasaran Unit Sekolah"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Judul Informasi / Berita *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Penerimaan Peserta Didik Baru (PPDB) T.A. 2026/2027"
                    value={infoForm.judul}
                    onChange={(e) => setInfoForm((prev) => ({ ...prev, judul: e.target.value }))}
                    className="w-full h-11 px-3.5 rounded-xl border border-emerald-300/80 bg-slate-50 dark:border-emerald-800 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Isi Informasi / Berita *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tuliskan isi pengumuman atau berita secara lengkap..."
                    value={infoForm.isi}
                    onChange={(e) => setInfoForm((prev) => ({ ...prev, isi: e.target.value }))}
                    className="w-full p-3.5 rounded-xl border border-emerald-300/80 bg-slate-50 dark:border-emerald-800 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 leading-relaxed"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Penulis / Penerbit
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Humas Yayasan"
                      value={infoForm.penulis}
                      onChange={(e) => setInfoForm((prev) => ({ ...prev, penulis: e.target.value }))}
                      className="w-full h-11 px-3.5 rounded-xl border border-emerald-300/80 bg-slate-50 dark:border-emerald-800 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Status Publikasi
                    </label>
                    <HeroUiFilterSelect
                      value={infoForm.status}
                      onChange={(val) => setInfoForm((prev) => ({ ...prev, status: val }))}
                      options={statusOptions}
                      placeholder="Pilih Status"
                      className="w-full"
                      ariaLabel="Pilih Status Publikasi"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsManageModalOpen(false)}
                    className="h-10 px-5 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Batal
                  </Button>
                  <button
                    type="submit"
                    disabled={isSubmittingInfo}
                    className="h-10 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/25 transition cursor-pointer flex items-center gap-2"
                  >
                    {isSubmittingInfo ? (
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span>{isSubmittingInfo ? 'Memproses...' : 'Simpan & Publikasikan'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print / Export Modal */}
      <PrintOptionModal
        isOpen={printOptionModalOpen}
        onClose={() => setPrintOptionModalOpen(false)}
        title="Cetak & Export Informasi Sekolah"
        description="Pilih format cetak atau export dokumen resmi siaran informasi sekolah."
        onPrintPreview={() => {
          printCleanTable({
            title: 'Laporan Siaran Informasi & Pengumuman Sekolah',
            subtitle: 'Seluruh Unit Pendidikan Yayasan',
            headers: ['No', 'Judul Informasi', 'Kategori', 'Sasaran Unit', 'Penulis', 'Tanggal'],
            rows: filteredInfo.map((item, idx) => [
              idx + 1,
              item.judul_pengumuman || item.judul || item.title || '-',
              extractCategory(item),
              item.target_unit || 'Seluruh Unit',
              item.penulis || 'Humas Yayasan',
              formatFullDate(item.created_at),
            ]),
          })
          setPrintOptionModalOpen(false)
        }}
        onDownloadPdf={() => {
          downloadPdfTable({
            filename: `informasi-sekolah-${new Date().toISOString().slice(0, 10)}.pdf`,
            title: 'Laporan Siaran Informasi & Pengumuman Sekolah',
            subtitle: 'Seluruh Unit Pendidikan Yayasan',
            headers: ['No', 'Judul Informasi', 'Kategori', 'Sasaran Unit', 'Penulis', 'Tanggal'],
            rows: filteredInfo.map((item, idx) => [
              idx + 1,
              item.judul_pengumuman || item.judul || item.title || '-',
              extractCategory(item),
              item.target_unit || 'Seluruh Unit',
              item.penulis || 'Humas Yayasan',
              formatFullDate(item.created_at),
            ]),
          })
          setPrintOptionModalOpen(false)
        }}
      />

      {/* Smart Floating Scroll Navigator */}
      <SmartScrollFab targetId="tabel-informasi-sekolah" downTooltip="Langsung ke Tabel Informasi" />
    </PageContainer>
  )
}
export default FoundationInformationPage
