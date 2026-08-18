import React from 'react'
import { cn } from '../../lib/utils'

/**
 * SectionHeader - Canonical section header component.
 * Used to group sections in pages, cards, and dashboards.
 */
export default function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  badge,
  actions,
  className = '',
}) {
  return (
    <div className={cn('flex flex-col justify-between gap-3 sm:flex-row sm:items-center', className)}>
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0E5C44]/10 text-[#0E5C44] dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]">
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h3>
            {badge && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
