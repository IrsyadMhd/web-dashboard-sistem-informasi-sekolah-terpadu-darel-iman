import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, LogOut, AlertTriangle, X } from 'lucide-react'

/**
 * AuthPopup — Popup notifikasi auth yang tampil di tengah layar.
 *
 * Dipicu via helper:
 *   import { showAuthPopup } from '@/components/ui/AuthPopup'
 *   showAuthPopup({ type: 'success' | 'error' | 'logout' | 'warning', title: '...', message: '...' })
 *
 * Atau via custom event:
 *   window.dispatchEvent(new CustomEvent('auth-popup', {
 *     detail: { type: 'success', title: '...', message: '...' }
 *   }))
 */

let setPopupExternal = null

export function showAuthPopup({ type = 'success', title = '', message = '' }) {
  if (setPopupExternal) {
    setPopupExternal({ id: Date.now(), type, title, message })
  } else {
    window.dispatchEvent(new CustomEvent('auth-popup', { detail: { type, title, message } }))
  }
}

/* --- Config --- */
const AUTO_DISMISS_MS = 4000

const CONFIG = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-500',
    bgGradient: 'from-emerald-50 to-white',
    border: 'border-emerald-200',
    bar: 'bg-emerald-500',
    iconBg: 'bg-emerald-100',
    title: 'text-emerald-900',
    message: 'text-emerald-700',
    shadow: 'shadow-emerald-200/60',
    pill: 'bg-emerald-500',
    label: 'Berhasil',
  },
  error: {
    icon: XCircle,
    iconClass: 'text-rose-500',
    bgGradient: 'from-rose-50 to-white',
    border: 'border-rose-200',
    bar: 'bg-rose-500',
    iconBg: 'bg-rose-100',
    title: 'text-rose-900',
    message: 'text-rose-700',
    shadow: 'shadow-rose-200/60',
    pill: 'bg-rose-500',
    label: 'Gagal',
  },
  logout: {
    icon: LogOut,
    iconClass: 'text-slate-500',
    bgGradient: 'from-slate-50 to-white',
    border: 'border-slate-200',
    bar: 'bg-slate-500',
    iconBg: 'bg-slate-100',
    title: 'text-slate-800',
    message: 'text-slate-600',
    shadow: 'shadow-slate-200/60',
    pill: 'bg-slate-500',
    label: 'Keluar',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-500',
    bgGradient: 'from-amber-50 to-white',
    border: 'border-amber-200',
    bar: 'bg-amber-500',
    iconBg: 'bg-amber-100',
    title: 'text-amber-900',
    message: 'text-amber-700',
    shadow: 'shadow-amber-200/60',
    pill: 'bg-amber-500',
    label: 'Perhatian',
  },
}

/* --- Component --- */
export default function AuthPopup() {
  const [popup, setPopup] = useState(null)

  const openPopup = useCallback((detail) => {
    setPopup({ id: Date.now(), ...detail })
  }, [])

  const closePopup = useCallback(() => setPopup(null), [])

  useEffect(() => {
    if (popup) {
      document.body.setAttribute('data-auth-popup-open', 'true')
    } else {
      document.body.removeAttribute('data-auth-popup-open')
    }
    return () => document.body.removeAttribute('data-auth-popup-open')
  }, [popup])

  useEffect(() => {
    setPopupExternal = (detail) => openPopup(detail)
    return () => { setPopupExternal = null }
  }, [openPopup])

  useEffect(() => {
    const handler = (e) => openPopup(e.detail)
    window.addEventListener('auth-popup', handler)
    return () => window.removeEventListener('auth-popup', handler)
  }, [openPopup])

  useEffect(() => {
    if (!popup) return
    const timer = setTimeout(closePopup, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [popup, closePopup])

  useEffect(() => {
    if (!popup) return
    const handler = (e) => { if (e.key === 'Escape') closePopup() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [popup, closePopup])

  const cfg = popup ? (CONFIG[popup.type] || CONFIG.success) : null
  const Icon = cfg?.icon

  return (
    <AnimatePresence>
      {popup && cfg && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[99998] bg-slate-900/30 backdrop-blur-sm"
            onClick={closePopup}
          />

          {/* Popup Card */}
          <motion.div
            key={popup.id}
            initial={{ opacity: 0, scale: 0.85, y: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -30 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center px-4 pointer-events-none"
          >
            <div
              className={[
                'pointer-events-auto relative w-full max-w-sm rounded-3xl border bg-gradient-to-b overflow-hidden shadow-2xl',
                cfg.bgGradient, cfg.border, cfg.shadow,
              ].join(' ')}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="auth-popup-title"
              aria-describedby="auth-popup-desc"
            >
              {/* Auto-dismiss progress bar */}
              <motion.div
                className={`absolute top-0 left-0 h-1 rounded-t-3xl ${cfg.bar}`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
              />

              {/* Close button */}
              <button
                type="button"
                onClick={closePopup}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-xl hover:bg-slate-100 z-10"
                aria-label="Tutup notifikasi"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Content */}
              <div className="flex flex-col items-center gap-4 px-8 pt-10 pb-8 text-center">
                {/* Icon with glow ring */}
                <div className={`flex items-center justify-center w-20 h-20 rounded-full ring-8 ring-white shadow-md ${cfg.iconBg}`}>
                  <Icon className={`w-10 h-10 ${cfg.iconClass}`} strokeWidth={1.8} />
                </div>

                {/* Status pill badge */}
                <span className={`inline-flex items-center px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${cfg.pill}`}>
                  {cfg.label}
                </span>

                {/* Title */}
                {popup.title && (
                  <p id="auth-popup-title" className={`text-lg font-black leading-tight ${cfg.title}`}>
                    {popup.title}
                  </p>
                )}

                {/* Message */}
                {popup.message && (
                  <p id="auth-popup-desc" className={`text-sm leading-relaxed ${cfg.message}`}>
                    {popup.message}
                  </p>
                )}

                {/* OK button */}
                <button
                  type="button"
                  onClick={closePopup}
                  className={`mt-1 w-full py-2.5 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-md ${cfg.pill}`}
                >
                  OK, Mengerti
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
