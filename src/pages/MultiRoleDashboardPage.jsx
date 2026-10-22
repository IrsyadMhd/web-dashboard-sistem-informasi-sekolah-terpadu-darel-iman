import React from 'react'
import { Navigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import SuperAdminDashboardPage from './SuperAdminDashboardPage'
import TeacherMonitoringDashboardPage from './TeacherMonitoringDashboardPage'
import ParentDashboardPage from './ParentDashboardPage'
import { getUserRoleLevel, ROLE_LEVELS, resolveDefaultPortal } from '../auth/portalResolver'

export default function MultiRoleDashboardPage() {
  const user = useAuthStore((state) => state.user)
  const permissions = user?.permissions || []
  const userLevel = getUserRoleLevel(user)

  // Tingkat 1: Super Admin & Admin Sistem
  if (userLevel === ROLE_LEVELS.ADMIN_SISTEM) {
    return <SuperAdminDashboardPage />
  }

  // Tingkat 2: Yayasan / Pimpinan
  const isFoundationUser =
    userLevel === ROLE_LEVELS.PIMPINAN_YAYASAN ||
    permissions.includes('foundation.dashboard.view')

  if (isFoundationUser) {
    return <Navigate to="/dashboard/yayasan" replace />
  }

  // Tingkat 8: Siswa
  if (userLevel === ROLE_LEVELS.SISWA) {
    return <Navigate to="/portal-siswa" replace />
  }

  // Tingkat 7: Orang Tua
  if (userLevel === ROLE_LEVELS.ORANG_TUA) {
    return <ParentDashboardPage />
  }

  // Tingkat 4: Kepala Sekolah
  if (userLevel === ROLE_LEVELS.KEPALA_SEKOLAH || permissions.includes('dashboard.kepala-sekolah.view')) {
    return <Navigate to="/dashboard/kepala-sekolah" replace />
  }

  // Tingkat 5: Tenaga Pendidik / Guru
  if (userLevel === ROLE_LEVELS.GURU) {
    return <TeacherMonitoringDashboardPage />
  }

  const resolvedRoute = resolveDefaultPortal(user)
  if (resolvedRoute !== '/dashboard') {
    return <Navigate to={resolvedRoute} replace />
  }

  // Admin dan role tanpa dashboard khusus: halaman Pemantauan (dashboard.pemantauan.lihat).
  // Bila tidak punya akses dashboard apa pun, tampilkan pesan jelas (bukan dashboard rusak).
  if (permissions.includes('dashboard.pemantauan.lihat')) {
    return <Navigate to="/dashboard/pemantauan" replace />
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <ShieldAlert className="h-10 w-10 text-amber-500" />
      <h1 className="text-lg font-semibold text-slate-800">Akses Dashboard Tidak Tersedia</h1>
      <p className="max-w-md text-sm text-slate-500">
        Akun Anda belum memiliki hak akses ke dashboard mana pun. Hubungi Super Admin untuk
        penetapan role/permission.
      </p>
    </div>
  )
}
