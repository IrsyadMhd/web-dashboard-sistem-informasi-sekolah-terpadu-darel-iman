import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Clock, User, MapPin, BookOpen, Search, Filter } from 'lucide-react'

const cardStyle = 'rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'

const DAYS = [
  { id: 1, name: 'Senin' },
  { id: 2, name: 'Selasa' },
  { id: 3, name: 'Rabu' },
  { id: 4, name: 'Kamis' },
  { id: 5, name: 'Jumat' },
  { id: 6, name: 'Sabtu' },
]

export default function ClassScheduleWorkspace({ schedules = [], loading = false }) {
  const [activeTab, setActiveTab] = useState('today')
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 1)
  const [search, setSearch] = useState('')

  const todayDayIndex = new Date().getDay() || 1

  const safeSchedules = useMemo(() => {
    if (Array.isArray(schedules)) return schedules
    if (schedules && Array.isArray(schedules.data)) return schedules.data
    return []
  }, [schedules])

  const todaySchedules = useMemo(() => {
    return safeSchedules.filter((s) => (s.day_of_week ?? s.hari_index) === todayDayIndex)
  }, [safeSchedules, todayDayIndex])

  const daySchedules = useMemo(() => {
    return safeSchedules.filter((s) => {
      const dayMatch = (s.day_of_week ?? s.hari_index) === selectedDay
      const searchMatch = !search || (s.subject?.name || s.mata_pelajaran || '').toLowerCase().includes(search.toLowerCase()) || (s.employee?.nama_lengkap || s.teacher?.name || '').toLowerCase().includes(search.toLowerCase())
      return dayMatch && searchMatch
    })
  }, [safeSchedules, selectedDay, search])

  const totalWeeklyHours = safeSchedules.length

  return (
    <div className="space-y-5">
      {/* KPI Header Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <CalendarDays className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{todaySchedules.length}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Pelajaran Hari Ini</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Jadwal aktif hari ini</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Clock className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{totalWeeklyHours}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Total Sesi Mingguan</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Alokasi jam pelajaran</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {new Set(schedules.map((s) => s.subject?.name || s.mata_pelajaran)).size}
            </span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Mata Pelajaran</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Pelajaran semester ini</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              <User className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {new Set(schedules.map((s) => s.employee?.nama_lengkap || s.teacher?.name)).size}
            </span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Guru Pengampu</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Tim tenaga pendidik</p>
        </motion.div>
      </div>

      {/* Main Workspace Section */}
      <div className={cardStyle}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('today')}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition ${activeTab === 'today' ? 'bg-[#0E5C44] text-white shadow' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'}`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition ${activeTab === 'weekly' ? 'bg-[#0E5C44] text-white shadow' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'}`}
            >
              Jadwal Mingguan
            </button>
          </div>

          {activeTab === 'weekly' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari pelajaran / guru..."
                  className="h-9 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab Hari Ini */}
        {activeTab === 'today' && (
          <div className="mt-5">
            <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">Pelajaran Hari Ini</h3>
            {todaySchedules.length ? (
              <div className="relative border-l-2 border-emerald-500/30 pl-6 space-y-6">
                {todaySchedules.map((item, idx) => (
                  <div key={item.id || idx} className="relative">
                    <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-[#0E5C44] ring-4 ring-emerald-50 dark:ring-emerald-950" />
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-emerald-200 dark:border-slate-800 dark:bg-slate-800/50">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                            <Clock className="h-3 w-3" />
                            {item.time_start || item.jam_mulai} - {item.time_end || item.jam_selesai}
                          </span>
                          <h4 className="mt-1 text-base font-bold text-slate-900 dark:text-white">{item.subject?.name || item.mata_pelajaran}</h4>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {item.room || item.ruangan || 'Ruang Kelas'}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                        Guru: <b>{item.employee?.nama_lengkap || item.teacher?.name || 'Guru Pengampu'}</b>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">Tidak ada jadwal pelajaran untuk hari ini.</div>
            )}
          </div>
        )}

        {/* Tab Mingguan */}
        {activeTab === 'weekly' && (
          <div className="mt-5 space-y-5">
            {/* Filter Hari */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {DAYS.map((day) => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  className={`flex h-9 shrink-0 items-center rounded-xl px-4 text-xs font-bold transition ${selectedDay === day.id ? 'bg-[#0E5C44] text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
                >
                  {day.name} {day.id === todayDayIndex && ' (Hari ini)'}
                </button>
              ))}
            </div>

            {/* List Jadwal Per Hari */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {daySchedules.map((item, idx) => (
                <div key={item.id || idx} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between text-xs text-emerald-600 font-bold">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {item.time_start || item.jam_mulai} - {item.time_end || item.jam_selesai}
                    </span>
                    <span className="rounded-md bg-white px-2 py-0.5 text-[10px] dark:bg-slate-800">{item.room || item.ruangan || 'Kelas'}</span>
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{item.subject?.name || item.mata_pelajaran}</h4>
                  <p className="mt-1 text-xs text-slate-500">Guru: {item.employee?.nama_lengkap || item.teacher?.name || 'Guru'}</p>
                </div>
              ))}
              {!daySchedules.length && (
                <div className="col-span-full py-16 text-center text-xs text-slate-400">Tidak ada jadwal pelajaran pada hari {DAYS.find((d) => d.id === selectedDay)?.name}.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
