import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaMosque } from 'react-icons/fa6'
import {
  Building2,
  MapPin,
  GraduationCap,
  Megaphone,
  BookOpen,
  Award,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Phone,
} from 'lucide-react'
import { usePengaturanStore } from '../stores/pengaturanStore'
import LoginCard from '../components/auth/LoginCard'
import { resolveDefaultPortal } from '../auth/portalResolver'
import AuthToast from '../components/ui/AuthToast'
import AuthPopup, { showAuthPopup } from '../components/ui/AuthPopup'
import { Badge } from '@/components/tailgrids/core/badge'
import { dashboardPemantauanService } from '../services/dashboardPemantauanService'

const UNIT_LIST = [
  {
    id: 'all',
    code: 'SEMUA',
    name: 'Seluruh Unit Pendidikan',
    tagline: 'Layanan Terpadu PAUD hingga Pesantren',
  },
  {
    id: 'tkit',
    code: 'TKIT',
    name: 'TKIT Dar El-Iman 1 & 2',
    address: 'Jl. Sawahan No. 10 & Surau Gadang, Kec. Nanggalo, Kota Padang',
    focus: 'Tahfizh Juz 30, Adab Islamiyah & Fun Learning',
    info: 'Pendaftaran PAUD & TKIT T.A. 2026/2027 Gelombang 1 Resmi Dibuka',
    phone: '(0751) 448899',
    badge: 'PAUD / TKIT',
  },
  {
    id: 'sdit1',
    code: 'SDIT 01',
    name: 'SDIT 01 Dar El-Iman',
    address: 'Jl. Gunung Juaro, Surau Gadang, Kec. Nanggalo, Kota Padang',
    focus: 'Target Hafalan 5-10 Juz, Olimpiade Sains & Bahasa Arab',
    info: 'Tasmi’ Al-Qur’an 3 Juz Sekali Duduk & Ekstrakurikuler Sains Terpadu',
    phone: '(0751) 448890',
    badge: 'Sekolah Dasar',
  },
  {
    id: 'sdit2',
    code: 'SDIT 02',
    name: 'SDIT 02 Dar El-Iman',
    address: 'Jl. Belakang Olo No. 15, Kec. Padang Barat, Kota Padang',
    focus: 'Kurikulum Merdeka Plus Darel Iman, Pembentukan Karakter Rabbani',
    info: 'Penerimaan Siswa Pindahan & Program Ekstrakurikuler Archery/Panahan',
    phone: '(0751) 448891',
    badge: 'Sekolah Dasar',
  },
  {
    id: 'smpit',
    code: 'SMPIT',
    name: 'SMPIT Dar El-Iman',
    address: 'Jl. Bypass Km 12, Koto Tangah, Kota Padang',
    focus: 'Kelas Bilingual, Tahfizh Mutqin & Portal CBT Examination',
    info: 'Simulasi Ujian CBT Akademik & Pemantauan Mutaba’ah Yaumiyah Digital',
    phone: '(0751) 448892',
    badge: 'Sekolah Menengah',
  },
  {
    id: 'smait',
    code: 'SMAIT',
    name: 'SMAIT Dar El-Iman',
    address: 'Jl. Bypass Km 14, Koto Tangah, Kota Padang',
    focus: 'Persiapan SNBP/SNBT PTN Favorit & Beasiswa Universitas Timur Tengah',
    info: 'Bimbingan Intensif Kelulusan PTN & Matrikulasi Bahasa Arab Syari’i',
    phone: '(0751) 448893',
    badge: 'Sekolah Menengah Atas',
  },
  {
    id: 'pesantren',
    code: 'STDI / MAHAD',
    name: 'STDI & Pesantren Dar El-Iman',
    address: 'Jl. Khatib Sulaiman / Surau Gadang, Kota Padang',
    focus: 'Dirasat Islamiyah, Sanad Tahfizh Al-Qur’an & Bahasa Arab Madinah',
    info: 'Pendaftaran Mahad Aly, Program Da’i Muda & Munaqasyah Kitab Kuning',
    phone: '(0751) 448894',
    badge: 'Pondok Pesantren',
  },
]

