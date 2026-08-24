import { useState } from 'react'
import { FiMonitor, FiSmartphone, FiGlobe, FiLogOut, FiShield, FiCheckCircle, FiClock } from 'react-icons/fi'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '@/components/tailgrids/core/button'
import { Badge } from '@/components/tailgrids/core/badge'
import { Alert, AlertContent, AlertDescription, AlertIndicator, AlertTitle } from '@/components/tailgrids/core/alert'
import { Card } from '@/components/tailgrids/core/card'

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
    <Card className="w-full max-w-5xl mx-auto rounded-[18px] border border-slate-200/80 bg-white p-6 lg:p-8 shadow-xs dark:border-slate-800 dark:bg-[#1B2433] space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FiShield className="text-emerald-700 dark:text-emerald-400" />
          <span>Perangkat yang Sedang Login</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kelola perangkat dan sesi browser yang saat ini terhubung dengan akun Anda.
        </p>
      </div>

      {/* Session Rules Banner */}
      <Alert status="info" className="rounded-xl">
        <AlertIndicator>
          <FiClock className="w-5 h-5" />
        </AlertIndicator>
        <AlertContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <AlertTitle>Keamanan Sesi Browser & Batas Waktu Inaktivitas</AlertTitle>
            <AlertDescription>
              • <strong>Batas Waktu Inaktif:</strong> Sesi otomatis logout jika tidak ada aktivitas / tidak membuka profil selama 15 menit.<br />
              • <strong>Isolasi Browser:</strong> Membuka URL link di browser lain atau jendela terpisah mengharuskan login kembali.
            </AlertDescription>
          </div>
          <Badge color="emerald" size="sm" className="whitespace-nowrap shrink-0 self-start sm:self-auto">
            Sesi Browser Terisolasi
          </Badge>
        </AlertContent>
      </Alert>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th className="py-3 px-4">Perangkat</th>
              <th className="py-3 px-4">Browser</th>
              <th className="py-3 px-4">Lokasi</th>
              <th className="py-3 px-4">IP Address</th>
              <th className="py-3 px-4">Waktu Login</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium">
            {sessions.map((session) => {
              const IconComp = session.icon
              return (
                <tr key={session.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-100 block">
                          {session.device}
                        </span>
                        {session.isCurrent && (
                          <Badge color="emerald" size="sm" className="text-[10px] py-0">
                            (Perangkat Ini)
                          </Badge>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{session.browser}</td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <FiGlobe className="text-slate-400 w-3 h-3" />
                      {session.location}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">{session.ip}</td>

                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {session.loginTime}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {session.isCurrent ? (
                      <Badge color="success" size="sm" prefixIcon={FiCheckCircle}>
                        Aktif
                      </Badge>
                    ) : (
                      <Button
                        type="button"
                        variant="danger"
                        appearance="outline"
                        size="xs"
                        onClick={() => handleLogoutSession(session.id)}
                        className="inline-flex items-center gap-1"
                      >
                        <FiLogOut className="w-3 h-3" />
                        <span>Logout</span>
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Warning Footer */}
      <Alert status="warning" className="rounded-xl">
        <AlertIndicator>
          <FiShield className="w-4 h-4" />
        </AlertIndicator>
        <AlertContent>
          <AlertDescription>
            Jika Anda melihat aktivitas yang tidak dikenal, segera logout dari perangkat tersebut dan ubah password Anda.
          </AlertDescription>
        </AlertContent>
      </Alert>
    </Card>
  )
}

