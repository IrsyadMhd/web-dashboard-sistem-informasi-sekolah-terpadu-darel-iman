import React from 'react'
import {
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  Database,
  Download,
  Eye,
  FileInput,
  FileSpreadsheet,
  Home,
  LayoutGrid,
  Pencil,
  Plus,
  Printer,
  RefreshCcw,
  RotateCcw,
  Star,
  Trash2,
  Upload,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Breadcrumbs } from '../tailgrids/core/breadcrumbs'
import {
  AppBadge,
  AppButton,
  AppCard,
  AppDataTable,
  AppEmptyState,
  AppErrorState,
  AppFilterBar,
  AppModal,
  AppPageHeader,
  AppPagination,
  AppSearch,
  AppSkeleton,
  AppToolbar,
  ConfirmDialog,
  SummaryCard,
} from '../app'

export const masterStyles = {
  card: 'rounded-[var(--master-card-radius,18px)] border border-slate-200/80 bg-white shadow-[var(--shadow-soft-xl)] dark:border-slate-700/80 dark:bg-[#1B2433]',
  control:
    'h-12 rounded-[var(--master-control-radius,14px)] border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-700 focus:ring-3 focus:ring-emerald-700/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-200',
  label: 'mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-100',
  error: 'mt-1.5 text-xs font-medium text-rose-600',
}

export function MasterDataPage({
  children,
  className = '',
  hideBreadcrumb = true,
  breadcrumbItems,
  breadcrumbPageTitle,
}) {
  const location = useLocation()

  const resolvedBreadcrumbs = React.useMemo(() => {
    if (breadcrumbItems && breadcrumbItems.length > 0) {
      return breadcrumbItems
    }
    const path = location.pathname
    if (path.includes('/akademik/jadwal')) {
      return [
        { href: '/dashboard/akademik', label: 'Akademik' },
        { label: 'Jadwal Pelajaran' },
      ]
    }
    if (path.includes('/orang-tua')) {
      return [
        { href: '/dashboard', label: 'Master Data' },
        { label: 'Orang Tua / Wali' },
      ]
    }
    const labelMap = {
      '/dashboard/students/unit-pendidikan': 'Unit Pendidikan',
      '/dashboard/master-jenis-unit': 'Jenis Unit',
      '/dashboard/master-tahun-ajaran': 'Tahun Ajaran',
      '/dashboard/master-subjects': 'Mata Pelajaran',
      '/dashboard/master/mata-pelajaran': 'Mata Pelajaran',
      '/dashboard/master-jabatan': 'Jabatan',
      '/dashboard/employees': 'Pegawai',
      '/dashboard/students': 'Siswa',
      '/dashboard/master/siswa': 'Data Siswa',
    }
    const label = labelMap[path] || 'Data Master'
    return [
      { href: '/dashboard', label: 'Master Data' },
      { label },
    ]
  }, [breadcrumbItems, location.pathname])

  return (
    <div className={`master-data-page space-y-6 pb-12 ${className}`}>
      {!hideBreadcrumb && (
        <Breadcrumbs
          items={resolvedBreadcrumbs}
          pageTitle={breadcrumbPageTitle}
        />
      )}
      {children}
    </div>
  )
}

export function MasterPageHeader({ title, description, actions, tone = 'default', icon: Icon, className = '' }) {
  return (
    <AppPageHeader
      variant={tone === 'brand' ? 'brand' : 'card'}
      icon={Icon}
      title={title}
      description={description}
      actions={actions && <MasterHeaderActions>{actions}</MasterHeaderActions>}
      className={`master-page-header ${className}`}
    />
  )
}

export function MasterHeaderActions({ children }) {
  return <div className="master-header-actions grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap sm:items-center">{children}</div>
}

// ── Tombol Aksi Berlabel (§H.3/§H.6 Tailgrids_Pengaturan_Halaman) ──
// Bahasa visual = tombol submit modal: vivid gradient rounded-2xl + ikon dalam
// wrapper putih/20. Varian secondary = slate outline netral (bukan cancel).
const actionIcons = {
  export: FileSpreadsheet,
  import: FileInput,
  primary: Plus,
  emerald: Plus,
  view: Eye,
  danger: Trash2,
  secondary: null,
}

