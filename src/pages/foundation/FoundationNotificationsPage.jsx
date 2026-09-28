import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  CheckCheck,
  RefreshCw,
  Search,
  Filter,
  Inbox,
  AlertCircle,
  Building2,
  Users,
  GraduationCap,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Eye,
  Calendar,
  Sparkles,
} from 'lucide-react'
import { reportService } from '../../services/reportService'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Skeleton } from '../../components/ui/skeleton'
import { EmptyState } from '../../components/ui/empty-state'

const TAB_CATEGORIES = [
  { key: 'all', label: 'Semua' },
  { key: 'unread', label: 'Belum Dibaca' },
  { key: 'school', label: 'Informasi Sekolah' },
  { key: 'sdm', label: 'Data SDM' },
  { key: 'student', label: 'Data Siswa' },
  { key: 'report', label: 'Laporan' },
  { key: 'system', label: 'Sistem' },
]

function useToast() {
  const [toasts, setToasts] = useState([])
  const add = (type, title, message) => {
    const id = Date.now() + Math.random()
    setToasts((p) => [...p, { id, type, title, message }])
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000)
  }
  const dismiss = (id) => setToasts((p) => p.filter((t) => t.id !== id))
  return {
    toasts,
    dismiss,
    success: (t, m) => add('success', t, m),
    error: (t, m) => add('error', t, m),
    warning: (t, m) => add('warning', t, m),
    info: (t, m) => add('info', t, m),
  }
}

