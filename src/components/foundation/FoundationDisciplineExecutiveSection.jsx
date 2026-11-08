import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Crown,
  FileText,
  Award,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Building2,
  CheckCircle2,
  Scale,
} from 'lucide-react'
import { Chip as HeroChip, Button as HeroButton, Spinner as HeroSpinner } from '@heroui/react'
import { disciplineService } from '../../services/disciplineService'

export default function FoundationDisciplineExecutiveSection() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const fetchOverview = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await disciplineService.getFoundationOverview()
      if (res.success && res.data) {
        setData(res.data)
      } else {
        setError(res.message || 'Gagal memuat overview eksekutif kedisiplinan yayasan.')
      }
    } catch (err) {
      console.error('Failed to fetch foundation discipline overview:', err)
      setError(err?.response?.data?.message || 'Gagal memuat overview eksekutif kedisiplinan yayasan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-3xl bg-white border border-slate-200/80 shadow-xs dark:bg-[#182232] dark:border-slate-800">
        <HeroSpinner color="primary" label="Menghubungkan ke Ringkasan Eksekutif Adab Yayasan..." />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50/50 border border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/60 dark:text-rose-300 text-center">
        <AlertCircle className="w-8 h-8 mx-auto text-rose-600 mb-2" />
        <p className="font-bold text-sm">{error || 'Data ringkasan eksekutif tidak tersedia.'}</p>
        <HeroButton size="sm" color="danger" variant="flat" className="mt-3 font-bold" onPress={fetchOverview}>
          Coba Lagi
        </HeroButton>
      </div>
    )
  }

  const { scorecard, critical_watchlist, severe_warning_letters, unit_ranking } = data

  return (
    <div className="space-y-6">
      {/* ── 1. HERO EXECUTIVE YAYASAN ── */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
        <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-52 w-52 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/30">
              <Crown className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                  <Sparkles className="h-3 w-3" /> Ringkasan Eksekutif Yayasan
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:border-emerald-700 dark:text-emerald-300">
                  Pengurus & Pembina Yayasan
                </span>
              </div>
              <h2 className="mt-1.5 text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                Tata Kelola Karakter & Mitigasi Risiko Disiplin
              </h2>
              <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                Laporan makro iklim kepatuhan adab santri, pengawasan kasus sanksi berat (SP2/DO), dan perlindungan integritas lembaga.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <HeroButton
              size="sm"
              variant="flat"
              color="primary"
              className="font-black rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-xs"
              startContent={<RefreshCw className="h-3.5 w-3.5" />}
              onPress={fetchOverview}
            >
              Segarkan
            </HeroButton>
          </div>
        </div>
      </div>

      {/* ── 2. MACRO EXECUTIVE SCORECARD ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative overflow-hidden rounded-[20px] border-2 border-emerald-200 bg-white p-4 shadow-sm dark:border-emerald-900/60 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Indeks Kepatuhan Adab Yayasan
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{scorecard.compliance_rate}%</p>
            <span className="text-xs font-bold text-slate-400">Santri Tertib</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
            <span className="text-[10px] text-slate-500">{scorecard.clean_students} dari {scorecard.total_students} Santri</span>
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              0 Pelanggaran
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[20px] border-2 border-amber-300 bg-amber-50/30 p-4 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Total Surat Peringatan Berat
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-amber-700 dark:text-amber-400">{scorecard.total_severe_sp}</p>
            <span className="text-xs font-bold text-amber-700/70">Berkas SP</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-amber-100 pt-2 dark:border-amber-900/50">
            <span className="text-[10px] text-amber-700/90 font-medium">SP1, SP2, dan Keluar</span>
            <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Level 4 - 6
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[20px] border-2 border-rose-300 bg-rose-50/30 p-4 shadow-sm dark:border-rose-900/60 dark:bg-rose-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300">
              Pelanggaran Kategori Berat
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{scorecard.total_permanent_violations}</p>
            <span className="text-xs font-bold text-rose-600/70">Kasus Permanen</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-rose-100 pt-2 dark:border-rose-900/50">
            <span className="text-[10px] text-rose-600/90 font-medium">Asusila, Narkoba, Fisik</span>
            <span className="inline-flex items-center rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              Mitigasi Hukum
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[20px] border-2 border-indigo-200 bg-white p-4 shadow-sm dark:border-indigo-900/60 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Status Integritas Yayasan
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">Terkendali</p>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
            <span className="text-[10px] text-slate-500">Zero Public Escalation</span>
            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Aman
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. CRITICAL ESCALATION WATCHLIST & REKOMENDASI KEPSEK ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Watchlist Kasus Berat & Permanen */}
        <div className="flex flex-col rounded-[22px] border-2 border-rose-300 dark:border-rose-900/60 bg-white shadow-md shadow-rose-950/10 dark:bg-[#1B2433] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-rose-200/90 dark:border-rose-900/60 bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-rose-950 dark:text-rose-200">
                  Critical Watchlist: Kasus Berat & Sanksi Level Tinggi
                </h3>
                <p className="text-[11px] text-slate-500">Hanya menampilkan pelanggaran yang berpotensi pemulangan/pengeluaran</p>
              </div>
            </div>
            <HeroChip size="sm" color="danger" variant="flat" className="font-extrabold text-[10px]">
              {critical_watchlist.length} Kasus
            </HeroChip>
          </div>

          <div className="flex-1 p-4 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-[420px]">
            {critical_watchlist.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <ShieldCheck className="h-10 w-10 mx-auto text-emerald-500 mb-2 opacity-80" />
                <p className="font-bold text-xs">Alhamdulillah, Nihil Kasus Kritis Berat di Seluruh Satuan Pendidikan.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Tidak ada santri yang terlibat pelanggaran permanen atau sanksi pemulangan.</p>
              </div>
            ) : (
              critical_watchlist.map((tr) => (
                <div key={tr.id} className="py-3 flex items-start justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-slate-900 dark:text-white">
                        {tr.student?.full_name || 'Santri'}
                      </span>
                      <HeroChip size="sm" color="danger" variant="flat" className="text-[9px] font-black h-5">
                        {tr.category?.level?.toUpperCase() || 'BERAT'}
                      </HeroChip>
                    </div>
                    <p className="text-[11px] font-bold text-rose-700 dark:text-rose-300 mt-0.5">
                      {tr.category?.name}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Unit: <b>{tr.student?.educationUnit?.name || '-'}</b> • Rombel: <b>{tr.student?.kelas?.nama_kelas || '-'}</b> • Tanggal: {tr.transaction_date}
                    </p>
                    {tr.category?.direct_consequence && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Konsekuensi: <i className="text-slate-600 dark:text-slate-300">{tr.category.direct_consequence}</i>
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-flex items-center rounded-md bg-rose-100 px-2 py-0.5 text-xs font-black text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      +{tr.points} Poin
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Peringkat Kepatuhan Unit Binaan */}
        <div className="flex flex-col rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-200/90 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Peringkat Kepatuhan Adab Unit Sekolah
                </h3>
                <p className="text-[11px] text-slate-500">Evaluasi tahunan persentase kedisiplinan per unit</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-[420px]">
            {unit_ranking.map((u, idx) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${idx === 0 ? 'bg-amber-400 text-slate-900' : idx === 1 ? 'bg-slate-300 text-slate-900' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="font-black text-xs text-slate-900 dark:text-white">{u.name}</h5>
                    <p className="text-[10px] text-slate-500">{u.total_students} Santri Terdaftar</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden hidden sm:block">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                      style={{ width: `${u.compliance_rate}%` }}
                    />
                  </div>
                  <span className="font-black text-xs text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {u.compliance_rate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
