import { useState } from 'react'
import { FiMonitor, FiSmartphone, FiGlobe, FiLogOut, FiShield, FiCheckCircle, FiClock } from 'react-icons/fi'
import { useAuthStore } from '../../stores/authStore'

export default function SessionLoginCard() {
  const loginTime = useAuthStore((state) => state.loginTime)
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const browserName = userAgent.includes('Chrome')
    ? 'Chrome Web Browser'
    : userAgent.includes('Firefox')
      ? 'Mozilla Firefox'
      : userAgent.includes('Safari')
        ? 'Apple Safari'
        : 'Web Browser'

  const formattedLoginTime = loginTime
    ? new Date(loginTime).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' WIB'
    : 'Sesi Aktif'

  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: 'Perangkat Sesi Saat Ini',
      isCurrent: true,
      browser: browserName,
      location: 'Padang, Indonesia',
      ip: '127.0.0.1 (Sesi Browser)',
      loginTime: formattedLoginTime,
      icon: FiMonitor,
    },
    {
      id: 2,
      device: 'MacBook Pro',
      isCurrent: false,
      browser: 'Safari 17',
      location: 'Padang, Indonesia',
      ip: '103.123.45.68',
      loginTime: '19 Mei 2024 21:15:09',
      icon: FiMonitor,
    },
    {
      id: 3,
      device: 'iPhone 13',
      isCurrent: false,
      browser: 'Safari iOS 17',
      location: 'Padang, Indonesia',
      ip: '103.123.45.69',
      loginTime: '18 Mei 2024 08:22:11',
      icon: FiSmartphone,
    },
  ])

  const handleLogoutSession = (id) => {
    setSessions(sessions.filter((s) => s.id !== id))
  }

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-emerald-100 p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FiShield className="text-emerald-700" />
          <span>Perangkat yang Sedang Login</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Kelola perangkat dan sesi browser yang saat ini terhubung dengan akun Anda.
        </p>
      </div>

      {/* Session Rules Banner */}
      <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <FiClock className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <p className="font-bold text-emerald-900">Keamanan Sesi Browser & Batas Waktu Inaktivitas</p>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              • <strong>Batas Waktu Inaktif:</strong> Sesi otomatis logout jika tidak ada aktivitas / tidak membuka profil selama 15 menit.<br />
              • <strong>Isolasi Browser:</strong> Membuka URL link di browser lain atau jendela terpisah mengharuskan login kembali.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-800 text-white rounded-full text-[10px] font-bold whitespace-nowrap shadow-xs">
          Sesi Browser Terisolasi
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="py-3 px-4">Perangkat</th>
              <th className="py-3 px-4">Browser</th>
              <th className="py-3 px-4">Lokasi</th>
              <th className="py-3 px-4">IP Address</th>
              <th className="py-3 px-4">Waktu Login</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
            {sessions.map((session) => {
              const IconComp = session.icon
              return (
                <tr key={session.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">
                          {session.device}
                        </span>
                        {session.isCurrent && (
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded">
                            (Perangkat Ini)
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">{session.browser}</td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="flex items-center gap-1">
                      <FiGlobe className="text-slate-400 w-3 h-3" />
                      {session.location}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600">{session.ip}</td>

                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {session.loginTime}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {session.isCurrent ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <FiCheckCircle className="w-3 h-3" />
                        Aktif
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleLogoutSession(session.id)}
                        className="inline-flex items-center gap-1 py-1 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 rounded-lg text-xs font-semibold transition-all shadow-xs"
                      >
                        <FiLogOut className="w-3 h-3" />
                        Logout
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Warning Footer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-center gap-2">
        <FiShield className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          Jika Anda melihat aktivitas yang tidak dikenal, segera logout dari perangkat tersebut dan ubah password Anda.
        </span>
      </div>
    </div>
  )
}