const actionVariantClasses = {
  primary:
    'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40',
  emerald:
    'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40',
  view:
    'bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border border-indigo-300/40',
  export:
    'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white border border-amber-300/40',
  import:
    'bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white border border-sky-300/40',
  danger:
    'bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40',
  secondary:
    'border border-slate-200/90 bg-white text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
}

export function MasterActionButton({ variant = 'primary', icon: CustomIcon, children, disabled = false, loading = false, className = '', ...props }) {
  const Icon = CustomIcon || actionIcons[variant] || actionIcons.primary
  const variantStyle = actionVariantClasses[variant] || actionVariantClasses.primary
  const isSecondary = variant === 'secondary'
  const isDisabled = disabled || loading
  return (
    <button
      type="button"
      disabled={isDisabled}
      className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-extrabold transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variantStyle} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
      ) : (
        Icon && (
          <span className={`flex size-5 items-center justify-center rounded-lg ${isSecondary ? 'bg-slate-200/70 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : 'bg-white/20 text-white'}`}>
            <Icon className="size-3.5" strokeWidth={2.2} />
          </span>
        )
      )}
      {children && <span>{children}</span>}
    </button>
  )
}

// ── Vivid Gradient Squircle (§H Tailgrids_Pengaturan_Halaman — kontrak global) ──
// WAJIB: bg-gradient-to-br + border [warna]-300/40 TANPA shadow.
// DILARANG: pastel flat, solid, shadow-md/lg, bg-gradient-to-r.
const squircleVariants = {
  import: {
    icon: Upload,
    classes: 'bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white border border-sky-300/40',
  },
  export: {
    icon: Download,
    classes: 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white border border-amber-300/40',
  },
  print: {
    icon: Printer,
    classes: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border border-indigo-300/40',
  },
  primary: {
    icon: Plus,
    classes: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40',
    iconStrokeWidth: 2.5,
  },
  view: {
    icon: Eye,
    classes: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border border-indigo-300/40',
  },
  edit: {
    icon: Pencil,
    classes: 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white border border-amber-300/40',
  },
  delete: {
    icon: Trash2,
    classes: 'bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white border border-rose-300/40',
  },
  restore: {
    icon: RotateCcw,
    classes: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40',
  },
  setActive: {
    icon: Star,
    classes: 'bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white border border-sky-300/40',
  },
  neutral: {
    icon: Database,
    classes: 'bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700 text-white border border-slate-300/40',
  },
  teal: {
    icon: LayoutGrid,
    classes: 'bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 text-white border border-teal-300/40',
  },
  cyan: {
    icon: CalendarCheck,
    classes: 'bg-gradient-to-br from-cyan-400 via-cyan-500 to-sky-600 text-white border border-cyan-300/40',
  },
  violet: {
    icon: LayoutGrid,
    classes: 'bg-gradient-to-br from-violet-500 via-violet-600 to-purple-700 text-white border border-violet-300/40',
  },
  pink: {
    icon: FileSpreadsheet,
    classes: 'bg-gradient-to-br from-pink-500 via-pink-600 to-rose-700 text-white border border-pink-300/40',
  },
  // Alias lawas — dipetakan ke varian kanonis (§H). Jangan dipakai di kode baru.
  vividBlue: {
    icon: Database,
    classes: 'bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white border border-sky-300/40',
  },
  vividPurple: {
    icon: Printer,
    classes: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border border-indigo-300/40',
  },
  vividSky: {
    icon: Upload,
    classes: 'bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white border border-sky-300/40',
  },
  vividAmber: {
    icon: Download,
    classes: 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white border border-amber-300/40',
  },
  vividEmerald: {
    icon: Plus,
    classes: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40',
    iconStrokeWidth: 2.5,
  },
}

