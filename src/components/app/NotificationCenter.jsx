import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Bell, CheckCheck, Inbox } from 'lucide-react'
import { Drawer } from '../ui/drawer'
import { cn } from '../../lib/utils'
import AppBadge from './AppBadge'
import { reportService } from '../../services/reportService'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '../tailgrids/core/hover-card'
import { AnimatePresence, motion } from 'framer-motion'

const CATEGORIES = [
  { id: 'semua', label: 'Semua' },
  { id: 'crud', label: 'CRUD' },
  { id: 'approval', label: 'Approval' },
  { id: 'chat', label: 'Chat' },
  { id: 'absensi', label: 'Absensi' },
  { id: 'tahfizh', label: 'Tahfizh' },
  { id: 'mutabaah', label: 'Mutabaah' },
  { id: 'akademik', label: 'Akademik' },
  { id: 'lms', label: 'LMS' },
  { id: 'portal', label: 'Portal' },
  { id: 'pengumuman', label: 'Pengumuman' },
  { id: 'system', label: 'System' },
]

function inferCategory(notification) {
  const text = `${notification.title || ''} ${notification.body || notification.message || ''} ${notification.category || ''}`.toLowerCase()
  const map = [
    ['crud', ['tambah', 'perbarui', 'hapus', 'simpan', 'crud']],
    ['approval', ['setuju', 'tolak', 'approval', 'persetujuan', 'disetujui']],
    ['chat', ['chat', 'pesan', 'komentar']],
    ['absensi', ['absensi', 'hadir', 'izin', 'sakit', 'presensi']],
    ['tahfizh', ['tahfizh', 'setoran', 'hafalan']],
    ['mutabaah', ['mutabaah', 'ibadah', 'amalan']],
    ['akademik', ['akademik', 'nilai', 'rapor', 'tugas']],
    ['lms', ['lms', 'materi', 'modul', 'ujian', 'bank soal']],
    ['portal', ['portal', 'orang tua', 'siswa']],
    ['pengumuman', ['pengumuman', 'info', 'informasi', 'berita']],
  ]
  for (const [category, keywords] of map) {
    if (keywords.some((k) => text.includes(k))) return category
  }
  return 'system'
}

/**
 * NotificationCenter - canonical global notification center.
 *
 * Self-contained: mengambil notifikasi via reportService, menampilkan bell
 * dengan unread counter, dan drawer dengan filter kategori.
 *
 * Bisa dikontrol eksternal via prop `items` / `unreadCount`.
 * Dibuka lewat bell atau event window `open-notification-center`.
 */
