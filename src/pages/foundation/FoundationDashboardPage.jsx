import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import HeroUiFilterSelect from '../../components/ui/HeroUiFilterSelect'
import { SmartScrollFab } from '../../components/common'
import FoundationDisciplineExecutiveSection from '../../components/foundation/FoundationDisciplineExecutiveSection'

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}
import {
  Building2,
  Users,
  UserCheck,
  GraduationCap,
  HeartHandshake,
  School,
  Layers,
  Award,
  CheckCircle2,
  Clock3,
  TrendingUp,
  FileSpreadsheet,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Bell,
  Activity,
  RefreshCw,
  Eye,
  Filter,
  Network,
  ChevronRight,
} from 'lucide-react'
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const PASTEL_PALETTES = [
  { bg: 'bg-sky-50 dark:bg-sky-950/60', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-200/60 dark:border-sky-800/60', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300' },
  { bg: 'bg-emerald-50 dark:bg-emerald-950/60', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200/60 dark:border-emerald-800/60', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' },
  { bg: 'bg-purple-50 dark:bg-purple-950/60', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200/60 dark:border-purple-800/60', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300' },
  { bg: 'bg-amber-50 dark:bg-amber-950/60', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200/60 dark:border-amber-800/60', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300' },
  { bg: 'bg-pink-50 dark:bg-pink-950/60', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200/60 dark:border-pink-800/60', badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/60 dark:text-pink-300' },
  { bg: 'bg-rose-50 dark:bg-rose-950/60', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200/60 dark:border-rose-800/60', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300' },
]

const CATEGORY_COLOR_MAP = {
  all: {
    active: 'bg-emerald-700 text-white shadow-xs dark:bg-emerald-500 dark:text-slate-950',
    inactive: 'bg-emerald-50/80 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
    countActive: 'bg-white/25 text-white dark:bg-slate-950/30 dark:text-slate-950',
    countInactive: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-200'
  },
  TK: {
    active: 'bg-sky-600 text-white shadow-xs dark:bg-sky-400 dark:text-slate-950',
    inactive: 'bg-sky-50/80 text-sky-800 border border-sky-200/80 hover:bg-sky-100 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60',
    countActive: 'bg-white/25 text-white dark:bg-slate-950/30 dark:text-slate-950',
    countInactive: 'bg-sky-100 text-sky-900 dark:bg-sky-900/80 dark:text-sky-200'
  },
  SD: {
    active: 'bg-amber-600 text-white shadow-xs dark:bg-amber-400 dark:text-slate-950',
    inactive: 'bg-amber-50/80 text-amber-800 border border-amber-200/80 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
    countActive: 'bg-white/25 text-white dark:bg-slate-950/30 dark:text-slate-950',
    countInactive: 'bg-amber-100 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200'
  },
  SMP: {
    active: 'bg-purple-600 text-white shadow-xs dark:bg-purple-400 dark:text-slate-950',
    inactive: 'bg-purple-50/80 text-purple-800 border border-purple-200/80 hover:bg-purple-100 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60',
    countActive: 'bg-white/25 text-white dark:bg-slate-950/30 dark:text-slate-950',
    countInactive: 'bg-purple-100 text-purple-900 dark:bg-purple-900/80 dark:text-purple-200'
  },
  SMA: {
    active: 'bg-rose-600 text-white shadow-xs dark:bg-rose-400 dark:text-slate-950',
    inactive: 'bg-rose-50/80 text-rose-800 border border-rose-200/80 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
    countActive: 'bg-white/25 text-white dark:bg-slate-950/30 dark:text-slate-950',
    countInactive: 'bg-rose-100 text-rose-900 dark:bg-rose-900/80 dark:text-rose-200'
  },
  PON: {
    active: 'bg-indigo-600 text-white shadow-xs dark:bg-indigo-400 dark:text-slate-950',
    inactive: 'bg-indigo-50/80 text-indigo-800 border border-indigo-200/80 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60',
    countActive: 'bg-white/25 text-white dark:bg-slate-950/30 dark:text-slate-950',
    countInactive: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/80 dark:text-indigo-200'
  },
  MAH: {
    active: 'bg-teal-600 text-white shadow-xs dark:bg-teal-400 dark:text-slate-950',
    inactive: 'bg-teal-50/80 text-teal-800 border border-teal-200/80 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/60',
    countActive: 'bg-white/25 text-white dark:bg-slate-950/30 dark:text-slate-950',
    countInactive: 'bg-teal-100 text-teal-900 dark:bg-teal-900/80 dark:text-teal-200'
  },
}
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../components/ui/chart'
import { Button } from '../../components/ui/button'

import {
  AppPageHeader,
  AppBreadcrumb,
  AppFilterBar,
  KpiCard,
  SummaryCard,
  AppBadge,
  AppButton,
  ActionDropdown,
  SectionHeader,
} from '../../components/app'
import PageContainer from '../../components/app/PageContainer'
import { QuickAccessCard } from '../../components/master-data'

import ChartCard from '../../components/dashboard/ChartCard'
import SkeletonDashboard from '../../components/dashboard/SkeletonDashboard'
import ErrorState from '../../components/dashboard/ErrorState'
import KpiQuickViewModal from '../../components/KpiQuickViewModal'
import ModalErrorBoundary from '../../components/common/ModalErrorBoundary'
import KpiDetailDrawer from '../../components/KpiDetailDrawer'

import api from '../../services/api'
import { useAuthStore } from '../../stores/authStore'
import { getUserRoleLevel, ROLE_LEVELS } from '../../auth/portalResolver'

