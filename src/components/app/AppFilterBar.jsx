import React from 'react'
import { SlidersHorizontal, RotateCcw } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * AppFilterBar - Canonical filter bar wrapper for page tables and data filters.
 *
 * Props:
 *  - label: string (default 'Filter')
 *  - activeCount: number of active filter conditions
 *  - onReset: callback function when reset filter button is clicked
 *  - children: select inputs, datepickers, radios, etc.
 */
export default function AppFilterBar({
  children,
  label = 'Filter',
  activeCount = 0,
  onReset,
  className = '',
}) {
  return (
    <section
      className={cn(
        'flex flex-col gap-3 rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-sm transition-all sm:flex-row sm:items-center dark:border-slate-800 dark:bg-[#1B2433]',
        className
      )}
    >
      {label && (
        <div className="flex shrink-0 items-center justify-between sm:justify-start gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
            <SlidersHorizontal className="h-4 w-4 text-[#0E5C44] dark:text-[#3FBF75]" />
            {label}
            {activeCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#0E5C44] px-1.5 text-[10px] font-extrabold text-white dark:bg-[#3FBF75] dark:text-slate-900">
                {activeCount}
              </span>
            )}
          </span>

          {activeCount > 0 && onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex sm:hidden items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
        {children}
      </div>

      {activeCount > 0 && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="hidden sm:inline-flex shrink-0 items-center gap-1 text-xs font-bold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Filter
        </button>
      )}
    </section>
  )
}
