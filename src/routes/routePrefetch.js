/**
 * Route Prefetcher Service
 * Mengunduh (pre-fetch) chunk modul lazy-loaded secara asynchronous saat pengguna
 * melakukan hover atau fokus pada tautan navigasi (NavLink) di sidebar/navbar.
 * Ini melenyapkan jeda kompilasi/unduh saat pengguna mengklik menu,
 * menghasilkan perpindahan rute instan (0ms perceived latency).
 */

const PREFETCH_MAP = {
  '/dashboard': () => import('../pages/DashboardPage'),
  '/dashboard/monitoring-divisi': () => import('../pages/MonitoringDivisiPage'),
  '/dashboard/students': () => import('../pages/StudentsPage'),
  '/dashboard/master/siswa': () => import('../pages/StudentsPage'),
  '/dashboard/master/unit-pendidikan': () => import('../pages/EducationUnitsPage'),
  '/dashboard/master/pegawai': () => import('../pages/EmployeesPage'),
  '/dashboard/employees': () => import('../pages/EmployeesPage'),
  '/dashboard/master/guru': () => import('../pages/EmployeesPage'),
  '/dashboard/attendance': () => import('../pages/AttendancePage'),
  '/absensi/laporan': () => import('../pages/attendance/AttendanceReportPage'),
  '/dashboard/laporan-absensi': () => import('../pages/LaporanAbsensiPage'),
  '/dashboard/laporan-siswa': () => import('../pages/LaporanSiswaPage'),
  '/dashboard/rekap-absensi-gerbang': () => import('../pages/RekapAbsensiGerbangPage'),
  '/dashboard/akademik': () => import('../pages/AcademicPage'),
  '/dashboard/akademik/jadwal': () => import('../pages/MasterSchedulePage'),
  '/dashboard/akademik/kelas': () => import('../pages/MasterKelasPage'),
  '/dashboard/pengaturan': () => import('../pages/PengaturanPage'),
  '/dashboard/profil-akun': () => import('../pages/UserProfileManagementPage'),
  '/dashboard/yayasan': () => import('../pages/MultiRoleDashboardPage'),
  '/portal-guru/workspace': () => import('../pages/TeacherTeachingWorkspacePage'),
  '/portal-siswa': () => import('../pages/StudentDataPage'),
  '/portal-orangtua': () => import('../pages/ParentsPage'),
}

const prefetchedPaths = new Set()

/**
 * Prefetch target route component chunk into browser memory.
 * @param {string} path 
 */
export function prefetchRoute(path) {
  if (!path || typeof path !== 'string') return
  const cleanPath = path.split('?')[0].split('#')[0].replace(/\/$/, '') || '/'

  if (prefetchedPaths.has(cleanPath)) return

  const loader = PREFETCH_MAP[cleanPath]
  if (typeof loader === 'function') {
    prefetchedPaths.add(cleanPath)
    loader().catch(() => {
      // Ignore network prefetch error, normal navigation will retry
      prefetchedPaths.delete(cleanPath)
    })
  }
}

export default prefetchRoute
