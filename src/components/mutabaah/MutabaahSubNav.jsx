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
import { AppTabs } from '../app'

import { useAuthStore } from '../../stores/authStore'

export function MutabaahSubNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []
  const isTU = roles.some((r) => typeof r === 'string' && /tata usaha|\btu\b/i.test(r))

  const navItems = [
    { id: '/dashboard/mutabaah', path: '/dashboard/mutabaah', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    ...(!isTU ? [{ id: '/dashboard/mutabaah/rekap', path: '/dashboard/mutabaah/rekap', label: 'Rekap', icon: <FileSpreadsheet className="h-4 w-4" /> }] : []),
    { id: '/dashboard/mutabaah/target-evaluasi', path: '/dashboard/mutabaah/target-evaluasi', label: 'Target & Evaluasi', icon: <Target className="h-4 w-4" /> },
    { id: '/dashboard/mutabaah/rincian-agenda', path: '/dashboard/mutabaah/rincian-agenda', label: 'Agenda TU', icon: <CalendarDays className="h-4 w-4" /> },
    { id: '/dashboard/mutabaah/template-agenda', path: '/dashboard/mutabaah/template-agenda', label: 'Template Agenda', icon: <FileCode2 className="h-4 w-4" /> },
    { id: '/dashboard/mutabaah/assign-template', path: '/dashboard/mutabaah/assign-template', label: 'Assign Template', icon: <BookmarkPlus className="h-4 w-4" /> },
    { id: '/dashboard/mutabaah/assign-pembimbing', path: '/dashboard/mutabaah/assign-pembimbing', label: 'Assign Pembimbing', icon: <UserCheck className="h-4 w-4" /> },
    { id: '/dashboard/mutabaah/monitoring-orang-tua', path: '/dashboard/mutabaah/monitoring-orang-tua', label: 'Monitoring Ortu', icon: <ShieldCheck className="h-4 w-4" /> },
  ]

  const activeItem = navItems.find((item) => item.end ? pathname === item.path : pathname.startsWith(item.path))

  return (
    <nav className="mb-6 overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-[#1B2433]" aria-label="Navigasi Kontekstual Mutaba'ah">
      <AppTabs
        tabs={navItems}
        activeTab={activeItem?.id || navItems[0].id}
        onChange={(path) => navigate(path)}
        className="border-0 px-2"
      />
    </nav>
  )
}

export default MutabaahSubNav
