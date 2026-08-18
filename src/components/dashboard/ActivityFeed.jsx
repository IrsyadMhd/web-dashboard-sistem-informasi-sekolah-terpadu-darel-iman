import React from 'react'
import EmptyState from './EmptyState'
import ErrorState from './ErrorState'
import { Activity } from 'lucide-react'

export default function ActivityFeed({
  title = 'Aktivitas Terbaru',
  activities = [],
  loading = false,
  emptyMessage = 'Belum ada aktivitas tercatat.',
  error = null,
  onRetry
}) {
  return (
    <div className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-[#0E5C44] dark:text-emerald-400" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-12 w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-12 w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-12 w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : activities.length === 0 ? (
        <EmptyState title="Belum Ada Aktivitas" message={emptyMessage} />
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {activities.map((item, idx) => (
            <div key={item.id || idx} className="relative group">
              <div className="absolute -left-[19px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-[#0E5C44] dark:border-slate-900 dark:bg-emerald-400 group-hover:scale-125 transition-transform" />
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.title || item.description || item.action}</div>
              {item.subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.subtitle}</p>}
              <span className="text-[11px] text-slate-400 dark:text-slate-500">{item.time || item.created_at || 'Baru saja'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
