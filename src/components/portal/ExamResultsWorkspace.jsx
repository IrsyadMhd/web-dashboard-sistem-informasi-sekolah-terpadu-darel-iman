import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, CheckCircle2, FileText, BarChart3, Lock } from 'lucide-react'

const cardStyle = 'rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'

const formatDate = (val) => val ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(val)) : '-'

export default function ExamResultsWorkspace({ resultsData = null, reports = [], loading = false }) {
  const [activeTab, setActiveTab] = useState('all')

  const cbtResults = useMemo(() => resultsData?.cbt_results || [], [resultsData])
  const assignmentResults = useMemo(() => resultsData?.assignment_results || [], [resultsData])
  const grades = useMemo(() => resultsData?.grades || [], [resultsData])

  const stats = useMemo(() => {
    const totalCompleted = (resultsData?.summary?.total_completed ?? (cbtResults.length + assignmentResults.length))
    const avgScore = resultsData?.summary?.average_score ? Math.round(resultsData.summary.average_score) : '-'

    const tuntasCount = [...cbtResults, ...assignmentResults].filter((r) => r.status_tuntas === 'Tuntas').length

    return { totalCompleted, avgScore, tuntasCount }
  }, [resultsData, cbtResults, assignmentResults])

  const allList = useMemo(() => {
    const combined = [
      ...cbtResults.map((c) => ({ ...c, itemType: 'ujian' })),
      ...assignmentResults.map((a) => ({ ...a, itemType: 'tugas' })),
      ...grades.map((g) => ({ ...g, itemType: 'rapor_komponen' })),
    ]

    if (activeTab === 'ujian') return combined.filter((i) => i.itemType === 'ujian')
    if (activeTab === 'tugas') return combined.filter((i) => i.itemType === 'tugas')
    if (activeTab === 'rapor') return reports.map((r) => ({ ...r, itemType: 'rapor' }))
    return combined
  }, [cbtResults, assignmentResults, grades, reports, activeTab])

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Award className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.avgScore}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Rata-rata Hasil</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Rata-rata skor evaluasi</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{cbtResults.length}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Ujian CBT Selesai</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Total sesi dikumpulkan</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <FileText className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{assignmentResults.length}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Tugas Dinilai</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Tugas terdaftar & dinilai</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              <BarChart3 className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.tuntasCount}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Hasil Tuntas</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Evaluasi &ge; KKM</p>
        </motion.div>
      </div>

      {/* Main Workspace Card */}
      <div className={cardStyle}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Hasil Evaluasi Belajar</h3>
            <p className="mt-0.5 text-xs text-slate-500">Hasil ujian CBT, penugasan dinilai, dan publikasi rapor resmi.</p>
          </div>

          <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {[
              { id: 'all', label: 'Semua Hasil' },
              { id: 'ujian', label: 'Ujian CBT' },
              { id: 'tugas', label: 'Tugas' },
              { id: 'rapor', label: 'Rapor' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${activeTab === tab.id ? 'bg-[#0E5C44] text-white shadow' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List Hasil */}
        <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
          {allList.map((item, idx) => (
            <div key={item.id || idx} className="flex flex-wrap items-center justify-between gap-4 py-4 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    {item.subject || item.semester?.name || 'Evaluasi'}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {item.itemType === 'ujian' ? 'Ujian CBT' : item.itemType === 'tugas' ? 'Tugas' : item.itemType === 'rapor' ? 'Rapor' : 'Komponen'}
                  </span>
                </div>
                <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{item.title || `Rapor ${item.semester?.name || ''}`}</h4>
                <p className="mt-0.5 text-slate-500">Selesai/Terbit: {formatDate(item.date || item.tanggal_terbit || item.created_at)}</p>

                {item.notes && <p className="mt-1 italic text-slate-600 dark:text-slate-400">"{item.notes}"</p>}
              </div>

              <div className="text-right">
                {item.is_published !== false && item.score != null ? (
                  <>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{item.score}</p>
                    {item.correct != null && (
                      <p className="text-[10px] text-slate-400">
                        Benar: {item.correct} · Salah: {item.wrong} · Kosong: {item.empty}
                      </p>
                    )}
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${item.status_tuntas === 'Tuntas' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {item.status_tuntas || 'Tuntas'}
                    </span>
                  </>
                ) : (
                  <span className="flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    <Lock className="h-3.5 w-3.5" />
                    Menunggu Publikasi
                  </span>
                )}
              </div>
            </div>
          ))}

          {!allList.length && (
            <div className="py-16 text-center text-xs text-slate-400">
              <Award className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              Belum ada hasil evaluasi pada kategori ini.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