export function SquircleActionButton({
  variant = 'primary',
  icon: CustomIcon,
  label,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  const config = squircleVariants[variant] || squircleVariants.primary
  const Icon = CustomIcon || config.icon
  const isDisabled = disabled || loading

  return (
    <div className="group relative inline-flex" {...props}>
      <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        title={label}
        aria-label={label}
        aria-busy={loading || undefined}
        className={`
          flex size-10 items-center justify-center rounded-2xl
          ${config.classes}
          transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer
          disabled:opacity-50 disabled:pointer-events-none
          ${className}
        `}
      >
        {loading ? (
          <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
        ) : (
          Icon && <Icon className="size-5 text-white" strokeWidth={config.iconStrokeWidth || 2.2} />
        )}
      </button>
      {label && (
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          {label}
        </div>
      )}
    </div>
  )
}

// ── Kartu Akses Cepat Horizontal (§H.7 Tailgrids_Pengaturan_Halaman) ──
// Navigasi modul dashboard: ikon squircle putih/20 + judul + subjudul di atas
// gradient vivid. Dilarang versi pastel flat.
const quickAccessTones = {
  emerald: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border-emerald-300/40',
  sky: 'bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 border-sky-300/40',
  purple: 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 border-purple-300/40',
  amber: 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 border-amber-300/40',
  rose: 'bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 border-rose-300/40',
  teal: 'bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 border-teal-300/40',
  slate: 'bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700 border-slate-300/40',
}

export function QuickAccessCard({
  icon: Icon,
  title,
  subtitle,
  onClick,
  tone = 'emerald',
  loading = false,
  className = '',
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={title}
      aria-busy={loading || undefined}
      className={`
        group flex min-w-0 items-center gap-3 rounded-2xl border p-3 text-left text-white
        transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60
        ${quickAccessTones[tone] || quickAccessTones.emerald}
        ${className}
      `}
      {...props}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-white/20 text-white transition-transform duration-200 group-hover:scale-110">
        {loading ? (
          <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
        ) : (
          Icon && <Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
        )}
      </span>
      <span className="min-w-0 flex-1 pr-1">
        <span className="block truncate text-xs font-extrabold text-white">{title}</span>
        {subtitle && <span className="block truncate text-[10px] font-medium text-white/80">{subtitle}</span>}
      </span>
    </button>
  )
}

export function MasterStatsGrid({ children, className = '' }) {
  const childCount = React.Children.count(children)

  return (
    <section
      className={`master-stats-grid ${className}`}
      data-count={childCount > 6 ? 'many' : Math.max(childCount, 1)}
    >
      {children}
    </section>
  )
}

const statSchemeMap = {
  success: 'emerald',
  warning: 'amber',
  info: 'blue',
  danger: 'rose',
  neutral: 'slate',
}

export function MasterStatCard({
  icon: Icon,
  label,
  title,
  value,
  description,
  subtitle,
  badge = null,
  badgeVariant = 'info',
  variant = 'success',
  delay = 0,
  loading = false,
  onClick,
  active = false,
  className = '',
}) {
  return (
    <div className="master-stat-card ui-enter" style={{ animationDelay: `${delay}ms` }}>
      <SummaryCard
        icon={Icon}
        title={label || title}
        value={value}
        description={description || subtitle}
        badge={badge}
        badgeVariant={badgeVariant}
        colorScheme={statSchemeMap[variant] || 'emerald'}
        loading={loading}
        onClick={onClick}
        className={`${className} ${active ? 'ring-2 ring-emerald-600/80 shadow-md border-emerald-500/50 dark:ring-emerald-400' : ''}`}
      />
    </div>
  )
}

export function MasterFilterBar({ search, filters, children }) {
  return (
    <AppFilterBar label={null} className="ui-enter">
      {search}
      {(filters || children) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-300">
            <span className="text-[#0E5C44] dark:text-[#3FBF75]">Filter:</span>
          </span>
          {filters || children}
        </div>
      )}
    </AppFilterBar>
  )
}

export function MasterSearchInput({ className = '', ...props }) {
  return <AppSearch className={className} {...props} />
}

