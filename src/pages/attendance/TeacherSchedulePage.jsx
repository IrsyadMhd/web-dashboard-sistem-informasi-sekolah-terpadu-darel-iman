import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Calendar as CalendarIcon,
  Clock,
  Filter,
  MapPin,
  PlayCircle,
  Search,
  Users,
} from 'lucide-react'
import { lmsPresensiService } from '../../services/lmsPresensiService'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import AppBadge from '../../components/app/AppBadge'
import AppEmptyState from '../../components/app/AppEmptyState'
import AppSkeleton from '../../components/app/AppSkeleton'
import { Button } from '@/components/tailgrids/core/button'
import { Input } from '@/components/tailgrids/core/input'

const todayDateStr = new Date().toLocaleDateString('en-CA')

export default function TeacherSchedulePage() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(todayDateStr)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState([])

  useEffect(() => {
    let active = true
    const loadSchedule = async () => {
      setLoading(true)
      try {
        const response = await lmsPresensiService.getMySchedules(selectedDate)
        if (!active) return
        setSchedules(Array.isArray(response.data) ? response.data : (response.data?.schedules || []))
      } catch (err) {
        console.error('Failed to load teaching schedule:', err)
        if (active) setSchedules([])
      } finally {
        if (active) setLoading(false)
      }
    }
    loadSchedule()
    return () => {
      active = false
    }
  }, [selectedDate])

  const filteredSchedules = schedules.filter((s) => {
    const term = search.toLowerCase()
    const subject = (s.subject_name || s.nama_matpel || '').toLowerCase()
    const rombel = (s.class_name || s.rombel_nama || '').toLowerCase()
    return !term || subject.includes(term) || rombel.includes(term)
  })

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <AppBreadcrumb items={[{ label: 'Absensi', href: '/absensi' }, { label: 'Jadwal Mengajar' }]} />
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Jadwal Mengajar Guru
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              Daftar jam pelajaran mengajar Anda untuk presensi kelas & pembelajaran.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Cari mata pelajaran / rombel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CalendarIcon size={15} /> Pilih Tanggal:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Schedule List */}
      {loading ? (
        <AppSkeleton rows={5} />
      ) : filteredSchedules.length === 0 ? (
        <AppEmptyState
          title="Tidak ada jadwal mengajar"
          description={`Tidak ditemukan jadwal mengajar untuk tanggal ${new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.`}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSchedules.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-500 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <Clock size={13} /> {item.time || item.jam_ke || 'Jam Mengajar'}
                  </span>
                  <AppBadge variant={item.is_active ? 'success' : 'gray'}>
                    {item.is_active ? 'Aktif Saat Ini' : 'Terjadwal'}
                  </AppBadge>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {item.subject_name || item.nama_matpel || 'Mata Pelajaran'}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-2">
                    <Users size={14} className="text-slate-400" />
                    Rombel: <span className="font-semibold text-slate-800 dark:text-slate-100">{item.class_name || item.rombel_nama || '-'}</span>
                  </p>
                  {item.room && (
                    <p className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-400" />
                      Ruangan: <span className="font-medium">{item.room}</span>
                    </p>
                  )}
                  {item.total_students && (
                    <p className="flex items-center gap-2">
                      <BookOpen size={14} className="text-slate-400" />
                      Jumlah Siswa: <span className="font-medium">{item.total_students} Siswa</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                <Button
                  variant="primary"
                  appearance="fill"
                  size="sm"
                  onClick={() => navigate(`/absensi/presensi?schedule_id=${item.id}&date=${selectedDate}`)}
                >
                  <PlayCircle className="mr-1.5 h-4 w-4" /> Mulai Presensi
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
