import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  CalendarCheck,
  FileSpreadsheet,
  RefreshCw,
  CalendarDays,
  BookOpen,
  Building2,
  Sparkles,
  ShieldCheck,
  FileText,
  GraduationCap,
  QrCode,
  Filter,
  RotateCcw,
  ChevronDown,
  Check,
  Search,
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'

import {
  AppBreadcrumb,
  AppFilterBar,
  KpiCard,
  SectionHeader,
  PageContainer,
} from '../components/app'

import { SquircleActionButton } from '../components/master-data'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import TataUsahaKpiModal from '../components/TataUsahaKpiModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'

import { managementDashboardService } from '../services/managementDashboardService'
import { educationUnitService } from '../services/educationUnitService'

const MODERN_KPI_TONES = {
  emerald: {
    card: 'border-2 border-emerald-300/90 bg-gradient-to-br from-emerald-100/80 via-teal-50/50 to-white hover:border-emerald-400 hover:shadow-emerald-500/20 dark:border-emerald-600/70 dark:from-emerald-950/60 dark:via-teal-950/40 dark:to-slate-900',
    topBar: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600',
    badgeBg: 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300/70 dark:border-emerald-700',
    iconGradient: 'from-emerald-500 via-emerald-600 to-teal-700 shadow-md shadow-emerald-500/30',
    glow: 'bg-emerald-400/25 group-hover:bg-emerald-400/40',
    title: 'text-emerald-800 dark:text-emerald-300',
    value: 'text-emerald-600 dark:text-emerald-400',
    subtext: 'text-emerald-700/90 dark:text-emerald-300/80',
    cta: 'text-emerald-600 dark:text-emerald-400',
    footerBorder: 'border-emerald-200/80 dark:border-emerald-800/60',
  },
  blue: {
    card: 'border-2 border-blue-300/90 bg-gradient-to-br from-blue-100/80 via-sky-50/50 to-white hover:border-blue-400 hover:shadow-blue-500/20 dark:border-blue-600/70 dark:from-blue-950/60 dark:via-sky-950/40 dark:to-slate-900',
    topBar: 'bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-600',
    badgeBg: 'bg-blue-100/90 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-300/70 dark:border-blue-700',
    iconGradient: 'from-blue-500 via-blue-600 to-indigo-700 shadow-md shadow-blue-500/30',
    glow: 'bg-blue-400/25 group-hover:bg-blue-400/40',
    title: 'text-blue-800 dark:text-blue-300',
    value: 'text-blue-600 dark:text-blue-400',
    subtext: 'text-blue-700/90 dark:text-blue-300/80',
    cta: 'text-blue-600 dark:text-blue-400',
    footerBorder: 'border-blue-200/80 dark:border-blue-800/60',
  },
  teal: {
    card: 'border-2 border-teal-300/90 bg-gradient-to-br from-teal-100/80 via-emerald-50/50 to-white hover:border-teal-400 hover:shadow-teal-500/20 dark:border-teal-600/70 dark:from-teal-950/60 dark:via-emerald-950/40 dark:to-slate-900',
    topBar: 'bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600',
    badgeBg: 'bg-teal-100/90 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 border border-teal-300/70 dark:border-teal-700',
    iconGradient: 'from-teal-500 via-teal-600 to-emerald-700 shadow-md shadow-teal-500/30',
    glow: 'bg-teal-400/25 group-hover:bg-teal-400/40',
    title: 'text-teal-800 dark:text-teal-300',
    value: 'text-teal-600 dark:text-teal-400',
    subtext: 'text-teal-700/90 dark:text-teal-300/80',
    cta: 'text-teal-600 dark:text-teal-400',
    footerBorder: 'border-teal-200/80 dark:border-teal-800/60',
  },
  amber: {
    card: 'border-2 border-amber-300/90 bg-gradient-to-br from-amber-100/80 via-orange-50/50 to-white hover:border-amber-400 hover:shadow-amber-500/20 dark:border-amber-600/70 dark:from-amber-950/60 dark:via-orange-950/40 dark:to-slate-900',
    topBar: 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600',
    badgeBg: 'bg-amber-100/90 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300/70 dark:border-amber-700',
    iconGradient: 'from-amber-500 via-orange-600 to-amber-700 shadow-md shadow-amber-500/30',
    glow: 'bg-amber-400/25 group-hover:bg-amber-400/40',
    title: 'text-amber-800 dark:text-amber-300',
    value: 'text-amber-600 dark:text-amber-400',
    subtext: 'text-amber-700/90 dark:text-amber-300/80',
    cta: 'text-amber-600 dark:text-amber-400',
    footerBorder: 'border-amber-200/80 dark:border-amber-800/60',
  },
  indigo: {
    card: 'border-2 border-indigo-300/90 bg-gradient-to-br from-indigo-100/80 via-purple-50/50 to-white hover:border-indigo-400 hover:shadow-indigo-500/20 dark:border-indigo-600/70 dark:from-indigo-950/60 dark:via-purple-950/40 dark:to-slate-900',
    topBar: 'bg-gradient-to-r from-indigo-500 via-purple-400 to-violet-600',
    badgeBg: 'bg-indigo-100/90 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-300/70 dark:border-indigo-700',
    iconGradient: 'from-indigo-500 via-purple-600 to-violet-700 shadow-md shadow-indigo-500/30',
    glow: 'bg-indigo-400/25 group-hover:bg-indigo-400/40',
    title: 'text-indigo-800 dark:text-indigo-300',
    value: 'text-indigo-600 dark:text-indigo-400',
    subtext: 'text-indigo-700/90 dark:text-indigo-300/80',
    cta: 'text-indigo-600 dark:text-indigo-400',
    footerBorder: 'border-indigo-200/80 dark:border-indigo-800/60',
  },
  rose: {
    card: 'border-2 border-rose-300/90 bg-gradient-to-br from-rose-100/80 via-pink-50/50 to-white hover:border-rose-400 hover:shadow-rose-500/20 dark:border-rose-600/70 dark:from-rose-950/60 dark:via-pink-950/40 dark:to-slate-900',
    topBar: 'bg-gradient-to-r from-rose-500 via-pink-400 to-red-600',
    badgeBg: 'bg-rose-100/90 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border border-rose-300/70 dark:border-rose-700',
    iconGradient: 'from-rose-500 via-rose-600 to-red-700 shadow-md shadow-rose-500/30',
    glow: 'bg-rose-400/25 group-hover:bg-rose-400/40',
    title: 'text-rose-800 dark:text-rose-300',
    value: 'text-rose-600 dark:text-rose-400',
    subtext: 'text-rose-700/90 dark:text-rose-300/80',
    cta: 'text-rose-600 dark:text-rose-400',
    footerBorder: 'border-rose-200/80 dark:border-rose-800/60',
  },
}

