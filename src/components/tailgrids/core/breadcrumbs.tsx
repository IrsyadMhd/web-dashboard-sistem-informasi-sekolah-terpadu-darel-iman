import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { usePengaturanStore } from '@/stores/pengaturanStore'

export type BreadcrumbItem = {
  href?: string
  to?: string
  path?: string
  url?: string
  label?: string
  name?: string
  title?: string
  icon?: React.ReactNode
}

export type BreadcrumbsProps = {
  items?: (BreadcrumbItem | string)[]
  dividerType?: 'slash' | 'chevron' | 'dot'
  homeTo?: string | null | boolean
  className?: string
  pageTitle?: string
}

/**
 * TailGrids Breadcrumbs Component
 *
 * Standar Emas Navigasi Breadcrumb SIMSIT berdasarkan TAILGRIDS_BREADCRUMBS_COMPONENT.md:
 * 1. Ikon Beranda di Awal (Home icon size-3.5 shrink-0)
 * 2. Pemisah Divider (Chevron / Slash / Dot) terintegrasi Pengaturan Sistem
 * 3. Hyperlink SPA dengan hover warna hijau khas SIMSIT (hover:text-[#0E5C44] dark:hover:text-[#3FBF75])
 * 4. Highlight Item Aktif tebal (font-bold text-slate-800 dark:text-slate-200)
 * 5. Safe truncation & responsif (truncate max-w-[200px] sm:max-w-xs)
 * 6. Print-safe & margin standar (mb-4 print:hidden)
 */
export function Breadcrumbs({
  items = [],
  dividerType,
  homeTo = '/dashboard',
  className = '',
  pageTitle,
}: BreadcrumbsProps) {
  const storeDivider = usePengaturanStore((s) => s.pengaturan?.breadcrumb_divider) || 'chevron'
  const storeShowHome = usePengaturanStore((s) => s.pengaturan?.breadcrumb_show_home) ?? true

  const activeDivider = dividerType || storeDivider
  const effectiveHomeTo =
    homeTo === null || homeTo === false || !storeShowHome
      ? null
      : typeof homeTo === 'string'
      ? homeTo
      : '/dashboard'

  // Normalisasi items input (array object atau string)
  let rawItems: BreadcrumbItem[] = []
  if (items && Array.isArray(items) && items.length > 0) {
    rawItems = items.map((item) => {
      if (typeof item === 'string') {
        return { label: item }
      }
      return {
        label: item.label || item.name || item.title || '',
        href: item.href || item.to || item.path || item.url,
        icon: item.icon,
      }
    })
  } else if (pageTitle) {
    rawItems = [{ label: pageTitle }]
  }

  // Cek apakah item pertama sudah merupakan "Beranda" / "Home" / "Dashboard"
  const firstItem = rawItems[0]
  const firstLabel = String(firstItem?.label || '').toLowerCase().trim()
  const isFirstItemHome = firstLabel === 'beranda' || firstLabel === 'home' || (firstLabel === 'dashboard' && firstItem?.href === '/dashboard')

  let allItems: BreadcrumbItem[] = []
  if (isFirstItemHome) {
    // Jika item pertama sudah Home/Beranda, beri ikon Home jika belum ada
    allItems = [
      {
        ...firstItem,
        icon: firstItem.icon || <Home className="size-3.5 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />,
      },
      ...rawItems.slice(1),
    ]
  } else if (effectiveHomeTo) {
    // Prepend item Beranda default dengan ikon Home
    allItems = [
      {
        href: effectiveHomeTo,
        label: 'Beranda',
        icon: <Home className="size-3.5 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />,
      },
      ...rawItems,
    ]
  } else {
    allItems = rawItems
  }

  if (!allItems.length) return null

  return (
    <nav
      className={cn(
        'flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 print:hidden',
        className
      )}
      aria-label="Breadcrumb"
    >
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1
        const target = item.href || item.to
        const label = item.label || ''

        return (
          <React.Fragment key={index}>
            {index > 0 && <Divider type={activeDivider} />}

            {isLast || !target ? (
              <span
                className="max-w-[200px] truncate font-bold text-slate-800 sm:max-w-xs dark:text-slate-200"
                aria-current="page"
                title={label}
              >
                {label}
              </span>
            ) : (
              <Link
                to={target}
                aria-label={label === 'Beranda' ? 'Kembali ke Dashboard' : label}
                className="inline-flex max-w-[150px] items-center gap-1.5 truncate font-medium transition hover:text-[#0E5C44] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5C44]/30 rounded-md sm:max-w-xs dark:hover:text-[#3FBF75]"
                title={label}
              >
                {item.icon}
                <span className="truncate">{label}</span>
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

function Divider({ type }: { type?: 'slash' | 'chevron' | 'dot' }) {
  switch (type) {
    case 'slash':
      return <span className="text-slate-300 dark:text-slate-600 select-none px-0.5" aria-hidden="true">/</span>
    case 'dot':
      return <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0 mx-0.5" aria-hidden="true" />
    case 'chevron':
    default:
      return <ChevronRight className="size-3.5 shrink-0 text-slate-300 dark:text-slate-600" aria-hidden="true" />
  }
}

export default Breadcrumbs