export default function NotificationCenter({
  items: controlledItems,
  unreadCount: controlledUnread,
  onMarkRead: externalMarkRead,
  onMarkAllRead: externalMarkAllRead,
  disabled = false,
  bellClassName = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('semua')
  const [items, setItems] = useState(controlledItems || [])
  const [unreadCount, setUnreadCount] = useState(controlledUnread || 0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const controlled = Boolean(controlledItems)

  const muatNotifikasi = useCallback(async () => {
    if (controlled || disabled) return
    setLoading(true)
    setError(false)
    try {
      const data = await reportService.notifications({ per_page: 50 })
      const list = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []
      setItems(list)
    } catch {
      setError(true)
      setItems([])
    } finally {
      setLoading(false)
    }
    try {
      const count = await reportService.notificationUnreadCount()
      setUnreadCount(Number(count.unread_count) || 0)
    } catch {
      setUnreadCount(0)
    }
  }, [controlled, disabled])

  useEffect(() => {
    muatNotifikasi()
    const interval = setInterval(muatNotifikasi, 60000)
    return () => clearInterval(interval)
  }, [muatNotifikasi])

  useEffect(() => {
    const handler = () => setIsOpen(true)
    window.addEventListener('open-notification-center', handler)
    return () => window.removeEventListener('open-notification-center', handler)
  }, [])

  const resolvedItems = controlledItems || items
  const resolvedUnread = controlledUnread ?? unreadCount

  const tandaiSemuaDibaca = async () => {
    if (externalMarkAllRead) {
      await externalMarkAllRead()
      return
    }
    try {
      await reportService.markAllNotificationsRead()
      setUnreadCount(0)
      setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })))
    } catch {
      // abaikan error; status lokal tetap konsisten
    }
  }

  const tandaiDibaca = async (item) => {
    if (externalMarkRead) {
      await externalMarkRead(item)
      return
    }
    try {
      await reportService.markNotificationRead(item.id)
      setUnreadCount((prev) => Math.max(0, prev - 1))
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n)))
    } catch {
      // abaikan
    }
  }

  const filteredItems = useMemo(() => {
    if (activeCategory === 'semua') return resolvedItems
    return resolvedItems.filter((item) => inferCategory(item) === activeCategory)
  }, [resolvedItems, activeCategory])

  const normalized = useMemo(
    () =>
      filteredItems.map((item) => {
        const time = item.created_at ? new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : ''
        return { ...item, time, category: inferCategory(item), unread: !item.read_at }
      }),
    [filteredItems]
  )

  const [isHoverOpen, setIsHoverOpen] = useState(false)

  return (
    <>
      {/* Notification Bell with TailGrids HoverCard */}
      <HoverCard open={isHoverOpen} onOpenChange={setIsHoverOpen}>
        <HoverCardTrigger
          onClick={() => setIsOpen(true)}
          className={cn(
            'relative rounded-xl border border-slate-200/80 bg-slate-50/80 p-2 text-slate-600 transition-all hover:bg-slate-100 hover:text-[#0E5C44] dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800',
            bellClassName
          )}
          title="Notifikasi Sistem"
          aria-label={`Notifikasi${resolvedUnread > 0 ? `, ${resolvedUnread} belum dibaca` : ''}`}
        >
          <Bell className="h-4 w-4" />
          {resolvedUnread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-xs">
              {resolvedUnread > 9 ? '9+' : resolvedUnread}
            </span>
          )}
        </HoverCardTrigger>
        <AnimatePresence>
          {isHoverOpen && (
            <HoverCardContent className="w-64 p-0 bg-transparent ring-0 shadow-none border-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 15, rotateX: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10, rotateX: -5 }}
                transition={{
                  type: 'spring',
                  stiffness: 350,
                  damping: 25,
                  mass: 1,
                }}
                className="w-64 rounded-xl border border-slate-200 bg-white p-4 text-xs shadow-xl dark:border-slate-800 dark:bg-[#1B2433]"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-emerald-500/20 text-[#0E5C44] dark:text-[#3FBF75] flex items-center justify-center font-bold">
                      <Bell className="size-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-[13px]">
                        Pemberitahuan Sistem
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {resolvedUnread > 0 ? `${resolvedUnread} Belum Dibaca` : 'Semua Sudah Dibaca'}
                      </p>
                    </div>
                  </div>
                  <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {resolvedUnread > 0
                      ? `Anda memiliki ${resolvedUnread} pemberitahuan baru yang memerlukan perhatian.`
                      : 'Belum ada notifikasi baru saat ini. Klik icon untuk melihat riwayat log.'}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: resolvedUnread > 0 ? '100%' : '30%' }}
                        transition={{
                          delay: 0.2,
                          duration: 0.8,
                          ease: 'easeInOut',
                        }}
                        className={`h-full ${resolvedUnread > 0 ? 'bg-emerald-500' : 'bg-slate-400'}`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </HoverCardContent>
          )}
        </AnimatePresence>
      </HoverCard>

      {/* Notification Drawer */}
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="Pemberitahuan & Activity Log" position="right">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            {resolvedUnread > 0 && (
              <AppBadge variant="success" dot>{resolvedUnread} belum dibaca</AppBadge>
            )}
            <button
              type="button"
              onClick={tandaiSemuaDibaca}
              className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-[#0E5C44] transition hover:underline dark:text-[#3FBF75]"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Tandai semua dibaca
            </button>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[10px] font-bold transition',
                  activeCategory === cat.id
                    ? 'border-[#0E5C44] bg-[#0E5C44] text-white dark:border-[#3FBF75] dark:bg-[#3FBF75] dark:text-slate-900'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-[#0E5C44]/40 hover:text-[#0E5C44] dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading && (
            <div className="space-y-2 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="py-6 text-center text-xs text-rose-500">
              Gagal memuat notifikasi. Silakan muat ulang halaman.
            </p>
          )}

          {!loading && !error && normalized.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <Inbox className="h-7 w-7" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Tidak Ada Notifikasi</p>
              <p className="mt-1 text-xs text-slate-400">Belum ada notifikasi pada kategori ini.</p>
            </div>
          )}

          {!loading && !error && normalized.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                if (item.unread) tandaiDibaca(item)
              }}
              className={cn(
                'w-full rounded-2xl border p-4 text-left transition',
                item.unread
                  ? 'border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-800/80 dark:bg-emerald-950/30'
                  : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <AppBadge variant={item.category === 'system' ? 'neutral' : 'info'}>{item.category}</AppBadge>
                  <h5 className="truncate text-xs font-bold text-slate-900 dark:text-white">{item.title}</h5>
                </div>
                {item.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-600" />}
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{item.desc}</p>
              <p className="mt-2 text-[10px] font-medium text-slate-400">{item.time}</p>
            </button>
          ))}
        </div>
      </Drawer>
    </>
  )
}