function ModernTuKpiCard({ title, value, subtitle, icon: Icon, tone = 'emerald', badge = 'METRIK', onClick }) {
  const t = MODERN_KPI_TONES[tone] || MODERN_KPI_TONES.emerald
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={`group relative flex flex-col justify-between overflow-hidden rounded-[20px] transition-all duration-300 shadow-xs hover:shadow-xl ${t.card} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Top Accent Gradient Line */}
      <div className={`h-1.5 w-full ${t.topBar} shrink-0`} />

      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 relative">
        {/* Ambient Backlight Glow */}
        <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all duration-500 ${t.glow}`} />

        <div>
          {/* Header with Tag & 3D Gradient Squircle Icon */}
          <div className="relative z-10 flex items-start justify-between gap-2.5 mb-2.5">
            <div className="space-y-1 min-w-0">
              <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${t.badgeBg}`}>
                {badge}
              </span>
              <p className={`text-xs font-bold pt-0.5 truncate uppercase tracking-wider ${t.title}`}>{title}</p>
            </div>
            <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-105 ${t.iconGradient}`}>
              {Icon && <Icon className="size-5 text-white" strokeWidth={2.2} />}
            </div>
          </div>

          {/* Metric Value & Subtitle */}
          <div className="relative z-10 mt-1">
            <p className={`text-3xl sm:text-4xl font-black tabular-nums tracking-tight ${t.value}`}>
              {value}
            </p>
            {subtitle && (
              <p className={`mt-1 text-xs font-semibold line-clamp-1 ${t.subtext}`}>{subtitle}</p>
            )}
          </div>
        </div>

        {/* Click Affordance Footer */}
        {onClick && (
          <div className={`relative z-10 mt-3.5 pt-2.5 border-t ${t.footerBorder} flex items-center justify-between text-[11px] font-bold`}>
            <span className="text-slate-400 dark:text-slate-500 font-medium text-[10px]">Klik untuk detail</span>
            <span className={`inline-flex items-center gap-1 transition-transform group-hover:translate-x-0.5 ${t.cta}`}>
              Lihat Data &rarr;
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── HEROUI FILTER BAR SELECT DROPDOWN COMPONENT ──
function HeroUiFilterSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Pilih...',
  icon: IconComponent = null,
  className = '',
  popoverWidth = 'w-full',
  searchable = false,
  ariaLabel = '',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const selectedOption = useMemo(() => {
    return options.find((opt) => String(opt.value) === String(value))
  }, [options, value])

  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) return options
    const q = search.toLowerCase()
    return options.filter((opt) =>
      (opt.label && String(opt.label).toLowerCase().includes(q)) ||
      (opt.subtext && String(opt.subtext).toLowerCase().includes(q))
    )
  }, [options, search, searchable])

  const hasValue = value !== '' && value !== 'semua' && value !== 'all' && value !== undefined && value !== null

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev)
            setSearch('')
          }
        }}
        className={`h-9 w-full flex items-center justify-between gap-2 rounded-xl border px-3 text-xs font-semibold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
          isOpen
            ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 dark:border-emerald-400 dark:bg-slate-800 dark:ring-emerald-400/20 text-slate-900 dark:text-white shadow-xs'
            : hasValue
            ? 'border-emerald-400/80 bg-emerald-50/80 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200 font-bold'
            : 'border-slate-300 dark:border-slate-700 bg-white text-slate-700 hover:border-emerald-400 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {IconComponent && (
            <IconComponent className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`size-3.5 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute left-0 top-full mt-1.5 z-[90] ${popoverWidth} min-w-[220px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-xl shadow-slate-900/10 dark:shadow-black/40`}
          >
            {searchable && options.length > 5 && (
              <div className="p-1.5 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                <div className="relative">
                  <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 pl-8 pr-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="max-h-56 overflow-y-auto space-y-0.5">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-3 text-center text-xs text-slate-400 dark:text-slate-500">
                  Tidak ada data
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(value)
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => {
                        onChange(opt.value)
                        setIsOpen(false)
                        setSearch('')
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate">{opt.label}</div>
                        {opt.subtext && (
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate mt-0.5">
                            {opt.subtext}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const tooltipStyle = {
  backgroundColor: '#1E293B',
  border: 'none',
  borderRadius: '12px',
  color: '#FFF',
  fontSize: '12px',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
}

const CHART_CARD_TONES = {
  emerald: {
    border: 'border-2 border-emerald-300/90 dark:border-emerald-700/80',
    topBar: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600',
    headerBg: 'bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/80 dark:border-emerald-800/60',
    iconBox: 'from-emerald-500 via-emerald-600 to-teal-700 shadow-md shadow-emerald-500/30 text-white',
    glow: 'bg-emerald-400/20 dark:bg-emerald-400/25',
    badge: 'bg-emerald-100/90 text-emerald-800 border-emerald-300/70 dark:bg-emerald-950/80 dark:text-emerald-300',
  },
  blue: {
    border: 'border-2 border-blue-300/90 dark:border-blue-700/80',
    topBar: 'bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-600',
    headerBg: 'bg-gradient-to-r from-blue-500/10 via-sky-500/5 to-transparent border-b border-blue-200/80 dark:border-blue-800/60',
    iconBox: 'from-blue-500 via-blue-600 to-indigo-700 shadow-md shadow-blue-500/30 text-white',
    glow: 'bg-blue-400/20 dark:bg-blue-400/25',
    badge: 'bg-blue-100/90 text-blue-800 border-blue-300/70 dark:bg-blue-950/80 dark:text-blue-300',
  },
  teal: {
    border: 'border-2 border-teal-300/90 dark:border-teal-700/80',
    topBar: 'bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600',
    headerBg: 'bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent border-b border-teal-200/80 dark:border-teal-800/60',
    iconBox: 'from-teal-500 via-teal-600 to-emerald-700 shadow-md shadow-teal-500/30 text-white',
    glow: 'bg-teal-400/20 dark:bg-teal-400/25',
    badge: 'bg-teal-100/90 text-teal-800 border-teal-300/70 dark:bg-teal-950/80 dark:text-teal-300',
  },
  amber: {
    border: 'border-2 border-amber-300/90 dark:border-amber-700/80',
    topBar: 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600',
    headerBg: 'bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-b border-amber-200/80 dark:border-amber-800/60',
    iconBox: 'from-amber-500 via-orange-600 to-amber-700 shadow-md shadow-amber-500/30 text-white',
    glow: 'bg-amber-400/20 dark:bg-amber-400/25',
    badge: 'bg-amber-100/90 text-amber-800 border-amber-300/70 dark:bg-amber-950/80 dark:text-amber-300',
  },
  rose: {
    border: 'border-2 border-rose-300/90 dark:border-rose-700/80',
    topBar: 'bg-gradient-to-r from-rose-500 via-pink-400 to-red-600',
    headerBg: 'bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-transparent border-b border-rose-200/80 dark:border-rose-800/60',
    iconBox: 'from-rose-500 via-rose-600 to-red-700 shadow-md shadow-rose-500/30 text-white',
    glow: 'bg-rose-400/20 dark:bg-rose-400/25',
    badge: 'bg-rose-100/90 text-rose-800 border-rose-300/70 dark:bg-rose-950/80 dark:text-rose-300',
  },
}

function ModernTuChartCard({
  title,
  subtitle,
  icon: Icon,
  tone = 'emerald',
  badge,
  action,
  empty = false,
  emptyMessage = 'Belum ada data grafik untuk periode ini.',
  children,
}) {
  const t = CHART_CARD_TONES[tone] || CHART_CARD_TONES.emerald
  return (
    <div className={`relative overflow-hidden rounded-[22px] bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/5 transition-all duration-300 hover:shadow-xl flex flex-col justify-between h-full ${t.border}`}>
      {/* Top Accent Gradient Stripe */}
      <div className={`h-1.5 w-full ${t.topBar} shrink-0`} />

      {/* Ambient Backlight Glow */}
      <div className={`pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl ${t.glow}`} />

      {/* Card Header */}
      <div className={`relative z-10 p-4 sm:p-5 flex items-center justify-between gap-3 ${t.headerBg}`}>
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${t.iconBox}`}>
              <Icon className="size-5" strokeWidth={2.2} />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                {title}
              </h3>
              {badge && (
                <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${t.badge}`}>
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Card Body */}
      <div className="relative z-10 p-4 sm:p-5 flex-1 flex flex-col justify-center">
        {empty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 mb-2">
              <FileSpreadsheet className="size-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

function GenderDonutChart({ data }) {
  const hasData = data && data.some((item) => Number(item.value) > 0)
  if (!hasData) return null
  const total = data.reduce((acc, curr) => acc + Number(curr.value || 0), 0)

  return (
    <div className="flex flex-col items-center justify-between w-full h-full">
      <div className="relative w-44 h-44 my-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={82}
              paddingAngle={4}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <strong className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
            {Number(total).toLocaleString('id-ID')}
          </strong>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Total
          </span>
        </div>
      </div>

      {/* Pill Legend with counts and percentages */}
      <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        {data.map((item) => {
          const val = Number(item.value || 0)
          const pct = total > 0 ? ((val / total) * 100).toFixed(0) : '0'
          return (
            <div
              key={item.name}
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800"
            >
              <span
                className="size-2.5 rounded-full shrink-0 shadow-xs"
                style={{ background: item.color }}
              />
              <div className="flex items-center justify-between w-full min-w-0">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                  {item.name}
                </span>
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <span className="text-[11px] font-black text-slate-900 dark:text-white tabular-nums">
                    {val.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    ({pct}%)
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EnhancedComparisonBarChart({ data }) {
  const hasData = data && data.some((item) => Number(item.value) > 0)
  if (!hasData) return null

  return (
    <div className="flex flex-col justify-between h-full w-full">
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
            <XAxis dataKey="name" fontSize={10} interval={0} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
            <YAxis fontSize={10} allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Stat Pills */}
      <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800"
          >
            <span
              className="size-2.5 rounded-full shrink-0 shadow-xs"
              style={{ background: item.color }}
            />
            <div className="flex items-center justify-between w-full min-w-0">
              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                {item.name}
              </span>
              <span className="text-[11px] font-black text-slate-900 dark:text-white tabular-nums ml-1">
                {Number(item.value || 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function KelengkapanDonutChart({ data }) {
  const hasData = data && data.some((item) => Number(item.value) > 0)
  if (!hasData) return null
  const total = data.reduce((acc, curr) => acc + Number(curr.value || 0), 0)

  return (
    <div className="flex flex-col items-center justify-between w-full h-full">
      <div className="relative w-44 h-44 my-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={82}
              paddingAngle={4}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <strong className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
            {Number(total).toLocaleString('id-ID')}
          </strong>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Total
          </span>
        </div>
      </div>

      {/* Pill Legend with counts and percentages */}
      <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        {data.map((item) => {
          const val = Number(item.value || 0)
          const pct = total > 0 ? ((val / total) * 100).toFixed(0) : '0'
          return (
            <div
              key={item.name}
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800"
            >
              <span
                className="size-2.5 rounded-full shrink-0 shadow-xs"
                style={{ background: item.color }}
              />
              <div className="flex items-center justify-between w-full min-w-0">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                  {item.name}
                </span>
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <span className="text-[11px] font-black text-slate-900 dark:text-white tabular-nums">
                    {val.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    ({pct}%)
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function TataUsahaDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [activeModal, setActiveModal] = useState(null)
  const [activeModalTab, setActiveModalTab] = useState(null)
  const [selectedUnitId, setSelectedUnitId] = useState('all')
  const [availableUnits, setAvailableUnits] = useState([])

  const openKpiModal = (type, tab = null) => {
    setActiveModal(type)
    setActiveModalTab(tab)
  }

  const fetchDashboard = async (unitId = selectedUnitId) => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (unitId && unitId !== 'all') {
        params.unit_id = unitId
      }
      const res = await managementDashboardService.getTataUsaha(params)
      if (res && res.data) {
        setData(res.data)
      } else {
        setError('Format respon server tidak valid.')
      }
    } catch (err) {
      console.error('Failed to load Tata Usaha dashboard:', err)
      setError(err.response?.data?.message || 'Gagal memuat data dashboard Tata Usaha.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard(selectedUnitId)
  }, [selectedUnitId])

  useEffect(() => {
    educationUnitService
      .getDaftar({ per_page: 100 })
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        setAvailableUnits(list)
      })
      .catch(() => {})
  }, [])

  if (loading && !data) return <SkeletonDashboard />
  if (error && !data) return <ErrorState message={error} onRetry={fetchDashboard} />

  const kpis = data?.kpis || {}
  const charts = data?.charts || {}
  const context = data?.context || {}

  const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

  const tahunAjaranLabel = context.tahun_ajaran?.nama
    ? `Tahun Ajaran ${context.tahun_ajaran.nama}`
    : 'Tahun Ajaran Aktif'
  const semesterLabel = context.semester?.nama
    ? `Semester ${context.semester.nama}`
    : 'Semester Berjalan'

  const chartHasData = (items = []) => items.some((item) => Number(item.value) > 0)

  return (
    <PageContainer maxW="7xl">
      <div className="space-y-6 pb-12">
        <AppBreadcrumb items={[{ label: 'Dashboard Tata Usaha' }]} />

        {/* MODERN HERO CARD HEADER (MATCHING MONITORING, KEPALA SEKOLAH, & YAYASAN DASHBOARD STYLE) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900"
        >
          {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <Building2 className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                    Pusat Administrasi &amp; Tata Usaha
                  </span>
                  {context.unit?.nama && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700/80 px-3.5 py-1 text-xs font-black text-white shadow-sm border border-emerald-400/40">
                      <Building2 className="h-3.5 w-3.5 text-emerald-200" /> Unit: {context.unit.nama}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    <CalendarDays className="h-3.5 w-3.5 text-emerald-600" /> {tahunAjaranLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-0.5 text-xs font-extrabold text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60">
                    <BookOpen className="h-3.5 w-3.5 text-teal-600" /> {semesterLabel}
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Dashboard Tata Usaha &amp; Administrasi Sekolah
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Pusat pengelolaan master data siswa, SDM pegawai &amp; guru, rekap presensi gerbang, dan pelaporan administrasi terpadu.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 z-10">
              <SquircleActionButton
                variant="restore"
                icon={RefreshCw}
                label="Segarkan Data"
                onClick={fetchDashboard}
              />
            </div>
          </div>
        </motion.div>

        {/* QUICK ACTION CONTAINER */}
        <section className="rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Aksi Cepat Tata Usaha
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Pintas administrasi data siswa, pegawai, dan pelaporan
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
              <SquircleActionButton
                variant="view"
                icon={Users}
                label="Kelola Master Siswa"
                onClick={() => navigate('/dashboard/students')}
              />
              <SquircleActionButton
                variant="import"
                icon={UserCheck}
                label="Kelola Master Pegawai"
                onClick={() => navigate('/dashboard/employees')}
              />
              <SquircleActionButton
                variant="primary"
                icon={CalendarCheck}
                label="Presensi KBM & Kelas"
                onClick={() => navigate('/dashboard/absensi-pembelajaran')}
              />
              <SquircleActionButton
                variant="import"
                icon={QrCode}
                label="Absensi Gerbang (Scan)"
                onClick={() => navigate('/dashboard/absensi-gerbang')}
              />
              <SquircleActionButton
                variant="primary"
                icon={CheckCircle2}
                label="Rekap Absensi Gerbang"
                onClick={() => navigate('/dashboard/rekap-absensi-gerbang')}
              />
              <SquircleActionButton
                variant="export"
                icon={FileSpreadsheet}
                label="Cetak Laporan Siswa"
                onClick={() => navigate('/dashboard/laporan-siswa')}
              />
              <SquircleActionButton
                variant="secondary"
                icon={GraduationCap}
                label="Kelola Alumni & Mutasi"
                onClick={() => navigate('/dashboard/master/alumni')}
              />
            </div>
          </div>
        </section>

        {/* FILTER BAR DROPDOWN HERO UI */}
        {availableUnits.length > 0 && (
          <div className="rounded-[22px] border-2 border-emerald-500/25 bg-white p-4 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs">
                  <Filter className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Filter Unit Administrasi</h4>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pilih unit pendidikan untuk memfilter metrik KPI dan data</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="w-full sm:w-64">
                  <HeroUiFilterSelect
                    value={selectedUnitId}
                    onChange={(val) => setSelectedUnitId(val)}
                    options={[
                      { value: 'all', label: 'Semua Unit Pendidikan' },
                      ...availableUnits.map((u) => ({
                        value: String(u.id),
                        label: u.nama_unit || u.name,
                        subtext: u.kode_unit ? `Kode: ${u.kode_unit}` : undefined,
                      })),
                    ]}
                    placeholder="Pilih Unit..."
                    icon={Building2}
                    searchable={availableUnits.length > 5}
                    ariaLabel="Filter Unit Pendidikan"
                  />
                </div>
                {selectedUnitId !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedUnitId('all')}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-pointer"
                  >
                    <RotateCcw className="size-3.5" />
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* METRIK KPI UTAMA TATA USAHA */}
        <section className="space-y-3">
          <SectionHeader
            title="Metrik Administrasi & Presensi Unit Tata Usaha"
            subtitle={`Ringkasan data siswa, pegawai, dan presensi gerbang${context.unit?.nama ? ` untuk unit ${context.unit.nama}` : ''}`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <ModernTuKpiCard
              title="Total Siswa Aktif"
              value={formatNumber(kpis.total_siswa?.total)}
              subtitle={`♂ ${formatNumber(kpis.total_siswa?.laki_laki)} L · ♀ ${formatNumber(kpis.total_siswa?.perempuan)} P`}
              icon={Users}
              tone="emerald"
              badge="Siswa Aktif"
              onClick={() => openKpiModal('total_siswa')}
            />
            <ModernTuKpiCard
              title="Total Pegawai & Guru"
              value={formatNumber(kpis.total_pegawai?.total)}
              subtitle={`♂ ${formatNumber(kpis.total_pegawai?.laki_laki)} L · ♀ ${formatNumber(kpis.total_pegawai?.perempuan)} P`}
              icon={UserCheck}
              tone="blue"
              badge="SDM Pegawai"
              onClick={() => openKpiModal('total_pegawai')}
            />
            <ModernTuKpiCard
              title="Siswa Hadir Hari Ini"
              value={formatNumber(kpis.absensi_hari_ini?.siswa_hadir)}
              subtitle={`Dari ${formatNumber(kpis.total_siswa?.total)} siswa unit`}
              icon={CheckCircle2}
              tone="teal"
              badge="Hadir Hari Ini"
              onClick={() => openKpiModal('absensi_hari_ini', 'siswa_hadir')}
            />
            <ModernTuKpiCard
              title="Siswa Belum Absen"
              value={formatNumber(kpis.absensi_hari_ini?.siswa_belum_absen)}
              subtitle="Belum tercatat presensi gerbang"
              icon={AlertTriangle}
              tone="amber"
              badge="Belum Presensi"
              onClick={() => openKpiModal('absensi_hari_ini', 'siswa_belum_absen')}
            />
            <ModernTuKpiCard
              title="Guru & Tendik Hadir"
              value={formatNumber(kpis.absensi_hari_ini?.guru_hadir ?? kpis.absensi_hari_ini?.pegawai_hadir)}
              subtitle={`Dari ${formatNumber(kpis.total_pegawai?.total)} pegawai & guru`}
              icon={UserCheck}
              tone="indigo"
              badge="Guru & Tendik"
              onClick={() => openKpiModal('absensi_hari_ini', 'pegawai')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <ModernTuKpiCard
              title="Data Siswa Perlu Dilengkapi"
              value={formatNumber(kpis.siswa_incomplete?.total)}
              subtitle="NISN, Tanggal Lahir, atau Orang Tua/Wali"
              icon={AlertTriangle}
              tone="amber"
              badge="Perlu Dilengkapi"
              onClick={() => openKpiModal('siswa_incomplete')}
            />
            <ModernTuKpiCard
              title="Data Pegawai Perlu Dilengkapi"
              value={formatNumber(kpis.pegawai_incomplete?.total)}
              subtitle="Nomor Induk Yayasan (NIY) atau NIK"
              icon={AlertTriangle}
              tone="rose"
              badge="Perlu Dilengkapi"
              onClick={() => openKpiModal('pegawai_incomplete')}
            />
          </div>
        </section>

        {/* Grafik per metrik */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/25">
                <FileSpreadsheet className="size-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Visualisasi Data Administrasi & Presensi
                </h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Grafik analitik perbandingan gender, presensi gerbang, dan kelengkapan profil data
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <ModernTuChartCard
              title="Distribusi Siswa Aktif"
              subtitle="Perbandingan jenis kelamin siswa"
              icon={Users}
              tone="emerald"
              badge="Siswa"
              empty={!chartHasData(charts.siswa_gender)}
              action={
                <SquircleActionButton
                  variant="view"
                  icon={Users}
                  label="Lihat Detail Siswa"
                  onClick={() => openKpiModal('total_siswa')}
                />
              }
            >
              <GenderDonutChart data={charts.siswa_gender || []} />
            </ModernTuChartCard>

            <ModernTuChartCard
              title="Distribusi Pegawai & Guru"
              subtitle="Perbandingan jenis kelamin SDM"
              icon={UserCheck}
              tone="blue"
              badge="Pegawai"
              empty={!chartHasData(charts.pegawai_gender)}
              action={
                <SquircleActionButton
                  variant="import"
                  icon={UserCheck}
                  label="Lihat Detail Pegawai"
                  onClick={() => openKpiModal('total_pegawai')}
                />
              }
            >
              <GenderDonutChart data={charts.pegawai_gender || []} />
            </ModernTuChartCard>

            <ModernTuChartCard
              title="Absensi Gerbang Hari Ini"
              subtitle="Siswa hadir, belum absen, dan pegawai"
              icon={CheckCircle2}
              tone="teal"
              badge="Presensi"
              empty={!chartHasData(charts.absensi_hari_ini)}
              action={
                <SquircleActionButton
                  variant="primary"
                  icon={CheckCircle2}
                  label="Lihat Detail Absensi"
                  onClick={() => openKpiModal('absensi_hari_ini', 'siswa_hadir')}
                />
              }
            >
              <EnhancedComparisonBarChart data={charts.absensi_hari_ini || []} />
            </ModernTuChartCard>

            <ModernTuChartCard
              title="Kelengkapan Data Siswa"
              subtitle="Profil lengkap vs belum lengkap"
              icon={AlertTriangle}
              tone="amber"
              badge="Kelengkapan"
              empty={!chartHasData(charts.siswa_kelengkapan)}
              action={
                <SquircleActionButton
                  variant="edit"
                  icon={AlertTriangle}
                  label="Lihat Siswa Belum Lengkap"
                  onClick={() => openKpiModal('siswa_incomplete')}
                />
              }
            >
              <KelengkapanDonutChart data={charts.siswa_kelengkapan || []} />
            </ModernTuChartCard>

            <ModernTuChartCard
              title="Kelengkapan Data Pegawai"
              subtitle="NIY/NIK lengkap vs belum lengkap"
              icon={AlertTriangle}
              tone="rose"
              badge="Kelengkapan"
              empty={!chartHasData(charts.pegawai_kelengkapan)}
              action={
                <SquircleActionButton
                  variant="delete"
                  icon={AlertTriangle}
                  label="Lihat Pegawai Belum Lengkap"
                  onClick={() => openKpiModal('pegawai_incomplete')}
                />
              }
            >
              <KelengkapanDonutChart data={charts.pegawai_kelengkapan || []} />
            </ModernTuChartCard>
          </div>
        </section>

        <ModalErrorBoundary onClose={() => { setActiveModal(null); setActiveModalTab(null) }}>
          <TataUsahaKpiModal
            type={activeModal}
            isOpen={Boolean(activeModal)}
            initialTab={activeModalTab}
            unitName={context.unit?.nama}
            onClose={() => { setActiveModal(null); setActiveModalTab(null) }}
          />
        </ModalErrorBoundary>
      </div>
    </PageContainer>
  )
}
