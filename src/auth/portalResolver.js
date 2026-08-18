const PORTAL_ROUTES = new Set([
  '/dashboard',
  '/dashboard/pemantauan',
  '/dashboard/yayasan',
  '/dashboard/divisi-pendidikan',
  '/dashboard/kepala-sekolah',
  '/dashboard/waka-kurikulum',
  '/dashboard/waka-kesiswaan',
  '/dashboard/tata-usaha',
  '/dashboard/wali-kelas',
  '/dashboard/guru-tahfizh',
  '/dashboard/musyrif',
  '/dashboard/guru-bk',
  '/dashboard/operator',
  '/portal-guru',
  '/portal-orangtua',
  '/portal-siswa',
  '/portal/alumni',
])

const ROLE_ROUTES = [
  { roles: ['Super Admin', 'Superadmin', 'super_admin'], route: '/dashboard' },
  { roles: ['Admin'], route: '/dashboard/pemantauan' },
  { roles: ['Yayasan', 'Ketua Yayasan', 'Pengurus Yayasan', 'Sekretaris Yayasan', 'Bendahara Yayasan', 'ketua_yayasan', 'pengurus_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan'], route: '/dashboard/yayasan' },
  { roles: ['Kepala Bidang Pendidikan', 'Divisi Pendidikan', 'Divisi Kurikulum', 'Divisi Kesiswaan', 'Divisi Bahasa', 'Divisi Program Khusus', 'divisi_pendidikan'], route: '/dashboard/divisi-pendidikan' },
  { roles: ['Kepala Sekolah', 'kepala_sekolah', 'kepsek'], route: '/dashboard/kepala-sekolah' },
  { roles: ['Wakil Kepala Sekolah', 'Wakil Kurikulum', 'Waka Kurikulum', 'waka_kurikulum'], route: '/dashboard/waka-kurikulum' },
  { roles: ['Wakil Kesiswaan', 'Waka Kesiswaan', 'waka_kesiswaan'], route: '/dashboard/waka-kesiswaan' },
  { roles: ['Operator', 'operator'], route: '/dashboard/operator' },
  { roles: ['Tata Usaha', 'TU', 'tu', 'tata_usaha'], route: '/dashboard/tata-usaha' },
  { roles: ['Wali Kelas', 'walas', 'wali_kelas'], route: '/dashboard/wali-kelas' },
  { roles: ['Guru Tahfizh', 'guru_tahfizh'], route: '/dashboard/guru-tahfizh' },
  { roles: ['Musyrif', 'musyrif', 'Musyrifah', 'Musyrif / Musyrifah'], route: '/dashboard/musyrif' },
  { roles: ['Guru BK', 'guru_bk'], route: '/dashboard/guru-bk' },
  { roles: ['Guru', 'guru', 'Guru Mata Pelajaran', 'guru_mata_pelajaran', 'Guru PAI', 'Pembimbing'], route: '/portal-guru/workspace' },
  { roles: ['Orang Tua', 'orang_tua', 'Orangtua', 'Wali Murid', 'parent'], route: '/portal-orangtua' },
  { roles: ['Siswa', 'siswa', 'student'], route: '/portal-siswa' },
  { roles: ['Alumni', 'alumni'], route: '/portal/alumni' },
]

export const normalizeRole = (role) => {
  if (!role) return ''
  if (typeof role === 'object') {
    role = role.name || role.nama || role.role || role.guard_name || ''
  }
  return String(role).toLowerCase().replace(/[\s_-]+/g, '')
}

export const hasAnyRole = (roles = [], allowedRoles = []) => {
  const current = roles.map(normalizeRole)
  return allowedRoles.some((role) => current.includes(normalizeRole(role)))
}

export const resolveDefaultPortal = (source = {}) => {
  const user = source.user?.data || source.user || source
  const explicitRoute = source.default_redirect || user.default_redirect

  if (PORTAL_ROUTES.has(explicitRoute)) return explicitRoute

  const roles = Array.isArray(user.roles) ? user.roles : []
  return ROLE_ROUTES.find(({ roles: allowedRoles }) => hasAnyRole(roles, allowedRoles))?.route || '/dashboard'
}

export const isTeacherRole = (roles = []) => hasAnyRole(roles, [
  'Guru', 'Guru Mata Pelajaran', 'Guru PAI', 'Pembimbing', 'Wali Kelas',
  'Guru Tahfizh', 'Guru BK', 'Musyrif', 'Musyrifah', 'Musyrif / Musyrifah',
])

export const isParentRole = (roles = []) => hasAnyRole(roles, ['Orang Tua', 'orang_tua', 'Orangtua', 'Wali Murid', 'parent'])

export const isStudentRole = (roles = []) => hasAnyRole(roles, ['Siswa', 'siswa', 'student'])
