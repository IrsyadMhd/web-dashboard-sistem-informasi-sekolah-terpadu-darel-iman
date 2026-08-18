import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BookOpenCheck, Target, Award, Calendar, CheckCircle2, User, Sparkles } from 'lucide-react'

const cardStyle = 'rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'

const formatDate = (val) => val ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(val)) : '-'

export default function TahfizhWorkspace({ logs = [], target = null, loading = false }) {
  const safeLogs = useMemo(() => {
    if (Array.isArray(logs)) return logs
    if (logs && Array.isArray(logs.data)) return logs.data
    return []
  }, [logs])

  const totalAyat = useMemo(() => {
    return safeLogs.reduce((acc, curr) => acc + (Number(curr.jumlah_ayat) || 0), 0)
  }, [safeLogs])

  const latestLog = safeLogs[0]

  const thisMonthLogs = useMemo(() => {
    const now = new Date()
    return safeLogs.filter((log) => {
      if (!log.date) return false
      const logDate = new Date(log.date)
      return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear()
    })
  }, [safeLogs])

  const targetProgress = useMemo(() => {
    const targetAyat = target?.target_ayat || 300
    return Math.min(100, Math.round((totalAyat / targetAyat) * 100))
  }, [totalAyat, target])

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <BookOpenCheck className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{totalAyat}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Total Hafalan (Ayat)</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Total ayat yang disetorkan</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Target className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{target?.surah_target || 'Juz 30'}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Target Semester</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Capaian yang ditargetkan</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <Award className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{targetProgress}%</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Progress Hafalan</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-amber-500" style={{ width: `${targetProgress}%` }} />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              <Calendar className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{thisMonthLogs.length}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Setoran Bulan Ini</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Frekuensi setoran hafalan</p>
        </motion.div>
      </div>

      {/* Target Active Card */}
      <div className={`${cardStyle} bg-gradient-to-r from-emerald-900 to-teal-800 text-white dark:from-slate-900 dark:to-slate-900`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              <Sparkles className="h-3 w-3" /> Hafalan Terakhir
            </span>
            <h3 className="mt-2 text-xl font-black">
              {latestLog ? `${latestLog.surah} (Ayat ${latestLog.ayat_start}-${latestLog.ayat_end})` : 'Belum Ada Setoran'}
            </h3>
            <p className="mt-1 text-xs text-emerald-100">
              {latestLog ? `Tanggal: ${formatDate(latestLog.date)} · Pengampu: ${latestLog.teacher?.nama_lengkap || 'Guru Tahfizh'}` : 'Segera lakukan setoran hafalan kepada guru tahfizh.'}
            </p>
          </div>
        </div>
      </div>

      {/* Riwayat Setoran */}
      <div className={cardStyle}>
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Riwayat Setoran Tahfizh</h3>
          <p className="mt-0.5 text-xs text-slate-500">Catatan setoran hafalan harian siswa.</p>
        </div>

        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {safeLogs.map((item, idx) => (
            <div key={item.id || idx} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{item.surah || item.nama_surah || 'Surah'}</span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Ayat {item.ayat_mulai || item.ayat_awal || 1} - {item.ayat_selesai || item.ayat_akhir || item.jumlah_ayat || 1}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {formatDate(item.date || item.tanggal)} · Penguji: {item.teacher?.nama_lengkap || item.teacher?.name || item.penguji || 'Ustadz/Ustazah'}
                </p>
                {item.catatan && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic font-medium">"{item.catatan}"</p>
                )}
              </div>
              <span className={`rounded-xl px-3 py-1 text-xs font-bold ${item.nilai === 'A' || item.nilai === 'Lancar' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                {item.nilai || item.predikat || 'Lancar'}
              </span>
            </div>
          ))}

          {!logs.length && (
            <div className="py-16 text-center text-xs text-slate-400">
              <BookOpenCheck className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              Belum ada riwayat setoran tahfizh.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
