import React, { useState, useEffect, useMemo } from 'react'
import {
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  Building2,
  Calendar,
  BookOpen,
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Globe,
} from 'lucide-react'
import { Download1, Upload1, ArrowBothDirectionHorizontal2 } from '@tailgrids/icons'
import { useAuthStore } from '../stores/authStore'
import { usePengaturanStore } from '../stores/pengaturanStore'
import ActionDropdown from '../components/app/ActionDropdown'
import { educationUnitService } from '../services/educationUnitService'
import { dashboardPemantauanService } from '../services/dashboardPemantauanService'

// TailGrids Core Components
import { Badge } from '@/components/tailgrids/core/badge'
import { Button } from '@/components/tailgrids/core/button'
import { Breadcrumbs } from '@/components/tailgrids/core/breadcrumbs'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from '@/components/tailgrids/core/dialog'
import { AlertDialog } from '@/components/tailgrids/core/alert-dialog'
import { Pagination } from '@/components/tailgrids/core/pagination'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/tailgrids/core/table'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/tailgrids/core/hover-card'
import { MasterStatsGrid, MasterStatCard } from '../components/master-data'

const STORAGE_KEY = 'school_news_announcements_db'

const FALLBACK_UNITS = [
  { id: 'all', name: 'Seluruh Unit (Yayasan)', code: 'YAYASAN' },
  { id: 'tkit', name: 'TKIT Dar El-Iman 1 & 2', code: 'TKIT' },
  { id: 'sdit1', name: 'SDIT 01 Dar El-Iman', code: 'SDIT 01' },
  { id: 'sdit2', name: 'SDIT 02 Dar El-Iman', code: 'SDIT 02' },
  { id: 'smpit', name: 'SMPIT Dar El-Iman', code: 'SMPIT' },
  { id: 'smait', name: 'SMAIT Dar El-Iman', code: 'SMAIT' },
  { id: 'pesantren', name: 'STDI & Pesantren Dar El-Iman', code: 'PESANTREN' },
]

const CATEGORY_OPTIONS = [
  { id: 'PPDB', label: 'PPDB & Pendaftaran', color: 'amber', icon: Megaphone },
  { id: 'Akademik', label: 'Pengumuman Akademik', color: 'sky', icon: BookOpen },
  { id: 'Prestasi', label: 'Capaian Prestasi', color: 'purple', icon: Award },
  { id: 'Kegiatan', label: 'Kegiatan Sekolah', color: 'emerald', icon: Calendar },
  { id: 'Umum', label: 'Informasi Umum', color: 'cyan', icon: FileText },
]

