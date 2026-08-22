import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  FileSpreadsheet,
  Target,
  CalendarDays,
  FileCode2,
  BookmarkPlus,
  UserCheck,
  ShieldCheck,
  BookHeart,
} from 'lucide-react'

import { useAuthStore } from '../../stores/authStore'

export function MutabaahSubNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []
  const isTU = roles.some((r) => typeof r === 'string' && /tata usaha|\btu\b/i.test(r))

  const navItems = [
    {
      id: '/dashboard/mutabaah',
      path: '/dashboard/mutabaah',
      label: 'Dashboard',
      icon: LayoutDashboard,
      end: true,
      activeColor: 'bg-sky-500 text-white shadow-md shadow-sky-500/30',
      inactiveColor: 'bg-sky-100/90 text-sky-600 hover:bg-sky-500 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-500 dark:hover:text-white hover:shadow-md hover:shadow-sky-500/30',
    },
    ...(!isTU
      ? [
          {
            id: '/dashboard/mutabaah/rekap',
            path: '/dashboard/mutabaah/rekap',
            label: 'Rekap',
            icon: FileSpreadsheet,
            activeColor: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30',
            inactiveColor: 'bg-emerald-100/90 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white hover:shadow-md hover:shadow-emerald-600/30',
          },
        ]
      : []),
    {
      id: '/dashboard/mutabaah/target-evaluasi',
      path: '/dashboard/mutabaah/target-evaluasi',
      label: 'Target & Evaluasi',
      icon: Target,
      activeColor: 'bg-violet-600 text-white shadow-md shadow-violet-600/30',
      inactiveColor: 'bg-violet-100/90 text-violet-600 hover:bg-violet-600 hover:text-white dark:bg-violet-950/60 dark:text-violet-300 dark:hover:bg-violet-600 dark:hover:text-white hover:shadow-md hover:shadow-violet-600/30',
    },
    {
      id: '/dashboard/mutabaah/rincian-agenda',
      path: '/dashboard/mutabaah/rincian-agenda',
      label: 'Agenda TU',
      icon: CalendarDays,
      activeColor: 'bg-amber-500 text-white shadow-md shadow-amber-500/30',
      inactiveColor: 'bg-amber-100/90 text-amber-600 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white hover:shadow-md hover:shadow-amber-500/30',
    },
    {
      id: '/dashboard/mutabaah/template-agenda',
      path: '/dashboard/mutabaah/template-agenda',
      label: 'Template Agenda',
      icon: FileCode2,
      activeColor: 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30',
      inactiveColor: 'bg-cyan-100/90 text-cyan-600 hover:bg-cyan-600 hover:text-white dark:bg-cyan-950/60 dark:text-cyan-300 dark:hover:bg-cyan-600 dark:hover:text-white hover:shadow-md hover:shadow-cyan-600/30',
    },
    {
      id: '/dashboard/mutabaah/assign-template',
      path: '/dashboard/mutabaah/assign-template',
      label: 'Assign Template',
      icon: BookmarkPlus,
      activeColor: 'bg-rose-500 text-white shadow-md shadow-rose-500/30',
      inactiveColor: 'bg-rose-100/90 text-rose-600 hover:bg-rose-500 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-500 dark:hover:text-white hover:shadow-md hover:shadow-rose-500/30',
    },
    {
      id: '/dashboard/mutabaah/assign-pembimbing',
      path: '/dashboard/mutabaah/assign-pembimbing',
      label: 'Assign Pembimbing',
      icon: UserCheck,
      activeColor: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30',
      inactiveColor: 'bg-indigo-100/90 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white hover:shadow-md hover:shadow-indigo-600/30',
    },
    {
      id: '/dashboard/mutabaah/monitoring-orang-tua',
      path: '/dashboard/mutabaah/monitoring-orang-tua',
      label: 'Monitoring Ortu',
      icon: ShieldCheck,
      activeColor: 'bg-teal-600 text-white shadow-md shadow-teal-600/30',
      inactiveColor: 'bg-teal-100/90 text-teal-600 hover:bg-teal-600 hover:text-white dark:bg-teal-950/60 dark:text-teal-300 dark:hover:bg-teal-600 dark:hover:text-white hover:shadow-md hover:shadow-teal-600/30',
    },
  ]

  return (
    <nav className="mb-6 rounded-[18px] border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]" aria-label="Navigasi Kontekstual Mutaba'ah">
      <div className="flex items-center gap-2 flex-wrap shrink-0 justify-end sm:justify-start">
        {navItems.map((item) => {
            const isActive = item.end ? pathname === item.path : pathname.startsWith(item.path)
            const Icon = item.icon
            return (
              <div key={item.id} className="group relative inline-flex">
                <button
                  type="button"
                  onClick={() => navigate(item.path)}
                  title={item.label}
                  aria-label={item.label}
                  className={`
                    flex size-10 items-center justify-center rounded-2xl
                    transition-colors duration-200 cursor-pointer shadow-2xs
                    ${isActive ? item.activeColor : item.inactiveColor}
                  `}
                >
                  <Icon className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  {item.label}
                </div>
              </div>
            )
          })}
        </div>
    </nav>
  )
}

export default MutabaahSubNav