function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md ${
              t.type === 'success'
                ? 'border-emerald-300 bg-emerald-50/95 text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-950/90 dark:text-emerald-100'
                : t.type === 'error'
                ? 'border-rose-300 bg-rose-50/95 text-rose-900 dark:border-rose-700/60 dark:bg-rose-950/90 dark:text-rose-100'
                : t.type === 'warning'
                ? 'border-amber-300 bg-amber-50/95 text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/90 dark:text-amber-100'
                : 'border-blue-300 bg-blue-50/95 text-blue-900 dark:border-blue-700/60 dark:bg-blue-950/90 dark:text-blue-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
              {t.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
              {t.type === 'warning' && <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
              {t.type === 'info' && <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold leading-tight">{t.title}</h5>
              {t.message && <p className="text-[11px] opacity-85 mt-0.5 leading-snug">{t.message}</p>}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs p-0.5 cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function FoundationNotificationsPage() {
  const toast = useToast()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await reportService.notifications({ per_page: 50 })
      const list = res?.data || res || []
      setNotifications(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('Failed to load notifications:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkRead = async (id) => {
    try {
      await reportService.markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
      )
    } catch (err) {
      console.error('Gagal menandai dibaca:', err)
      toast.error('Gagal', 'Terjadi kesalahan saat menandai notifikasi.')
    }
  }

  const handleMarkAllRead = async () => {
    setMarkingAll(true)
    try {
      await reportService.markAllNotificationsRead()
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      )
      toast.success('Berhasil!', 'Semua notifikasi telah ditandai sebagai dibaca.')
    } catch (err) {
      console.error('Gagal menandai semua dibaca:', err)
      toast.error('Gagal', 'Gagal menandai semua notifikasi dibaca.')
    } finally {
      setMarkingAll(false)
    }
  }

  // Filtered Notifications
  const filteredNotifications = notifications.filter((n) => {
    const title = (n.title || '').toLowerCase()
    const message = (n.message || n.body || '').toLowerCase()
    const type = (n.type || '').toLowerCase()
    const isRead = Boolean(n.is_read || n.read_at)

    const matchesSearch = title.includes(search.toLowerCase()) || message.includes(search.toLowerCase())
    
    let matchesStatus = true;
    if (statusFilter === 'unread' || activeTab === 'unread') {
      matchesStatus = !isRead
    } else if (statusFilter === 'read') {
      matchesStatus = isRead
    }

    let matchesType = true;
    if (typeFilter !== 'all') {
      matchesType = type.includes(typeFilter.toLowerCase())
    }

    let matchesTab = true;
    if (activeTab === 'school') matchesType = type.includes('sekolah') || type.includes('info') || type.includes('announcement')
    if (activeTab === 'sdm') matchesType = type.includes('pegawai') || type.includes('guru') || type.includes('sdm') || type.includes('hr')
    if (activeTab === 'student') matchesType = type.includes('siswa') || type.includes('mutasi') || type.includes('kelulusan')
    if (activeTab === 'report') matchesType = type.includes('laporan') || type.includes('report')
    if (activeTab === 'system') matchesType = type.includes('system') || type.includes('sistem') || type.includes('auth')

    return matchesSearch && matchesStatus && matchesType && matchesTab
  })

  // KPI Calculations
  const totalCount = notifications.length
  const unreadCount = notifications.filter((n) => !n.is_read && !n.read_at).length
  const readCount = totalCount - unreadCount
  const todayCount = notifications.filter((n) => {
    if (!n.created_at) return false
    const date = new Date(n.created_at)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }).length

  const getTypeIcon = (type) => {
    const t = (type || '').toLowerCase()
    if (t.includes('sdm') || t.includes('pegawai') || t.includes('guru')) return <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
    if (t.includes('siswa') || t.includes('mutasi') || t.includes('kelulusan')) return <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    if (t.includes('laporan') || t.includes('report')) return <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
    if (t.includes('sekolah') || t.includes('info')) return <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
    return <Bell className="w-5 h-5 text-[#0E5C44] dark:text-emerald-400" />
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0E5C44] via-[#1E8E5A] to-[#0A4331] p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-100 text-xs font-semibold">
              <Bell className="w-3.5 h-3.5 text-amber-300" />
              <span>Notifikasi & Pemberitahuan Pengurus Yayasan</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Pusat Notifikasi & Aktivitas Unit
            </h1>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              Lihat informasi terbaru, pembaruan data SDM, aktivitas siswa, mutasi, kelulusan, dan laporan resmi dari seluruh unit pendidikan.
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
            <Button
              variant="outline"
              onClick={fetchNotifications}
              disabled={loading}
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={handleMarkAllRead}
              disabled={markingAll || unreadCount === 0}
              className="bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 border-none shadow-md"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Tandai Semua Dibaca
            </Button>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-36 -top-12 w-48 h-48 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#13221f] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-[#0E5C44] dark:text-emerald-400 shrink-0">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Notifikasi</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{loading ? '...' : totalCount}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Semua rekaman</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#13221f] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Belum Dibaca</p>
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">{loading ? '...' : unreadCount}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Membutuhkan perhatian</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#13221f] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Sudah Dibaca</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{loading ? '...' : readCount}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tersimpan dalam arsip</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#13221f] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Hari Ini</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{loading ? '...' : todayCount}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Notifikasi baru hari ini</p>
          </div>
        </div>
      </div>

      {/* 3. Toolbar Dua Tingkat */}
      <div className="bg-white dark:bg-[#13221f] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        {/* Row 1: Search & Status Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari notifikasi berdasarkan judul atau pesan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0E5C44] transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0E5C44]"
            >
              <option value="all">Semua Status</option>
              <option value="unread">Belum Dibaca</option>
              <option value="read">Sudah Dibaca</option>
            </select>
          </div>
        </div>

        {/* Row 2: Category Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 dark:border-slate-800/80 pt-3">
          {TAB_CATEGORIES.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#0E5C44] text-white shadow-md shadow-emerald-900/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
                {tab.key === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-[10px] font-extrabold bg-rose-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. Notification Cards List */}
      <div className="bg-white dark:bg-[#13221f] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white">Daftar Pemberitahuan</h3>
            <p className="text-xs text-slate-500 mt-0.5">Menampilkan {filteredNotifications.length} dari {notifications.length} notifikasi</p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="warning" className="bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200">
              {unreadCount} Notifikasi Baru
            </Badge>
          )}
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800 dark:text-white">Data Notifikasi Gagal Dimuat</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Terjadi kesalahan saat mengambil notifikasi sistem. Silakan coba kembali.
              </p>
              <Button onClick={fetchNotifications} className="mt-4 bg-[#0E5C44] text-white">
                Coba Lagi
              </Button>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => {
              const isUnread = !notif.is_read && !notif.read_at
              return (
                <div
                  key={notif.id}
                  className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                    isUnread ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                      {getTypeIcon(notif.type)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-sm tracking-tight ${isUnread ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-700 dark:text-slate-300'}`}>
                          {notif.title || 'Notifikasi Sistem'}
                        </h4>
                        {isUnread && (
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-rose-500 text-white rounded-full">
                            Baru
                          </span>
                        )}
                        {notif.type && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
                            {notif.type}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                        {notif.message || notif.body || 'Tidak ada rincian pesan.'}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {notif.created_at ? new Date(notif.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Baru saja'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {isUnread && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(notif.id)}
                        className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-emerald-700 dark:text-emerald-400 rounded-xl transition flex items-center gap-1.5"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Tandai Dibaca
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-12 text-center">
              <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800 dark:text-white">Belum Ada Notifikasi</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Informasi dan pembaruan terbaru akan tampil otomatis di halaman ini.
              </p>
            </div>
          )}
        </div>
      </div>

      <ToastStack toasts={toast.toasts} onDismiss={toast.dismiss} />
    </div>
  )
}