export function MasterFilterSelect({ className = '', children, ...props }) {
  return (
    <div className={`relative min-w-38 ${className}`}>
      <select className={`${masterStyles.control} w-full appearance-none px-3.5 pr-9`} {...props}>{children}</select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

/**
 * Canonical list/CRUD data surface.
 *
 * `search` accepts an AppSearch element or an AppSearch props object.
 * `pagination` accepts `{ meta, page, onPageChange }` plus manual
 * AppPagination props. Table markup remains page-owned so migrations can keep
 * their domain-specific responsive cells without duplicating this shell.
 */
export function MasterDataSection({
  title,
  description,
  countLabel,
  search,
  filters,
  stackedFilters = false,
  onReset,
  resetLabel = 'Reset',
  resetDisabled = false,
  actions,
  isLoading = false,
  isError = false,
  errorTitle = 'Data gagal dimuat',
  errorMessage = 'Terjadi kesalahan saat mengambil data.',
  onRetry,
  isEmpty,
  emptyTitle = 'Data Tidak Ditemukan',
  emptyDescription = 'Belum ada data yang sesuai dengan kriteria.',
  emptyActionLabel,
  emptyActionOnClick,
  pagination,
  headingId,
  ariaLabel,
  className = '',
  toolbarClassName = '',
  tableClassName = '',
  children,
}) {
  const generatedHeadingId = React.useId().replaceAll(':', '')
  const resolvedHeadingId = headingId || `master-data-section-${generatedHeadingId}`
  const hasHeading = Boolean(title || description || (countLabel !== undefined && countLabel !== null))

  let searchNode = null
  if (React.isValidElement(search)) {
    searchNode = React.cloneElement(search, {
      className: `master-data-section__search ${search.props.className || ''}`,
    })
  } else if (search && typeof search === 'object') {
    const { onValueChange, onChange, className: searchClassName = '', ...searchProps } = search
    searchNode = (
      <AppSearch
        {...searchProps}
        className={`master-data-section__search ${searchClassName}`}
        onChange={onChange || (onValueChange ? (event) => onValueChange(event.target.value) : undefined)}
      />
    )
  }

  const filterNode = (filters || onReset) ? (
    <div className="master-data-section__filters">
      {filters}
      {onReset && (
        <AppButton
          type="button"
          variant="secondary"
          size="sm"
          icon={RefreshCcw}
          onClick={onReset}
          disabled={resetDisabled}
          className="master-data-section__reset"
        >
          {resetLabel}
        </AppButton>
      )}
    </div>
  ) : null

  const paginationNode = React.isValidElement(pagination) ? pagination : pagination && (
    <AppPagination
      {...pagination}
      currentPage={pagination.page ?? pagination.currentPage}
      onPageChange={pagination.onPageChange}
      meta={pagination.meta}
    />
  )

  return (
    <section
      className={`master-data-section ui-enter space-y-6 ${className}`}
      aria-labelledby={title ? resolvedHeadingId : undefined}
      aria-label={!title ? ariaLabel : undefined}
    >
      {hasHeading && (
        <header className="master-data-section__header flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between mb-4 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 min-w-0">
            {title && <h2 id={resolvedHeadingId} className="master-data-section__title text-lg font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>}
            {countLabel !== undefined && countLabel !== null && (
              <AppBadge variant="success" className="master-data-section__count font-bold">{countLabel}</AppBadge>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {actions}
            </div>
          )}
        </header>
      )}

      {(searchNode || filterNode || (!hasHeading && actions)) && (
        <div className={`master-data-section__toolbar ${stackedFilters ? 'master-data-section__toolbar--stacked' : ''} ${toolbarClassName}`}>
          <AppToolbar search={searchNode} filters={filterNode} actions={!hasHeading ? actions : null} stacked={stackedFilters} />
        </div>
      )}

      <AppDataTable
        embedded
        serverControlled
        showToolbar={false}
        showPagination={false}
        renderTable={() => children}
        isLoading={isLoading}
        isError={isError}
        errorTitle={errorTitle}
        errorMessage={errorMessage}
        onRetry={onRetry}
        isEmpty={isEmpty}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyActionLabel={emptyActionLabel}
        emptyActionOnClick={emptyActionOnClick}
        tableContainerClassName={tableClassName}
      />

      {paginationNode && !isLoading && !isError && !isEmpty && (
        <div className="master-data-section__pagination">{paginationNode}</div>
      )}
    </section>
  )
}

export function MasterDataTable({ children, className = '' }) {
  return (
    <AppCard noPadding className={`master-table ui-enter relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433] ${className}`}>
      <div className="overflow-x-auto">{children}</div>
    </AppCard>
  )
}

const badgeVariantMap = {
  success: 'success',
  danger: 'danger',
  warning: 'warning',
  info: 'info',
  neutral: 'neutral',
}

export function MasterBadge({ variant = 'neutral', children, color, className = '' }) {
  return (
    <AppBadge
      variant={badgeVariantMap[variant] || 'neutral'}
      className={className}
      style={color ? { borderColor: color, color } : undefined}
    >
      {children}
    </AppBadge>
  )
}

export function MasterStatusBadge({ active, status, activeLabel = 'Aktif', inactiveLabel = 'Tidak Aktif' }) {
  const isCurrentlyActive = active !== undefined 
    ? Boolean(active) 
    : (status === true || String(status).toLowerCase() === 'aktif' || String(status).toLowerCase() === 'active')
  return (
    <AppBadge variant={isCurrentlyActive ? 'success' : 'danger'} dot>
      {isCurrentlyActive ? activeLabel : inactiveLabel}
    </AppBadge>
  )
}

export function MasterActionGroup({ children }) {
  return <div className="inline-flex items-center gap-2">{children}</div>
}

// ── Aksi Ikon Level Baris (§H.6):SELALU Alias ke SquircleActionButton ──
// Dilarang memakai IconButton/AppButton ghost-outlined untuk aksi baris.
const iconButtonVariantMap = {
  view: 'view',
  edit: 'edit',
  delete: 'delete',
}

const iconButtonDefaultLabels = {
  view: 'Lihat Detail',
  edit: 'Edit Data',
  delete: 'Hapus Data',
}

export function MasterActionIconButton({ variant = 'view', icon, label, loading = false, ...props }) {
  const mapped = iconButtonVariantMap[variant] || 'view'
  return (
    <SquircleActionButton
      variant={mapped}
      icon={icon}
      label={label || iconButtonDefaultLabels[mapped]}
      loading={loading}
      {...props}
    />
  )
}

export function MasterPagination({ meta = {}, page = 1, onPageChange }) {
  if (!(meta.total > 0)) return null
  return (
    <AppPagination
      meta={meta}
      currentPage={page}
      onPageChange={onPageChange}
    />
  )
}

function ModalShell({ isOpen, onClose, icon: Icon = Database, title, description, children, footer, maxWidth = 'max-w-2xl' }) {
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      icon={Icon}
      title={title}
      description={description}
      footer={footer}
      maxWidth={maxWidth}
    >
      {children}
    </AppModal>
  )
}

export function MasterFormModal(props) {
  return <ModalShell {...props} />
}

export function MasterDetailModal(props) {
  return <ModalShell maxWidth="max-w-xl" {...props} />
}

export function MasterDeleteDialog({ isOpen, onClose, onConfirm, title = 'Hapus data?', description, isLoading = false }) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      message={description || 'Tindakan ini tidak dapat dibatalkan.'}
      action="delete"
      confirmLabel="Hapus"
      isDanger
      isLoading={isLoading}
      icon={Trash2}
    />
  )
}

export function MasterLoadingState({ label = 'Memuat data...' }) {
  return (
    <div className={`${masterStyles.card} p-4`}>
      <AppSkeleton variant="table" rows={4} cols={4} />
      <p className="mt-3 text-center text-sm font-medium text-emerald-700 dark:text-emerald-300">{label}</p>
    </div>
  )
}

export function MasterEmptyState({ title = 'Data Tidak Ditemukan', description = 'Belum ada data yang sesuai dengan kriteria.', action }) {
  return <AppEmptyState title={title} description={description} action={action} />
}

export function MasterErrorState({ title = 'Data gagal dimuat', description = 'Terjadi kesalahan saat mengambil data.', onRetry }) {
  return <AppErrorState title={title} description={description} onRetry={onRetry} />
}

export { default as PrintOptionModal } from './PrintOptionModal'
