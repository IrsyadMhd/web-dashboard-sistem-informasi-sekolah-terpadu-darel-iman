import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  BookOpen,
  Award,
  Languages,
  Sparkles,
  FileCheck,
  ShieldCheck,
  ArrowLeft,
  LayoutGrid,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react'

import { PageContainer, AppBreadcrumb } from '../../components/app'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import SupervisiKbmSection from '../../components/divisi/SupervisiKbmSection'
import KurasiBankSoalSection from '../../components/divisi/KurasiBankSoalSection'
import MunaqasyahTahfizhSection from '../../components/divisi/MunaqasyahTahfizhSection'
import PembiasaanBahasaSection from '../../components/divisi/PembiasaanBahasaSection'
import PelatihanGuruSection from '../../components/divisi/PelatihanGuruSection'
import ReviewLaporanBulananSection from '../../components/divisi/ReviewLaporanBulananSection'
import RadarAkreditasiSection from '../../components/divisi/RadarAkreditasiSection'
import { divisiPendidikanWorkspaceService } from '../../services/divisiPendidikanWorkspaceService'

const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/80 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white hover:border-emerald-400 hover:shadow-emerald-500/10 dark:border-emerald-700/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-emerald-500/10 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/30',
    iconGradient: 'from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-500/25',
    glow: 'bg-emerald-500/20 group-hover:bg-emerald-500/30',
    title: 'text-emerald-800 dark:text-emerald-300',
    value: 'text-emerald-950 dark:text-emerald-100',
    subtext: 'text-emerald-700/80 dark:text-emerald-400/80',
    activeTab: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/35 ring-2 ring-emerald-400',
  },
  purple: {
    card: 'border-purple-300/80 bg-gradient-to-br from-purple-50/70 via-violet-50/40 to-white hover:border-purple-400 hover:shadow-purple-500/10 dark:border-purple-700/60 dark:from-purple-950/40 dark:via-violet-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-purple-500/10 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border-purple-500/30',
    iconGradient: 'from-purple-500 via-violet-600 to-indigo-700 shadow-purple-500/25',
    glow: 'bg-purple-500/20 group-hover:bg-purple-500/30',
    title: 'text-purple-800 dark:text-purple-300',
    value: 'text-purple-950 dark:text-purple-100',
    subtext: 'text-purple-700/80 dark:text-purple-400/80',
    activeTab: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/35 ring-2 ring-purple-400',
  },
  amber: {
    card: 'border-amber-300/80 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white hover:border-amber-400 hover:shadow-amber-500/10 dark:border-amber-700/60 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-amber-500/10 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/30',
    iconGradient: 'from-amber-500 via-orange-600 to-amber-700 shadow-amber-500/25',
    glow: 'bg-amber-500/20 group-hover:bg-amber-500/30',
    title: 'text-amber-800 dark:text-amber-300',
    value: 'text-amber-950 dark:text-amber-100',
    subtext: 'text-amber-700/80 dark:text-amber-400/80',
    activeTab: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/35 ring-2 ring-amber-400',
  },
  sky: {
    card: 'border-sky-300/80 bg-gradient-to-br from-sky-50/70 via-blue-50/40 to-white hover:border-sky-400 hover:shadow-sky-500/10 dark:border-sky-700/60 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-sky-500/10 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border-sky-500/30',
    iconGradient: 'from-sky-500 via-blue-600 to-indigo-700 shadow-sky-500/25',
    glow: 'bg-sky-500/20 group-hover:bg-sky-500/30',
    title: 'text-sky-800 dark:text-sky-300',
    value: 'text-sky-950 dark:text-sky-100',
    subtext: 'text-sky-700/80 dark:text-sky-400/80',
    activeTab: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/35 ring-2 ring-sky-400',
  },
  teal: {
    card: 'border-teal-300/80 bg-gradient-to-br from-teal-50/70 via-cyan-50/40 to-white hover:border-teal-400 hover:shadow-teal-500/10 dark:border-teal-700/60 dark:from-teal-950/40 dark:via-cyan-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-teal-500/10 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300 border-teal-500/30',
    iconGradient: 'from-teal-500 via-teal-600 to-emerald-700 shadow-teal-500/25',
    glow: 'bg-teal-500/20 group-hover:bg-teal-500/30',
    title: 'text-teal-800 dark:text-teal-300',
    value: 'text-teal-950 dark:text-teal-100',
    subtext: 'text-teal-700/80 dark:text-teal-400/80',
    activeTab: 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/35 ring-2 ring-teal-400',
  },
  rose: {
    card: 'border-rose-300/80 bg-gradient-to-br from-rose-50/70 via-pink-50/40 to-white hover:border-rose-400 hover:shadow-rose-500/10 dark:border-rose-700/60 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-rose-500/10 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border-rose-500/30',
    iconGradient: 'from-rose-500 via-pink-600 to-red-700 shadow-rose-500/25',
    glow: 'bg-rose-500/20 group-hover:bg-rose-500/30',
    title: 'text-rose-800 dark:text-rose-300',
    value: 'text-rose-950 dark:text-rose-100',
    subtext: 'text-rose-700/80 dark:text-rose-400/80',
    activeTab: 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/35 ring-2 ring-rose-400',
  },
  indigo: {
    card: 'border-indigo-300/80 bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-white hover:border-indigo-400 hover:shadow-indigo-500/10 dark:border-indigo-700/60 dark:from-indigo-950/40 dark:via-blue-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-indigo-500/10 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 border-indigo-500/30',
    iconGradient: 'from-indigo-500 via-blue-600 to-indigo-700 shadow-indigo-500/25',
    glow: 'bg-indigo-500/20 group-hover:bg-indigo-500/30',
    title: 'text-indigo-800 dark:text-indigo-300',
    value: 'text-indigo-950 dark:text-indigo-100',
    subtext: 'text-indigo-700/80 dark:text-indigo-400/80',
    activeTab: 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-lg shadow-indigo-600/35 ring-2 ring-indigo-400',
  },
}

