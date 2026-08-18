import React from 'react'

export function ReportKpiGrid({ items = [] }) {
  if (!items || items.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item, index) => {
        const Icon = item.icon

        return (
          <div
            key={index}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {item.title}
              </span>
              {Icon && (
                <div className={`rounded-xl p-2.5 transition ${item.iconBg || 'bg-emerald-50 text-[#0E5C44] dark:bg-emerald-950/40 dark:text-emerald-300'}`}>
                  <Icon className="h-5 w-5" />
                </div>
              )}
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {typeof item.value === 'number' ? item.value.toLocaleString('id-ID') : (item.value || '0')}
              </span>
              {item.unit && <span className="text-xs font-semibold text-slate-500">{item.unit}</span>}
            </div>

            {item.subtext && (
              <p className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {item.subtext}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
