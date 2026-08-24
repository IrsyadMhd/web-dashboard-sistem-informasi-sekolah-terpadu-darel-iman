import { useState } from 'react'
import { FiDownload, FiCheckCircle, FiXCircle, FiCalendar, FiFilter } from 'react-icons/fi'
import { Button } from '@/components/tailgrids/core/button'
import { Badge } from '@/components/tailgrids/core/badge'
import { Card } from '@/components/tailgrids/core/card'

export default function ActivityLoginCard() {
  const [statusFilter, setStatusFilter] = useState('semua')
  const [deviceFilter, setDeviceFilter] = useState('semua')
  const [dateRange, setDateRange] = useState('01/05/2024 - 20/05/2024')
  const [currentPage, setCurrentPage] = useState(1)

  const logs = [
    {
      id: 1,
      time: '20 Mei 2024 10:32:45',
      status: 'Berhasil',
      device: 'Windows PC',
      browser: 'Chrome 125',
      location: 'Padang, Indonesia',
      ip: '103.123.45.67',
    },
    {
      id: 2,
      time: '19 Mei 2024 21:15:09',
      status: 'Berhasil',
      device: 'MacBook Pro',
      browser: 'Safari 17',
      location: 'Padang, Indonesia',
      ip: '103.123.45.68',
    },
    {
      id: 3,
      time: '19 Mei 2024 19:05:12',
      status: 'Gagal',
      device: 'Android Phone',
      browser: 'Chrome Mobile',
      location: 'Padang, Indonesia',
      ip: '103.123.45.71',
    },
    {
      id: 4,
      time: '18 Mei 2024 08:22:11',
      status: 'Berhasil',
      device: 'iPhone 13',
      browser: 'Safari iOS 17',
      location: 'Padang, Indonesia',
      ip: '103.123.45.69',
    },
    {
      id: 5,
      time: '17 Mei 2024 16:40:33',
      status: 'Gagal',
      device: 'Windows PC',
      browser: 'Chrome 124',
      location: 'Padang, Indonesia',
      ip: '103.123.45.72',
    },
  ]

  const filteredLogs = logs.filter((log) => {
    if (statusFilter !== 'semua' && log.status.toLowerCase() !== statusFilter) return false
    if (deviceFilter !== 'semua' && !log.device.toLowerCase().includes(deviceFilter.toLowerCase())) return false
    return true
  })

  return (
    <Card className="w-full max-w-5xl mx-auto rounded-[18px] border border-slate-200/80 bg-white p-6 lg:p-8 shadow-xs dark:border-slate-800 dark:bg-[#1B2433] space-y-6">
      {/* Header & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Riwayat Aktivitas Login
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Pantau aktivitas login ke akun Anda.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          appearance="outline"
          size="sm"
          className="inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <FiDownload className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>Export Log</span>
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs"
          >
            <option value="semua">Semua Status</option>
            <option value="berhasil">Berhasil</option>
            <option value="gagal">Gagal</option>
          </select>
        </div>

        {/* Date Range Picker */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <FiCalendar className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs"
          />
        </div>

        {/* Device Filter */}
        <div className="relative">
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs"
          >
            <option value="semua">Semua Perangkat</option>
            <option value="windows">Windows PC</option>
            <option value="macbook">MacBook Pro</option>
            <option value="iphone">iPhone 13</option>
            <option value="android">Android Phone</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th className="py-3 px-4">Waktu</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Perangkat</th>
              <th className="py-3 px-4">Browser</th>
              <th className="py-3 px-4">Lokasi</th>
              <th className="py-3 px-4">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium">
            {filteredLogs.map((log) => {
              const isSuccess = log.status === 'Berhasil'
              return (
                <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 text-slate-800 dark:text-slate-100 font-semibold whitespace-nowrap">
                    {log.time}
                  </td>

                  <td className="py-3.5 px-4">
                    {isSuccess ? (
                      <Badge color="success" size="sm" prefixIcon={FiCheckCircle}>
                        Berhasil
                      </Badge>
                    ) : (
                      <Badge color="error" size="sm" prefixIcon={FiXCircle}>
                        Gagal
                      </Badge>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-slate-800 dark:text-slate-100">{log.device}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{log.browser}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{log.location}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">{log.ip}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-1.5 pt-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
        <button className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center">
          &lt;
        </button>
        {[1, 2, 3, 4, 5].map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => setCurrentPage(pageNum)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              currentPage === pageNum
                ? 'bg-[#0E5C44] text-white shadow-xs dark:bg-[#3FBF75] dark:text-slate-900 font-bold'
                : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {pageNum}
          </button>
        ))}
        <span className="px-1 text-slate-400">...</span>
        <button className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center">
          10
        </button>
        <button className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center">
          &gt;
        </button>
      </div>
    </Card>
  )
}

