import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpenCheck, Clock, FileText, Search, User, Target, Layers } from 'lucide-react'

const cardStyle = 'rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'

export default function ExamGridsWorkspace({ grids = [], loading = false }) {
  const [search, setSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [activeModal, setActiveModal] = useState(null)

  const subjects = useMemo(() => {
    return Array.from(new Set(grids.map((g) => g.subject?.name || g.mata_pelajaran).filter(Boolean)))
  }, [grids])

  const filteredGrids = useMemo(() => {
    return grids.filter((g) => {
      const title = g.judul_kisi || g.judul || ''
      const subject = g.subject?.name || g.mata_pelajaran || ''
      const searchMatch = !search || title.toLowerCase().includes(search.toLowerCase()) || subject.toLowerCase().includes(search.toLowerCase())
      const subjectMatch = !selectedSubject || subject === selectedSubject
      return searchMatch && subjectMatch
    })
  }, [grids, search, selectedSubject])

  return (
    <div className="space-y-5">
      {/* Header Toolbar */}
      <div className={cardStyle}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Kisi-Kisi Ujian</h2>
            <p className="mt-0.5 text-xs text-slate-500">Panduan materi, kompetensi, dan kisi-kisi soal ujian yang dipublikasikan guru.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kisi-kisi..."
                className="h-9 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="">Semua Mapel</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredGrids.map((item, idx) => (
          <motion.div
            key={item.id || idx}
            whileHover={{ y: -3 }}
            className="flex flex-col justify-between rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <BookOpenCheck className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {item.jenis_ujian || 'Ujian'}
                </span>
              </div>

              <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                {item.subject?.name || item.mata_pelajaran}
              </p>
              <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">{item.judul_kisi || item.judul}</h3>

              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                  <Clock className="mr-1 inline h-3 w-3" />
                  {item.alokasi_waktu_menit || item.durasi || 60} Menit
                </span>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                  <FileText className="mr-1 inline h-3 w-3" />
                  {item.jumlah_soal || 0} Soal
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(item)}
              className="mt-5 pt-3 border-t border-slate-100 text-left text-xs font-bold text-[#0E5C44] hover:underline dark:border-slate-800"
            >
              Lihat Detail Kisi-Kisi →
            </button>
          </motion.div>
        ))}

        {!filteredGrids.length && (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            <BookOpenCheck className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            Belum ada kisi-kisi ujian yang dipublikasikan.
          </div>
        )}
      </div>

      {/* Modal Detail Kisi-Kisi */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-xl rounded-[18px] bg-white p-6 shadow-2xl dark:bg-slate-900 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-600">{activeModal.subject?.name || activeModal.mata_pelajaran}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{activeModal.judul_kisi || activeModal.judul}</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div>
                <b className="block text-slate-900 dark:text-white">Kompetensi Dasar / Capaian Pembelajaran:</b>
                <p className="mt-1 leading-5 text-slate-600 dark:text-slate-400">{activeModal.kompetensi_dasar || 'Sesuai dengan capaian kurikulum yang berlaku.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Level Kognitif</span>
                  <p className="font-bold">{activeModal.level_kognitif || 'L1 - L3'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Guru Pengampu</span>
                  <p className="font-bold">{activeModal.guru?.nama_lengkap || activeModal.teacher?.name || 'Guru'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveModal(null)}
                className="h-9 rounded-xl bg-[#0E5C44] px-4 text-xs font-bold text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
