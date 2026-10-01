import { useEffect, useState } from 'react'
import { AlarmClock, CheckCircle2, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { lmsPresensiService } from '../../services/lmsPresensiService'
import { useAuthStore } from '../../stores/authStore'

export default function ActiveScheduleNotice() {
  const navigate = useNavigate()
  const roles = useAuthStore((state) => state.user?.roles || [])
  const [data, setData] = useState(null)
  const eligible = roles.includes('Guru') || roles.includes('Wali Kelas')

  useEffect(() => {
    if (!eligible) return undefined
    let alive = true
    const load = () =>
      lmsPresensiService
        .getActiveSchedules()
        .then((response) => alive && setData(response?.data || null))
        .catch(() => alive && setData(null))
    load()
    const timer = window.setInterval(load, 60_000)
    return () => {
      alive = false
      window.clearInterval(timer)
    }
  }, [eligible])

  if (!eligible || !data?.schedules?.length) return null

  // Helper untuk konversi waktu HH:MM ke menit total dalam hari
  const toMinutes = (timeStr) => {
    if (!timeStr) return 0
    const parts = String(timeStr).split(':')
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || '0', 10)
  }

  // Hitung waktu sekarang berdasarkan server_time backend atau waktu lokal
  const currentMinutes = (() => {
    if (data?.server_time) {
      const sDate = new Date(data.server_time)
      if (!isNaN(sDate.getTime())) {
        return sDate.getHours() * 60 + sDate.getMinutes()
      }
    }
    const lDate = new Date()
    return lDate.getHours() * 60 + lDate.getMinutes()
  })()

  // Cek apakah ada jadwal yang sedang benar-benar berjalan di jam ini
  const hasCurrentOngoing = data.schedules.some((s) => {
    const sMin = toMinutes(s.time_start)
    const eMin = toMinutes(s.time_end)
    return currentMinutes >= sMin && currentMinutes <= eMin
  })

  return (
    <section className="mb-3.5 space-y-2.5" aria-label="Jadwal pelajaran aktif">
      {data.schedules.map((schedule, idx) => {
        const done = ['final', 'locked'].includes(schedule.attendance_status)
        const className = schedule.kelas?.nama_kelas || schedule.school_class?.name || 'Kelas'
        const sMin = toMinutes(schedule.time_start)
        const eMin = toMinutes(schedule.time_end)

        // Penentuan status: Pelajaran Sekarang vs Pelajaran Berikutnya
        const isCurrent = currentMinutes >= sMin && currentMinutes <= eMin
        // Jika tidak ada yang strictly ongoing, jadwal pertama dianggap sesi aktif terdekat
        const isEffectiveCurrent = isCurrent || (!hasCurrentOngoing && idx === 0)
        const isUpcoming = !isEffectiveCurrent && currentMinutes < sMin

        return (
          <article
            key={schedule.id}
            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4 rounded-2xl border px-4 py-3 shadow-xs transition ${
              done
                ? 'border-slate-200 bg-slate-50/90 dark:border-slate-800 dark:bg-slate-900/40'
                : isEffectiveCurrent
                ? 'border-emerald-500/35 bg-gradient-to-r from-emerald-50/95 via-teal-50/60 to-emerald-50/90 hover:border-emerald-500/50 dark:border-emerald-800/60 dark:bg-emerald-950/30'
                : 'border-amber-400/80 bg-gradient-to-r from-amber-50/95 via-yellow-50/60 to-amber-50/90 hover:border-amber-400 dark:border-amber-700/60 dark:bg-amber-950/25'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white shadow-xs ${
                  done
                    ? 'bg-slate-600 dark:bg-slate-700'
                    : isEffectiveCurrent
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-600/30'
                    : 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/30'
                }`}
              >
                {done ? (
                  <CheckCircle2 size={18} />
                ) : isEffectiveCurrent ? (
                  <AlarmClock size={18} />
                ) : (
                  <Clock size={18} />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${
                      done
                        ? 'text-slate-600 dark:text-slate-400'
                        : isEffectiveCurrent
                        ? 'text-emerald-800 dark:text-emerald-300'
                        : 'text-amber-900 dark:text-amber-300'
                    }`}
                  >
                    {!done && isEffectiveCurrent && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                    {!done && !isEffectiveCurrent && isUpcoming && (
                      <span className="relative flex h-2 w-2">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                    )}
                    {done
                      ? 'Presensi Selesai'
                      : isEffectiveCurrent
                      ? 'Jam Pelajaran Sekarang'
                      : 'Pelajaran Berikutnya'}
                  </span>

                  <span
                    className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      done
                        ? 'bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        : isEffectiveCurrent
                        ? 'bg-emerald-100/90 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200'
                        : 'bg-amber-100/90 text-amber-950 dark:bg-amber-900/60 dark:text-amber-200'
                    }`}
                  >
                    {String(schedule.time_start).slice(0, 5)}–{String(schedule.time_end).slice(0, 5)} WIB
                  </span>
                </div>

                <div className="flex items-center gap-1.5 truncate mt-0.5">
                  <h4 className="truncate text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    {schedule.subject?.name || 'Mata Pelajaran'} · {className}
                  </h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                    ({schedule.requires_substitute_reason ? 'Wali kelas/pengganti' : 'Jadwal Anda'})
                  </span>
                </div>
              </div>
            </div>

            {/* BUTTON / STATUS AREA: Hanya tampilkan tombol presensi di pelajaran sekarang, sembunyikan di pelajaran berikutnya */}
            {isEffectiveCurrent ? (
              <button
                type="button"
                disabled={done}
                onClick={() =>
                  navigate(`/absensi/presensi?schedule_id=${schedule.id}&date=${data.date}`)
                }
                className={`inline-flex shrink-0 h-8 items-center justify-center rounded-xl px-4 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 ${
                  done
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-400'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/20'
                }`}
              >
                {done
                  ? 'Sudah Final'
                  : schedule.attendance_status === 'draft'
                  ? 'Lanjutkan Absen'
                  : 'Ambil Presensi'}
              </button>
            ) : (
              /* Pelajaran Berikutnya: Button presensi disembunyikan, diganti label badge kuning informatif */
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="inline-flex items-center gap-1 rounded-xl bg-amber-100/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800 px-3 py-1.5 text-xs font-extrabold shadow-2xs">
                  <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Segera Dimulai</span>
                </span>
              </div>
            )}
          </article>
        )
      })}
    </section>
  )
}
