import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  Database,
  BookOpen,
  FileText,
  Settings,
  Sparkles,
  CalendarCheck,
  BookHeart,
  BookMarked,
  Users,
  Building2,
  CalendarDays,
  ShieldCheck,
  CreditCard,
  Layers,
  Calendar,
  User,
  Briefcase,
  GraduationCap,
  Activity,
  Compass,
  UserCheck,
  Heart,
  Clock,
  CheckSquare,
  Info,
  Home,
  Target,
  FileSpreadsheet,
  FileQuestion,
} from 'lucide-react'
import { navigationService } from '../services/navigationService'
import { useAuthStore } from '../stores/authStore'

const ICON_MAP = {
  LayoutDashboard,
  Database,
  BookOpen,
  FileText,
  Settings,
  Sparkles,
  CalendarCheck,
  BookHeart,
  BookMarked,
  Users,
  Building2,
  CalendarDays,
  ShieldCheck,
  CreditCard,
  Layers,
  Calendar,
  User,
  Briefcase,
  GraduationCap,
  Activity,
  Compass,
  UserCheck,
  Heart,
  Clock,
  CheckSquare,
  Info,
  Home,
  Target,
  FileSpreadsheet,
  FileQuestion,
}

/**
 * Helper untuk me-resolve komponen Lucide Icon berdasarkan string icon name dari database.
 * Jika nama icon tidak ditemukan, fallback ke Layers.
 *
 * @param {string} iconName
 * @returns {import('react').ComponentType}
 */
export function resolveSidebarIcon(iconName) {
  if (!iconName) return Layers
  return ICON_MAP[iconName] || Layers
}

/**
 * Hook TanStack React Query untuk memuat data dynamic navigation modules.
 * Menggunakan platform 'web' secara eksplisit.
 *
 * @returns {import('@tanstack/react-query').UseQueryResult<{ user: object, modules: Array }>}
 */
export function useNavigationModules() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)

  return useQuery({
    queryKey: ['navigation-modules', 'web', user?.id || 'guest'],
    queryFn: () => navigationService.getModules('web'),
    enabled: Boolean(isAuthenticated && token),
    staleTime: 5 * 60 * 1000, // 5 menit
    retry: 1,
  })
}

export default useNavigationModules