const INITIAL_SEED_NEWS = [
  {
    id: 'news-1',
    judul: 'Penerimaan Peserta Didik Baru (PPDB) T.A. 2026/2027 Resmi Dibuka',
    kategori: 'PPDB',
    target_unit: 'all',
    target_unit_name: 'Seluruh Unit (Yayasan)',
    ringkasan: 'Pendaftaran online siswa baru untuk seluruh jenjang TKIT, SDIT 01, SDIT 02, SMPIT, SMAIT, dan Pesantren Dar El-Iman.',
    isi: 'Pendaftaran peserta didik baru Yayasan Dar El-Iman Padang Tahun Ajaran 2026/2027 telah dibuka secara resmi. Orang tua dapat melakukan pendaftaran melalui website portal atau mendatangi sekretariat PPDB di unit masing-masing.',
    tanggal_publikasi: '2026-08-20',
    status: 'Dipublikasikan',
    penerbit: 'Humas & Informasi Yayasan',
    penerbit_role: 'Pengurus Yayasan',
    gambar_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'news-2',
    judul: 'Peluncuran Sistem Jurnal Mutaba’ah Yaumiyah & Pemantauan Tahfizh Digital',
    kategori: 'Kegiatan',
    target_unit: 'all',
    target_unit_name: 'Seluruh Unit (Yayasan)',
    ringkasan: 'Yayasan merilis fitur pemantauan kedisiplinan ibadah dan hafalan Al-Qur’an siswa secara online terpadu.',
    isi: 'Dalam rangka meningkatkan kedisiplinan ibadah yaumiyah dan hafalan Al-Qur’an santri, Yayasan meluncurkan portal mutabaah digital yang terhubung langsung dengan aplikasi orang tua.',
    tanggal_publikasi: '2026-08-19',
    status: 'Dipublikasikan',
    penerbit: 'Divisi Pendidikan Yayasan',
    penerbit_role: 'Pengurus Yayasan',
    gambar_url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'news-3',
    judul: 'Kegiatan Outbound Ceria & Euklid Edukasi Usia Dini TKIT Dar El-Iman',
    kategori: 'Kegiatan',
    target_unit: 'tkit',
    target_unit_name: 'TKIT Dar El-Iman 1 & 2',
    ringkasan: 'Murid TKIT mengikuti kegiatan outing class edukatif melatih kemandirian dan motorik halus anak.',
    isi: 'TKIT Dar El-Iman menyelenggarakan kegiatan outbound edukatif yang bertujuan melatih keberanian, kerjasama, dan kedisiplinan anak sejak dini.',
    tanggal_publikasi: '2026-08-18',
    status: 'Dipublikasikan',
    penerbit: 'Kepala Sekolah TKIT',
    penerbit_role: 'Kepala Sekolah',
    gambar_url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'news-4',
    judul: 'Prestasi Santri SDIT 01: Medali Emas Olimpiade Sains & Wisuda Tahfizh 10 Juz',
    kategori: 'Prestasi',
    target_unit: 'sdit1',
    target_unit_name: 'SDIT 01 Dar El-Iman',
    ringkasan: 'Santri SDIT 01 memborong medali emas sains nasional serta lulus tasmi’ hafalan 10 juz sekali duduk predikat Mumtaz.',
    isi: 'Alhamdulillah, santri SDIT 01 Dar El-Iman kembali mengukir prestasi gemilang tingkat nasional dalam ajang Olimpiade Sains dan Musabaqah Hifzhil Qur’an 10 Juz.',
    tanggal_publikasi: '2026-08-17',
    status: 'Dipublikasikan',
    penerbit: 'Kepala Sekolah SDIT 01',
    penerbit_role: 'Kepala Sekolah',
    gambar_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'news-5',
    judul: 'Market Day Wirausaha Cilik & Pembiasaan Shalat Dhuha Berjamaah SDIT 02',
    kategori: 'Kegiatan',
    target_unit: 'sdit2',
    target_unit_name: 'SDIT 02 Dar El-Iman',
    ringkasan: 'Siswa SDIT 02 mempraktikkan muamalah syariah melalui kegiatan Market Day sekolah.',
    isi: 'SDIT 02 Dar El-Iman menggelar acara Market Day tahunan untuk melatih kejujuran, kewirausahaan Islam, serta adab berbelanja bagi seluruh siswa.',
    tanggal_publikasi: '2026-08-16',
    status: 'Dipublikasikan',
    penerbit: 'Waka Kesiswaan SDIT 02',
    penerbit_role: 'Waka Kesiswaan',
    gambar_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'news-6',
    judul: 'Simulasi Ujian CBT Akademik & Pelatihan Bahasa Arab SMPIT Dar El-Iman',
    kategori: 'Akademik',
    target_unit: 'smpit',
    target_unit_name: 'SMPIT Dar El-Iman',
    ringkasan: 'Siswa SMPIT mengikuti simulasi portal CBT ujian berbasis komputer dan integrasi jurnal mutabaah digital.',
    isi: 'Dalam rangka meningkatkan kesiapan akademik, SMPIT Dar El-Iman menyelenggarakan simulasi ujian berbasis komputer (CBT) serta evaluasi kedisiplinan ibadah yaumiyah.',
    tanggal_publikasi: '2026-08-15',
    status: 'Dipublikasikan',
    penerbit: 'Tata Usaha SMPIT',
    penerbit_role: 'Tata Usaha',
    gambar_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'news-7',
    judul: 'Program Bimbingan Intensif UTBK-SNBT & Kelulusan PTN Favorit SMAIT',
    kategori: 'Akademik',
    target_unit: 'smait',
    target_unit_name: 'SMAIT Dar El-Iman',
    ringkasan: 'Santri SMAIT Dar El-Iman meraih persentase kelulusan 92% masuk Perguruan Tinggi Negeri terkemuka.',
    isi: 'Selamat kepada para santri kelas XII SMAIT Dar El-Iman yang berhasil diterima di PTN favorit melalui jalur SNBP dan SNBT tahun ajaran ini.',
    tanggal_publikasi: '2026-08-14',
    status: 'Dipublikasikan',
    penerbit: 'Waka Kurikulum SMAIT',
    penerbit_role: 'Waka Kurikulum',
    gambar_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'news-8',
    judul: 'Dauroh Bahasa Arab & Matsama Pembekalan Santri Baru Pesantren',
    kategori: 'Kegiatan',
    target_unit: 'pesantren',
    target_unit_name: 'STDI & Pesantren Dar El-Iman',
    ringkasan: 'Pembekalan kedisiplinan dan bahasa Arab intensif bagi santri baru Ma’had Dar El-Iman.',
    isi: 'Kegiatan dauroh bahasa Arab dan matrikulasi keislaman diselenggarakan untuk membekali santri baru Pesantren Dar El-Iman Padang.',
    tanggal_publikasi: '2026-08-12',
    status: 'Dipublikasikan',
    penerbit: 'Divisi Tahfizh & Pesantren',
    penerbit_role: 'Pengurus Yayasan',
    gambar_url: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=800&auto=format&fit=crop&q=60',
  },
]

