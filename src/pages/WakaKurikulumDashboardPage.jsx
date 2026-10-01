import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Calendar,
  Target,
  Award,
  FileSpreadsheet,
  CheckSquare,
  RefreshCw,
  Sparkles,
  Layers,
  GraduationCap,
  ArrowRight,
} from 'lucide-react'

import {
  AppBreadcrumb,
  PageContainer,
} from '../components/app'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import { Button } from '@/components/tailgrids/core/button'
import { managementDashboardService } from '../services/managementDashboardService'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 26 },
  },
}

const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/30',
    tag: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
  },
  blue: {
    card: 'border-sky-300/70 bg-gradient-to-br from-sky-50 via-blue-50/60 to-white hover:border-sky-400 dark:border-sky-700/50 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-slate-900',
    glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
    iconBox: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm shadow-sky-500/30',
    tag: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300',
    title: 'text-sky-700 dark:text-sky-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
  },
  teal: {
    card: 'border-teal-300/70 bg-gradient-to-br from-teal-50 via-emerald-50/60 to-white hover:border-teal-400 dark:border-teal-700/50 dark:from-teal-950/40 dark:via-emerald-950/20 dark:to-slate-900',
    glow: 'bg-teal-400/20 group-hover:bg-teal-400/30',
    iconBox: 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm shadow-teal-500/30',
    tag: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300',
    title: 'text-teal-700 dark:text-teal-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
  },
}

function ModernKpiCard({ icon: Icon, label, subtext, value, tag, tone = 'emerald' }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald

  return (
    <article
      className={`group relative overflow-hidden rounded-[18px] border-2 p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left flex flex-col justify-between h-full cursor-default ${t.card}`}
    >
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${t.iconBox}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-wider ${t.title}`}>{label}</p>
            </div>
          </div>
          {tag && (
            <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold ${t.tag}`}>
              {tag}
            </span>
          )}
        </div>

        <p className={`text-3xl sm:text-4xl font-black tabular-nums tracking-tight ${t.val}`}>
          {value ?? '0'}
        </p>
        {subtext && (
          <p className={`mt-1 text-[11px] font-semibold ${t.sub}`}>
            {subtext}
          </p>
        )}
      </div>
    </article>
  )
}

export default function WakaKurikulumDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await managementDashboardService.getWakaKurikulum()
      if (res && res.data) {
        setData(res.data)
      } else {
        setError('Format respon server tidak valid.')
      }
    } catch (err) {
      console.error('Failed to load Waka Kurikulum dashboard:', err)
      setError(err.response?.data?.message || 'Gagal memuat data dashboard Waka Kurikulum.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  if (loading && !data) return <SkeletonDashboard />
  if (error && !data) return <ErrorState message={error} onRetry={fetchDashboard} />

  const kpis = data?.kpis || {}
  const context = data?.context || {}

  const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

  return (
    <PageContainer maxW="7xl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 pb-12"
      >
        {/* ── Breadcrumb ── */}
        <motion.div variants={itemVariants}>
          <AppBreadcrumb items={[{ label: 'Dashboard Waka Kurikulum' }]} />
        </motion.div>

        {/* ── Modern Hero Card ── */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900"
        >
          {/* Ambient Glow Blobs */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Dashboard Waka Kurikulum
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Manajemen Kurikulum & Akademik
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Kelola dan pantau kesiapan kurikulum, jadwal pelajaran, perangkat ajar CP/TP, kisi-kisi, modul ajar, dan evaluasi CBT terpadu.
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-emerald-100/80 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 font-mono">
                    {context.tahun_ajaran ? `TA ${context.tahun_ajaran.nama}` : 'TA 2026/2027'}
                  </span>
                  <span className="rounded-md bg-teal-100/80 px-2 py-0.5 text-[11px] font-bold text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 font-mono">
                    {context.semester ? `Semester ${context.semester.nama}` : 'Semester Ganjil'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap self-end sm:self-center">
              <Button
                variant="primary"
                appearance="fill"
                size="sm"
                onClick={() => navigate('/dashboard/master/kurikulum')}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                <BookOpen className="mr-1.5 h-4 w-4" /> Master Kurikulum
              </Button>
              <Button
                variant="ghost"
                appearance="outline"
                size="sm"
                onClick={fetchDashboard}
                className="border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 cursor-pointer"
              >
                <RefreshCw className="mr-1.5 h-4 w-4" /> Segarkan Data
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── Section 1: Metrik Mata Pelajaran & Perangkat Ajar ── */}
        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <BookOpen className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Metrik Mata Pelajaran & Perangkat Ajar
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Distribusi mata pelajaran, jadwal KBM, Capaian Pembelajaran (CP), dan Tujuan Pembelajaran (TP)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ModernKpiCard
              icon={BookOpen}
              label="Mata Pelajaran Aktif"
              subtext="Mapel kurikulum terdaftar"
              value={formatNumber(kpis.total_subjects?.total)}
              tag="Mapel"
              tone="emerald"
            />
            <ModernKpiCard
              icon={Calendar}
              label="Jadwal Pelajaran"
              subtext="Sesi KBM terjadwal"
              value={formatNumber(kpis.total_schedules?.total)}
              tag="Jadwal"
              tone="blue"
            />
            <ModernKpiCard
              icon={Target}
              label="Capaian Pembelajaran (CP)"
              subtext="Kompetensi dasar kurikulum"
              value={formatNumber(kpis.total_cp?.total)}
              tag="CP"
              tone="teal"
            />
            <ModernKpiCard
              icon={Award}
              label="Tujuan Pembelajaran (TP)"
              subtext="Matriks capaian sasaran TP"
              value={formatNumber(kpis.total_tp?.total)}
              tag="TP"
              tone="amber"
            />
          </div>
        </motion.div>

        {/* ── Section 2: Kesiapan LMS & Evaluasi Pembelajaran ── */}
        <motion.div variants={itemVariants} className="space-y-3 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
              <Layers className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Kesiapan LMS & Evaluasi Pembelajaran
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Penyusunan modul ajar, bank soal terstandar, kisi-kisi instrumen, dan jadwal CBT
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ModernKpiCard
              icon={FileSpreadsheet}
              label="Modul Ajar"
              subtext="Perangkat ajar guru aktif"
              value={formatNumber(kpis.total_modul_ajar?.total)}
              tag="Modul"
              tone="emerald"
            />
            <ModernKpiCard
              icon={CheckSquare}
              label="Kisi-kisi Ujian"
              subtext="Matriks instrumen penilaian"
              value={formatNumber(kpis.total_kisi_kisi?.total)}
              tag="Kisi-kisi"
              tone="amber"
            />
            <ModernKpiCard
              icon={BookOpen}
              label="Bank Soal Terdaftar"
              subtext="Koleksi butir soal evaluasi"
              value={formatNumber(kpis.total_bank_soal?.total)}
              tag="Bank Soal"
              tone="blue"
            />
            <ModernKpiCard
              icon={Calendar}
              label="Ujian CBT Terjadwal"
              subtext="Sesi CBT diselenggarakan"
              value={formatNumber(kpis.total_ujian_cbt?.total)}
              tag="Ujian CBT"
              tone="teal"
            />
          </div>
        </motion.div>
      </motion.div>
    </PageContainer>
  )
}
