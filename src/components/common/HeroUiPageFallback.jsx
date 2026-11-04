import React from 'react'
import { motion } from 'framer-motion'
import { Card as HeroCard, Spinner as HeroSpinner, Chip as HeroChip, Skeleton as HeroSkeleton } from '@heroui/react'
import { Sparkles, Layers } from 'lucide-react'

/**
 * HeroUiPageFallback
 * Canonical Suspense fallback component for lazy-loaded route chunks powered by HeroUI.
 *
 * Capabilities:
 *  - Premium HeroCard container with emerald accent border & radial ambient glow
 *  - 3D Squircle badge with HeroUI Spinner
 *  - HeroUI Status Chip & descriptive feedback
 *  - HeroUI Skeleton lines to prevent jarring layout shifts
 *  - Strictly HeroUI & Tailwind (no TailGrids)
 */
export default function HeroUiPageFallback({
  title = 'Menyiapkan Halaman...',
  message = 'Sedang memuat modul dan menyinkronkan data tampilan sistem.',
}) {
  return (
    <div className="relative min-h-[50vh] w-full flex items-center justify-center p-4 sm:p-8 overflow-hidden">
      {/* Ambient Radial Glow */}
      <div className="pointer-events-none absolute -top-12 -left-12 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-teal-500/15 blur-3xl animate-pulse" />

      {/* HeroUI Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <HeroCard className="relative overflow-hidden rounded-[26px] border border-emerald-500/25 bg-white/95 dark:bg-[#1B2433]/95 p-0 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
          {/* Top Emerald Gradient Accent Stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 animate-pulse" />

          <div className="p-6 sm:p-7 flex flex-col items-center text-center">
            {/* 3D Squircle Icon Badge with HeroUI Spinner */}
            <div className="relative mb-4 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white shadow-xl shadow-emerald-600/30 border border-emerald-300/40">
                <HeroSpinner size="md" color="white" />
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-[#1B2433] shadow-md border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>

            {/* HeroUI Status Chip */}
            <HeroChip
              color="success"
              variant="flat"
              size="sm"
              className="mb-2.5 font-extrabold uppercase tracking-wider text-[10px] border border-emerald-300/50 dark:border-emerald-700/50"
            >
              Memuat Modul
            </HeroChip>

            {/* Title & Description */}
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              {message}
            </p>

            {/* Shimmer Placeholder Lines using HeroUI Skeleton */}
            <div className="mt-6 w-full space-y-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3.5 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <HeroSkeleton className="h-2.5 w-2.5 rounded-full bg-emerald-500/40" />
                <HeroSkeleton className="h-2.5 w-4/5 rounded-md bg-emerald-100/70 dark:bg-emerald-950/50" />
              </div>
              <div className="flex items-center gap-2">
                <HeroSkeleton className="h-2.5 w-2.5 rounded-full bg-teal-500/40" />
                <HeroSkeleton className="h-2.5 w-3/5 rounded-md bg-emerald-100/50 dark:bg-emerald-950/40" />
              </div>
            </div>
          </div>
        </HeroCard>
      </motion.div>
    </div>
  )
}
