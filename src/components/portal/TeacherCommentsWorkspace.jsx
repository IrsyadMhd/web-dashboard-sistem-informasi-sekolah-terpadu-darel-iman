import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, User, Calendar, Tag, Search, Filter } from 'lucide-react'

const cardStyle = 'rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'

const formatDate = (val) => val ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(val)) : '-'

const CATEGORIES = [
  'Semua', 'Akademik', 'Tugas', 'Perilaku', 'Kedisiplinan', 'Tahfizh', 'Mutabaah', 'Wali Kelas'
]

export default function TeacherCommentsWorkspace({ comments = [], loading = false }) {
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [search, setSearch] = useState('')

  const safeComments = useMemo(() => {
    if (Array.isArray(comments)) return comments
    if (comments && Array.isArray(comments.data)) return comments.data
    return []
  }, [comments])

  const filteredComments = useMemo(() => {
    return safeComments.filter((item) => {
      const note = item.note || item.notes || item.catatan || ''
      const teacher = item.teacher?.nama_lengkap || item.teacher?.name || ''
      const category = item.category || item.kategori || 'Akademik'

      const categoryMatch = selectedCategory === 'Semua' || category.toLowerCase() === selectedCategory.toLowerCase()
      const searchMatch = !search || note.toLowerCase().includes(search.toLowerCase()) || teacher.toLowerCase().includes(search.toLowerCase())

      return categoryMatch && searchMatch
    })
  }, [safeComments, selectedCategory, search])

  return (
    <div className="space-y-5">
      {/* Header Toolbar */}
      <div className={cardStyle}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Komentar & Catatan Guru</h2>
            <p className="mt-0.5 text-xs text-slate-500">Catatan perkembangan siswa yang dibagikan oleh guru dan wali kelas.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari catatan / nama guru..."
              className="h-9 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex h-8 shrink-0 items-center rounded-xl px-3 text-xs font-bold transition ${selectedCategory === cat ? 'bg-[#0E5C44] text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List Komentar */}
      <div className="space-y-4">
        {filteredComments.map((item, idx) => (
          <motion.div
            key={item.id || idx}
            whileHover={{ y: -2 }}
            className={cardStyle}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <User className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.teacher?.nama_lengkap || item.teacher?.name || 'Guru Pengampu'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {item.teacher?.subject?.name || item.subject?.name || 'Guru Pelajaran / Wali Kelas'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {item.category || item.kategori || 'Akademik'}
                </span>
                <span className="text-xs text-slate-400">
                  {formatDate(item.date || item.created_at)}
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs leading-6 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {item.note || item.notes || item.catatan || 'Tidak ada isi catatan.'}
            </p>
          </motion.div>
        ))}

        {!filteredComments.length && (
          <div className={`${cardStyle} py-16 text-center text-xs text-slate-400`}>
            <MessageCircle className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            Belum ada komentar guru untuk kategori ini.
          </div>
        )}
      </div>
    </div>
  )
}