export default function NewsManagementPage() {
  const user = useAuthStore((state) => state.user)
  const pengaturan = usePengaturanStore((state) => state.pengaturan)

  // 1. Dynamic Units State (Fetched from Database)
  const [unitOptions, setUnitOptions] = useState(FALLBACK_UNITS)

  useEffect(() => {
    let cancelled = false
    educationUnitService.getDaftar()
      .then((res) => {
        if (cancelled) return
        const list = res?.data?.data || res?.data || res || []
        if (Array.isArray(list) && list.length > 0) {
          const mappedUnits = [
            { id: 'all', name: 'Seluruh Unit (Yayasan)', code: 'YAYASAN' },
            ...list.map((u) => ({
              id: String(u.id || u.code || u.name),
              name: u.name || u.nama || 'Unit Sekolah',
              code: u.code || u.level || 'UNIT',
            })),
          ]
          setUnitOptions(mappedUnits)
        }
      })
      .catch((err) => {
        console.warn('Load units from database failed, using fallback:', err)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // 2. Role Scope Calculation
  const roleAnalysis = useMemo(() => {
    if (!user) return { isGlobalAdmin: true, assignedUnitId: 'all', assignedUnitName: 'Seluruh Unit (Yayasan)' }

    const roles = user.roles ? (Array.isArray(user.roles) ? user.roles.map(r => typeof r === 'string' ? r : r.name) : [user.roles]) : []
    const roleNames = roles.map(r => String(r).toLowerCase())

    const isGlobal = roleNames.some(r =>
      r.includes('super') || r.includes('yayasan') || r.includes('pengurus') || r.includes('ketua') || r.includes('admin')
    )

    const uCode = user.unit_code || user.unit_name || user.unit || ''
    let assignedId = 'sdit1'
    let assignedName = 'SDIT 01 Dar El-Iman'

    const matchedFromDb = unitOptions.find(u =>
      u.id !== 'all' && (
        String(u.name).toLowerCase().includes(String(uCode).toLowerCase()) ||
        String(u.code).toLowerCase().includes(String(uCode).toLowerCase())
      )
    )

    if (matchedFromDb) {
      assignedId = matchedFromDb.id
      assignedName = matchedFromDb.name
    }

    return {
      isGlobalAdmin: isGlobal,
      assignedUnitId: isGlobal ? 'all' : assignedId,
      assignedUnitName: isGlobal ? 'Seluruh Unit (Yayasan)' : assignedName,
    }
  }, [user, unitOptions])

  // State List Berita
  const [newsList, setNewsList] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    unit_id: 'all',
    kategori: 'all',
    status: 'all',
    page: 1,
    per_page: 10,
  })

  // Modals State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState(null)

  // Form State
  const [form, setForm] = useState({
    judul: '',
    kategori: 'PPDB',
    target_unit: 'all',
    target_unit_name: 'Seluruh Unit (Yayasan)',
    ringkasan: '',
    isi: '',
    tanggal_publikasi: new Date().toISOString().slice(0, 10),
    status: 'Dipublikasikan',
    gambar_url: '',
  })

  // Load News from Database API & LocalStorage Cache
  const loadNews = async () => {
    setLoading(true)
    try {
      // 1. Try DB API Endpoint
      const res = await dashboardPemantauanService.getDaftarPengumumanSekolah({ per_page: 100 }).catch(() => null)
      const rawApiList = res?.data?.data || res?.data || res || []

      if (Array.isArray(rawApiList) && rawApiList.length > 0) {
        const normalized = rawApiList.map((item) => {
          const extra = item.data_tambahan || {}
          return {
            id: item.id,
            judul: item.judul_pengumuman || item.judul || 'Pengumuman Sekolah',
            isi: item.isi_pengumuman || item.isi || '',
            kategori: extra.kategori || 'PPDB',
            target_unit: extra.unit_id || 'all',
            target_unit_name: extra.unit_name || 'Seluruh Unit (Yayasan)',
            ringkasan: extra.ringkasan || (item.isi_pengumuman || '').slice(0, 120),
            tanggal_publikasi: item.mulai_tampil ? String(item.mulai_tampil).slice(0, 10) : new Date().toISOString().slice(0, 10),
            status: item.status_aktif ? 'Dipublikasikan' : 'Draf',
            penerbit: item.penerbit || 'Pengelola Sekolah',
            penerbit_role: item.penerbit_role || 'Pengurus',
            gambar_url: extra.gambar_url || '',
          }
        })

        const mergedMap = new Map()
        INITIAL_SEED_NEWS.forEach(item => mergedMap.set(item.id, item))
        normalized.forEach(item => mergedMap.set(item.id, item))
        const finalList = Array.from(mergedMap.values())

        setNewsList(finalList)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalList))
      } else {
        const stored = localStorage.getItem(STORAGE_KEY)
        let parsed = stored ? JSON.parse(stored) : []
        if (!Array.isArray(parsed) || parsed.length < INITIAL_SEED_NEWS.length) {
          parsed = INITIAL_SEED_NEWS
          localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_NEWS))
        }
        setNewsList(parsed)
      }
    } catch {
      const stored = localStorage.getItem(STORAGE_KEY)
      let parsed = stored ? JSON.parse(stored) : []
      if (!Array.isArray(parsed) || parsed.length < INITIAL_SEED_NEWS.length) {
        parsed = INITIAL_SEED_NEWS
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_NEWS))
      }
      setNewsList(parsed)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNews()
  }, [])

  const saveNewsListToCache = (updated) => {
    setNewsList(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.warn('LocalStorage save error:', e)
    }
  }

  // Filtered List based on Search & Role Scoping
  const filteredList = useMemo(() => {
    return newsList.filter((item) => {
      if (!roleAnalysis.isGlobalAdmin) {
        const itemUnit = (item.target_unit || '').toLowerCase()
        const assignedUnit = roleAnalysis.assignedUnitId.toLowerCase()
        if (itemUnit !== 'all' && itemUnit !== assignedUnit) {
          return false
        }
      }

      if (filters.unit_id !== 'all' && item.target_unit !== filters.unit_id) {
        return false
      }

      if (filters.kategori !== 'all' && item.kategori !== filters.kategori) {
        return false
      }

      if (filters.status !== 'all' && item.status !== filters.status) {
        return false
      }

      if (filters.search.trim()) {
        const q = filters.search.toLowerCase()
        const j = (item.judul || '').toLowerCase()
        const r = (item.ringkasan || '').toLowerCase()
        const i = (item.isi || '').toLowerCase()
        if (!j.includes(q) && !r.includes(q) && !i.includes(q)) return false
      }

      return true
    })
  }, [newsList, filters, roleAnalysis])

  // Pagination Slice
  const totalPages = Math.ceil(filteredList.length / filters.per_page) || 1
  const paginatedList = useMemo(() => {
    const start = (filters.page - 1) * filters.per_page
    return filteredList.slice(start, start + filters.per_page)
  }, [filteredList, filters.page, filters.per_page])

  // Stats Calculation
  const stats = useMemo(() => {
    const total = filteredList.length
    const published = filteredList.filter(i => i.status === 'Dipublikasikan').length
    const draft = filteredList.filter(i => i.status === 'Draf').length
    const globalUnit = filteredList.filter(i => i.target_unit === 'all').length

    return { total, published, draft, globalUnit }
  }, [filteredList])

  // Form Handlers
  const handleOpenAdd = () => {
    setEditingItem(null)
    setForm({
      judul: '',
      kategori: 'PPDB',
      target_unit: roleAnalysis.isGlobalAdmin ? 'all' : roleAnalysis.assignedUnitId,
      target_unit_name: roleAnalysis.isGlobalAdmin ? 'Seluruh Unit (Yayasan)' : roleAnalysis.assignedUnitName,
      ringkasan: '',
      isi: '',
      tanggal_publikasi: new Date().toISOString().slice(0, 10),
      status: 'Dipublikasikan',
      gambar_url: '',
    })
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setForm({
      judul: item.judul || '',
      kategori: item.kategori || 'PPDB',
      target_unit: item.target_unit || 'all',
      target_unit_name: item.target_unit_name || 'Seluruh Unit (Yayasan)',
      ringkasan: item.ringkasan || '',
      isi: item.isi || '',
      tanggal_publikasi: item.tanggal_publikasi || new Date().toISOString().slice(0, 10),
      status: item.status || 'Dipublikasikan',
      gambar_url: item.gambar_url || '',
    })
    setIsFormOpen(true)
  }

  const handleSaveForm = async (e) => {
    e.preventDefault()
    if (!form.judul.trim() || !form.ringkasan.trim()) return

    const selectedU = unitOptions.find((u) => u.id === form.target_unit) || unitOptions[0]

    const payload = {
      judul_pengumuman: form.judul,
      isi_pengumuman: form.isi,
      target_peran: ['Orang Tua', 'Siswa'],
      status_aktif: form.status === 'Dipublikasikan',
      mulai_tampil: form.tanggal_publikasi,
      data_tambahan: {
        unit_id: form.target_unit,
        unit_name: selectedU.name,
        unit_code: selectedU.code,
        kategori: form.kategori,
        ringkasan: form.ringkasan,
        gambar_url: form.gambar_url,
      },
    }

    if (editingItem) {
      // 1. Send DB Update
      await dashboardPemantauanService.ubahPengumumanSekolah({ id: editingItem.id, payload }).catch(() => null)

      // 2. Update State & Local Cache
      const updated = newsList.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              ...form,
              target_unit_name: selectedU.name,
              updated_at: new Date().toISOString(),
            }
          : item
      )
      saveNewsListToCache(updated)
    } else {
      // 1. Send DB Post
      const dbRes = await dashboardPemantauanService.tambahPengumumanSekolah(payload).catch(() => null)
      const newId = dbRes?.data?.id || 'news-' + Date.now()

      // 2. Insert to State & Local Cache
      const newItem = {
        id: newId,
        ...form,
        target_unit_name: selectedU.name,
        penerbit: user?.name || user?.nama || 'Pengelola Berita',
        penerbit_role: roleAnalysis.isGlobalAdmin ? 'Pengurus Yayasan' : 'Pengelola Unit',
        created_at: new Date().toISOString(),
      }
      saveNewsListToCache([newItem, ...newsList])
    }

    setIsFormOpen(false)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return
    await dashboardPemantauanService.hapusPengumumanSekolah(deletingItem.id).catch(() => null)

    const updated = newsList.filter((item) => item.id !== deletingItem.id)
    saveNewsListToCache(updated)
    setIsDeleteOpen(false)
    setDeletingItem(null)
  }

  return (
    <div className="news-management-page space-y-6 pb-12 px-4 sm:px-6 md:px-8 py-6 font-sans">
      {/* 0. BREADCRUMB */}
      <Breadcrumbs
        dividerType="chevron"
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Manajemen Data', href: '/dashboard' },
          { label: 'Berita & Pengumuman' },
        ]}
      />

      {/* KPI STATS CARDS */}
      <MasterStatsGrid columns={4}>
        <MasterStatCard
          icon={Megaphone}
          label="Total Berita"
          value={stats.total}
          description="Total publikasi di database"
          variant="info"
        />
        <MasterStatCard
          icon={CheckCircle2}
          label="Dipublikasikan"
          value={stats.published}
          description="Aktif di portal ortu & siswa"
          variant="success"
        />
        <MasterStatCard
          icon={AlertCircle}
          label="Draf Internal"
          value={stats.draft}
          description="Belum dipublikasikan"
          variant="warning"
        />
        <MasterStatCard
          icon={Globe}
          label="Lintas Unit"
          value={stats.globalUnit}
          description="Target seluruh yayasan"
          variant="neutral"
        />
      </MasterStatsGrid>

      {/* 1. SINGLE UNIFIED DATATABLE CARD CONTAINER (FILTER BAR & DATATABLE DIGABUNGKAN) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* BARIS 1: HEADER CARD TITLE + SOFT PASTEL SQUIRCLE ACTION BUTTONS */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                Berita & Pengumuman Sekolah
              </h1>
              <Badge color={roleAnalysis.isGlobalAdmin ? 'amber' : 'emerald'} size="md" prefixIcon={ShieldCheck}>
                {roleAnalysis.isGlobalAdmin ? 'Akses Lintas Unit Yayasan' : `Unit: ${roleAnalysis.assignedUnitName}`}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {roleAnalysis.isGlobalAdmin
                ? 'Kelola pengumuman dan berita sekolah untuk seluruh unit pendidikan atau unit spesifik yang langsung tampil di portal orang tua dan siswa.'
                : `Kelola pengumuman dan berita sekolah resmi khusus untuk unit ${roleAnalysis.assignedUnitName}.`}
            </p>
          </div>

          {/* Soft Pastel Squircle Action Buttons Baris 1 */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Tombol Impor (Sky Blue Soft Pastel Squircle) */}
            <HoverCard>
              <HoverCardTrigger>
                <button
                  type="button"
                  onClick={() => alert('Fitur impor data berita dari file Excel/CSV')}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700 shadow-xs transition hover:scale-105 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                >
                  <Upload1 className="h-4 w-4" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="text-[11px] font-bold text-slate-700 dark:text-slate-200 p-2">
                Impor Data Berita (Excel/CSV)
              </HoverCardContent>
            </HoverCard>

            {/* Tombol Ekspor (Amber/Orange Soft Pastel Squircle) */}
            <HoverCard>
              <HoverCardTrigger>
                <button
                  type="button"
                  onClick={() => alert('Mengekspor daftar berita ke format Excel/PDF')}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700 shadow-xs transition hover:scale-105 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                >
                  <Download1 className="h-4 w-4" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="text-[11px] font-bold text-slate-700 dark:text-slate-200 p-2">
                Ekspor Laporan Berita
              </HoverCardContent>
            </HoverCard>

            {/* Tombol Buat Berita Baru (Emerald/Green Soft Pastel Squircle) */}
            <HoverCard>
              <HoverCardTrigger>
                <Button
                  variant="ghost"
                  size="md"
                  className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold shadow-xs transition hover:scale-105 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  onClick={handleOpenAdd}
                >
                  <Plus className="h-4 w-4" />
                  <span>Buat Berita Baru</span>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="text-[11px] font-bold text-slate-700 dark:text-slate-200 p-2">
                Publikasikan berita baru
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>

        {/* BARIS 2: CARD FILTER (DILENGKAPI DENGAN SEARCH, DROPDOWN UNIT DARI DATABASE & PERPAGE SELECTOR) */}
        <div className="flex flex-col gap-3 bg-slate-50/60 p-4 dark:bg-slate-800/40 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 dark:border-slate-800">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              placeholder="Cari judul, ringkasan, atau isi berita..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* Filters & perPage Selector */}
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            {roleAnalysis.isGlobalAdmin && (
              <select
                value={filters.unit_id}
                onChange={(e) => setFilters({ ...filters, unit_id: e.target.value, page: 1 })}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="all">Semua Unit</option>
                {unitOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            )}

            <select
              value={filters.kategori}
              onChange={(e) => setFilters({ ...filters, kategori: e.target.value, page: 1 })}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="all">Semua Kategori</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="all">Semua Status</option>
              <option value="Dipublikasikan">Dipublikasikan</option>
              <option value="Draf">Draf</option>
            </select>

            {/* perPage Selector */}
            <select
              value={filters.per_page}
              onChange={(e) => setFilters({ ...filters, per_page: Number(e.target.value), page: 1 })}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value={5}>5 / hal</option>
              <option value={10}>10 / hal</option>
              <option value={15}>15 / hal</option>
              <option value={25}>25 / hal</option>
              <option value={50}>50 / hal</option>
              <option value={100}>100 / hal</option>
            </select>

            {/* Tombol Muat Ulang (Sky Pastel) */}
            <HoverCard>
              <HoverCardTrigger>
                <button
                  type="button"
                  onClick={loadNews}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700 shadow-xs transition hover:scale-105 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="text-[11px] font-bold text-slate-700 dark:text-slate-200 p-2">
                Muat Ulang Data dari Database
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>

        {/* TAILGRIDS TABLE ROOT & ROWS */}
        <div className="overflow-x-auto">
          <TableRoot fullBleed={false}>
            <TableHeader>
              <TableRow className="bg-slate-50/90 dark:bg-slate-800/80">
                <TableHead className="font-extrabold text-slate-900 dark:text-slate-200">
                  <div className="flex items-center gap-1.5 cursor-pointer">
                    <span>Judul Berita & Kategori</span>
                    <ArrowBothDirectionHorizontal2 className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead className="font-extrabold text-slate-900 dark:text-slate-200">Target Unit Sekolah</TableHead>
                <TableHead className="font-extrabold text-slate-900 dark:text-slate-200">Penerbit & Peran</TableHead>
                <TableHead className="font-extrabold text-slate-900 dark:text-slate-200">Tanggal Publikasi</TableHead>
                <TableHead className="font-extrabold text-slate-900 dark:text-slate-200">Status</TableHead>
                <TableHead className="text-center font-extrabold text-slate-900 dark:text-slate-200">Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-xs text-slate-400">
                    Belum ada berita atau pengumuman yang sesuai dengan filter pencarian.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedList.map((row) => {
                  const cat = CATEGORY_OPTIONS.find((c) => c.id === row.kategori) || CATEGORY_OPTIONS[0]
                  const IconComp = cat.icon

                  return (
                    <TableRow key={row.id} className="transition hover:scale-[1.003] hover:bg-slate-50/90 dark:hover:bg-slate-800/50">
                      <TableCell className="max-w-xs">
                        <div className="flex items-start gap-2.5">
                          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shrink-0 mt-0.5 shadow-xs">
                            <IconComp className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white line-clamp-1">
                              {row.judul}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{row.ringkasan}</p>
                            <Badge color={cat.color} size="sm" className="mt-1">
                              {cat.label}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          color={row.target_unit === 'all' ? 'amber' : 'cyan'}
                          size="sm"
                          prefixIcon={row.target_unit === 'all' ? Globe : Building2}
                        >
                          {row.target_unit_name || 'Seluruh Unit (Yayasan)'}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{row.penerbit}</p>
                        <p className="text-[11px] text-slate-400">{row.penerbit_role}</p>
                      </TableCell>

                      <TableCell className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {row.tanggal_publikasi}
                      </TableCell>

                      <TableCell>
                        <Badge
                          color={row.status === 'Dipublikasikan' ? 'success' : 'warning'}
                          size="sm"
                          prefixIcon={row.status === 'Dipublikasikan' ? CheckCircle2 : AlertCircle}
                        >
                          {row.status}
                        </Badge>
                      </TableCell>

                      {/* KOLOM AKSI: MEMAKAI ACTION DROPDOWN STANDAR BENCHMARK PROJECT */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <ActionDropdown
                            onView={() => {
                              setDetailItem(row)
                              setIsDetailOpen(true)
                            }}
                            onEdit={() => handleOpenEdit(row)}
                            onDelete={() => {
                              setDeletingItem(row)
                              setIsDeleteOpen(true)
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </TableRoot>
        </div>

        {/* CONTAINER PAGINATION DI BAGIAN BAWAH CARD */}
        {totalPages > 1 && (
          <div className="w-full border-t border-slate-100 p-4 dark:border-slate-800">
            <Pagination
              currentPage={filters.page}
              totalPages={totalPages}
              onPageChange={(page) => setFilters({ ...filters, page })}
              sideLayout="full"
            />
          </div>
        )}
      </div>

      {/* MODAL FORM TAMBAH / EDIT BERITA */}
      <Dialog isOpen={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit Berita & Pengumuman' : 'Buat Berita / Pengumuman Baru'}</DialogTitle>
          <DialogDescription>
            {roleAnalysis.isGlobalAdmin
              ? 'Isi formulir untuk mempublikasikan berita/pengumuman ke seluruh unit yayasan atau unit tertentu.'
              : `Formulir pembuatan berita resmi khusus untuk ${roleAnalysis.assignedUnitName}.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSaveForm}>
          <DialogBody className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Judul Berita / Pengumuman *
              </label>
              <input
                type="text"
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                required
                placeholder="Contoh: Penerimaan Siswa Baru T.A. 2026/2027 Resmi Dibuka"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Berita *
                </label>
                <select
                  value={form.kategori}
                  onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Target Unit Sekolah *
                </label>
                {roleAnalysis.isGlobalAdmin ? (
                  <select
                    value={form.target_unit}
                    onChange={(e) => {
                      const u = unitOptions.find((opt) => opt.id === e.target.value)
                      setForm({
                        ...form,
                        target_unit: e.target.value,
                        target_unit_name: u?.name || 'Seluruh Unit (Yayasan)',
                      })
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {unitOptions.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    value={roleAnalysis.assignedUnitName}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Publikasi *
                </label>
                <input
                  type="date"
                  value={form.tanggal_publikasi}
                  onChange={(e) => setForm({ ...form, tanggal_publikasi: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Status Publikasi *
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Dipublikasikan">Dipublikasikan (Tampil di Portal)</option>
                  <option value="Draf">Draf (Disimpan Internal)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Ringkasan Singkat *
              </label>
              <textarea
                rows={2}
                value={form.ringkasan}
                onChange={(e) => setForm({ ...form, ringkasan: e.target.value })}
                required
                placeholder="Ringkasan 1-2 kalimat yang akan tampil di kartu preview berita..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Isi Lengkap Berita / Pengumuman *
              </label>
              <textarea
                rows={4}
                value={form.isi}
                onChange={(e) => setForm({ ...form, isi: e.target.value })}
                required
                placeholder="Tuliskan isi berita, ketentuan, pengumuman lengkap untuk wali murid & siswa..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                URL Gambar / Banner (Opsional)
              </label>
              <input
                type="url"
                value={form.gambar_url}
                onChange={(e) => setForm({ ...form, gambar_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" size="sm">
                Batal
              </Button>
            </DialogClose>
            <Button variant="primary" size="sm" type="submit">
              {editingItem ? 'Simpan Perubahan ke Database' : 'Publikasikan Berita ke Database'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* MODAL DETAIL PRATINJAU BERITA */}
      <Dialog isOpen={isDetailOpen} onOpenChange={setIsDetailOpen}>
        {detailItem && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge color="amber" size="sm">
                  {detailItem.kategori}
                </Badge>
                <Badge color="emerald" size="sm">
                  {detailItem.target_unit_name}
                </Badge>
              </div>
              <DialogTitle className="mt-2 text-lg font-black">{detailItem.judul}</DialogTitle>
              <DialogDescription className="text-xs">
                Dipublikasikan oleh {detailItem.penerbit} ({detailItem.penerbit_role}) pada {detailItem.tanggal_publikasi}
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              {detailItem.gambar_url && (
                <img
                  src={detailItem.gambar_url}
                  alt={detailItem.judul}
                  className="w-full h-48 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                />
              )}

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Ringkasan:</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{detailItem.ringkasan}</p>
              </div>

              <div>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">Isi Lengkap Berita:</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {detailItem.isi}
                </p>
              </div>
            </DialogBody>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="primary" size="sm">
                  Tutup Pratinjau
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </Dialog>

      {/* MODAL KONFIRMASI HAPUS (ALERT DIALOG TAILGRIDS) */}
      <AlertDialog isOpen={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogHeader>
          <DialogTitle>Hapus Berita Ini dari Database?</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus berita "{deletingItem?.judul}" dari database? Berita yang dihapus tidak akan tampil lagi di portal orang tua dan siswa.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" size="sm">
              Batal
            </Button>
          </DialogClose>
          <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
            Hapus Permanen dari Database
          </Button>
        </DialogFooter>
      </AlertDialog>
    </div>
  )
}
