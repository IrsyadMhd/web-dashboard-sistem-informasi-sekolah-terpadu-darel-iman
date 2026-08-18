import React from 'react'
import PermissionGuard from './PermissionGuard'
import { AppButton, SectionCard } from '../app'

export default function QuickActionCard({
  title = 'Aksi Cepat',
  actions = []
}) {
  if (actions.length === 0) return null

  const visibleDesktopColumns = Math.min(actions.length, 6)
  const desktopColumnsClass = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
  }[visibleDesktopColumns]

  return (
    <SectionCard title={title} contentClassName={`grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 ${desktopColumnsClass}`}>
        {actions.map((act, idx) => {
          const ActionIcon = act.icon
          const content = (
            <AppButton
              key={idx}
              type="button"
              onClick={act.onClick}
              variant="outline"
              className="h-auto min-h-[76px] flex-col rounded-xl border-slate-200/80 bg-slate-50/50 p-2.5 text-center hover:border-emerald-200 hover:bg-emerald-50/60 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40"
            >
              {ActionIcon && (
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#0E5C44] shadow-xs dark:bg-slate-800 dark:text-emerald-400">
                    <ActionIcon className="h-4 w-4" />
                  </span>
                )}
              <span className="line-clamp-2 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                {act.label}
              </span>
            </AppButton>
          )

          if (act.permissions && act.permissions.length > 0) {
            return (
              <PermissionGuard key={idx} any={act.permissions}>
                {content}
              </PermissionGuard>
            )
          }

          return content
        })}
    </SectionCard>
  )
}
