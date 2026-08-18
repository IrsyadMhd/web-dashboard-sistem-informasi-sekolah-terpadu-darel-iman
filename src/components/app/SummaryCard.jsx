import React from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import AppBadge from './AppBadge'
import AppSkeleton from './AppSkeleton'

const toneMap = {
  emerald: 'bg-[#0E5C44]/10 text-[#0E5C44] dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]',
  blue: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
  violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
}

/**
 * SummaryCard - Canonical summary card (used for unit, program, rombel summary).
 */
export default function SummaryCard({
  icon: Icon,
  title,
  value,
  description,
  badge,
  badgeVariant = 'info',
  onClick,
  loading = false,
  accent = true,
  colorScheme,
  className = '',
}) {
  if (loading) {
    return <AppSkeleton variant="card" className={cn('summary-card h-[90px] rounded-[18px]', className)} />
  }

  const tone = colorScheme ? toneMap[colorScheme] || toneMap.emerald : null
  const isClickable = typeof onClick === 'function'

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={cn(
        'summary-card flex items-start gap-3.5 rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5C44]/30 dark:border-slate-800 dark:bg-[#1B2433]',
        isClickable && 'cursor-pointer hover:-translate-y-0.5 hover:border-[#3FBF75]/40 hover:shadow-md dark:hover:border-[#3FBF75]/30',
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            'summary-card__icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl mt-0.5 transition-colors',
            tone || (accent ? 'bg-[#0E5C44]/10 text-[#0E5C44] dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300')
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="summary-card__content min-w-0 flex-1">
        <p className="summary-card__title text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-normal leading-tight">
          {title}
        </p>
        <div className="summary-card__value-row mt-1 flex flex-wrap items-center gap-2">
          <span className="summary-card__value text-2xl font-black text-slate-900 dark:text-white whitespace-nowrap">
            {value ?? '—'}
          </span>
          {badge && <AppBadge variant={badgeVariant} className="shrink-0">{badge}</AppBadge>}
        </div>
        {description && (
          <p className="summary-card__description mt-1 text-xs text-slate-400 dark:text-slate-500 whitespace-normal leading-tight">
            {description}
          </p>
        )}
      </div>
      {isClickable && <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 dark:text-slate-600" />}
    </div>
  )
}
