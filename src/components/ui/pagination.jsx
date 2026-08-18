import React from 'react'
import PropTypes from 'prop-types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'

export function Pagination({ currentPage = 1, totalPages = 1, onPageChange, totalItems = 0, itemsPerPage = 10 }) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)
  const pages = []
  for (let page = 1; page <= totalPages; page += 1) {
    if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) pages.push(page)
  }
  const pageItems = pages.reduce((items, page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) items.push(`ellipsis-${page}`)
    items.push(page)
    return items
  }, [])

  return (
    <div className="flex flex-col items-center justify-between gap-3 pt-3 sm:flex-row sm:pt-4">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
        Menampilkan{' '}
        <span className="font-extrabold text-slate-800 dark:text-white">{totalItems > 0 ? startItem : 0}</span> -{' '}
        <span className="font-extrabold text-slate-800 dark:text-white">{endItem}</span> dari{' '}
        <span className="font-extrabold text-slate-800 dark:text-white">{totalItems}</span> data
      </p>

      <nav aria-label="Navigasi halaman" className="flex items-center gap-1 sm:gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage <= 1}
          aria-label="Halaman sebelumnya"
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 gap-1 px-2.5 text-xs font-bold sm:h-9 sm:px-3"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </Button>

        <div className="flex items-center gap-1">
          {pageItems.map((page) =>
            typeof page === 'string' ? (
              <span key={page} aria-hidden="true" className="px-1 text-xs text-slate-400">
                …
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-label={`Buka halaman ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
                className={`h-8 w-8 rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5C44]/30 ${
                  page === currentPage
                    ? 'bg-[#0E5C44] text-white shadow-sm font-extrabold dark:bg-[#3FBF75] dark:text-slate-900'
                    : 'text-slate-600 hover:bg-[#0E5C44]/10 hover:text-[#0E5C44] dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage >= totalPages}
          aria-label="Halaman berikutnya"
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 gap-1 px-2.5 text-xs font-bold sm:h-9 sm:px-3"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </nav>
    </div>
  )
}

Pagination.propTypes = {
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
  totalItems: PropTypes.number,
  itemsPerPage: PropTypes.number,
}
