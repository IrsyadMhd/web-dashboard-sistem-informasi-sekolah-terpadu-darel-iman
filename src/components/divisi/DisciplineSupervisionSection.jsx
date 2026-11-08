import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Building2,
  Scale,
  Sparkles,
  Layers,
  TrendingDown,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Award,
} from 'lucide-react'
import { Chip as HeroChip, Button as HeroButton, Spinner as HeroSpinner } from '@heroui/react'
import { disciplineService } from '../../services/disciplineService'

export default function DisciplineSupervisionSection() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const fetchOverview = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await disciplineService.getDivisiOverview()
      if (res.success && res.data) {
        setData(res.data)
      } else {
        setError(res.message || 'Gagal memuat supervisi kedisiplinan divisi.')
      }
    } catch (err) {
      console.error('Failed to fetch divisi discipline overview:', err)
      setError(err?.response?.data?.message || 'Gagal memuat supervisi kedisiplinan divisi.')
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
        <HeroSpinner color="primary" label="Menghubungkan ke Supervisi Tata Tertib Lintas Unit..." />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50/50 border border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/60 dark:text-rose-300 text-center">
        <AlertCircle className="w-8 h-8 mx-auto text-rose-600 mb-2" />
        <p className="font-bold text-sm">{error || 'Data supervisi tidak tersedia.'}</p>
        <HeroButton size="sm" color="danger" variant="flat" className="mt-3 font-bold" onPress={fetchOverview}>
          Coba Lagi
        </HeroButton>
      </div>
    )
  }

  const { macro_kpi, unit_benchmarks, compliance_audit, cluster_distribution } = data

  return (
    <div className="space-y-6">
      {/* ── 1. HERO SUPERVISI DIVISI PENDIDIKAN ── */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
        <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-52 w-52 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/30">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                  <Sparkles className="h-3 w-3" /> Supervisi Penjaminan Mutu & Adab
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:border-emerald-700 dark:text-emerald-300">
                  {macro_kpi.total_units} Satuan Pendidikan
                </span>
              </div>
              <h2 className="mt-1.5 text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                Benchmarking Kedisiplinan Lintas Unit Sekolah & Pondok
              </h2>
              <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                Audit kepatuhan SOP tata tertib, komparasi indeks ketertiban antar-unit, dan pengawasan eskalasi sanksi.
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

      {/* ── 2. MACRO SCORECARD GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative overflow-hidden rounded-[20px] border-2 border-emerald-200 bg-white p-4 shadow-sm dark:border-emerald-900/60 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Rata-Rata Kepatuhan Yayasan
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{macro_kpi.overall_compliance_rate}%</p>
            <span className="text-xs font-bold text-slate-400">Santri Tertib</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
            <span className="text-[10px] text-slate-500">{macro_kpi.clean_students} dari {macro_kpi.total_students} Santri</span>
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Sangat Baik
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[20px] border-2 border-rose-300 bg-rose-50/30 p-4 shadow-sm dark:border-rose-900/60 dark:bg-rose-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300">
              Total Siswa Rawan (≥100)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{macro_kpi.total_high_risk_students}</p>
            <span className="text-xs font-bold text-rose-600/70">Santri Se-Yayasan</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-rose-100 pt-2 dark:border-rose-900/50">
            <span className="text-[10px] text-rose-600/90 font-medium">Batas Sanksi ST/SP</span>
            <span className="inline-flex items-center rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              Perlu Intervensi
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[20px] border-2 border-amber-300 bg-amber-50/30 p-4 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Surat Peringatan Terbit
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-amber-700 dark:text-amber-400">{macro_kpi.total_warning_letters}</p>
            <span className="text-xs font-bold text-amber-700/70">Surat Resmi</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-amber-100 pt-2 dark:border-amber-900/50">
            <span className="text-[10px] text-amber-700/90 font-medium">Seluruh Unit Sekolah</span>
            <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              ST / SP1 / SP2
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[20px] border-2 border-indigo-200 bg-white p-4 shadow-sm dark:border-indigo-900/60 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Audit Pending Sanksi
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{macro_kpi.unissued_sp_count}</p>
            <span className="text-xs font-bold text-slate-400">Belum Ada SP</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
            <span className="text-[10px] text-slate-500">Poin ≥100 tanpa surat</span>
            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Audit SOP
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. TABEL BENCHMARKING KOMPARATIF LINTAS UNIT PENDIDIKAN ── */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-200/90 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Tabel Komparasi & Kepatuhan Tata Tertib Antar-Unit
              </h3>
              <p className="text-[11px] text-slate-500">Perbandingan rasio kepatuhan adab santri dari jenjang TK s.d. SMA & Ponpes</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-slate-700 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:text-slate-200 font-black uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Nama Unit Pendidikan</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4 text-center">Total Santri</th>
                <th className="py-3 px-4 text-center">Santri Tertib (0 Poin)</th>
                <th className="py-3 px-4">Indeks Kepatuhan</th>
                <th className="py-3 px-4 text-center">Rawan (≥100)</th>
                <th className="py-3 px-4 text-center">SP Terbit</th>
                <th className="py-3 px-4 text-right">Total Poin Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
              {unit_benchmarks.map((u) => (
                <tr key={u.unit_id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {u.unit_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <HeroChip
                      size="sm"
                      variant="flat"
                      color={u.program_type === 'boarding' ? 'warning' : 'default'}
                      className="text-[10px] font-black h-5"
                    >
                      {u.program_type === 'boarding' ? 'Boarding' : 'Fullday'}
                    </HeroChip>
                  </td>
                  <td className="py-3.5 px-4 text-center font-black tabular-nums">
                    {u.total_students}
                  </td>
                  <td className="py-3.5 px-4 text-center font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {u.clean_students}
                  </td>
                  <td className="py-3.5 px-4 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                          style={{ width: `${u.compliance_rate}%` }}
                        />
                      </div>
                      <span className="font-black text-[11px] tabular-nums text-emerald-700 dark:text-emerald-400 shrink-0">
                        {u.compliance_rate}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`font-black tabular-nums ${u.high_risk_count > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                      {u.high_risk_count}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                    {u.sp_count}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black tabular-nums text-slate-900 dark:text-white">
                    {u.total_points} Poin
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. AUDIT KEPATUHAN PENANGANAN (SISWA ≥100 POIN TANPA SP) ── */}
      {compliance_audit.length > 0 && (
        <div className="rounded-[22px] border-2 border-rose-300 bg-rose-50/20 p-5 shadow-sm dark:border-rose-900/60 dark:bg-rose-950/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-rose-900 dark:text-rose-200">
                Audit Supervisi: {compliance_audit.length} Santri Melebihi Ambang Sanksi Namun Belum Menerima SP
              </h4>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80">
                Divisi Pendidikan merekomendasikan Kepala Sekolah dan TU segera menerbitkan Surat Teguran/SP dan memanggil orang tua siswa terkait.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {compliance_audit.map((st) => (
              <div key={st.id} className="p-3 rounded-2xl bg-white border border-rose-200/80 shadow-xs dark:bg-[#1B2433] dark:border-rose-900/50">
                <div className="flex items-start justify-between">
                  <h5 className="font-black text-xs text-slate-900 dark:text-white truncate">{st.full_name}</h5>
                  <HeroChip size="sm" color="danger" variant="flat" className="font-black text-[9px] h-5">
                    {st.total_points} Poin
                  </HeroChip>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  NIS: {st.nis} • {st.unit_name} • {st.kelas}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                  <span className="text-rose-600 font-bold">{st.audit_status}</span>
                  <span className="text-slate-400">Level 3 Sanksi TU</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
