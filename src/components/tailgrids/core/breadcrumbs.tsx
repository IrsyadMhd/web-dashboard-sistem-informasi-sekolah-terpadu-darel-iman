import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

type BreadcrumbItem = {
  href?: string
  to?: string
  label: string
  icon?: React.ReactNode
}

type PropsType = {
  items: BreadcrumbItem[]
  dividerType?: 'slash' | 'chevron' | 'dot'
  homeTo?: string | null
  className?: string
}

export function Breadcrumbs({
  items = [],
  dividerType = 'chevron',
  homeTo = '/dashboard',
  className = '',
}: PropsType) {
  const allItems: BreadcrumbItem[] = homeTo
    ? [{ href: homeTo, label: 'Beranda', icon: <Home className="size-3.5 shrink-0 text-slate-400 dark:text-slate-500" /> }, ...items]
    : items

  if (!allItems.length) return null

  return (
    <nav className={cn('flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400', className)} aria-label="Breadcrumb">
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1
        const target = item.href || item.to

        return (
          <React.Fragment key={index}>
            {index > 0 && <Divider type={dividerType} />}

            {isLast || !target ? (
              <span
                className="max-w-[200px] truncate font-bold text-slate-800 sm:max-w-xs dark:text-slate-200"
                aria-current="page"
                title={item.label}
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={target}
                className="inline-flex max-w-[150px] items-center gap-1.5 truncate font-medium transition hover:text-[#0E5C44] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5C44]/30 rounded-md sm:max-w-xs dark:hover:text-[#3FBF75]"
                title={item.label}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

function Divider({ type }: { type: PropsType['dividerType'] }) {
  switch (type) {
    case 'chevron':
      return <ChevronRight className="size-3.5 shrink-0 text-slate-300 dark:text-slate-600" aria-hidden="true" />
    case 'dot':
      return <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-600" />
    default:
      return <span className="text-slate-300 dark:text-slate-600">/</span>
  }
}

export default Breadcrumbs