const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/80 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white hover:border-emerald-400 hover:shadow-emerald-500/10 dark:border-emerald-700/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-emerald-500/10 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/30',
    iconGradient: 'from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-500/25',
    glow: 'bg-emerald-500/20 group-hover:bg-emerald-500/30',
    title: 'text-emerald-800 dark:text-emerald-300',
    value: 'text-emerald-950 dark:text-emerald-100',
    subtext: 'text-emerald-700/80 dark:text-emerald-400/80',
    cta: 'text-emerald-600 dark:text-emerald-400',
  },
  sky: {
    card: 'border-sky-300/80 bg-gradient-to-br from-sky-50/70 via-blue-50/40 to-white hover:border-sky-400 hover:shadow-sky-500/10 dark:border-sky-700/60 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-sky-500/10 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border-sky-500/30',
    iconGradient: 'from-sky-500 via-blue-600 to-indigo-700 shadow-sky-500/25',
    glow: 'bg-sky-500/20 group-hover:bg-sky-500/30',
    title: 'text-sky-800 dark:text-sky-300',
    value: 'text-sky-950 dark:text-sky-100',
    subtext: 'text-sky-700/80 dark:text-sky-400/80',
    cta: 'text-sky-600 dark:text-sky-400',
  },
  purple: {
    card: 'border-purple-300/80 bg-gradient-to-br from-purple-50/70 via-violet-50/40 to-white hover:border-purple-400 hover:shadow-purple-500/10 dark:border-purple-700/60 dark:from-purple-950/40 dark:via-violet-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-purple-500/10 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border-purple-500/30',
    iconGradient: 'from-purple-500 via-violet-600 to-indigo-700 shadow-purple-500/25',
    glow: 'bg-purple-500/20 group-hover:bg-purple-500/30',
    title: 'text-purple-800 dark:text-purple-300',
    value: 'text-purple-950 dark:text-purple-100',
    subtext: 'text-purple-700/80 dark:text-purple-400/80',
    cta: 'text-purple-600 dark:text-purple-400',
  },
  indigo: {
    card: 'border-indigo-300/80 bg-gradient-to-br from-indigo-50/70 via-sky-50/40 to-white hover:border-indigo-400 hover:shadow-indigo-500/10 dark:border-indigo-700/60 dark:from-indigo-950/40 dark:via-sky-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-indigo-500/10 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 border-indigo-500/30',
    iconGradient: 'from-indigo-500 via-purple-600 to-violet-700 shadow-indigo-500/25',
    glow: 'bg-indigo-500/20 group-hover:bg-indigo-500/30',
    title: 'text-indigo-800 dark:text-indigo-300',
    value: 'text-indigo-950 dark:text-indigo-100',
    subtext: 'text-indigo-700/80 dark:text-indigo-400/80',
    cta: 'text-indigo-600 dark:text-indigo-400',
  },
  rose: {
    card: 'border-rose-300/80 bg-gradient-to-br from-rose-50/70 via-pink-50/40 to-white hover:border-rose-400 hover:shadow-rose-500/10 dark:border-rose-700/60 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-rose-500/10 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border-rose-500/30',
    iconGradient: 'from-rose-500 via-pink-600 to-red-700 shadow-rose-500/25',
    glow: 'bg-rose-500/20 group-hover:bg-rose-500/30',
    title: 'text-rose-800 dark:text-rose-300',
    value: 'text-rose-950 dark:text-rose-100',
    subtext: 'text-rose-700/80 dark:text-rose-400/80',
    cta: 'text-rose-600 dark:text-rose-400',
  },
  amber: {
    card: 'border-amber-300/80 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white hover:border-amber-400 hover:shadow-amber-500/10 dark:border-amber-700/60 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-amber-500/10 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/30',
    iconGradient: 'from-amber-500 via-orange-600 to-amber-700 shadow-amber-500/25',
    glow: 'bg-amber-500/20 group-hover:bg-amber-500/30',
    title: 'text-amber-800 dark:text-amber-300',
    value: 'text-amber-950 dark:text-amber-100',
    subtext: 'text-amber-700/80 dark:text-amber-400/80',
    cta: 'text-amber-600 dark:text-amber-400',
  },
  blue: {
    card: 'border-blue-300/80 bg-gradient-to-br from-blue-50/70 via-cyan-50/40 to-white hover:border-blue-400 hover:shadow-blue-500/10 dark:border-blue-700/60 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-blue-500/10 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border-blue-500/30',
    iconGradient: 'from-blue-500 via-indigo-600 to-cyan-700 shadow-blue-500/25',
    glow: 'bg-blue-500/20 group-hover:bg-blue-500/30',
    title: 'text-blue-800 dark:text-blue-300',
    value: 'text-blue-950 dark:text-blue-100',
    subtext: 'text-blue-700/80 dark:text-blue-400/80',
    cta: 'text-blue-600 dark:text-blue-400',
  },
  teal: {
    card: 'border-teal-300/80 bg-gradient-to-br from-teal-50/70 via-cyan-50/40 to-white hover:border-teal-400 hover:shadow-teal-500/10 dark:border-teal-700/60 dark:from-teal-950/40 dark:via-cyan-950/20 dark:to-[#1B2433]',
    badgeBg: 'bg-teal-500/10 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300 border-teal-500/30',
    iconGradient: 'from-teal-500 via-emerald-600 to-cyan-700 shadow-teal-500/25',
    glow: 'bg-teal-500/20 group-hover:bg-teal-500/30',
    title: 'text-teal-800 dark:text-teal-300',
    value: 'text-teal-950 dark:text-teal-100',
    subtext: 'text-teal-700/80 dark:text-teal-400/80',
    cta: 'text-teal-600 dark:text-teal-400',
  },
}

function ModernKpiCard({ title, value, subtext, icon: Icon, tone = 'emerald', tag = 'METRIK', trend, trendText, onClick }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[20px] border-2 p-4.5 sm:p-5 shadow-xs transition-all duration-300 hover:shadow-lg ${t.card} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all duration-500 ${t.glow}`} />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${t.badgeBg}`}>
              {tag}
            </span>
          </div>
          <p className={`text-xs font-bold pt-0.5 ${t.title}`}>{title}</p>
        </div>
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-105 ${t.iconGradient}`}>
          {Icon && <Icon className="size-5 text-white" />}
        </div>
      </div>
      <div className="relative z-10 mt-3 flex items-baseline justify-between gap-2">
        <div>
          <p className={`text-2xl sm:text-3xl font-black tabular-nums tracking-tight ${t.value}`}>
            {value}
          </p>
          {(subtext || trendText) && (
            <p className={`mt-1 text-xs font-medium ${t.subtext}`}>
              {trend !== undefined && trend !== null && (
                <span className={`font-bold mr-1 ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {trend > 0 ? `+${trend}` : trend}
                </span>
              )}
              {subtext || trendText}
            </p>
          )}
        </div>
      </div>
      {onClick && (
        <div className="relative z-10 mt-3.5 pt-2.5 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-bold">
          <span className="text-slate-400 dark:text-slate-500 font-medium text-[10px]">Klik untuk detail</span>
          <span className={`inline-flex items-center gap-1 transition-transform group-hover:translate-x-0.5 ${t.cta}`}>
            Lihat Data &rarr;
          </span>
        </div>
      )}
    </motion.div>
  )
}

