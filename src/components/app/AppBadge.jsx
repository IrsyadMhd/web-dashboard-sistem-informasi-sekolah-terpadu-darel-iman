import React from 'react'
import { Badge } from '../ui/badge'
import { cn } from '../../lib/utils'

const badgeVariants = {
  primary: 'bg-[#0E5C44]/10 text-[#0E5C44] border-[#0E5C44]/20 font-bold dark:bg-[#3FBF75]/20 dark:text-[#3FBF75] dark:border-[#3FBF75]/30',
  secondary: 'bg-slate-100 text-slate-700 border-slate-200/80 font-semibold dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  success: 'bg-[#0E5C44]/10 text-[#0E5C44] border-[#0E5C44]/20 font-bold dark:bg-[#3FBF75]/20 dark:text-[#3FBF75] dark:border-[#3FBF75]/30',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/80 font-bold dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/80 font-bold dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80',
  info: 'bg-sky-50 text-sky-700 border-sky-200/80 font-bold dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/80',
  purple: 'bg-violet-50 text-violet-700 border-violet-200/80 font-bold dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800/80',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200 font-semibold dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  outline: 'bg-transparent text-slate-600 border-slate-300/80 font-semibold dark:text-slate-300 dark:border-slate-700',
}

const dotColors = {
  primary: 'bg-[#0E5C44] dark:bg-[#3FBF75]',
  secondary: 'bg-slate-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  purple: 'bg-violet-500',
  neutral: 'bg-slate-400',
  outline: 'bg-slate-400',
}

export function getStatusVariant(status) {
  const normalized = String(status ?? '').toLowerCase().replace(/[_-]/g, ' ')
  if (['active', 'aktif', 'success', 'paid', 'lunas', 'hadir', 'approved', 'disetujui'].includes(normalized)) return 'success'
  if (['pending', 'menunggu', 'proses', 'in progress', 'draft'].includes(normalized)) return 'warning'
  if (['inactive', 'nonaktif', 'failed', 'gagal', 'rejected', 'ditolak', 'absent', 'alpa'].includes(normalized)) return 'danger'
  if (['info', 'informasi'].includes(normalized)) return 'info'
  return 'secondary'
}

/**
 * AppBadge - canonical badge.
 * variant: primary | secondary | success | warning | danger | info | purple | neutral | outline
 * dot: menampilkan titik status di depan label
 */
export default function AppBadge({ variant, status, dot = false, className = '', children, ...props }) {
  const resolvedVariant = variant || (status ? getStatusVariant(status) : 'secondary')
  return (
    <Badge className={cn(badgeVariants[resolvedVariant], className)} {...props}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[resolvedVariant] || dotColors.secondary)} />}
      {children}
    </Badge>
  )
}
