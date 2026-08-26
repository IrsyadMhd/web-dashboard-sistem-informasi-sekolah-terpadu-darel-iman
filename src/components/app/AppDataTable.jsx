import React, { useMemo, useState, useEffect } from 'react'
import { ArrowBothDirectionHorizontal2 } from '@tailgrids/icons'
import { TableRoot, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../tailgrids/core/table'
import { Pagination } from '../tailgrids/core/pagination'
import { cn } from '../../lib/utils'
import AppSearch from './AppSearch'
import AppPagination from './AppPagination'
import AppEmptyState from './AppEmptyState'
import AppErrorState from './AppErrorState'
import AppSkeleton from './AppSkeleton'
import ActionDropdown from './ActionDropdown'
import MobileDataCard from './MobileDataCard'


/**
 * AppDataTable - Canonical master data table component.
 *
 * Capabilities:
 *  - Responsive Desktop Table + Mobile Card view fallback
 *  - Sticky header & sticky action columns
 *  - Internal + Controlled Search & Sorting
 *  - Filter bar integration
 *  - Server / Client pagination
 *  - Density modes ('comfortable' | 'compact')
 *  - Loading skeleton, Empty, and Error states
 *  - Multi-row selection & Bulk actions
 *  - ActionDropdown with built-in permission checking
 */
export default function AppDataTable({
  children,
  renderTable,
  renderMobileCard,
  columns = [],
  data = [],
  printableHeader,
  keyField = 'id',
  isLoading = false,
  isError = false,
  errorTitle = 'Data Gagal Dimuat',
  errorMessage,
  onRetry,
  searchableKeys,
  search = '',
  onSearchChange,
  searchPlaceholder = 'Cari data...',
  filters,
  actions,
  title,
  countLabel,
  description,
  bulkActions,
  serverControlled = false,
  clientPagination = false,
  clientPageSize = 10,
  page,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  meta,
  onRowClick,
  selectedKeys = [],
  onToggleSelect,
  density = 'comfortable',
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  emptyActionOnClick,
  hasActiveFilters,
  filteredEmptyTitle = 'Data tidak ditemukan',
  filteredEmptyDescription = 'Coba ubah kata kunci atau filter yang digunakan.',
  filteredEmptyActionLabel = 'Reset Filter',
  onResetFilters,
  isEmpty,
  onView,
  onEdit,
  onDelete,
  onHistory,
  extraActions,
  embedded = false,
  fullBleed = false,
  showToolbar = true,
  showPagination = true,
  toolbarClassName = '',
  tableContainerClassName = '',
  className = '',
}) {
  const [internalSearch, setInternalSearch] = useState(search ?? '')
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [clientPage, setClientPage] = useState(1)

  const hasCustomTable = typeof renderTable === 'function' || children !== undefined
  const searchValue = onSearchChange ? (search ?? '') : internalSearch

  useEffect(() => {
    setInternalSearch(search ?? '')
  }, [search])

  useEffect(() => {
    if (clientPagination) setClientPage(1)
  }, [clientPagination, searchValue, sortKey, sortDir])

  const handleSearch = (e) => {
    const value = e.target.value
    setInternalSearch(value)
    onSearchChange?.(value)
  }

  const filteredData = useMemo(() => {
    if (serverControlled || hasCustomTable) return data
    if (!searchValue) return data
    const keys = searchableKeys || columns.map((c) => c.key).filter(Boolean)
    const term = String(searchValue).toLowerCase()
    return data.filter((row) =>
      keys.some((key) => {
        const val = row?.[key]
        if (val === null || val === undefined) return false
        return String(val).toLowerCase().includes(term)
      })
    )
  }, [data, searchValue, searchableKeys, columns, serverControlled, hasCustomTable])

  const sortedData = useMemo(() => {
    if (serverControlled || !sortKey) return filteredData
    const dir = sortDir === 'asc' ? 1 : -1
    return [...filteredData].sort((a, b) => {
      const av = a?.[sortKey]
      const bv = b?.[sortKey]
      if (av === bv) return 0
      if (av === null || av === undefined) return 1
      if (bv === null || bv === undefined) return -1
      return String(av).localeCompare(String(bv), 'id', { numeric: true }) * dir
    })
  }, [filteredData, sortKey, sortDir, serverControlled])

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const hasActionColumn = Boolean(onView || onEdit || onDelete || onHistory || extraActions)
  const rowPadding = density === 'compact' ? 'px-3.5 py-2.5' : 'px-4 py-3.5'
  const hasFilters = Boolean(filters)
  const resolvedBulkActions = typeof bulkActions === 'function' ? bulkActions(selectedKeys) : bulkActions
  const clientTotalPages = Math.max(1, Math.ceil(sortedData.length / clientPageSize))
  const resolvedClientPage = Math.min(clientPage, clientTotalPages)
  const visibleData = clientPagination
    ? sortedData.slice((resolvedClientPage - 1) * clientPageSize, resolvedClientPage * clientPageSize)
    : sortedData
  const resolvedIsEmpty = typeof isEmpty === 'boolean' ? isEmpty : !hasCustomTable && sortedData.length === 0
  const isFilteredEmpty = typeof hasActiveFilters === 'boolean' ? hasActiveFilters : Boolean(searchValue)
  const customTable = typeof renderTable === 'function'
    ? renderTable({ data: visibleData, sortKey, sortDir })
    : children

  return (
    <div
      className={cn(
        'app-data-table min-w-0',
        embedded
          ? 'app-data-table--embedded'
          : 'relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]',
        className
      )}
    >
      {/* Toolbar: search + filter + action */}
      {showToolbar && (onSearchChange || search !== undefined || hasFilters || actions || title) && (
        <div className={cn('flex flex-col gap-3.5 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-4 py-4 sm:px-6 md:px-8 dark:border-emerald-800/40 dark:bg-gradient-to-r dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-transparent print:hidden', toolbarClassName)}>
          {/* Row 1: Title / Description on Left, Action Buttons (Import, Export, Tambah Unit) on Right */}
          {(title || description || actions) && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100/80 pb-3 dark:border-slate-800/60">
              {(title || description) && (
                <div className="min-w-0">
                  {title && (
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{title}</h3>
                      {countLabel && (
                        <span className="inline-flex items-center rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                          {countLabel}
                        </span>
                      )}
                    </div>
                  )}
                  {description && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
                </div>
              )}
              {actions && (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {actions}
                </div>
              )}
            </div>
          )}

          {/* Row 2: Full-width Search Input */}
          {(onSearchChange || search !== undefined) && (
            <div className="w-full min-w-0">
              <AppSearch
                value={searchValue}
                onChange={handleSearch}
                placeholder={searchPlaceholder}
                size="sm"
              />
            </div>
          )}

          {/* Row 3: Filter Controls */}
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap overflow-x-auto no-scrollbar min-w-0 w-full pt-0.5">
              {filters}
            </div>
          )}

          {/* Selected Rows Bulk Action */}
          {selectedKeys.length > 0 && resolvedBulkActions && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-emerald-50/80 p-2.5 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30">
              <span className="mr-1 text-xs font-bold text-[#0E5C44] dark:text-[#3FBF75]">
                {selectedKeys.length} data dipilih
              </span>
              {resolvedBulkActions}
            </div>
          )}
        </div>
      )}

      {/* Body states */}
      {isLoading ? (
        <div className="app-data-table__state p-4 print:hidden">
          <AppSkeleton variant="table" rows={6} cols={Math.max(columns.length, 4)} />
        </div>
      ) : isError ? (
        <div className="app-data-table__state p-4 print:hidden">
          <AppErrorState title={errorTitle} description={errorMessage} onRetry={onRetry} compact />
        </div>
      ) : resolvedIsEmpty ? (
        <AppEmptyState
          title={isFilteredEmpty ? filteredEmptyTitle : (emptyTitle || 'Data Tidak Ditemukan')}
          description={isFilteredEmpty ? filteredEmptyDescription : (emptyDescription || 'Belum ada data yang sesuai dengan kriteria.')}
          actionLabel={isFilteredEmpty ? filteredEmptyActionLabel : emptyActionLabel}
          onAction={isFilteredEmpty ? (onResetFilters || emptyActionOnClick) : emptyActionOnClick}
        />
      ) : hasCustomTable ? (
        <div className={cn('app-data-table__viewport min-w-0 overflow-x-auto', tableContainerClassName)}>
          {customTable}
        </div>
      ) : (
        <>
          {/* Mobile Card List View (Visible on < md screens if renderMobileCard or fallback card is enabled) */}
          <div className="block md:hidden space-y-3 p-3.5 print:hidden app-data-table__mobile-cards">
            {visibleData.map((row, rowIdx) => {
              const rowKey = row?.[keyField] ?? rowIdx
              const selected = selectedKeys.includes(rowKey)

              if (renderMobileCard) {
                return (
                  <React.Fragment key={rowKey}>
                    {renderMobileCard({
                      row,
                      rowIdx,
                      selected,
                      onToggleSelect: () => {
                        const next = selected
                          ? selectedKeys.filter((k) => k !== rowKey)
                          : [...new Set([...selectedKeys, rowKey])]
                        onToggleSelect?.(next)
                      },
                      onView: onView ? () => onView(row) : undefined,
                      onEdit: onEdit ? () => onEdit(row) : undefined,
                      onDelete: onDelete ? () => onDelete(row) : undefined,
                      onHistory: onHistory ? () => onHistory(row) : undefined,
                    })}
                  </React.Fragment>
                )
              }

              // Default Mobile Data Card fallback
              const firstCol = columns[0]
              const titleVal = firstCol?.render ? firstCol.render(row, rowIdx) : row?.[firstCol?.key] || `Item #${rowIdx + 1}`
              const secondaryFields = columns.slice(1, 5).map((col) => ({
                label: col.label,
                value: col.render ? col.render(row, rowIdx) : row?.[col.key],
              }))

              return (
                <MobileDataCard
                  key={rowKey}
                  title={titleVal}
                  fields={secondaryFields}
                  selected={selected}
                  onSelect={
                    onToggleSelect
                      ? (checked) => {
                          const next = checked
                            ? [...new Set([...selectedKeys, rowKey])]
                            : selectedKeys.filter((k) => k !== rowKey)
                          onToggleSelect(next)
                        }
                      : undefined
                  }
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onView={onView ? () => onView(row) : undefined}
                  onEdit={onEdit ? () => onEdit(row) : undefined}
                  onDelete={onDelete ? () => onDelete(row) : undefined}
                  onHistory={onHistory ? () => onHistory(row) : undefined}
                  extraActions={extraActions?.({ row, rowIdx })}
                />
              )
            })}
          </div>

          {/* Desktop Table View (Hidden on mobile < md screens) */}
          <div className={cn('hidden md:block app-data-table__viewport min-w-0 w-full overflow-x-auto px-4 sm:px-6 md:px-8 print:block print:px-0 print:m-0 print:p-0', tableContainerClassName)}>
            {printableHeader && (
              <div className="hidden print:block mb-1 mt-0 p-0 border-b border-slate-400 pb-1 text-slate-900">
                {printableHeader}
              </div>
            )}
            <TableRoot fullBleed={false} className="w-full min-w-[850px] border-collapse print:min-w-0 print:m-0">
              <TableHeader className="bg-[#F8FAFB] dark:bg-[#202B3A]">
                <TableRow className="hover:bg-transparent border-b border-[#EDF0F4] dark:border-[#354153] bg-[#F8FAFB] dark:bg-[#202B3A]">
                  {onToggleSelect && (
                    <TableHead className="w-10 px-4 print:hidden bg-[#F8FAFB] dark:bg-[#202B3A]">
                      <input
                        type="checkbox"
                        aria-label="Pilih semua"
                        checked={selectedKeys.length > 0 && selectedKeys.length === visibleData.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onToggleSelect?.(visibleData.map((row) => row[keyField]))
                          } else {
                            onToggleSelect?.([])
                          }
                        }}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#0E5C44] dark:border-slate-700"
                      />
                    </TableHead>
                  )}
                  {columns.map((col) => (
                    <TableHead
                      key={col.key || col.label}
                      className={cn(
                        'whitespace-nowrap text-[11px] font-extrabold uppercase tracking-wider text-[#58677B] dark:text-[#DCE5F1] bg-[#F8FAFB] dark:bg-[#202B3A] py-3.5 px-4',
                        col.hideOnMobile && 'hidden lg:table-cell print:table-cell',
                        col.className,
                        col.headerProps?.className
                      )}
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() => handleSort(col.key)}
                          className="inline-flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer hover:text-slate-900 dark:hover:text-white text-[11px] font-extrabold"
                        >
                          <span>{col.label}</span>
                          <ArrowBothDirectionHorizontal2 className={cn('h-3.5 w-3.5 shrink-0 transition-transform duration-200 print:hidden', sortKey === col.key ? 'text-emerald-600 dark:text-emerald-400 rotate-180' : 'text-slate-400 dark:text-slate-500')} />
                        </button>
                      ) : (
                        col.label
                      )}
                    </TableHead>
                  ))}
                  {hasActionColumn && (
                    <TableHead className="w-[88px] min-w-[88px] text-center font-extrabold text-[11px] uppercase tracking-wider text-[#58677B] dark:text-[#DCE5F1] bg-[#F8FAFB] dark:bg-[#202B3A] py-3.5 px-4 print:hidden">
                      AKSI
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleData.map((row, rowIdx) => {
                  const rowKey = row?.[keyField] ?? rowIdx
                  const selected = selectedKeys.includes(rowKey)
                  return (
                    <TableRow
                      key={rowKey}
                      data-state={selected ? 'selected' : undefined}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={cn(
                        'transition-all duration-200 hover:bg-slate-50/90 dark:hover:bg-slate-800/50 hover:shadow-xs',
                        selected && 'bg-emerald-50/30 dark:bg-emerald-950/20',
                        onRowClick && 'cursor-pointer'
                      )}
                    >
                      {onToggleSelect && (
                        <TableCell className="px-4 py-3.5 print:hidden" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            aria-label={`Pilih ${rowKey}`}
                            checked={selected}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...new Set([...selectedKeys, rowKey])]
                                : selectedKeys.filter((k) => k !== rowKey)
                              onToggleSelect?.(next)
                            }}
                            className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#0E5C44] dark:border-slate-700"
                          />
                        </TableCell>
                      )}
                      {columns.map((col) => (
                        <TableCell
                          key={col.key || col.label}
                          className={cn(rowPadding, 'text-xs text-slate-700 dark:text-slate-200 align-top', col.hideOnMobile && 'hidden lg:table-cell print:table-cell', col.className, col.cellProps?.className)}
                        >
                          {col.render ? col.render(row, rowIdx) : row?.[col.key] ?? '—'}
                        </TableCell>
                      ))}
                      {hasActionColumn && (
                        <TableCell className={cn('w-[88px] min-w-[88px] text-center print:hidden', rowPadding)} onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            {extraActions?.({ row, rowIdx })}
                            {hasActionColumn && (
                              <ActionDropdown
                                onView={onView ? () => onView(row) : undefined}
                                onEdit={onEdit ? () => onEdit(row) : undefined}
                                onDelete={onDelete ? () => onDelete(row) : undefined}
                                onHistory={onHistory ? () => onHistory(row) : undefined}
                              />
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </TableRoot>
          </div>
        </>
      )}

      {/* Pagination */}
      {showPagination && !isLoading && !isError && !resolvedIsEmpty && (
        <div className="w-full border-t border-slate-100 px-4 py-3.5 sm:px-6 md:px-8 dark:border-slate-800 print:hidden">
          <Pagination
            currentPage={clientPagination ? resolvedClientPage : page}
            totalPages={clientPagination ? clientTotalPages : totalPages}
            sideLayout="full"
            onPageChange={clientPagination ? setClientPage : onPageChange}
          />
        </div>
      )}
    </div>
  )
}
