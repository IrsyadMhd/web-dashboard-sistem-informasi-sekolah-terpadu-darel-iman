import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'
import { cn } from '../../lib/utils'

const ToastContext = createContext(null)

const ICONS = {
  success: { Icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500' },
  error: { Icon: XCircle, color: 'text-rose-600 dark:text-rose-400', bar: 'bg-rose-500' },
  warning: { Icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500' },
  info: { Icon: Info, color: 'text-sky-600 dark:text-sky-400', bar: 'bg-sky-500' },
}

const ToastItem = ({ toast, onClose }) => {
  const { Icon, color, bar } = ICONS[toast.type] || ICONS.info
  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className="pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-[16px] border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-[#1B2433]"
    >
      <span className={cn('absolute inset-y-0 left-0 w-1', bar)} aria-hidden="true" />
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', color)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900 dark:text-white">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{toast.description}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup notifikasi"
        className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

/**
 * ToastProvider - canonical global toast notification.
 *
 * Pakai lewat hook useToast():
 *   const toast = useToast()
 *   toast.success('Data berhasil ditambahkan.')
 *   toast.error('Gagal menyimpan data.')
 *   toast.warning('Perhatikan validasi input.')
 *   toast.info('Export sedang diproses.')
 *
 * Semua feedback sukses/gagal di aplikasi wajib lewat provider ini
 * (bukan toast per halaman).
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(({ title, description, type = 'info', duration = 4000 }) => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, title, description, type }])
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }, [dismiss])

  const api = useMemo(() => ({
    toast,
    success: (title, description) => toast({ title, description, type: 'success' }),
    error: (title, description) => toast({ title, description, type: 'error', duration: 6000 }),
    warning: (title, description) => toast({ title, description, type: 'warning' }),
    info: (title, description) => toast({ title, description, type: 'info' }),
    dismiss,
  }), [toast, dismiss])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-2.5" aria-live="polite">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast harus dipakai di dalam <ToastProvider>.')
  }
  return ctx
}

export default ToastProvider
