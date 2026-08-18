import React, { useEffect, useState } from 'react'
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  HeartHandshake,
  Layers,
  MessageSquare,
  Sparkles,
  UserCheck,
  Users
} from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const kpiToneStyles = {
  emerald: 'border-emerald-100/80 bg-emerald-50/80 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300',
  blue: 'border-sky-100/80 bg-sky-50/80 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300',
  amber: 'border-amber-100/80 bg-amber-50/80 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300',
  violet: 'border-violet-100/80 bg-violet-50/80 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-300',
  rose: 'border-rose-100/80 bg-rose-50/80 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300',
  slate: 'border-slate-100/80 bg-slate-50/80 text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300'
}

const quickActionStyles = {
  emerald: 'bg-emerald-50/90 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50',
  blue: 'bg-sky-50/90 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/50',
  violet: 'bg-violet-50/90 text-violet-700 hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:hover:bg-violet-900/50',
  amber: 'bg-amber-50/90 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50',
  teal: 'bg-teal-50/90 text-teal-700 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-900/50',
  rose: 'bg-rose-50/90 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50'
}

export default function TeacherPortalPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/teacher/dashboard')
      if (res?.data?.success) {
        setData(res.data.data)
      } else {
        setError('Gagal memuat data portal guru')
      }
    } catch (err) {
      console.error(err)
      setError('Terjadi kesalahan saat menghubungkan ke server.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-[18px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-[18px]" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-[18px]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-6 rounded-[18px] text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <button
            onClick={fetchDashboard}
            className="mt-4 px-4 py-2 bg-[#0E5C44] text-white rounded-xl text-sm font-semibold hover:bg-[#1E8E5A] transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  const { teacher, academic_context, kpi, schedules_today, announcements } = data || {}

  const kpiItems = [
    {
      label: 'Jadwal Hari Ini',
      value: kpi?.schedules_today_count || 0,
      hint: 'Sesi Mengajar',
      icon: Clock,
      tone: 'emerald'
    },
    {
      label: 'Total Siswa',
      value: kpi?.total_students || 0,
      hint: `${kpi?.total_classes || 0} Rombel`,
      icon: Users,
      tone: 'blue'
    },
    {
      label: 'Belum Dinilai',
      value: kpi?.pending_grading_count || 0,
      hint: 'Pengumpulan Tugas',
      icon: FileText,
      tone: 'amber'
    },
    {
      label: 'Setoran Tahfizh',
      value: kpi?.tahfizh_today_count || 0,
      hint: 'Setoran Hari Ini',
      icon: BookOpen,
      tone: 'violet'
    },
    {
      label: 'Mutabaah Draft',
      value: kpi?.unverified_mutabaah_count || 0,
      hint: 'Perlu Verifikasi',
      icon: HeartHandshake,
      tone: 'rose'
    },
    {
      label: 'Notifikasi',
      value: kpi?.unread_notifications || 0,
      hint: 'Pesan Belum Dibaca',
      icon: MessageSquare,
      tone: 'slate'
    }
  ]

  const quickActions = [
    { to: '/portal-guru/workspace?tab=presensi', label: 'Input Presensi', icon: UserCheck, tone: 'emerald' },
    { to: '/portal-guru/workspace?tab=materi', label: 'Buat Materi', icon: BookOpen, tone: 'blue' },
    { to: '/portal-guru/workspace?tab=penugasan', label: 'Buat Tugas', icon: FileText, tone: 'violet' },
    { to: '/portal-guru/workspace?tab=penilaian', label: 'Input Nilai', icon: Layers, tone: 'amber' },
    { to: '/portal-guru/workspace?tab=tahfizh', label: 'Input Tahfizh', icon: CheckCircle, tone: 'teal' },
    { to: '/portal-guru/workspace?tab=catatan', label: 'Catatan Siswa', icon: MessageSquare, tone: 'rose' }
  ]

  return (
    <div className="min-h-screen bg-[#F7F9FC] px-4 py-5 text-slate-800 dark:bg-[#0F172A] dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <section className="overflow-hidden rounded-[24px] border border-emerald-100/60 bg-gradient-to-r from-[#0E5C44] via-[#1E8E5A] to-[#3FBF75] p-5 text-white shadow-[0_20px_60px_rgba(14,92,68,0.18)] sm:p-7">
          <div className="absolute right-0 top-0 pointer-events-none opacity-15">
            <Sparkles className="h-48 w-48 translate-x-10 -translate-y-8 sm:h-56 sm:w-56" />
          </div>
          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="mb-3 inline-flex rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-50 backdrop-blur">
                {teacher?.education_unit || 'Portal Guru Terpadu'}
              </span>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Assalamu&apos;alaikum, {teacher?.name || 'Ustadz/Ustadzah'}
              </h1>
              <p className="mt-2 text-sm text-emerald-50/95 sm:text-base">
                Selamat mengajar hari ini. {academic_context?.date} | Tahun Ajaran {academic_context?.academic_year} ({academic_context?.semester})
              </p>
            </div>

            <Link
              to="/portal-guru/workspace"
              className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-white px-4 py-2.5 text-sm font-semibold text-[#0E5C44] shadow-md transition hover:bg-emerald-50"
            >
              <BookOpen className="h-4 w-4" />
              Workspace Mengajar
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {kpiItems.map(({ label, value, hint, icon: Icon, tone }) => (
            <div key={label} className="rounded-[20px] border border-slate-200/70 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433]">
              <div className={`inline-flex rounded-2xl border p-2.5 ${kpiToneStyles[tone]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[22px] border border-slate-200/70 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1B2433] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
              Quick Actions Guru
            </h2>
            <span className="text-xs text-slate-400">Akses utama untuk hari ini</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {quickActions.map(({ to, label, icon: Icon, tone }) => (
              <Link
                key={label}
                to={to}
                className={`flex items-center justify-between rounded-[16px] border border-slate-200/70 px-4 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 ${quickActionStyles[tone]}`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
                <span className="text-base">→</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_0.9fr]">
          <div className="rounded-[22px] border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Jadwal Mengajar Hari Ini</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Ringkasan agenda mengajar yang siap dikerjakan.</p>
              </div>
              <Link to="/portal-guru/workspace?tab=jadwal" className="text-sm font-semibold text-[#0E5C44] hover:underline">
                Lihat Semua Jadwal →
              </Link>
            </div>

            {(!schedules_today || schedules_today.length === 0) ? (
              <div className="rounded-[16px] border border-dashed border-slate-200 px-6 py-10 text-center dark:border-slate-700">
                <Calendar className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="font-semibold text-slate-600 dark:text-slate-300">Tidak ada jadwal mengajar hari ini.</p>
                <p className="mt-1 text-sm text-slate-400">Manfaatkan waktu untuk merancang materi dan merekap nilai.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {schedules_today.map((sch) => (
                  <div
                    key={sch.id}
                    className="flex flex-col gap-3 rounded-[16px] border border-slate-200/70 bg-slate-50/70 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="min-w-[96px] rounded-[12px] bg-[#0E5C44] px-3 py-2 text-center text-xs font-bold text-white">
                        {sch.start_time || '07:30'} - {sch.end_time || '09:00'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{sch.subject?.name || 'Mata Pelajaran'}</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Kelas <span className="font-medium text-slate-700 dark:text-slate-300">{sch.kelas?.name || 'Rombel'}</span> • Ruangan {sch.room_name || 'R. Kelas'}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/portal-guru/workspace?tab=presensi&schedule_id=${sch.id}`}
                      className="inline-flex items-center justify-center rounded-[12px] bg-[#0E5C44] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#1E8E5A]"
                    >
                      Presensi Siswa
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[22px] border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Pengumuman Sekolah</h2>
            </div>

            {(!announcements || announcements.length === 0) ? (
              <div className="rounded-[16px] border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400 dark:border-slate-700">
                Belum ada pengumuman terbaru.
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((anc) => (
                  <div key={anc.id} className="rounded-[14px] border border-amber-200/60 bg-amber-50/60 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                    <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300">{anc.title || anc.judul}</h4>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{anc.content || anc.isi}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