const INITIAL_FALLBACK_NEWS = [
  {
    id: 'news-1',
    judul: 'Penerimaan Peserta Didik Baru (PPDB) T.A. 2026/2027 Resmi Dibuka',
    kategori: 'PPDB',
    target_unit: 'all',
    target_unit_name: 'Seluruh Unit (Yayasan)',
    ringkasan: 'Pendaftaran online siswa baru untuk seluruh jenjang TKIT, SDIT 01, SDIT 02, SMPIT, SMAIT, dan Pesantren Dar El-Iman.',
    tanggal_publikasi: '2026-08-20',
  },
  {
    id: 'news-2',
    judul: 'Peluncuran Sistem Jurnal Mutaba’ah Yaumiyah & Pemantauan Tahfizh Digital',
    kategori: 'Kegiatan',
    target_unit: 'all',
    target_unit_name: 'Seluruh Unit (Yayasan)',
    ringkasan: 'Yayasan merilis fitur pemantauan kedisiplinan ibadah dan hafalan Al-Qur’an siswa secara online terpadu.',
    tanggal_publikasi: '2026-08-19',
  },
  {
    id: 'news-3',
    judul: 'Prestasi Santri: Medali Emas Olimpiade Sains & Wisuda Tahfizh 10 Juz',
    kategori: 'Prestasi',
    target_unit: 'sdit1',
    target_unit_name: 'SDIT 01 Dar El-Iman',
    ringkasan: 'Santri Dar El-Iman memborong medali emas sains nasional serta lulus tasmi’ hafalan 10 juz sekali duduk predikat Mumtaz.',
    tanggal_publikasi: '2026-08-18',
  },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const pengaturan = usePengaturanStore((state) => state.pengaturan)
  const muatPengaturan = usePengaturanStore((state) => state.muatPengaturan)

  const [activeUnitId, setActiveUnitId] = useState('all')
  const [dbNews, setDbNews] = useState([])

  useEffect(() => {
    muatPengaturan()
  }, [muatPengaturan])

  // Dynamic Database News Fetching
  useEffect(() => {
    let mounted = true
    const fetchDatabaseNews = async () => {
      try {
        const res = await dashboardPemantauanService.getDaftarPengumumanSekolah()
        const apiList = res?.data || res || []

        // Local cache fallback
        const rawCache = localStorage.getItem('school_news_announcements_db')
        const cachedList = rawCache ? JSON.parse(rawCache) : []

        let finalNews = Array.isArray(apiList) && apiList.length > 0 ? apiList : cachedList
        if (!finalNews || finalNews.length === 0) {
          finalNews = INITIAL_FALLBACK_NEWS
        }

        if (mounted) {
          setDbNews(finalNews)
        }
      } catch {
        const rawCache = localStorage.getItem('school_news_announcements_db')
        const cachedList = rawCache ? JSON.parse(rawCache) : []
        if (mounted) {
          setDbNews(cachedList.length > 0 ? cachedList : INITIAL_FALLBACK_NEWS)
        }
      }
    }

    fetchDatabaseNews()
    return () => {
      mounted = false
    }
  }, [])

  // Baca toast dari sessionStorage (misal: setelah logout)
  useEffect(() => {
    const raw = sessionStorage.getItem('auth_toast')
    if (raw) {
      sessionStorage.removeItem('auth_toast')
      try {
        const { type, title, message } = JSON.parse(raw)
        setTimeout(() => showAuthPopup({ type, title, message }), 300)
      } catch {
        // abaikan parse error
      }
    }
  }, [])

  const logoUrl = pengaturan?.logo_url || pengaturan?.logoUrl || ''
  const faviconUrl = pengaturan?.favicon_url || pengaturan?.faviconUrl || ''
  const namaSekolah = pengaturan?.school_name || pengaturan?.namaSekolah || 'YAYASAN DAR EL - IMAN'

  // Dynamic Favicon Update
  useEffect(() => {
    if (faviconUrl) {
      let link = document.querySelector("link[rel*='icon']")
      if (!link) {
        link = document.createElement('link')
        link.rel = 'shortcut icon'
        document.getElementsByTagName('head')[0].appendChild(link)
      }
      link.href = faviconUrl
    }
  }, [faviconUrl])

  const handleLoginSuccess = (result) => {
    navigate(resolveDefaultPortal(result), { replace: true })
  }

  const selectedUnit = UNIT_LIST.find((u) => u.id === activeUnitId) || UNIT_LIST[0]

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 grid grid-cols-1 lg:grid-cols-12 font-sans relative overflow-x-hidden">
      {/* LEFT COLUMN: YAYASAN & EDUCATION UNITS SHOWCASE PANEL */}
      <div className="lg:col-span-7 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 shadow-inner">
        {/* Subtle Background Glows */}
        <div className="absolute -left-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Brand Showcase Header */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3.5">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo Yayasan"
                className="w-14 h-14 object-contain rounded-2xl bg-white p-1.5 shadow-xl border border-white/20 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 flex items-center justify-center shadow-xl border border-amber-300 shrink-0">
                <FaMosque className="w-8 h-8" />
              </div>
            )}
            <div>
              <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest block">
                Official Brand & Information Portal
              </span>
              <span className="text-sm font-extrabold text-emerald-100 tracking-tight">
                {namaSekolah}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge color="amber" size="md" prefixIcon={Sparkles}>
              Pusat Pendidikan Islam Terpadu
            </Badge>
            <Badge color="emerald" size="md" prefixIcon={ShieldCheck}>
              Akreditasi Unggul & Berkarakter Rabbani
            </Badge>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white">
              Yayasan Dar El - Iman Padang
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl font-normal">
              Mewujudkan generasi Rabbani yang berakhlaq mulia, cerdas, berprestasi, dan mandiri berlandaskan Al-Qur’an dan As-Sunnah menurut pemahaman Salafus Shalih.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2 max-w-xl">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
              <p className="text-lg font-black text-amber-300">6 Unit</p>
              <p className="text-[11px] text-emerald-100/80 font-medium">Pendidikan Terpadu</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
              <p className="text-lg font-black text-amber-300">3.500+</p>
              <p className="text-[11px] text-emerald-100/80 font-medium">Santri & Siswa Aktif</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
              <p className="text-lg font-black text-amber-300">850+</p>
              <p className="text-[11px] text-emerald-100/80 font-medium">Hafiz Al-Qur’an</p>
            </div>
          </div>
        </div>

        {/* Middle Interactive Section: Units & Addresses */}
        <div className="relative z-10 my-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-sm font-extrabold text-amber-300 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Unit Pendidikan & Alamat Lokasi
            </h3>
            <span className="text-[11px] text-emerald-200/70 font-medium">Pilih Unit Sekolah:</span>
          </div>

          {/* Unit Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {UNIT_LIST.map((unit) => {
              const isActive = unit.id === activeUnitId
              return (
                <button
                  key={unit.id}
                  onClick={() => setActiveUnitId(unit.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-400 text-emerald-950 shadow-md font-black scale-105'
                      : 'bg-white/10 text-emerald-100 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <span>{unit.code}</span>
                </button>
              )
            })}
          </div>

          {/* Active Unit Info Card */}
          {selectedUnit.id !== 'all' ? (
            <div className="rounded-2xl border border-amber-300/30 bg-emerald-900/60 p-4 backdrop-blur-md space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300">{selectedUnit.name}</span>
                <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-200 border border-amber-300/30">
                  {selectedUnit.badge}
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs text-emerald-100">
                <MapPin className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="font-medium">{selectedUnit.address}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-emerald-100">
                <GraduationCap className="h-4 w-4 text-emerald-300 shrink-0 mt-0.5" />
                <span>Fokus Program: <strong className="text-white">{selectedUnit.focus}</strong></span>
              </div>
              <div className="rounded-xl bg-white/10 p-2.5 text-[11px] text-emerald-100 flex items-center justify-between">
                <span className="font-semibold">{selectedUnit.info}</span>
                <span className="font-bold text-amber-300">{selectedUnit.phone}</span>
              </div>
            </div>
          ) : (
            /* All Units Overview Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {UNIT_LIST.filter((u) => u.id !== 'all').slice(0, 4).map((u) => (
                <div
                  key={u.id}
                  onClick={() => setActiveUnitId(u.id)}
                  className="cursor-pointer rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-amber-300/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">{u.name}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-emerald-300" />
                  </div>
                  <p className="text-[11px] text-emerald-100/80 truncate mt-1">{u.address}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Academic News & Portal Info Snippet (Dynamic Database Integration & Harmonized Colors) */}
        <div className="relative z-10 space-y-3 pt-4 border-t border-white/15">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-amber-300 flex items-center gap-2 uppercase tracking-wide">
              <Megaphone className="h-4 w-4 text-amber-400 stroke-[2.2]" />
              Informasi & Berita Akademik Terkini
            </h4>
            <span className="rounded-full bg-emerald-800/80 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-300 border border-amber-300/30 shadow-xs">
              {activeUnitId === 'all' ? 'Seluruh Unit' : selectedUnit.code}
            </span>
          </div>

          {/* Dynamic News Grid with Harmonized Dark Emerald Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(dbNews.filter((item) => {
              if (activeUnitId === 'all') return true
              const itemUnit = (item.target_unit || item.unit_id || '').toLowerCase()
              return itemUnit === 'all' || itemUnit === activeUnitId.toLowerCase()
            }).length > 0
              ? dbNews.filter((item) => {
                  if (activeUnitId === 'all') return true
                  const itemUnit = (item.target_unit || item.unit_id || '').toLowerCase()
                  return itemUnit === 'all' || itemUnit === activeUnitId.toLowerCase()
                })
              : dbNews
            ).slice(0, 3).map((news) => (
              <div
                key={news.id || news.judul || news.title}
                className="rounded-2xl border border-amber-300/30 bg-emerald-900/60 p-3.5 backdrop-blur-md transition-all duration-200 hover:bg-emerald-800/70 hover:border-amber-300/50 shadow-xs flex flex-col justify-between space-y-2"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1 text-[10px] font-black">
                    <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-amber-200 border border-amber-300/30 uppercase tracking-wider">
                      {news.kategori || news.category || 'AKADEMIK'}
                    </span>
                    <span className="text-emerald-200/70 text-[9.5px]">
                      {news.tanggal_publikasi || news.date || '2026-08-20'}
                    </span>
                  </div>
                  <p className="text-xs font-black text-white line-clamp-2 leading-snug">
                    {news.judul || news.title}
                  </p>
                  <p className="text-[11px] text-emerald-100/90 line-clamp-2 leading-relaxed font-normal">
                    {news.ringkasan || news.desc || news.isi}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-emerald-200/80 font-bold">
                  <span>Unit: {news.target_unit_name || (news.target_unit || 'SEMUA').toUpperCase()}</span>
                  <span className="text-amber-300 font-extrabold flex items-center gap-1">
                    • Database Sync
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: EXACT EXISTING FORM LOGIN (UNTOUCHED STYLE) */}
      <div className="lg:col-span-5 flex items-center justify-center p-4 sm:p-8 bg-slate-50/70 dark:bg-slate-900 border-l border-slate-200/60 dark:border-slate-800 min-h-screen">
        <div className="w-full max-w-md my-auto">
          <LoginCard onLoginSuccess={handleLoginSuccess} />
        </div>
      </div>

      {/* Global Auth Popup (logout, login success, error) */}
      <AuthPopup />
      {/* Global Auth Toast (fallback, notifikasi non-kritikal) */}
      <AuthToast />
    </div>
  )
}