const VIBRANT_TONES = {
  emerald: {
    card: 'border-emerald-300/80 bg-gradient-to-br from-emerald-50/80 via-teal-50/30 to-white hover:border-emerald-400 hover:shadow-emerald-500/15 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-[#1B2433]',
    iconBg: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/25 border border-emerald-300/30',
    title: 'text-emerald-800 dark:text-emerald-300',
    value: 'text-emerald-950 dark:text-emerald-100',
    subtext: 'text-emerald-700/80 dark:text-emerald-400/80',
    glow: 'bg-emerald-500/15',
  },
  blue: {
    card: 'border-blue-300/80 bg-gradient-to-br from-blue-50/80 via-sky-50/30 to-white hover:border-blue-400 hover:shadow-blue-500/15 dark:border-blue-800/60 dark:from-blue-950/40 dark:via-sky-950/20 dark:to-[#1B2433]',
    iconBg: 'bg-gradient-to-br from-blue-500 via-sky-600 to-indigo-700 text-white shadow-md shadow-blue-500/25 border border-blue-300/30',
    title: 'text-blue-800 dark:text-blue-300',
    value: 'text-blue-950 dark:text-blue-100',
    subtext: 'text-blue-700/80 dark:text-blue-400/80',
    glow: 'bg-blue-500/15',
  },
  violet: {
    card: 'border-purple-300/80 bg-gradient-to-br from-purple-50/80 via-violet-50/30 to-white hover:border-purple-400 hover:shadow-purple-500/15 dark:border-purple-800/60 dark:from-purple-950/40 dark:via-violet-950/20 dark:to-[#1B2433]',
    iconBg: 'bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700 text-white shadow-md shadow-purple-500/25 border border-purple-300/30',
    title: 'text-purple-800 dark:text-purple-300',
    value: 'text-purple-950 dark:text-purple-100',
    subtext: 'text-purple-700/80 dark:text-purple-400/80',
    glow: 'bg-purple-500/15',
  },
  amber: {
    card: 'border-amber-300/80 bg-gradient-to-br from-amber-50/80 via-orange-50/30 to-white hover:border-amber-400 hover:shadow-amber-500/15 dark:border-amber-800/60 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-[#1B2433]',
    iconBg: 'bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-white shadow-md shadow-amber-500/25 border border-amber-300/30',
    title: 'text-amber-800 dark:text-amber-300',
    value: 'text-amber-950 dark:text-amber-100',
    subtext: 'text-amber-700/80 dark:text-amber-400/80',
    glow: 'bg-amber-500/15',
  },
  indigo: {
    card: 'border-indigo-300/80 bg-gradient-to-br from-indigo-50/80 via-sky-50/30 to-white hover:border-indigo-400 hover:shadow-indigo-500/15 dark:border-indigo-800/60 dark:from-indigo-950/40 dark:via-sky-950/20 dark:to-[#1B2433]',
    iconBg: 'bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 text-white shadow-md shadow-indigo-500/25 border border-indigo-300/30',
    title: 'text-indigo-800 dark:text-indigo-300',
    value: 'text-indigo-950 dark:text-indigo-100',
    subtext: 'text-indigo-700/80 dark:text-indigo-400/80',
    glow: 'bg-indigo-500/15',
  },
  rose: {
    card: 'border-rose-300/80 bg-gradient-to-br from-rose-50/80 via-pink-50/30 to-white hover:border-rose-400 hover:shadow-rose-500/15 dark:border-rose-800/60 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-[#1B2433]',
    iconBg: 'bg-gradient-to-br from-rose-500 via-pink-600 to-red-700 text-white shadow-md shadow-rose-500/25 border border-rose-300/30',
    title: 'text-rose-800 dark:text-rose-300',
    value: 'text-rose-950 dark:text-rose-100',
    subtext: 'text-rose-700/80 dark:text-rose-400/80',
    glow: 'bg-rose-500/15',
  },
  sky: {
    card: 'border-sky-300/80 bg-gradient-to-br from-sky-50/80 via-blue-50/30 to-white hover:border-sky-400 hover:shadow-sky-500/15 dark:border-sky-800/60 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-[#1B2433]',
    iconBg: 'bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white shadow-md shadow-sky-500/25 border border-sky-300/30',
    title: 'text-sky-800 dark:text-sky-300',
    value: 'text-sky-950 dark:text-sky-100',
    subtext: 'text-sky-700/80 dark:text-sky-400/80',
    glow: 'bg-sky-500/15',
  },
}

function VibrantMetricCard({
  icon: Icon,
  title,
  value,
  description,
  badge,
  tone = 'emerald',
  onClick,
}) {
  const t = VIBRANT_TONES[tone] || VIBRANT_TONES.emerald
  const isClickable = typeof onClick === 'function'

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`group relative overflow-hidden rounded-[20px] border-2 p-3 sm:p-3.5 shadow-xs transition-all duration-300 hover:shadow-md ${t.card} ${isClickable ? 'cursor-pointer' : ''}`}
    >
      <div className={`pointer-events-none absolute -top-8 -right-8 h-20 w-20 rounded-full blur-xl transition-all duration-500 ${t.glow}`} />

      <div className="relative z-10 flex items-start gap-2.5">
        {Icon && (
          <div className={`flex size-9 shrink-0 items-center justify-center rounded-[12px] text-white shadow-md transition-transform duration-300 group-hover:scale-105 ${t.iconBg}`}>
            <Icon className="size-4.5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className={`text-[11px] font-black leading-tight line-clamp-1 ${t.title}`} title={title}>
            {title}
          </p>
          <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
            <span className={`text-xl font-black tabular-nums tracking-tight ${t.value}`}>
              {value ?? '—'}
            </span>
            {badge && (
              <span className="rounded-md bg-white/70 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className={`mt-0.5 text-[10px] font-medium leading-tight line-clamp-1 ${t.subtext}`} title={description}>
              {description}
            </p>
          )}
        </div>
        {isClickable && (
          <ChevronRight className="size-3.5 shrink-0 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all mt-0.5 dark:text-slate-500" />
        )}
      </div>
    </motion.div>
  )
}


