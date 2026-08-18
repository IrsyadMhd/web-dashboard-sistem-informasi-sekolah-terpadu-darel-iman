import React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * AppSearch - Canonical search input component used across pages.
 */
export default function AppSearch({
  value = '',
  onChange,
  placeholder = 'Cari data...',
  className = '',
  shortcut,
  autoFocus,
  size = 'default',
  ...props
}) {
  return (
    <div className={cn('group relative min-w-0 flex-1', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#0E5C44] dark:group-focus-within:text-[#3FBF75]" />
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          'w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-9 font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#0E5C44] focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-800 dark:bg-[#111827] dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-[#3FBF75] dark:focus:ring-[#3FBF75]/20',
          size === 'sm' ? 'h-9 text-xs' : 'h-10 text-sm'
        )}
        {...props}
      />
      {value ? (
        <button
          type="button"
          aria-label="Bersihkan pencarian"
          onClick={() => onChange?.({ target: { value: '' } })}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 focus-visible:outline-none"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : shortcut ? (
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-slate-200/60 bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
          {shortcut}
        </span>
      ) : null}
    </div>
  )
}
