import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  FileSpreadsheet,
  BarChart2,
  UserCheck,
  Activity,
} from 'lucide-react'

import { useAuthStore } from '../../stores/authStore'
import { isParentRole, isStudentRole } from '../../auth/portalResolver'

export function TahfizhSubNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []
  const userRoles = Array.isArray(roles) ? roles.map((r) => (typeof r === 'string' ? r : r?.name || '')) : []
  const isTeacher = userRoles.some((r) => /guru|musyrif|wali_kelas/i.test(r))
  const isParent = isParentRole(roles)
  const isStudent = isStudentRole(roles)

  // Satu bahasa gradient vivid (§H.6) — aktif hanya ber-ring + aria-current.
  const navItems = [
    {
      id: '/dashboard/tahfizh',
      path: '/dashboard/tahfizh',
      label: 'Setoran Tahfizh',
      icon: BookOpen,
      end: true,
      classes: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40',
    },
    {
      id: '/dashboard/tahfizh/rekapan',
      path: '/dashboard/tahfizh/rekapan',
      label: 'Laporan Rekapan',
      icon: FileSpreadsheet,
      classes: 'bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white border border-sky-300/40',
    },
    ...(!isTeacher ? [
      {
        id: '/dashboard/laporan-tahfizh',
        path: '/dashboard/laporan-tahfizh',
        label: 'Laporan Tahfizh',
        icon: BarChart2,
        classes: 'bg-gradient-to-br from-violet-500 via-violet-600 to-purple-700 text-white border border-violet-300/40',
      },
    ] : []),
    {
      id: '/dashboard/guru-tahfizh',
      path: '/dashboard/guru-tahfizh',
      label: 'Dashboard Guru',
      icon: UserCheck,
      classes: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border border-indigo-300/40',
    },
    ...(!(isParent || isStudent) ? [
      {
        id: '/dashboard/monitoring-tahfizh-ibadah-non-pesantren',
        path: '/dashboard/monitoring-tahfizh-ibadah-non-pesantren',
        label: 'Monitor Non-Ponpes',
        icon: Activity,
        classes: 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white border border-amber-300/40',
      },
    ] : []),
  ]

  return (
    <nav className="mb-5 rounded-[22px] border-2 border-emerald-300 bg-white p-3.5 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433]" aria-label="Navigasi Kontekstual Tahfizh">
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.end
            ? pathname === item.path
            : pathname === item.path || pathname.startsWith(`${item.path}/`)

          return (
            <motion.button
              key={item.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all duration-200 cursor-pointer hover:scale-[1.03] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${item.classes} ${
                isActive ? 'ring-2 ring-offset-2 ring-slate-400/70 dark:ring-slate-500 dark:ring-offset-slate-900' : ''
              }`}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}

export default TahfizhSubNav