export function FoundationDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const userLevel = useMemo(() => getUserRoleLevel(user), [user])
  const isKepalaSekolah = userLevel === ROLE_LEVELS.KEPALA_SEKOLAH // Level 4
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('all')
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState('year')
  const [activeModal, setActiveModal] = useState(null)
  const [detailDrawer, setDetailDrawer] = useState({ isOpen: false, type: null, id: null })
  const [unitsList, setUnitsList] = useState([])
  const [cardUnitFilter, setCardUnitFilter] = useState('all')

  const fetchDashboard = async (unitId = selectedUnitFilter, period = selectedPeriodFilter) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/foundation/dashboard', {
        params: { unit_id: unitId, period }
      })
      if (res.data && res.data.data) {
        setData(res.data.data)
      } else {
        setError('Format respon server tidak valid.')
      }
    } catch (err) {
      console.error('Failed to load foundation dashboard:', err)
      setError(err?.response?.data?.message || 'Gagal memuat data dashboard yayasan.')
    } finally {
      setLoading(false)
    }
  }

  const fetchUnits = async () => {
    try {
      const res = await api.get('/foundation/units')
      if (res.data && res.data.data) {
        setUnitsList(res.data.data)
      }
    } catch (err) {
      console.error('Failed to load units for filter:', err)
    }
  }

  useEffect(() => {
    fetchUnits()
    fetchDashboard('all', 'year')
  }, [])

  const handleUnitFilterChange = (unitId) => {
    setSelectedUnitFilter(unitId)
    fetchDashboard(unitId, selectedPeriodFilter)
  }

  const handleResetFilter = () => {
    setSelectedUnitFilter('all')
    setSelectedPeriodFilter('year')
    fetchDashboard('all', 'year')
  }

  const handleOpenUnitDetail = (unit) => {
    setDetailDrawer({
      isOpen: true,
      type: 'unit_pendidikan',
      id: unit.id,
    })
  }

  const kpis = data?.kpis || {}
  const charts = data?.charts || {}
  const unitSummaries = data?.unit_summaries || []
  const recentInformation = data?.recent_information || []
  const recentActivities = data?.recent_activities || []
  const monitoringAkademik = data?.monitoring_akademik || {}
  const monitoringIbadah = data?.monitoring_ibadah || {}
  const unitRankings = data?.unit_rankings || []
  const agendaYayasan = data?.agenda_yayasan || []
  const activeYear = data?.active_academic_year
  const activeSemester = data?.active_semester
  const activeYearName = typeof activeYear === 'object' ? (activeYear?.name || activeYear?.year || '2026/2027') : (activeYear || '2026/2027')
  const activeSemesterName = typeof activeSemester === 'object' ? (activeSemester?.name || activeSemester?.semester || 'Semester Ganjil') : (activeSemester || 'Semester Ganjil')
  const prestasiDistribution = charts.prestasi_distribution || []
  const sdmDistribution = charts.sdm_distribution || []

  const getUnitCategoryKey = (row) => {
    const code = (row.code || '').toUpperCase()
    const name = (row.name || '').toUpperCase()
    const jenis = (row.jenis_unit || row.level || '').toUpperCase()

    if (
      code.includes('TK') ||
      code.includes('TAU') ||
      name.includes('TK') ||
      name.includes('TAUD') ||
      jenis.includes('KANAK') ||
      jenis.includes('USIA DINI')
    ) {
      return 'TK'
    }
    if (
      code.includes('SD') ||
      code.includes('MIT') ||
      name.includes('SD') ||
      name.includes('MIT') ||
      jenis.includes('DASAR') ||
      jenis.includes('IBTIDAIYAH')
    ) {
      return 'SD'
    }
    if (code.includes('SMP') || name.includes('SMP') || jenis.includes('PERTAMA')) {
      return 'SMP'
    }
    if (code.includes('SMA') || name.includes('SMA') || jenis.includes('ATAS')) {
      return 'SMA'
    }
    if (
      code.includes('PON') ||
      name.includes('PONPES') ||
      name.includes('PESANTREN') ||
      jenis.includes('PESANTREN')
    ) {
      return 'PON'
    }
    if (
      code.includes('MAH') ||
      name.includes('MAHAD') ||
      name.includes("MA'HAD") ||
      jenis.includes('MAHAD') ||
      jenis.includes("MA'HAD")
    ) {
      return 'MAH'
    }
    return code || 'OTHERS'
  }

  const getShortUnitBadgeLabel = (row) => {
    const val = (row?.jenis_unit || row?.level || '').trim()
    if (!val) return 'Unit'
    const upper = val.toUpperCase()
    if (upper.includes('KANAK') || upper.includes('TK')) return 'TKIT'
    if (upper.includes('USIA DINI') || upper.includes('TAUD')) return 'TAUD'
    if (upper.includes('DASAR') || upper.includes('SD')) return 'SDIT'
    if (upper.includes('IBTIDAIYAH') || upper.includes('MIT')) return 'MIT'
    if (upper.includes('PERTAMA') || upper.includes('SMP')) return 'SMPIT'
    if (upper.includes('ATAS') || upper.includes('SMA')) return 'SMAIT'
    if (upper.includes('PESANTREN') || upper.includes('PON')) return 'Ponpes'
    if (upper.includes('MAHAD') || upper.includes("MA'HAD") || upper.includes('MAH')) return "Ma'had"
    if (val.length > 12) return val.substring(0, 10) + '...'
    return val
  }

  const categoryCounts = useMemo(() => {
    const counts = {
      all: unitSummaries.length,
      TK: 0,
      SD: 0,
      SMP: 0,
      SMA: 0,
      PON: 0,
      MAH: 0,
    }
    unitSummaries.forEach((row) => {
      const key = getUnitCategoryKey(row)
      if (counts[key] !== undefined) {
        counts[key] += 1
      } else {
        counts[key] = (counts[key] || 0) + 1
      }
    })
    return counts
  }, [unitSummaries])

  const availableFilterCategories = useMemo(() => {
    const defaultCats = [
      { id: 'all', label: 'Semua Unit' },
      { id: 'TK', label: 'TK / PAUD' },
      { id: 'SD', label: 'SD / MI' },
      { id: 'SMP', label: 'SMP' },
      { id: 'SMA', label: 'SMA' },
      { id: 'PON', label: 'Pondok Pesantren' },
      { id: 'MAH', label: "Ma'had" },
    ]
    const extraKeys = Object.keys(categoryCounts).filter(
      (k) => !defaultCats.some((c) => c.id === k) && categoryCounts[k] > 0
    )
    extraKeys.forEach((k) => {
      defaultCats.push({ id: k, label: k })
    })
    return defaultCats
  }, [categoryCounts])

  const unitFilterOptions = useMemo(() => [
    {
      value: 'all',
      label: `Semua Unit Pendidikan (${unitsList.length ? `${unitsList.length} Unit` : '15 Unit'})`,
      badge: 'SEMUA',
      subtext: 'Agregat monitoring seluruh unit yayasan',
    },
    ...unitsList.map((u) => ({
      value: String(u.id),
      label: u.name,
      badge: u.code || u.jenis_unit || 'Unit',
      subtext: u.alamat || `${u.student_count || 0} Siswa • ${u.employee_count || 0} Pegawai`,
    })),
  ], [unitsList])

  const periodFilterOptions = useMemo(() => [
    { value: 'year', label: 'Tahun Berjalan (2026/2027)', badge: 'TAHUNAN', subtext: 'Akumulasi tahun ajaran aktif' },
    { value: 'semester', label: 'Semester Berjalan', badge: 'SEMESTER', subtext: 'Data semester ganjil/genap aktif' },
    { value: 'month', label: 'Bulan Ini', badge: 'BULANAN', subtext: 'Rekapitulasi 30 hari terakhir' },
  ], [])

  const mobileCategoryOptions = useMemo(() => availableFilterCategories.map((cat) => ({
    value: cat.id,
    label: cat.label,
    badge: `${categoryCounts[cat.id] || 0} Unit`,
  })), [availableFilterCategories, categoryCounts])

  const filteredUnitSummaries = useMemo(() => {
    if (cardUnitFilter === 'all') return unitSummaries
    return unitSummaries.filter((row) => {
      const catKey = getUnitCategoryKey(row)
      if (cardUnitFilter === catKey) return true
      const code = (row.code || '').toUpperCase()
      const jenis = (row.jenis_unit || row.level || '').toUpperCase()
      return code === cardUnitFilter.toUpperCase() || jenis === cardUnitFilter.toUpperCase()
    })
  }, [unitSummaries, cardUnitFilter])

  if (loading && !data) return <SkeletonDashboard />
  if (error && !data) return <ErrorState message={error} onRetry={() => fetchDashboard(selectedUnitFilter)} />

  const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

  const isFiltered = selectedUnitFilter !== 'all' || selectedPeriodFilter !== 'year'

  return (
    <PageContainer maxW="7xl">
      <div className="mb-4">
        <AppBreadcrumb items={[{ label: isKepalaSekolah ? 'Dashboard Kepala Sekolah' : 'Dashboard Pengurus Yayasan' }]} />
      </div>

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
        {/* Header Halaman Modern Hero Card */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[24px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-7 shadow-lg shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4 sm:gap-5 min-w-0">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/35 border-2 border-white/20 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <Building2 className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    {isKepalaSekolah ? 'Dashboard Kepala Sekolah' : 'Dashboard Pengurus Yayasan'}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {isKepalaSekolah ? 'Kepala Sekolah' : 'Pengurus Yayasan'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-emerald-300/60 dark:border-emerald-700/60 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-2xs">
                    <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>T.A. {activeYearName} • {activeSemesterName}</span>
                  </span>
                </div>
                <p className="mt-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed">
                  Pusat kendali eksekutif: monitoring terpadu kinerja SDM guru & pegawai, rekapitulasi santri & siswa, analisis akademik, dan supervisi 15 unit pendidikan yayasan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
              <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-white/80 dark:bg-slate-900/80 px-3.5 py-2 text-xs font-black text-emerald-900 dark:text-emerald-200 shadow-xs backdrop-blur-xs">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span>Realtime Analytics</span>
              </div>
              <button
                type="button"
                onClick={() => fetchDashboard(selectedUnitFilter, selectedPeriodFilter)}
                disabled={loading}
                title="Perbarui Data Dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/60 bg-white/80 px-3.5 py-2 text-xs font-extrabold text-emerald-800 shadow-xs hover:bg-emerald-50 transition-all cursor-pointer dark:border-emerald-700/60 dark:bg-slate-900/80 dark:text-emerald-300 dark:hover:bg-emerald-950/60 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Segarkan</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Informasi Resmi & Aktivitas Terbaru */}
        <motion.section variants={itemVariants} className="space-y-3">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Announcements Feed (Card 1 - Hero UI Blue Accent) */}
            <div className="relative overflow-hidden rounded-[22px] border-2 border-sky-300/80 bg-gradient-to-br from-sky-50/60 via-white to-blue-50/30 p-5 sm:p-6 shadow-md shadow-sky-500/5 space-y-4 lg:col-span-7 dark:border-sky-800/60 dark:from-sky-950/30 dark:via-[#1B2433] dark:to-[#1B2433]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 text-white shadow-md shadow-sky-500/25 border border-sky-300/40">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">Pengumuman & Agenda Yayasan</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Informasi dan edaran resmi terbaru lintas unit</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-xl bg-sky-100/90 border border-sky-200/80 px-3 py-1 text-xs font-black text-sky-800 dark:bg-sky-900/70 dark:border-sky-800/60 dark:text-sky-300">
                  {recentInformation.length} Informasi
                </span>
              </div>

              <div className="space-y-3">
                {recentInformation.map((info) => (
                  <div
                    key={info.id}
                    className="group rounded-xl border border-sky-100 border-l-4 border-l-sky-500 bg-white/90 p-3.5 transition-all duration-200 hover:border-sky-300 hover:shadow-md dark:border-sky-900/40 dark:border-l-sky-400 dark:bg-slate-900/50 dark:hover:bg-slate-900/80 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400 transition line-clamp-1">
                        {info.judul}
                      </h4>
                      <span className="shrink-0 rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-extrabold text-sky-700 dark:bg-sky-900/80 dark:text-sky-300">
                        {info.tanggal}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{info.isi}</p>
                  </div>
                ))}
                {!recentInformation.length && (
                  <p className="py-8 text-center text-xs text-slate-400 italic">Belum ada pengumuman resmi terbaru.</p>
                )}
              </div>
            </div>

            {/* Activity Feed (Card 2 - Hero UI Emerald Accent) */}
            <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300/80 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/30 p-5 sm:p-6 shadow-md shadow-emerald-500/5 space-y-4 lg:col-span-5 dark:border-emerald-800/60 dark:from-emerald-950/30 dark:via-[#1B2433] dark:to-[#1B2433]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/25 border border-emerald-300/40">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">Aktivitas Sistem Terbaru</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Log presensi, nilai & mutaba'ah real-time</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 border border-emerald-200/80 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-900/70 dark:border-emerald-800/60 dark:text-emerald-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>Live Feed</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-emerald-100 border-l-4 border-l-emerald-500 bg-white/90 p-3 transition-all duration-200 hover:border-emerald-300 hover:shadow-md dark:border-emerald-900/40 dark:border-l-emerald-400 dark:bg-slate-900/50 dark:hover:bg-slate-900/80"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition">
                        {act.title}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate font-medium">
                        {act.subtitle}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-800 dark:bg-emerald-900/90 dark:text-emerald-200">
                      {act.time}
                    </span>
                  </div>
                ))}
                {!recentActivities.length && (
                  <p className="py-8 text-center text-xs text-slate-400 italic">Belum ada aktivitas terbaru tercatat.</p>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Filter Global Unit & Periode & Akses Cepat Modul Eksekutif */}
        <motion.section variants={itemVariants} className="space-y-3">
          <div className="rounded-[22px] border-2 border-emerald-500/20 bg-gradient-to-r from-emerald-50/40 via-white to-teal-50/30 p-4 sm:p-4.5 shadow-sm dark:border-emerald-800/50 dark:bg-[#1B2433]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                  <Filter className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Filter Monitoring
                    </span>
                    {isFiltered && (
                      <span className="inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black text-white">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Pilih unit pendidikan & rentang periode data</p>
                </div>
              </div>

              <div className="flex flex-1 flex-wrap items-center gap-3 justify-start md:justify-end min-w-0">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">Unit:</span>
                  <div className="w-full sm:w-64 md:w-72">
                    <HeroUiFilterSelect
                      value={selectedUnitFilter}
                      onChange={(val) => handleUnitFilterChange(val || 'all')}
                      options={unitFilterOptions}
                      placeholder="Pilih Unit..."
                      icon={School}
                      searchable={true}
                      popoverWidth="w-72 sm:w-80"
                      size="md"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">Periode:</span>
                  <div className="w-full sm:w-56">
                    <HeroUiFilterSelect
                      value={selectedPeriodFilter}
                      onChange={(val) => {
                        const newPeriod = val || 'year'
                        setSelectedPeriodFilter(newPeriod)
                        fetchDashboard(selectedUnitFilter, newPeriod)
                      }}
                      options={periodFilterOptions}
                      placeholder="Pilih Periode..."
                      icon={Calendar}
                      popoverWidth="w-64"
                      size="md"
                    />
                  </div>
                </div>

                {isFiltered && (
                  <button
                    type="button"
                    onClick={handleResetFilter}
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-extrabold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 cursor-pointer transition-all shadow-2xs"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card Akses Cepat Modul Eksekutif (5 Buttons dengan Style Soft Pastel Squircle Unik) */}
          <div className="rounded-[22px] border-2 border-emerald-500/25 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/20 p-5 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/25 border border-emerald-300/40">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">Akses Cepat Modul Eksekutif</h3>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                      5 Modul
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Navigasi langsung ke modul monitoring spesifik yayasan</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* 1. Pegawai & Guru Seluruh Unit */}
                <QuickAccessCard
                  tone="emerald"
                  icon={UserCheck}
                  title="Pegawai & Guru"
                  subtitle="SDM Seluruh Unit"
                  onClick={() => navigate('/dashboard/yayasan/pegawai-guru')}
                />

                {/* 2. Struktur Organisasi */}
                <QuickAccessCard
                  tone="sky"
                  icon={Network}
                  title="Struktur Organisasi"
                  subtitle="Hirarki Per Unit"
                  onClick={() => navigate('/dashboard/yayasan/struktur-organisasi')}
                />

                {/* 3. Data Siswa */}
                <QuickAccessCard
                  tone="purple"
                  icon={Users}
                  title="Data Siswa"
                  subtitle="Tahun Ajaran"
                  onClick={() => navigate('/dashboard/yayasan/siswa')}
                />

                {/* 4. Siswa Masuk & Keluar */}
                <QuickAccessCard
                  tone="amber"
                  icon={GraduationCap}
                  title="Siswa Masuk/Keluar"
                  subtitle="Mobilisasi Siswa"
                  onClick={() => navigate('/dashboard/yayasan/siswa-baru')}
                />

                {/* 5. Unit Pendidikan */}
                <QuickAccessCard
                  tone="rose"
                  icon={Building2}
                  title="Unit Pendidikan"
                  subtitle="Seluruh Unit"
                  onClick={() => navigate('/dashboard/yayasan/unit-pendidikan')}
                />
              </div>
            </div>
          </div>
        </motion.section>

      {/* KPI Cards Grid (Canonical KpiCard Session 3) */}
      <motion.section variants={itemVariants} className="space-y-3">
        <SectionHeader
          icon={Building2}
          title="Kinerja Eksekutif Yayasan"
          subtitle="Ringkasan agregat real-time dari PostgreSQL seluruh 15 unit pendidikan"
          badge="Monitoring Real-Time"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ModernKpiCard
            title="Total Unit Pendidikan"
            value={formatNumber(kpis.unit_pendidikan?.total ?? kpis.total_unit_aktif ?? unitsList.length)}
            trend={kpis.unit_pendidikan?.growth ?? kpis.growth_unit}
            trendText="unit baru bulan ini"
            icon={Building2}
            tone="emerald"
            tag="15 UNIT"
            onClick={() => setActiveModal('total_unit')}
          />

          <ModernKpiCard
            title="SDM Guru"
            value={formatNumber(kpis.guru?.total ?? kpis.total_guru)}
            trend={kpis.guru?.growth ?? kpis.growth_guru}
            trendText="vs bulan lalu"
            icon={GraduationCap}
            tone="sky"
            tag="GURU"
            onClick={() => setActiveModal('total_guru')}
          />

          <ModernKpiCard
            title="Tenaga Kependidikan"
            value={formatNumber(kpis.pegawai?.total ?? kpis.total_pegawai)}
            trend={kpis.pegawai?.growth ?? kpis.growth_pegawai}
            trendText="vs bulan lalu"
            icon={UserCheck}
            tone="purple"
            tag="TENDIK"
            onClick={() => setActiveModal('total_pegawai')}
          />

          <ModernKpiCard
            title="Siswa Aktif"
            value={formatNumber(kpis.siswa?.total ?? kpis.total_siswa_aktif)}
            trend={kpis.siswa?.growth ?? kpis.growth_siswa}
            trendText="siswa terdaftar"
            icon={Users}
            tone="indigo"
            tag="SISWA"
            onClick={() => setActiveModal('total_siswa')}
          />

          <ModernKpiCard
            title="Orang Tua / Wali"
            value={formatNumber(kpis.orang_tua?.total ?? kpis.total_ortu)}
            trend={kpis.orang_tua?.growth ?? kpis.growth_ortu}
            trendText="akun wali murid"
            icon={HeartHandshake}
            tone="rose"
            tag="WALI"
            onClick={() => setActiveModal('total_ortu')}
          />

          <ModernKpiCard
            title="Total Alumni"
            value={formatNumber(kpis.alumni?.total ?? kpis.total_alumni)}
            trend={kpis.alumni?.growth ?? kpis.growth_alumni}
            trendText="alumni terdata"
            icon={Sparkles}
            tone="amber"
            tag="LULUSAN"
            onClick={() => setActiveModal('total_alumni')}
          />

          <ModernKpiCard
            title="Total Kelas"
            value={formatNumber(kpis.kelas?.total ?? kpis.total_kelas)}
            trend={kpis.kelas?.growth ?? kpis.growth_kelas}
            trendText="ruang kelas"
            icon={School}
            tone="blue"
            tag="KELAS"
            onClick={() => setActiveModal('total_kelas')}
          />

          <ModernKpiCard
            title="Total Rombel"
            value={formatNumber(kpis.rombel?.total ?? kpis.total_rombel)}
            trend={kpis.rombel?.growth ?? kpis.growth_rombel}
            trendText="rombongan belajar"
            icon={Layers}
            tone="teal"
            tag="ROMBEL"
            onClick={() => setActiveModal('total_rombel')}
          />
        </div>
      </motion.section>

      {/* Ringkasan Operasional & Monitoring Akademik */}
      <motion.section variants={itemVariants} className="space-y-3">
        <SectionHeader
          icon={Activity}
          title="Monitoring Operasional & Akademik"
          subtitle="Kondisi presensi guru & siswa, input nilai LMS, setoran tahfizh, dan mutaba'ah ibadah"
          badge="Harian & Real-time"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          <VibrantMetricCard
            title="Kehadiran Guru"
            value={monitoringAkademik.kehadiran_guru != null ? `${monitoringAkademik.kehadiran_guru}%` : '—'}
            description={monitoringAkademik.teacher_sessions_total > 0 ? `${monitoringAkademik.teacher_sessions_present} dari ${monitoringAkademik.teacher_sessions_total} sesi` : 'Belum ada sesi'}
            icon={UserCheck}
            tone="emerald"
            onClick={() => setActiveModal('kehadiran_guru')}
          />
          <VibrantMetricCard
            title="Kehadiran Siswa"
            value={monitoringAkademik.kehadiran_siswa != null ? `${monitoringAkademik.kehadiran_siswa}%` : '—'}
            description={monitoringAkademik.total_siswa_aktif > 0 ? `${formatNumber(Math.max(0, (monitoringAkademik.total_siswa_aktif || 0) - (monitoringAkademik.tidak_hadir_hari_ini || 0)))} dari ${formatNumber(monitoringAkademik.total_siswa_aktif)} siswa` : 'Belum ada data'}
            icon={Users}
            tone="blue"
            onClick={() => setActiveModal('kehadiran_siswa')}
          />
          <VibrantMetricCard
            title="Nilai LMS"
            value={monitoringAkademik.input_nilai != null ? `${monitoringAkademik.input_nilai}%` : '—'}
            description={monitoringAkademik.total_grades > 0 ? `${formatNumber(monitoringAkademik.total_grades)} entri terdata` : 'Belum ada entri'}
            icon={CheckCircle2}
            tone="violet"
            onClick={() => setActiveModal('input_nilai')}
          />
          <VibrantMetricCard
            title="Tahfizh Qur'an"
            value={monitoringAkademik.input_tahfiz != null ? `${monitoringAkademik.input_tahfiz}%` : '—'}
            description={monitoringAkademik.today_tahfizh_logs > 0 ? `${formatNumber(monitoringAkademik.today_tahfizh_logs)} setoran hari ini` : 'Belum ada setoran'}
            icon={Award}
            tone="amber"
            onClick={() => setActiveModal('input_tahfiz')}
          />
          <VibrantMetricCard
            title="Mutaba'ah"
            value={monitoringAkademik.input_mutabaah != null ? `${monitoringAkademik.input_mutabaah}%` : '—'}
            description={monitoringAkademik.today_mutabaah_headers > 0 ? `${formatNumber(monitoringAkademik.today_mutabaah_headers)} jurnal hari ini` : 'Belum ada jurnal'}
            icon={HeartHandshake}
            tone="indigo"
            onClick={() => setActiveModal('input_mutabaah')}
          />
          <VibrantMetricCard
            title="Terlambat"
            value={formatNumber(monitoringAkademik.terlambat_hari_ini)}
            description="Presensi melewati batas jam masuk"
            icon={Clock3}
            tone="amber"
          />
          <VibrantMetricCard
            title="Tidak Hadir"
            value={formatNumber(monitoringAkademik.tidak_hadir_hari_ini)}
            description="Alpa / Sakit / Izin hari ini"
            icon={UserCheck}
            tone="rose"
          />
        </div>

        {/* Demographic & Movement Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <VibrantMetricCard
            title="Siswa Baru"
            value={formatNumber(kpis.siswa_baru)}
            description="Tahun ajaran berjalan"
            icon={TrendingUp}
            tone="emerald"
          />
          <VibrantMetricCard
            title="Mutasi Masuk"
            value={formatNumber(kpis.mutasi_masuk)}
            description="Siswa pindahan masuk"
            icon={TrendingUp}
            tone="sky"
          />
          <VibrantMetricCard
            title="Mutasi Keluar"
            value={formatNumber(kpis.mutasi_keluar)}
            description="Siswa pindahan keluar"
            icon={TrendingUp}
            tone="amber"
          />
          <VibrantMetricCard
            title="Siswa Lulus"
            value={formatNumber(kpis.siswa_lulus)}
            description="Telah menyelesaikan pendidikan"
            icon={GraduationCap}
            tone="indigo"
          />
        </div>
      </motion.section>

      {/* Visual Analytics & Charts */}
      <motion.section variants={itemVariants} className="space-y-3">
        <SectionHeader
          icon={TrendingUp}
          title="Analitik Capaian & Distribusi Lintas Unit"
          subtitle="Visualisasi grafik distribusi SDM, capaian prestasi, dan mutaba'ah ibadah"
          badge="Grafik Analitik"
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Chart 1: Distribusi SDM Guru & Tendik per Unit */}
          <div className="rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 shadow-sm space-y-4 lg:col-span-6 dark:border-emerald-800/60 dark:bg-[#1B2433]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/25 border border-emerald-300/30">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Distribusi SDM per Unit Pendidikan</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Perbandingan jumlah Guru vs Tendik di seluruh unit</p>
              </div>
            </div>

            <div className="h-56 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sdmDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="code" fontSize={10} interval={0} angle={-30} textAnchor="end" />
                  <YAxis fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="guru" fill="#0E5C44" name="Guru" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="tendik" fill="#3FBF75" name="Tendik" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Monitoring Mutaba'ah Ibadah */}
          <div className="rounded-[22px] border-2 border-emerald-500/25 bg-gradient-to-br from-white via-emerald-50/15 to-teal-50/20 p-5 shadow-sm space-y-4 lg:col-span-3 dark:border-emerald-800/60 dark:bg-[#1B2433]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/25 border border-emerald-300/30">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Monitoring Ibadah Harian</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tingkat kelengkapan mutaba'ah siswa</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {[
                { label: 'Shalat Wajib & Sunnah', value: monitoringIbadah.shalat, detail: monitoringIbadah.shalat_detail, gradient: 'from-emerald-500 to-teal-500' },
                { label: 'Tilawah Al-Qur\'an', value: monitoringIbadah.tilawah, detail: monitoringIbadah.tilawah_detail, gradient: 'from-blue-500 to-cyan-500' },
                { label: 'Muraja\'ah Hafalan', value: monitoringIbadah.murajaah, detail: monitoringIbadah.murajaah_detail, gradient: 'from-purple-500 to-violet-500' },
                { label: 'Mutaba\'ah Terverifikasi', value: monitoringIbadah.mutabaah, detail: monitoringIbadah.mutabaah_detail, gradient: 'from-amber-500 to-orange-500' },
              ].map((item) => (
                <div
                  key={item.label}
                  onClick={() => setActiveModal('monitoring_ibadah')}
                  className="space-y-1.5 p-2 rounded-xl transition-all duration-150 cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200/80 dark:hover:bg-slate-800/60 dark:hover:border-slate-700/60"
                  role="button"
                  tabIndex={0}
                  title="Klik untuk melihat rincian data sumber monitoring ibadah"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-black tabular-nums">
                      {item.value != null ? `${item.value}%` : '—'}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.gradient} transition-all duration-300`}
                      style={{ width: `${Math.min(100, Math.max(0, Number(item.value) || 0))}%` }}
                    />
                  </div>
                  {item.detail?.total > 0 ? (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium text-right">
                      {item.detail.completed} dari {item.detail.total} entri tercatat
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium text-right">
                      Belum ada data periode ini
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chart 3: Distribusi Prestasi Siswa */}
          <div className="rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 shadow-sm space-y-4 lg:col-span-3 dark:border-emerald-800/60 dark:bg-[#1B2433]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-white shadow-md shadow-amber-500/25 border border-amber-300/30">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Distribusi Prestasi Siswa</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Kategori capaian prestasi terdaftar</p>
              </div>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              {!prestasiDistribution.some((item) => Number(item.value) > 0) ? (
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 mb-2">
                    <Award className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Data Prestasi Kosong</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Belum ada data prestasi tercatat periode ini.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prestasiDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {prestasiDistribution.map((entry, index) => (
                        <Cell
                          key={`${entry.name}-${index}`}
                          fill={entry.color || ['#0E5C44', '#3FBF75', '#F59E0B', '#8B5CF6', '#EF4444'][index % 5]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Cross-Unit Comparison & Performance Ranking */}
      <motion.section variants={itemVariants} id="kinerja-unit-pendidikan" className="space-y-3 scroll-mt-6">
        <SectionHeader
          icon={School}
          title="Perbandingan Kinerja Unit Pendidikan"
          subtitle="Daftar unit pendidikan beserta statistik jumlah siswa, guru, pegawai, dan rombel"
          badge="15 Unit"
          actions={
            <AppButton
              variant="outline"
              size="sm"
              icon={Building2}
              onClick={() => navigate('/dashboard/yayasan/unit-pendidikan')}
            >
              Lihat Seluruh Unit
            </AppButton>
          }
        />

        {/* Filter Selection Bar for Card Unit Types */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border-2 border-emerald-500/25 bg-gradient-to-r from-emerald-50/30 via-white to-teal-50/20 p-3.5 shadow-xs dark:border-emerald-800/60 dark:bg-[#1B2433]">
          {/* Category Filter Pills (Desktop & Tablet) */}
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className="text-xs font-black text-slate-500 mr-1 hidden sm:inline-flex items-center gap-1 dark:text-slate-400">
              <Filter className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Jenis Unit:
            </span>
            {availableFilterCategories.map((cat) => {
              const count = categoryCounts[cat.id] || 0
              const isActive = cardUnitFilter === cat.id
              const catColors = CATEGORY_COLOR_MAP[cat.id] || CATEGORY_COLOR_MAP.all
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCardUnitFilter(cat.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${isActive
                    ? `${catColors.active} scale-[1.03] shadow-xs`
                    : `${catColors.inactive} hover:scale-[1.02]`
                    }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${isActive
                      ? catColors.countActive
                      : catColors.countInactive
                      }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Select Dropdown (Mobile) & Counter */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <div className="w-48 sm:hidden">
              <HeroUiFilterSelect
                value={cardUnitFilter}
                onChange={(val) => setCardUnitFilter(val || 'all')}
                options={mobileCategoryOptions}
                placeholder="Kategori Unit..."
                icon={Filter}
                popoverWidth="w-56"
                size="sm"
              />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Menampilkan <strong className="font-extrabold text-emerald-800 dark:text-emerald-300">{filteredUnitSummaries.length}</strong> dari {unitSummaries.length} unit
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredUnitSummaries.map((row, idx) => {
            const palette = PASTEL_PALETTES[idx % PASTEL_PALETTES.length]
            const shortBadge = getShortUnitBadgeLabel(row)
            const fullBadge = row.jenis_unit || row.level || 'Unit'
            const avatarCode = (row.code || getUnitCategoryKey(row) || 'UN').substring(0, 4).toUpperCase()

            return (
              <button
                key={row.id}
                type="button"
                onClick={() => handleOpenUnitDetail(row)}
                className="group flex items-center justify-between gap-3 rounded-2xl border-2 border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-200 hover:scale-[1.02] hover:shadow-md hover:border-emerald-400 dark:border-slate-800 dark:bg-[#1B2433] text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border ${palette.bg} ${palette.text} ${palette.border} font-black text-xs transition-transform duration-200 group-hover:scale-110 shadow-xs`}>
                    {avatarCode}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4
                      className="font-extrabold text-xs text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition"
                      title={row.name}
                    >
                      {row.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                      {formatNumber(row.siswa_aktif_count ?? row.siswa_count ?? 0)} Siswa • {formatNumber(row.guru_count || 0)} Guru
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 max-w-[95px] sm:max-w-[110px] truncate rounded-lg px-2 py-1 text-[10px] font-extrabold ${palette.badge}`}
                  title={fullBadge}
                >
                  {shortBadge}
                </span>
              </button>
            )
          })}
          {!filteredUnitSummaries.length && (
            <div className="col-span-full py-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tidak ada unit pendidikan pada jenis unit ini.</p>
              <button
                type="button"
                onClick={() => setCardUnitFilter('all')}
                className="mt-2 text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400 cursor-pointer"
              >
                Tampilkan Semua Unit
              </button>
            </div>
          )}
        </div>
      </motion.section>

      {/* Tata Kelola Kedisiplinan & Critical Watchlist Yayasan */}
      <motion.section variants={itemVariants} className="mt-8">
        <FoundationDisciplineExecutiveSection />
      </motion.section>

      {/* Modal Quick View KPI (Data PostgreSQL Real) */}
      <ModalErrorBoundary onClose={() => setActiveModal(null)}>
        <KpiQuickViewModal
          type={activeModal}
          isOpen={Boolean(activeModal)}
          onClose={() => setActiveModal(null)}
        />
      </ModalErrorBoundary>

      {/* Canonical Detail Drawer Slide-over */}
      <KpiDetailDrawer
        type={detailDrawer.type}
        id={detailDrawer.id}
        isOpen={detailDrawer.isOpen}
        onClose={() => setDetailDrawer({ isOpen: false, type: null, id: null })}
      />

      {/* Smart Floating Scroll Navigator */}
      <SmartScrollFab targetId="kinerja-unit-pendidikan" downTooltip="Langsung ke Kinerja Unit" />
    </motion.div>
    </PageContainer>
  )
}

export default FoundationDashboardPage
