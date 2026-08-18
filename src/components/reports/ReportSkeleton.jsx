import React from 'react'

export function ReportSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      {/* Filter skeleton */}
      <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      {/* KPI grid skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
      {/* Table skeleton */}
      <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
    </div>
  )
}
