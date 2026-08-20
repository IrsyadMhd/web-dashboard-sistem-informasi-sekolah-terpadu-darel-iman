import React from 'react'
import PropTypes from 'prop-types'
import { FaInbox } from 'react-icons/fa'
import { RefreshCcw } from 'lucide-react'

export function EmptyState({
  icon = <FaInbox className="text-4xl text-emerald-600/70" />,
  title = 'Belum Ada Data',
  description = 'Data yang Anda cari saat ini belum tersedia atau belum diinputkan ke sistem.',
  action,
  actionLabel,
  onAction,
}) {
  const isReset = typeof actionLabel === 'string' && actionLabel.toLowerCase().includes('reset')

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 my-4 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-xs dark:bg-emerald-950/60 dark:text-emerald-300">
        {icon}
      </div>
      <h4 className="text-base font-bold text-slate-800 dark:text-white leading-snug">{title}</h4>
      <p className="mt-1 text-xs text-slate-500 max-w-sm dark:text-slate-400">{description}</p>
      {action || (actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className={`mt-4 inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs ${
            isReset
              ? 'bg-[#EDE9FE] text-[#7C3AED] hover:bg-[#DDD6FE] dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-900/80'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500'
          }`}
        >
          {isReset && <RefreshCcw className="h-4 w-4" />}
          <span>{actionLabel}</span>
        </button>
      ))}
    </div>
  )
}

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.node,
  description: PropTypes.node,
  action: PropTypes.node,
  actionLabel: PropTypes.node,
  onAction: PropTypes.func,
}