const TABS = [
  { key: 'supervisi-kbm', label: 'Supervisi KBM', icon: GraduationCap, tone: 'emerald' },
  { key: 'kurasi-soal', label: 'Kurasi Soal', icon: BookOpen, tone: 'purple' },
  { key: 'tahfizh-munaqasyah', label: 'Munaqasyah', icon: Award, tone: 'amber' },
  { key: 'bahasa-mufradat', label: 'Program Bahasa', icon: Languages, tone: 'sky' },
  { key: 'pelatihan-guru', label: 'Pelatihan Guru', icon: Sparkles, tone: 'teal' },
  { key: 'revisi-laporan', label: 'Review Laporan', icon: FileCheck, tone: 'rose' },
  { key: 'radar-akreditasi', label: 'Radar Akreditasi', icon: ShieldCheck, tone: 'indigo' },
]

function ModernWorkspaceKpiCard({ title, value, subtext, icon: Icon, tone = 'emerald', tag = 'METRIK', onClick, isActive }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[20px] border-2 p-3.5 sm:p-4 shadow-xs transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col justify-between h-full min-h-[155px] ${
        t.card
      } ${
        isActive
          ? 'ring-2 ring-emerald-500/90 ring-offset-2 dark:ring-offset-slate-900 shadow-md shadow-emerald-500/20 scale-[1.015] border-emerald-500/90 dark:border-emerald-500'
          : 'hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Ambient Glow */}
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all duration-500 ${t.glow}`} />

      {/* Row 1: Category Tag & Icon Badge */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${t.badgeBg}`}>
          {tag}
        </span>
        <div className={`flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md border border-white/20 ${t.iconGradient}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      {/* Row 2: Title Label, Big Value, and Subtext */}
      <div className="relative z-10 mt-2.5 space-y-1">
        <span className={`text-xs font-black uppercase tracking-wider block truncate ${t.title}`}>
          {title}
        </span>
        <p className={`text-xl sm:text-2xl font-black tracking-tight tabular-nums ${t.value}`}>
          {value}
        </p>
        <p className={`text-[11.5px] font-medium leading-snug line-clamp-1 ${t.subtext}`} title={subtext}>
          {subtext}
        </p>
      </div>

      {/* Row 3: Action Footer */}
      <div className="relative z-10 mt-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Akses Modul
        </span>
        <span className={`inline-flex items-center gap-1 font-extrabold text-[11px] transition-transform group-hover:translate-x-1 ${isActive ? 'text-emerald-700 dark:text-emerald-300 font-black' : t.title}`}>
          {isActive ? 'Sedang Dibuka ✓' : 'Buka Tab →'}
        </span>
      </div>
    </motion.div>
  )
}

export default function DivisiPendidikanWorkspacePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const activeTabParam = searchParams.get('tab') || 'supervisi-kbm'
  const [selectedTab, setSelectedTab] = useState(activeTabParam)
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)

  const loadOverviewStats = async () => {
    try {
      const data = await divisiPendidikanWorkspaceService.getWorkspaceOverviewStats()
      setStats(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingStats(false)
    }
  }

  useEffect(() => {
    loadOverviewStats()
  }, [])

  useEffect(() => {
    if (activeTabParam !== selectedTab) {
      setSelectedTab(activeTabParam)
    }
  }, [activeTabParam])

  const handleTabChange = (key) => {
    setSelectedTab(key)
    setSearchParams({ tab: key })
  }

  return (
    <PageContainer maxWidth="max-w-[1560px]">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <AppBreadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Divisi Pendidikan', href: '/dashboard/divisi-pendidikan' },
            { label: 'Modul Kerja Divisi' },
          ]}
        />
        <Button
          size="sm"
          variant="outline"
          className="text-xs font-bold rounded-xl border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-slate-800"
          onClick={() => navigate('/dashboard/divisi-pendidikan')}
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1 text-emerald-600" />
          Dashboard Utama
        </Button>
      </div>

      <div className="space-y-6 pb-12">
        {/* Hero Card Header with Ambient Glow */}
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40">
                <LayoutGrid className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Workspace Modul Kerja Divisi Pendidikan
                  </h1>
                  <span className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 text-xs font-black text-white shadow-xs border border-emerald-300/30">
                    Direktorat Pendidikan SIT
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl font-medium">
                  Instrumen operasional penjaminan mutu: supervisi mengajar, kurasi ujian bersama, sertifikasi tahfizh, pembiasaan bahasa, pelatihan guru, evaluasi laporan, dan radar akreditasi.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-300/50 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Live Dynamic Sync
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Master KPI Cards Grid (MasterStatsGrid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7 gap-3.5 items-stretch">
          <ModernWorkspaceKpiCard
            tag="KBM"
            title="Supervisi Kelas"
            value={stats?.supervisi?.avgSkor ? `${stats.supervisi.avgSkor}/100` : '-'}
            subtext={`${stats?.supervisi?.selesai ?? 0} guru dinilai selesai`}
            icon={GraduationCap}
            tone="emerald"
            isActive={selectedTab === 'supervisi-kbm'}
            onClick={() => handleTabChange('supervisi-kbm')}
          />
          <ModernWorkspaceKpiCard
            tag="UJIAN"
            title="Kurasi Soal"
            value={`${stats?.soal?.approved ?? 0} Naskah`}
            subtext={`${stats?.soal?.pending ?? 0} antrean kurasi`}
            icon={BookOpen}
            tone="purple"
            isActive={selectedTab === 'kurasi-soal'}
            onClick={() => handleTabChange('kurasi-soal')}
          />
          <ModernWorkspaceKpiCard
            tag="TAHFIZH"
            title="Munaqasyah"
            value={`${stats?.tahfizh?.lulus ?? 0} Santri`}
            subtext="Lulus tasmi' bersyahadah"
            icon={Award}
            tone="amber"
            isActive={selectedTab === 'tahfizh-munaqasyah'}
            onClick={() => handleTabChange('tahfizh-munaqasyah')}
          />
          <ModernWorkspaceKpiCard
            tag="BILINGUAL"
            title="Program Bahasa"
            value={`${stats?.bahasa?.totalPekan ?? 0} Kosakata`}
            subtext="Mufradat Arab & Inggris"
            icon={Languages}
            tone="sky"
            isActive={selectedTab === 'bahasa-mufradat'}
            onClick={() => handleTabChange('bahasa-mufradat')}
          />
          <ModernWorkspaceKpiCard
            tag="UPGRADING"
            title="Pelatihan Guru"
            value={`${stats?.pelatihan?.totalJP ?? 0} JP`}
            subtext={`${stats?.pelatihan?.totalAgenda ?? 0} agenda terlaksana`}
            icon={Sparkles}
            tone="teal"
            isActive={selectedTab === 'pelatihan-guru'}
            onClick={() => handleTabChange('pelatihan-guru')}
          />
          <ModernWorkspaceKpiCard
            tag="AUDIT"
            title="Laporan Kepsek"
            value={`${stats?.laporan?.disetujui ?? 0} Disetujui`}
            subtext={`${stats?.laporan?.revisi ?? 0} butuh perbaikan`}
            icon={FileCheck}
            tone="rose"
            isActive={selectedTab === 'revisi-laporan'}
            onClick={() => handleTabChange('revisi-laporan')}
          />
          <ModernWorkspaceKpiCard
            tag="STANDAR"
            title="Radar Akreditasi"
            value={stats?.akreditasi?.avgKesiapan ? `${stats.akreditasi.avgKesiapan}%` : '-'}
            subtext={`${stats?.akreditasi?.totalUnit ?? 0} unit terakreditasi`}
            icon={ShieldCheck}
            tone="indigo"
            isActive={selectedTab === 'radar-akreditasi'}
            onClick={() => handleTabChange('radar-akreditasi')}
          />
        </div>

        {/* Tab Navigation Pill Bar with Dynamic Tone Styling */}
        <Card className="border-2 border-emerald-500/25 shadow-md p-2 bg-white/95 dark:bg-[#1B2433] rounded-[20px]">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = selectedTab === tab.key
                const t = MODERN_CARD_TONES[tab.tone] || MODERN_CARD_TONES.emerald
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleTabChange(tab.key)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all duration-200 cursor-pointer ${
                      isActive
                        ? t.activeTab + ' scale-[1.02]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'opacity-80'}`} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tab Content Rendering with Animated Transition */}
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {selectedTab === 'supervisi-kbm' && <SupervisiKbmSection onDataMutate={loadOverviewStats} />}
          {selectedTab === 'kurasi-soal' && <KurasiBankSoalSection onDataMutate={loadOverviewStats} />}
          {selectedTab === 'tahfizh-munaqasyah' && <MunaqasyahTahfizhSection onDataMutate={loadOverviewStats} />}
          {selectedTab === 'bahasa-mufradat' && <PembiasaanBahasaSection onDataMutate={loadOverviewStats} />}
          {selectedTab === 'pelatihan-guru' && <PelatihanGuruSection onDataMutate={loadOverviewStats} />}
          {selectedTab === 'revisi-laporan' && <ReviewLaporanBulananSection onDataMutate={loadOverviewStats} />}
          {selectedTab === 'radar-akreditasi' && <RadarAkreditasiSection onDataMutate={loadOverviewStats} />}
        </motion.div>
      </div>
    </PageContainer>
  )
}

