import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileSpreadsheet,
  Target,
  CalendarDays,
  FileCode2,
  BookmarkPlus,
  UserCheck,
  ShieldCheck,
} from 'lucide-react'

import { useAuthStore } from '../../stores/authStore'
import { SquircleActionButton } from '../master-data'

export function MutabaahSubNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []
  const isTU = roles.some((r) => typeof r === 'string' && /tata usaha|\btu\b/i.test(r))

  // Varian squircle kanonis §H.5 — aktif ditandai ring + aria-current.
  const navItems = [
    {
      id: '/dashboard/mutabaah',
      path: '/dashboard/mutabaah',
      label: 'Dashboard',
      icon: LayoutDashboard,
      variant: 'import',
      end: true,
    },
    ...(!isTU
      ? [
          {
            id: '/dashboard/mutabaah/rekap',
            path: '/dashboard/mutabaah/rekap',
            label: 'Rekap',
            icon: FileSpreadsheet,
            variant: 'primary',
          },
        ]
      : []),
    {
      id: '/dashboard/mutabaah/target-evaluasi',
      path: '/dashboard/mutabaah/target-evaluasi',
      label: 'Target & Evaluasi',
      icon: Target,
      variant: 'violet',
    },
    {
      id: '/dashboard/mutabaah/rincian-agenda',
      path: '/dashboard/mutabaah/rincian-agenda',
      label: 'Agenda TU',
      icon: CalendarDays,
      variant: 'edit',
    },
    {
      id: '/dashboard/mutabaah/template-agenda',
      path: '/dashboard/mutabaah/template-agenda',
      label: 'Template Agenda',
      icon: FileCode2,
      variant: 'cyan',
    },
    {
      id: '/dashboard/mutabaah/assign-template',
      path: '/dashboard/mutabaah/assign-template',
      label: 'Assign Template',
      icon: BookmarkPlus,
      variant: 'delete',
    },
    {
      id: '/dashboard/mutabaah/assign-pembimbing',
      path: '/dashboard/mutabaah/assign-pembimbing',
      label: 'Assign Pembimbing',
      icon: UserCheck,
      variant: 'view',
    },
    {
      id: '/dashboard/mutabaah/monitoring-orang-tua',
      path: '/dashboard/mutabaah/monitoring-orang-tua',
      label: 'Monitoring Ortu',
      icon: ShieldCheck,
      variant: 'teal',
    },
  ]

  return (
    <nav className="relative mb-6 rounded-[22px] border-2 border-emerald-300 bg-white p-3.5 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433]" aria-label="Navigasi Kontekstual Mutaba'ah">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22px]" aria-hidden="true">
        <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
      </div>
      <div className="relative z-10 flex items-center gap-1.5 sm:gap-2.5 flex-wrap shrink-0 justify-start">
        {navItems.map((item) => {
            const isActive = item.end ? pathname === item.path : pathname.startsWith(item.path)
            return (
              <SquircleActionButton
                key={item.id}
                variant={item.variant}
                icon={item.icon}
                label={item.label}
                onClick={() => navigate(item.path)}
                aria-current={isActive ? 'page' : undefined}
                className={isActive ? 'ring-2 ring-offset-2 ring-slate-400/70 dark:ring-slate-500 dark:ring-offset-slate-900' : undefined}
              />
            )
          })}
        </div>
    </nav>
  )
}

export default MutabaahSubNav
