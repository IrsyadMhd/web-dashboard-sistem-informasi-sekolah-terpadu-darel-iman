import React from 'react'
import { Home, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

/**
 * AppBreadcrumb - canonical breadcrumb navigation.
 *
 * Props:
 *  - items: [{ label, to }] — last item without `to` is the active page.
 *  - homeTo: default '/dashboard' (Home icon). Set null to hide home item.
 */
export default function AppBreadcrumb({ items = [], homeTo = '/dashboard', className = '' }) {
  const all = homeTo ? [{ label: 'Beranda', to: homeTo }, ...items] : [...items]

  if (all.length === 0) return null

  return (
    <nav className={cn('flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400', className)} aria-label="Breadcrumb">
      {all.map((item, idx) => {
        const isLast = idx === all.length - 1
        return (
          <React.Fragment key={idx}>
            {idx > 0 && (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" aria-hidden="true" />
            )}
            {isLast || !item.to ? (
              <span
                className="max-w-[200px] truncate font-bold text-slate-800 sm:max-w-xs dark:text-slate-200"
                aria-current="page"
                title={item.label}
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                aria-label={item.label === 'Beranda' ? 'Kembali ke Dashboard' : item.label}
                className="inline-flex max-w-[150px] items-center gap-1.5 truncate font-medium transition hover:text-[#0E5C44] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5C44]/30 rounded-md sm:max-w-xs dark:hover:text-[#3FBF75]"
                title={item.label}
              >
                {item.label === 'Beranda' && <Home className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />}
                <span className="truncate">{item.label}</span>
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
