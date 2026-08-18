import React from 'react'
import { AppSkeleton } from '../app'

export default function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <AppSkeleton variant="line" rows={4} className="h-40 rounded-[24px] bg-slate-200 p-6 dark:bg-slate-800" />

      {/* Filter skeleton */}
      <AppSkeleton variant="line" rows={2} className="h-14 rounded-[18px] bg-slate-200 p-4 dark:bg-slate-800" />

      {/* KPI grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AppSkeleton variant="card" />
        <AppSkeleton variant="card" />
        <AppSkeleton variant="card" />
        <AppSkeleton variant="card" />
      </div>

      {/* Chart grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppSkeleton variant="table" rows={4} cols={3} />
        <AppSkeleton variant="table" rows={4} cols={3} />
      </div>

      {/* Table skeleton */}
      <AppSkeleton variant="table" rows={5} cols={5} />
    </div>
  )
}
