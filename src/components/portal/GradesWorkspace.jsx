import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, TrendingUp, CheckCircle, AlertCircle, Search, Filter } from 'lucide-react'

const cardStyle = 'rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'

export default function GradesWorkspace({ grades = [], loading = false }) {
  const [search, setSearch] = useState('')

  const safeGrades = useMemo(() => {
    if (Array.isArray(grades)) return grades
    if (grades && Array.isArray(grades.data)) return grades.data
    return []
  }, [grades])

  const numericScores = useMemo(() => {
    return safeGrades.map((g) => Number(g.final_score || g.nilai_akhir || g.nilai_tugas)).filter(Number.isFinite)
  }, [safeGrades])

  const stats = useMemo(() => {
    if (!numericScores.length) return { avg: '-', max: '-', tuntas: 0, belumTuntas: 0 }
    const avg = Math.round(numericScores.reduce((a, b) => a + b, 0) / numericScores.length)
    const max = Math.max(...numericScores)
    const tuntas = numericScores.filter((s) => s >= 75).length
    const belumTuntas = numericScores.filter((s) => s < 75).length

    return { avg, max, tuntas, belumTuntas }
  }, [numericScores])

  const filteredGrades = useMemo(() => {
    return safeGrades.filter((g) => {
      const subjectName = g.subject?.name || g.mata_pelajaran || ''
      return !search || subjectName.toLowerCase().includes(search.toLowerCase())
    })
  }, [safeGrades, search])

  return (
    <div className="space-y-5">
      {/* KPI Section */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Award className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.avg}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Rata-rata Nilai</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Rata-rata seluruh mata pelajaran</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <TrendingUp className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.max}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Nilai Tertinggi</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Capaian skor tertinggi</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
              <CheckCircle className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.tuntas}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Mapel Tuntas</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Nilai &ge; KKM (75)</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              <AlertCircle className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.belumTuntas}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Perlu Perbaikan</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Nilai &lt; KKM (75)</p>
        </motion.div>
      </div>

      {/* Main Workspace Card */}
      <div className={cardStyle}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Daftar Nilai Hasil Belajar</h3>
            <p className="mt-0.5 text-xs text-slate-500">Nilai resmi berstatus published dari modul utama.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari mata pelajaran..."
              className="h-9 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>

        {/* Grid Nilai */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGrades.map((item, idx) => {
            const finalScore = Number(item.final_score || item.nilai_akhir || item.nilai_tugas || 0)
            const isTuntas = finalScore >= 75
            const predikat = finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : finalScore >= 75 ? 'C' : 'D'

            return (
              <div
                key={item.id || idx}
                className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500">{item.subject?.code || 'MAPEL'}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${isTuntas ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}`}>
                      {isTuntas ? 'Tuntas' : 'Perlu Remedial'}
                    </span>
                  </div>

                  <h4 className="mt-2 text-base font-bold text-slate-900 dark:text-white">{item.subject?.name || item.mata_pelajaran || 'Mata Pelajaran'}</h4>

                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">Nilai Akhir</p>
                      <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{finalScore}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Predikat</p>
                      <p className="text-xl font-black text-slate-800 dark:text-slate-200">{predikat}</p>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="mt-3 text-xs italic text-slate-500">
                      "{item.notes}"
                    </p>
                  )}
                </div>
              </div>
            )
          })}

          {!filteredGrades.length && (
            <div className="col-span-full py-16 text-center text-xs text-slate-400">
              <Award className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              Belum ada data nilai yang dipublikasikan.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
