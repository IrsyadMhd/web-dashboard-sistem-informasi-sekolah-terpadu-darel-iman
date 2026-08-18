import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Database,
  BookOpen,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Search,
  Bell,
  User,
  Layers,
  Plus,
  LogOut,
  Calendar,
  Sparkles,
  Sun,
  Moon,
  CalendarCheck,
  HelpCircle,
  BookHeart,
  BookMarked,
  Users,
  Building2,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { authService } from '../services/authService'
import { api } from '../services/api'
import { educationUnitService } from '../services/educationUnitService'
import { useAuthStore } from '../stores/authStore'
import { usePengaturanStore } from '../stores/pengaturanStore'
import { useUnitStore } from '../stores/unitStore'
import { FAB } from '../components/ui/fab'
import ActiveScheduleNotice from '../components/attendance/ActiveScheduleNotice'
import FloatingChatWidget from '../components/portal/FloatingChatWidget'
import PersonAvatar from '../components/ui/PersonAvatar'
import GlobalSearchModal from '../components/GlobalSearchModal'
import NotificationCenter from '../components/app/NotificationCenter'
import AppBottomNavigation from '../components/app/AppBottomNavigation'
import { isParentRole, isStudentRole, isTeacherRole, resolveDefaultPortal } from '../auth/portalResolver'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/tailgrids/core/dropdown'
import { UserCircle1, Gear1, Exit, Bell1 } from '@tailgrids/icons'

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const setSession = useAuthStore((state) => state.setSession)
  const touchActivity = useAuthStore((state) => state.touchActivity)
  const isSessionValid = useAuthStore((state) => state.isSessionValid)
  const loginTime = useAuthStore((state) => state.loginTime)
  const activeUnit = useUnitStore((state) => state.activeUnit)
  const setActiveUnit = useUnitStore((state) => state.setActiveUnit)
  const pengaturan = usePengaturanStore((state) => state.pengaturan)
  const muatPengaturan = usePengaturanStore((state) => state.muatPengaturan)
  const namaSekolah = pengaturan?.school_name || 'YAYASAN DAR EL - IMAN'
  const roles = Array.isArray(user?.roles) ? user.roles : []
  const permissions = Array.isArray(user?.permissions) ? user.permissions : []
  const hasRole = (...names) => names.some((name) => roles.some((role) => String(role).toLowerCase().replace(/[\s_-]+/g, '') === String(name).toLowerCase().replace(/[\s_-]+/g, '')))
  const can = (...names) => hasRole('Super Admin') || names.some((name) => permissions.includes(name))
  const canViewEducationUnits = can('unit.view', 'unit.view_all', 'foundation.unit.view', 'sistem.master_data')
  const canViewStudents = can('student.view', 'student.view_all', 'kesiswaan.data_lengkap_siswa')
  const canCreateStudent = can('student.create')
  const isPortalUser = isStudentRole(roles) || isParentRole(roles)
  const defaultPortal = resolveDefaultPortal(user || {})

  const [collapsed, setCollapsed] = useState(Boolean(pengaturan?.sidebar_collapsed))
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openSection, setOpenSection] = useState('master-data')
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const [roleAccessOpen, setRoleAccessOpen] = useState(false)
  const [roleAccessLoading, setRoleAccessLoading] = useState('')
  const [impersonating] = useState(() => Boolean(localStorage.getItem('school_erp_superadmin_session')))
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light') return false
    if (saved === 'dark') return true
    return false // Default to Light Mode
  })

  const [dbUnits, setDbUnits] = useState([])
  const [serverNow, setServerNow] = useState(null)

  const muatPengaturanRef = muatPengaturan

  useEffect(() => {
    muatPengaturanRef()
    if (!canViewEducationUnits) {
      setDbUnits([])
      return undefined
    }

    educationUnitService.getAll().then((res) => {
      const list = res?.data || res || []
      if (Array.isArray(list) && list.length > 0) {
        setDbUnits(list.map((u) => ({ id: u.code || u.level || u.id, name: u.name || u.nama })))
      }
    }).catch(() => { })
    return undefined
  }, [muatPengaturanRef, canViewEducationUnits])

  useEffect(() => {
    document.title = pengaturan.application_name || 'Sistem Manajemen Sekolah'
    let favicon = document.querySelector("link[rel~='icon']")
    if (!favicon) {
      favicon = document.createElement('link')
      favicon.rel = 'icon'
      document.head.appendChild(favicon)
    }
    favicon.href = pengaturan.favicon_url || '/favicon.ico'
  }, [pengaturan.application_name, pengaturan.favicon_url])

  useEffect(() => {
    setCollapsed(Boolean(pengaturan.sidebar_collapsed))
  }, [pengaturan.sidebar_collapsed])

  const serverTimeEndpoint = location.pathname.startsWith('/portal-guru')
    ? '/teacher/step04/schedules'
    : location.pathname === '/dashboard/pemantauan' && permissions.includes('teacher_monitoring.view')
      ? '/teacher-monitoring'
      : null

  useEffect(() => {
    let cancelled = false

    if (!serverTimeEndpoint) {
      setServerNow(null)
      return () => {
        cancelled = true
      }
    }

    api.get(serverTimeEndpoint)
      .then((response) => {
        if (!cancelled) setServerNow(response.data?.data?.server_time || null)
      })
      .catch(() => {
        if (!cancelled) setServerNow(null)
      })

    return () => {
      cancelled = true
    }
  }, [serverTimeEndpoint])

  const profileDropdownRef = useRef(null)
  const unitDropdownRef = useRef(null)
  const themeDropdownRef = useRef(null)
  const roleAccessRef = useRef(null)

  // Sync dark mode class on html & body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
      document.documentElement.style.colorScheme = 'dark'
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
      document.documentElement.style.colorScheme = 'light'
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkMode])

  // Listener Aktivitas & Timer Inaktivitas (15 Menit) Sesi
  useEffect(() => {
    let lastCall = 0
    const handleUserActivity = () => {
      const now = Date.now()
      if (now - lastCall > 4000) {
        lastCall = now
        touchActivity()
      }
    }

    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart', 'visibilitychange']
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }))

    const checkInterval = setInterval(() => {
      const sessionStatus = isSessionValid()
      if (!sessionStatus.valid) {
        clearSession()
        const isMismatch = sessionStatus.reason === 'browser_mismatch'
        const title = isMismatch ? 'Sesi Browser Berbeda' : 'Sesi Berakhir'
        const message = isMismatch
          ? 'Status login memerlukan autentikasi baru saat berpindah browser/link. Silakan login kembali.'
          : 'Sesi Anda telah berakhir karena tidak ada aktivitas selama 15 menit. Silakan login kembali.'

        Swal.fire({
          icon: 'warning',
          title,
          text: message,
          confirmButtonColor: '#047857',
        }).then(() => {
          window.location.href = `/masuk?reason=${sessionStatus.reason}`
        })
      }
    }, 10000)

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity))
      clearInterval(checkInterval)
    }
  }, [touchActivity, isSessionValid, clearSession])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleGlobalSearch = () => setIsSearchModalOpen(true)
    window.addEventListener('open-global-search', handleGlobalSearch)
    return () => window.removeEventListener('open-global-search', handleGlobalSearch)
  }, [])
  useEffect(() => {
    const handler = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false)
      }
      if (unitDropdownRef.current && !unitDropdownRef.current.contains(e.target)) {
        setUnitDropdownOpen(false)
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target)) {
        setThemeMenuOpen(false)
      }
      if (roleAccessRef.current && !roleAccessRef.current.contains(e.target)) {
        setRoleAccessOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const namaTampil = user?.name || 'Ketua Yayasan'
  const roleTampil = roles.join(', ') || 'Pengguna'
  const tanggalTampil = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(serverNow ? new Date(serverNow) : new Date())

  const toggleSection = (sectionKey) => {
    setOpenSection((prev) => (prev === sectionKey ? '' : sectionKey))
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch {
      // Abaikan error API jika token sudah expired
    } finally {
      clearSession()
      localStorage.removeItem('school_erp_superadmin_session')
      window.location.href = '/masuk'
    }
  }

  const roleAccessOptions = [
    { label: 'Pengurus Yayasan', role: 'Yayasan' },
    { label: 'Divisi Pendidikan', role: 'Divisi Pendidikan' },
    { label: 'Kepala Sekolah', role: 'Kepala Sekolah' },
    { label: 'Tata Usaha', role: 'Tata Usaha' },
    { label: 'Guru', role: 'Guru' },
    { label: 'Guru Tahfizh', role: 'Guru Tahfizh' },
    { label: 'Musyrif', role: 'Musyrif' },
    { label: 'Orang Tua', role: 'Orang Tua' },
    { label: 'Siswa', role: 'Siswa' },
  ]

  const routeForRole = (role) => {
    return resolveDefaultPortal({ roles: [role] })
  }

  const accessAsRole = async (option) => {
    setRoleAccessLoading(option.role)
    try {
      const currentSession = {
        token: localStorage.getItem('school_erp_token'),
        user,
      }
      const result = await authService.impersonate(option.role)
      const targetUser = result.user?.data || result.user
      if (!result.token || !Array.isArray(targetUser?.roles)) {
        throw new Error('Respons sesi role tidak valid')
      }
      localStorage.setItem('school_erp_superadmin_session', JSON.stringify(currentSession))
      setSession({ token: result.token, user: targetUser })
      // Reload penuh diperlukan agar cache query, permission, dan seluruh outlet
      // dibangun ulang menggunakan token pengguna target.
      window.location.replace(routeForRole(option.role))
    } catch (error) {
      Swal.fire('Akses belum tersedia', error.response?.data?.message || 'Gagal masuk sebagai role tersebut.', 'error')
    } finally {
      setRoleAccessLoading('')
    }
  }

  const returnToSuperAdmin = () => {
    try {
      const original = JSON.parse(localStorage.getItem('school_erp_superadmin_session') || 'null')
      if (!original?.token || !original?.user) throw new Error('Sesi tidak ditemukan')
      setSession(original)
      localStorage.removeItem('school_erp_superadmin_session')
      window.location.replace('/dashboard')
    } catch {
      clearSession()
      localStorage.removeItem('school_erp_superadmin_session')
      window.location.href = '/masuk'
    }
  }

  const daftarUnitOptions = [
    { id: 'SEMUA', name: 'Semua Unit Pendidikan' },
    ...(dbUnits.length > 0 ? dbUnits : [
      { id: 'TK', name: 'TK Islam Terpadu' },
      { id: 'SD', name: 'SD Islam Terpadu' },
      { id: 'SMP', name: 'SMP Islam Terpadu' },
      { id: 'SMA', name: 'SMA Islam Terpadu' },
      { id: 'PONPES', name: 'Pondok Pesantren' },
    ]),
  ]

  const attendanceSubmenus = [
    ...(hasRole('Wali Kelas') && can('attendance.homeroom.dashboard', 'homeroom_attendance.dashboard', 'homeroom_attendance.view') ? [
      { to: '/absensi/dashboard-wali-kelas', label: 'Dashboard Wali Kelas' },
      { to: '/absensi/rekap-kehadiran', label: 'Rekap Kehadiran' },
      { to: '/absensi/verifikasi-izin', label: 'Verifikasi Izin/Sakit' },
      { to: '/absensi/koreksi', label: 'Koreksi Presensi' },
      { to: '/absensi/tindak-lanjut', label: 'Tindak Lanjut Siswa' },
      { to: '/absensi/laporan', label: 'Laporan Rombel' },
    ] : []),
    // Submenu presensi guru telah dikonsolidasikan ke dalam Portal Guru -> Workspace Pembelajaran Guru
    ...(isStudentRole(roles) && can('attendance.student.view_own', 'student_attendance.view_own') ? [
      { to: '/absensi/kehadiran-saya', label: 'Kehadiran Saya' },
      { to: '/absensi/riwayat-saya', label: 'Riwayat Kehadiran' },
    ] : []),
    ...(can('teacher_monitoring.view') ? [
      { to: '/dashboard/pemantauan', label: 'Monitoring Guru Mengajar' },
    ] : []),
    ...(can('divisi.monitoring', 'dashboard.pemantauan.kelola', 'dashboard.pemantauan.lihat') ? [
      { to: '/dashboard/monitoring-divisi', label: 'Input Monitoring Divisi' },
    ] : []),
    ...(!hasRole('Guru') && !hasRole('Guru Tahfizh') && !hasRole('Wali Kelas') && !hasRole('Siswa') ? [
      { to: '/dashboard/absensi-gerbang', label: 'Absensi Gerbang' },
      { to: '/dashboard/absensi-pembelajaran', label: 'Absensi Kelas & MaPel' },
      { to: '/dashboard/absensi-ibadah', label: 'Absensi Ibadah Santri' },
      { to: '/dashboard/absensi-ibadah-siswa', label: 'Absensi Ibadah Siswa' },
      { to: '/dashboard/laporan-absensi', label: 'Rekap Presensi & Laporan' },
    ] : [
      { to: '/dashboard/absensi-pembelajaran', label: 'Absensi Kelas & Mata Pelajaran' },
      { to: '/dashboard/absensi-gerbang', label: 'Absensi Gerbang' },
      { to: '/dashboard/absensi-ibadah', label: 'Absensi Ibadah Santri' },
      { to: '/dashboard/absensi-ibadah-siswa', label: 'Absensi Ibadah Siswa' },
    ]),
  ].filter((item, index, list) => list.findIndex((entry) => entry.to === item.to) === index)

  const isRestrictedFoundationOrPrincipal =
    !hasRole('Super Admin', 'superadmin', 'SuperAdmin') &&
    hasRole(
      'Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan', 'Pengurus Yayasan', 'Pengurus',
      'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek'
    )

  const currentUnitObj = dbUnits.find((u) => u.id === activeUnit || u.name === activeUnit)
  const unitNameToCheck = String(activeUnit || currentUnitObj?.name || user?.education_unit || user?.unit_name || user?.unit || '').toLowerCase()
  const isPesantrenUnit = Boolean(
    user?.is_pesantren ||
    unitNameToCheck.includes('pesantren') ||
    unitNameToCheck.includes('ponpes') ||
    unitNameToCheck.includes('mahad') ||
    unitNameToCheck.includes('asrama')
  )
  const setoranTahfizhMenuLabel = isPesantrenUnit ? 'Setoran Tahfizh Santri' : 'Setoran Tahfizh Siswa'

  const bolehBukaMenu = (to) => {
    if (hasRole('Super Admin')) return true

    if (to.startsWith('/portal-siswa')) return isStudentRole(roles)
    if (to.startsWith('/portal-orangtua')) return isParentRole(roles)
    if (to.startsWith('/portal-guru')) {
      if (isRestrictedFoundationOrPrincipal) return false
      return isTeacherRole(roles)
    }
    if (to.startsWith('/dashboard/musyrif')) {
      if (isRestrictedFoundationOrPrincipal) return false
      return can('dashboard.guru-tahfizh.view')
    }
    if (to === '/dashboard') return can('dashboard.view')
    if (to.startsWith('/dashboard/pemantauan')) return can('dashboard.pemantauan.lihat', 'teacher_monitoring.view')
    if (to.startsWith('/dashboard/monitoring-divisi')) return can('divisi.monitoring', 'dashboard.pemantauan.kelola', 'dashboard.pemantauan.lihat')
    // Data pribadi hanya memberi akses ke profil siswa sendiri di portal,
    // bukan ke master data seluruh siswa.
    if (to === '/dashboard/students') return canViewStudents
    if (to.includes('/students/rombel') || to.includes('/students/kelas')) return can('kesiswaan.kelas_rombel')
    if (to.includes('/students/input')) return canCreateStudent
    if (to.includes('/students/laporan')) return can('report.student.view', 'kesiswaan.laporan_masuk_keluar')
    if (to.includes('/employees') || to.includes('/students/pegawai') || to.includes('/master/pegawai') || to.includes('/master/guru')) {
      return can('employee.view', 'employee.view_all', 'foundation.employee.view')
    }
    if (to.includes('/unit-pendidikan') || to.includes('/master-jenis-unit')) return canViewEducationUnits
    if (to.includes('/master-jabatan') || to.includes('/students/jabatan')) {
      if (
        hasRole('Guru', 'guru', 'Wali Kelas', 'wali_kelas', 'Guru Mapel', 'Guru Tahfizh', 'Guru BK') &&
        !hasRole('Super Admin', 'SuperAdmin', 'superadmin', 'super_admin', 'Admin', 'admin', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'Tata Usaha', 'TU', 'tata_usaha', 'Operator', 'operator', 'Yayasan')
      ) {
        return false
      }
      return can('master.view', 'sistem.master_data')
    }
    if (to.includes('/master-tahun-ajaran')) {
      return can('master.view', 'sistem.master_data')
    }
    if (to.includes('/chat-pegawai')) return can('chat.conversation.view', 'chat.manage')
    if (to.includes('/akademik/nilai-rapor') || to.includes('/lms/penilaian') || to.includes('/lms/rapor')) {
      if (hasRole(
        'Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan', 'Pengurus Yayasan',
        'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah',
        'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan'
      )) {
        return false
      }
      if (hasRole(
        'Super Admin', 'SuperAdmin', 'superadmin', 'super_admin',
        'Admin', 'admin',
        'TU', 'Tata Usaha', 'tata_usaha', 'Operator', 'operator',
        'Guru', 'guru', 'Wali Kelas', 'wali_kelas', 'Guru Mapel', 'Guru Tahfizh', 'Guru BK'
      )) {
        return true
      }
      return false
    }
    if (to.includes('/akademik/pengaturan')) {
      if (
        hasRole(
          'Guru', 'guru', 'Wali Kelas', 'wali_kelas', 'Guru Mapel', 'Guru Tahfizh', 'Guru BK',
          'Musyrif', 'Musyrifah', 'musyrif', 'musyrifah', 'Pengasuh', 'Wali Asrama', 'Pembimbing'
        ) &&
        !hasRole(
          'Super Admin', 'SuperAdmin', 'superadmin', 'super_admin',
          'Admin', 'admin',
          'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah',
          'Divisi Pendidikan', 'divisi_pendidikan'
        )
      ) {
        return false
      }
    }
    if (to.includes('/akademik') || to === '/dashboard/academic') return can('academic.view', 'academic.manage')
    if (to.includes('/lms/penugasan')) return can('kesiswaan.penugasan_siswa')
    if (to.includes('/lms/materi-pembelajaran')) return can('pembelajaran.materi')
    if (to.includes('/lms/kisi-kisi')) return can('pembelajaran.kisi_kisi_ujian')
    if (to.includes('/lms/bank-soal')) return can('pembelajaran.bank_soal')
    if (to.includes('/jadwal-pelajaran')) return can('pembelajaran.jadwal_pelajaran')
    if (to.includes('/master-kurikulum')) return can('pembelajaran.kurikulum.view')
    if (to === '/dashboard/mutabaah/rekap') return can('mutabaah.recap.view', 'mutabaah.report.view', 'mutabaah.report.export')
    if (to === '/dashboard/tahfizh' || to.startsWith('/dashboard/tahfizh')) {
      return (
        hasRole(
          'Super Admin', 'Admin', 'Yayasan', 'Ketua Yayasan', 'Pengurus Yayasan',
          'Sekretaris Yayasan', 'Bendahara Yayasan', 'Divisi Pendidikan', 'Kepala Bidang Pendidikan',
          'Divisi Kurikulum', 'Divisi Kesiswaan', 'Divisi Bahasa', 'Divisi Program Khusus',
          'Kepala Sekolah', 'Wakil Kepala Sekolah', 'Waka Kurikulum', 'Wakil Kurikulum',
          'Waka Kesiswaan', 'Wakil Kesiswaan', 'Tata Usaha', 'TU', 'Operator',
          'Guru', 'Wali Kelas', 'Guru Tahfizh', 'Guru BK', 'Musyrif', 'Musyrifah', 'Siswa', 'Orang Tua'
        ) ||
        can(
          'kesiswaan.kelas_rombel', 'academic.schedule.view', 'sistem.master_data',
          'tahfizh.monitoring_target', 'tahfizh.laporan_target', 'tahfizh.view',
          'tahfizh.deposit.view', 'tahfizh.deposit.create', 'tahfizh.input_setoran_harian',
          'dashboard.guru-tahfizh.view', 'dashboard.guru.view'
        )
      )
    }
    if (to === '/dashboard/absensi-ibadah-siswa' || to.startsWith('/dashboard/absensi-ibadah-siswa')) {
      return (
        hasRole(
          'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah',
          'Guru', 'guru', 'Wali Kelas', 'wali_kelas',
          'Super Admin', 'Admin', 'Tata Usaha', 'TU', 'Operator',
          'Yayasan', 'Divisi Pendidikan'
        ) ||
        can('student_worship_attendance.view', 'student_worship_attendance.manage', 'worship_attendance.view')
      )
    }
    if (to === '/dashboard/absensi-ibadah' || to.startsWith('/dashboard/absensi-ibadah') || to.includes('/worship')) {
      return (
        hasRole(
          'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah',
          'Musyrif', 'Musyrifah', 'Pengasuh', 'Wali Asrama', 'Pembimbing',
          'Super Admin', 'Admin', 'Yayasan', 'Divisi Pendidikan'
        ) ||
        can('worship_attendance.view', 'worship_attendance.verify')
      )
    }
    if (to.includes('/monitoring-tahfizh-ibadah') || to.includes('/mutabaah')) {
      return (
        hasRole('Super Admin', 'Admin', 'Yayasan', 'Kepala Sekolah', 'Divisi Pendidikan', 'Waka Kesiswaan', 'Waka Kurikulum', 'Tata Usaha', 'TU', 'Operator', 'Wali Kelas', 'Guru', 'Musyrif', 'Musyrifah', 'Pembimbing', 'Pengurus Yayasan') ||
        can('mutabaah.view', 'mutabaah.input', 'mutabaah.agenda.manage', 'sistem.master_data', 'mutabaah.dashboard.view', 'mutabaah.recap.view', 'mutabaah.daily.view', 'mutabaah.agenda.view', 'mutabaah.template.view', 'mutabaah.supervisor.view', 'mutabaah.parent.monitor', 'divisi.monitoring')
      )
    }
    if (to.includes('/laporan-absensi')) return can('kehadiran.siswa.monitoring', 'kehadiran.siswa.rekap_keterlambatan', 'kehadiran.siswa.rekap_ketidakhadiran')
    if (to.includes('/rekap-absensi-gerbang')) return can('kehadiran.siswa.monitoring', 'gate_attendance.view')
    if (to.includes('/rekap-absensi-ibadah')) return can('worship_attendance.view', 'worship_attendance.verify')
    if (to.includes('/laporan-siswa')) return can('kesiswaan.rekap_prestasi', 'kesiswaan.kelulusan_per_unit', 'kesiswaan.kelulusan_per_tahun')
    if (to.includes('/laporan-alumni')) return can('kesiswaan.alumni_tujuan_lanjut')
    if (to.startsWith('/absensi') || to.includes('/attendance') || to.includes('/lms/presensi')) {
      return can(
        'kehadiran.siswa.absensi_digital',
        'kehadiran.siswa.barcode_kartu',
        'lesson_attendance.view',
        'lesson_attendance.view_own',
        'student_attendance.view_own',
      )
    }
    if (to.startsWith('/dashboard/yayasan')) {
      return (
        hasRole('Super Admin', 'Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan') ||
        can(
          'foundation.dashboard.view',
          'foundation.unit.view',
          'foundation.employee.view',
          'foundation.teacher.view',
          'foundation.student.view',
          'foundation.student_new.view',
          'foundation.student_mutation.view',
          'foundation.graduation.view',
          'foundation.alumni.view',
          'foundation.information.view',
          'foundation.report.view',
          'foundation.report.export'
        )
      )
    }
    if (to.includes('/hak-akses')) return can('sistem.hak_akses', 'permission.manage', 'role.manage')
    if (to.includes('/pengaturan')) return can('sistem.pengaturan', 'setting.manage')

    return can('sistem.master_data')
  }

  const isFoundationUser =
    !hasRole('Super Admin', 'superadmin', 'SuperAdmin') &&
    (hasRole('Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan') ||
      can('foundation.dashboard.view'))

  const sidebarMenu = (isFoundationUser ? [
    {
      key: 'dashboard-yayasan',
      label: 'Dashboard Yayasan',
      icon: LayoutDashboard,
      to: '/dashboard/yayasan',
    },
    {
      key: 'yayasan-monitoring',
      label: 'Monitoring',
      icon: Building2,
      submenus: [
        { to: '/dashboard/yayasan/unit-pendidikan', label: 'Unit Pendidikan' },
        { to: '/dashboard/yayasan/pegawai-guru', label: 'Pegawai & Guru' },
        { to: '/dashboard/yayasan/siswa', label: 'Data Siswa' },
        { to: '/dashboard/yayasan/siswa-baru', label: 'Siswa Baru' },
        { to: '/dashboard/yayasan/mutasi-siswa', label: 'Mutasi Siswa' },
        { to: '/dashboard/yayasan/kelulusan-alumni', label: 'Kelulusan & Alumni' },
        { to: '/dashboard/yayasan/informasi-sekolah', label: 'Informasi Sekolah' },
        ...(can('teacher_monitoring.view') ? [{ to: '/dashboard/pemantauan', label: 'Monitoring Guru Mengajar' }] : []),
      ],
    },
    {
      key: 'yayasan-laporan',
      label: 'Laporan',
      icon: FileText,
      submenus: [
        { to: '/dashboard/yayasan/laporan/sdm', label: 'Laporan SDM' },
        { to: '/dashboard/yayasan/laporan/siswa', label: 'Laporan Siswa' },
        { to: '/dashboard/yayasan/laporan/mutasi', label: 'Laporan Mutasi' },
        { to: '/dashboard/yayasan/laporan/kelulusan', label: 'Laporan Kelulusan' },
        { to: '/dashboard/yayasan/laporan/alumni', label: 'Laporan Alumni' },
        { to: '/dashboard/yayasan/laporan/lintas-unit', label: 'Laporan Lintas Unit' },
        { to: '/dashboard/yayasan/laporan/prestasi', label: 'Laporan Prestasi Siswa' },
      ],
    },
    {
      key: 'yayasan-akun',
      label: 'Akun',
      icon: User,
      submenus: [
        { to: '/dashboard/yayasan/notifikasi', label: 'Notifikasi' },
        { to: '/dashboard/yayasan/profil', label: 'Profil' },
      ],
    },
  ] : [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      to: '/dashboard',
    },
    {
      key: 'dashboard-yayasan-menu',
      label: 'DASHBOARD YAYASAN',
      icon: Building2,
      submenus: [
        { to: '/dashboard/yayasan', label: 'Ringkasan Utama' },
        { to: '/dashboard/yayasan/unit-pendidikan', label: 'Unit Pendidikan' },
        { to: '/dashboard/yayasan/pegawai-guru', label: 'Pegawai & Guru' },
        { to: '/dashboard/yayasan/siswa', label: 'Data Siswa' },
        { to: '/dashboard/yayasan/siswa-baru', label: 'Siswa Baru' },
        { to: '/dashboard/yayasan/mutasi-siswa', label: 'Mutasi Siswa' },
        { to: '/dashboard/yayasan/kelulusan-alumni', label: 'Kelulusan & Alumni' },
        { to: '/dashboard/yayasan/informasi-sekolah', label: 'Informasi Sekolah' },
        { to: '/dashboard/yayasan/laporan', label: 'Laporan Lintas Unit' },
      ],
    },
    {
      key: 'master-data',
      label: hasRole('Kepala Sekolah') ? 'MANAJEMEN DATA' : 'MASTER DATA',
      icon: Database,
      submenus: [
        { to: '/dashboard/students/unit-pendidikan', label: 'Unit Pendidikan' },
        { to: '/dashboard/master-jenis-unit', label: 'Jenis Unit' },
        { to: '/dashboard/master-jabatan', label: 'Jabatan' },
        { to: '/dashboard/employees', label: 'Pegawai' },
        { to: '/dashboard/students', label: 'Siswa' },
        { to: '/dashboard/master-quran-surah', label: 'Al-Qur’an' },
        { to: '/dashboard/master-jadwal-sholat', label: 'Sholat' },
        { to: '/dashboard/master-doa', label: 'Do’a & Dzikir' },
      ],
    },
    {
      key: 'akademik',
      label: 'AKADEMIK & LMS',
      icon: BookOpen,
      submenus: [
        { to: '/dashboard/akademik/pengaturan?tab=tahun-ajaran', label: 'Pengaturan Akademik' },
        { to: '/dashboard/akademik/perencanaan?tab=cp', label: 'Perencanaan Pembelajaran' },
        { to: '/dashboard/akademik/pembelajaran?tab=materi', label: 'Pembelajaran' },
        { to: '/dashboard/akademik/evaluasi?tab=penugasan', label: 'Tugas & Evaluasi' },
        { to: '/dashboard/akademik/nilai-rapor?tab=buku-nilai', label: 'Nilai & Rapor' },
      ],
    },
    {
      key: 'portal-guru',
      label: 'PORTAL GURU',
      icon: BookOpen,
      submenus: [
        { to: '/portal-guru/workspace', label: 'Workspace Pembelajaran Guru' },
        { to: '/dashboard/chat-pegawai', label: 'Chat Pegawai' },
      ],
    },
    {
      key: 'portal-ortu-siswa',
      label: hasRole('Orang Tua') ? 'PORTAL ORANG TUA' : hasRole('Siswa') ? 'PORTAL SISWA' : 'PORTAL ORANG TUA & SISWA',
      icon: Users,
      submenus: [
        ...(isParentRole(roles) || hasRole('Super Admin', 'Admin') ? [
          { to: '/portal-orangtua?tab=ringkasan', label: 'Dashboard' },
          { to: '/portal-orangtua?tab=chat', label: 'Chat Guru' },
        ] : []),
        ...(isStudentRole(roles) ? [
          { to: '/portal-siswa/profil', label: 'Profil & Biodata' },
          { to: '/portal-siswa/informasi-sekolah', label: 'Informasi Sekolah' },
          { to: '/portal-siswa/jadwal', label: 'Jadwal' },
          { to: '/portal-siswa/materi', label: 'Materi' },
          { to: '/portal-siswa/tugas', label: 'Tugas' },
          { to: '/portal-siswa/tahfizh', label: 'Tahfizh' },
          { to: '/portal-siswa/nilai', label: 'Nilai' },
          { to: '/portal-siswa/komentar-guru', label: 'Komentar Guru' },
          { to: '/portal-siswa/kisi-kisi', label: 'Kisi-kisi' },
          { to: '/portal-siswa/ujian-cbt', label: 'Ujian CBT' },
          { to: '/portal-siswa/hasil', label: 'Hasil' },
        ] : []),
      ],
    },
    {
      key: 'absensi',
      label: 'ABSENSI',
      icon: CalendarCheck,
      submenus: attendanceSubmenus,
    },
    ...((hasRole('Musyrif', 'Musyrifah', 'musyrif', 'musyrifah', 'Pengasuh', 'Wali Asrama', 'Pembimbing', 'Super Admin', 'Admin', 'superadmin', 'SuperAdmin')) ? [
      {
        key: 'musyrif-asrama',
        label: 'PORTAL MUSYRIF',
        icon: Moon,
        submenus: [
          { to: '/dashboard/absensi-ibadah', label: 'Presensi Ibadah Santri' },
          { to: '/dashboard/mutabaah', label: 'Mutaba’ah Harian Santri' },
          ...(can('kesiswaan.kelas_rombel', 'academic.schedule.view', 'sistem.master_data')
            ? [{ to: '/dashboard/tahfizh', label: setoranTahfizhMenuLabel }]
            : []),
        ],
      },
    ] : []),
    {
      key: 'mutabaah',
      label: 'MUTABA’AH',
      icon: BookHeart,
      submenus: [
        { to: '/dashboard/mutabaah', label: 'Dashboard Mutaba’ah' },
        { to: '/dashboard/tahfizh', label: setoranTahfizhMenuLabel },
        { to: '/dashboard/mutabaah/rekap', label: 'Rekap Mutaba’ah' },
        { to: '/dashboard/mutabaah/target-evaluasi', label: 'Target & Evaluasi' },
        ...(hasRole('Super Admin', 'Admin', 'Yayasan', 'Kepala Sekolah', 'Divisi Pendidikan', 'Tata Usaha', 'TU', 'Operator', 'Wali Kelas', 'Musyrif', 'Pembimbing') || can('mutabaah.agenda.view') ? [{ to: '/dashboard/mutabaah/rincian-agenda', label: 'Rincian Agenda TU' }] : []),
        ...(hasRole('Super Admin', 'Admin', 'Yayasan', 'Kepala Sekolah', 'Divisi Pendidikan', 'Tata Usaha', 'TU', 'Operator', 'Wali Kelas', 'Musyrif', 'Pembimbing') || can('mutabaah.template.view') ? [{ to: '/dashboard/mutabaah/template-agenda', label: 'Template Agenda' }] : []),
        ...(hasRole('Super Admin', 'Admin', 'Yayasan', 'Kepala Sekolah', 'Divisi Pendidikan', 'Tata Usaha', 'TU', 'Operator', 'Wali Kelas', 'Musyrif', 'Pembimbing') || can('mutabaah.template.assign') ? [{ to: '/dashboard/mutabaah/assign-template', label: 'Assign Template' }] : []),
        ...(hasRole('Super Admin', 'Admin', 'Yayasan', 'Kepala Sekolah', 'Divisi Pendidikan', 'Tata Usaha', 'TU', 'Operator', 'Wali Kelas', 'Musyrif', 'Pembimbing') || can('mutabaah.supervisor.view') ? [{ to: '/dashboard/mutabaah/assign-pembimbing', label: 'Assign Pembimbing' }] : []),
        { to: '/dashboard/mutabaah/monitoring-orang-tua', label: 'Monitoring Orang Tua' },
        { to: '/dashboard/monitoring-tahfizh-ibadah-non-pesantren', label: 'Monitor Siswa Non Ponpes' },

      ],
    },
    {
      key: 'tahfizh-main',
      label: 'TAHFIZH AL-QUR’AN',
      icon: BookMarked,
      submenus: [
        { to: '/dashboard/laporan-tahfizh', label: 'Laporan Tahfizh' },
        ...(hasRole('Super Admin', 'Admin', 'Guru Tahfizh', 'Kepala Sekolah', 'Divisi Pendidikan') || can('dashboard.guru-tahfizh.view')
          ? [{ to: '/dashboard/guru-tahfizh', label: 'Dashboard Guru Tahfizh' }]
          : []),
      ],
    },
    {
      key: 'laporan',
      label: 'REKAP DATA',
      icon: FileText,
      submenus: [
        { to: '/dashboard/laporan-siswa', label: 'Laporan Siswa' },
        { to: '/dashboard/laporan-absensi', label: 'Laporan Absensi Pembelajaran' },
        { to: '/dashboard/rekap-absensi-gerbang', label: 'Laporan Absensi Gerbang' },
        { to: '/dashboard/rekap-absensi-ibadah', label: 'Laporan Absensi Ibadah' },
        { to: '/dashboard/mutabaah/rekap', label: 'Laporan Mutaba’ah' },
        { to: '/dashboard/laporan-tahfizh', label: 'Laporan Tahfizh' },
        ...(hasRole('Super Admin', 'super_admin', 'Admin', 'admin', 'Pengurus Yayasan', 'Yayasan', 'Kepala Sekolah', 'Divisi Pendidikan', 'Guru', 'guru', 'Guru Mapel', 'Guru Tahfizh', 'Wali Kelas') || can('report.tahfizh.view') || can('tahfizh.view')
          ? [{ to: '/dashboard/tahfizh/rekapan', label: 'Laporan Rekapan Tahfizh' }]
          : []),
        { to: '/dashboard/laporan-akademik', label: 'Laporan Akademik & Nilai' },
        { to: '/dashboard/laporan-pegawai', label: 'Laporan Pegawai & Guru' },
        { to: '/dashboard/laporan-lms', label: 'Laporan LMS' },
        { to: '/dashboard/laporan-alumni', label: 'Laporan Alumni & Prestasi' },
      ],
    },
    {
      key: 'pengaturan',
      label: 'PENGATURAN',
      icon: Settings,
      submenus: [
        { to: '/dashboard/pengaturan', label: 'Profil Sekolah' },
        { to: '/dashboard/hak-akses', label: 'Hak Akses' },
        // { to: '/dashboard/pengaturan?tab=unit', label: 'Pengaturan Unit' },
      ],
    },
  ]).map((item) => (
    item.submenus
      ? { ...item, submenus: item.submenus.filter((submenu) => bolehBukaMenu(submenu.to)) }
      : item
  )).filter((item) => {
    if (isRestrictedFoundationOrPrincipal && (item.key === 'portal-guru' || item.key === 'musyrif-asrama')) {
      return false
    }
    return item.submenus ? item.submenus.length > 0 : bolehBukaMenu(item.to)
  })

  const normalizePath = (to) => (to || '').split('?')[0].replace(/\/+$/, '') || '/'

  // Aktif jika path sama persis, ATAU target adalah "leaf" dalam grupnya
  // sehingga tidak ada dua submenu yang menyala bersamaan.
  const isSubActive = (to, siblings = [], sectionKey = null) => {
    const target = normalizePath(to)
    const current = normalizePath(location.pathname)

    // Jika route beda dan bukan nested path
    if (current !== target && !current.startsWith(target + '/')) return false

    // Jika sectionKey dipassing dan openSection diset, pastikan leaf hanya aktif di section yang terbuka
    if (sectionKey && openSection && sectionKey !== openSection) {
      // Kecuali jika tidak ada section lain yang match
      const matchingSection = sidebarMenu.find(m => m.key === openSection)
      const matchingSub = matchingSection?.submenus?.some(s => normalizePath(s.to) === current)
      if (matchingSub) return false
    }

    const hasDeeperSibling = siblings.some((sibling) => {
      const sTarget = normalizePath(sibling.to)
      return sTarget !== target && sTarget.startsWith(target + '/')
    })
    if (!hasDeeperSibling && target !== '/dashboard' && (current === target || current.startsWith(target + '/'))) return true
    return current === target
  }

  // Auto-expand grup menu yang berisi route aktif.
  useEffect(() => {
    const current = normalizePath(location.pathname)
    for (const item of sidebarMenu) {
      if (!item.submenus) continue
      if (item.submenus.some((sub) => normalizePath(sub.to) === current || (normalizePath(sub.to) !== '/dashboard' && current.startsWith(normalizePath(sub.to) + '/')))) {
        setOpenSection((prev) => {
          // Jika section sebelumnya sudah memuat route ini, pertahankan
          const prevItem = sidebarMenu.find((m) => m.key === prev)
          if (prevItem && prevItem.submenus && prevItem.submenus.some((sub) => normalizePath(sub.to) === current)) {
            return prev
          }
          return item.key
        })
        return
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isFoundationUser])

  return (
    <div
      className={`site-shell min-h-screen text-slate-800 flex flex-col font-sans antialiased dark:bg-slate-950 dark:text-slate-100 template-${pengaturan.template}`}
      style={{
        '--site-sidebar': pengaturan.sidebar_color || '#064E3B',
        '--site-accent': pengaturan.sidebar_accent_color || '#3FBF75',
        '--site-body': isDarkMode ? '#0F172A' : '#F7F9FC',
        '--site-header': isDarkMode ? '#0F172A' : '#FFFFFF',
        backgroundColor: isDarkMode ? '#0F172A' : '#F7F9FC',
      }}
    >
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className={`flex flex-1 min-h-screen ${pengaturan.sidebar_position === 'right' ? 'md:flex-row-reverse' : ''}`}>
        {/* Left Sidebar (Sticky & Collapsible - Deep Emerald Green #064E3B) */}
        <aside
          className={`site-sidebar fixed inset-y-0 z-50 flex flex-col justify-between border-white/10 text-slate-100 transition-all duration-300 ease-in-out md:sticky md:top-0 md:h-screen ${pengaturan.sidebar_position === 'right' ? 'right-0 border-l' : 'left-0 border-r'} ${pengaturan.sidebar_style === 'light' ? 'site-sidebar-light' : ''} ${collapsed ? 'w-20' : 'w-64'
            } ${mobileMenuOpen ? 'translate-x-0 w-64' : pengaturan.sidebar_position === 'right' ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0'}`}
          style={{
            background: pengaturan.sidebar_style === 'gradient'
              ? `linear-gradient(180deg, ${pengaturan.sidebar_color || '#064E3B'}, color-mix(in srgb, ${pengaturan.sidebar_color || '#064E3B'} 72%, #000))`
              : pengaturan.sidebar_style === 'light' ? '#FFFFFF' : (pengaturan.sidebar_color || '#064E3B'),
          }}
        >
          {/* Header Sidebar: Logo & Collapsible Toggle */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-white shadow-md bg-[#064E3B] border border-emerald-400/30" style={{ backgroundColor: pengaturan.sidebar_accent_color || '#064E3B' }}>
                  {pengaturan.logo_url ? <img src={pengaturan.logo_url} alt="Logo Yayasan Darel Iman" className="h-full w-full bg-white object-contain p-1" /> : <span className="text-[10px] font-black">{pengaturan.logo_text || <Sparkles className="h-5 w-5 text-emerald-200" />}</span>}
                </div>
                {!collapsed && (
                  <div className="min-w-0">
                    <h1 className="text-xs font-black tracking-wider text-white uppercase truncate font-sans">
                      {namaSekolah}
                    </h1>
                    <p className="text-[10px] font-bold tracking-widest text-emerald-300">{pengaturan.application_name || 'Sistem Manajemen Sekolah'}</p>
                  </div>
                )}
              </div>

              {/* Desktop Toggle Button */}
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="hidden md:flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 text-emerald-100 hover:bg-white/20 hover:text-white transition-all btn-master"
                title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>

              {/* Mobile Close Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden text-emerald-200 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-3 text-xs custom-scrollbar">
            {sidebarMenu.map((item) => {
              const Icon = item.icon
              if (!item.submenus) {
                const isActive = normalizePath(location.pathname) === normalizePath(item.to)
                return (
                  <NavLink
                    key={item.key}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold transition-all duration-200 ${isActive
                      ? 'bg-white text-[#064E3B] shadow-md dark:bg-emerald-500 dark:text-slate-950'
                      : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
                      }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${isActive ? 'bg-[#064E3B]/10 text-[#064E3B] dark:bg-slate-900/30 dark:text-slate-900' : 'text-emerald-300'}`}>
                      <Icon className="h-4 w-4 stroke-[2]" />
                    </div>
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                )
              }

              const isOpen = openSection === item.key
              const hasActiveChild = isOpen && item.submenus.some((sub) => isSubActive(sub.to, item.submenus, item.key))

              return (
                <div key={item.key} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (collapsed) setCollapsed(false)
                      toggleSection(item.key)
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-200 ${isOpen || hasActiveChild
                      ? 'bg-white/15 text-white shadow-xs'
                      : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
                      }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="h-4 w-4 shrink-0 text-[#3FBF75] stroke-[1.8]" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!collapsed && (
                      <span className="text-[10px]">
                        {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-emerald-200" /> : <ChevronRight className="h-3.5 w-3.5 text-emerald-300" />}
                      </span>
                    )}
                  </button>

                  {/* Submenu Accordion */}
                  {!collapsed && isOpen && (
                    <div className="ml-5 space-y-1 border-l-2 border-[#3FBF75]/40 pl-3 pt-1 animate-[masterDropdownSlide_0.2s_ease-out]">
                      {item.submenus.map((sub, sIdx) => {
                        const active = isSubActive(sub.to, item.submenus, item.key)
                        return (
                          <NavLink
                            key={`${item.key}-${sub.to || sub.label}-${sIdx}`}
                            to={sub.to}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block rounded-lg px-2.5 py-1.5 text-xs transition-all duration-150 ${active
                              ? 'bg-[#3FBF75] text-slate-900 font-bold shadow-xs'
                              : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
                              }`}
                          >
                            {sub.label}
                          </NavLink>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* User Status Bar & Help Link at Sidebar Bottom */}
          <div className="p-3.5 border-t border-white/10 bg-black/15 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <PersonAvatar
                  src={user?.photo_url || user?.avatar_url || user?.avatar || user?.photo || user?.profile_photo_url}
                  name={namaTampil}
                  size="sm"
                  className="border border-white/20 shadow-md"
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#064E3B]" />
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-white leading-tight">{namaTampil}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="truncate text-[10px] font-medium text-[#3FBF75]">{roleTampil}</p>
                    <span className="text-[9px] text-emerald-300 font-semibold">• Online</span>
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <p className="truncate px-2 text-[9px] text-white/55">{pengaturan.footer_text || 'Yayasan Darel Iman © 2026'}</p>
            )}
            {!collapsed && (
              <button
                type="button"
                onClick={() => navigate('/dashboard/pengaturan')}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 text-[11px] font-semibold transition"
              >
                <HelpCircle className="h-3.5 w-3.5 text-[#3FBF75]" />
                <span>Bantuan & Panduan</span>
              </button>
            )}
          </div>
        </aside>

        {/* Main Workspace Area (Light Gray Background bg-slate-50) */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#0F172A]">
          {/* Topbar Header (Clean White bg-white with subtle shadow shadow-sm) */}
          <header
            className={`${pengaturan.header_sticky ? 'sticky top-0' : 'relative'} z-30 flex h-16 min-w-0 items-center justify-between overflow-visible border-b border-slate-200/80 px-3 sm:px-4 lg:px-8 bg-white dark:bg-slate-900 shadow-sm backdrop-blur-md transition-colors duration-200 dark:border-slate-800/80`}
          >
            {/* Left Controls: Mobile Menu Toggle & Active Unit Switcher */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden dark:border-slate-800 dark:text-slate-300"
                aria-label="Buka Menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Active Unit Dropdown Switcher */}
              <div className="relative shrink-0" ref={unitDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUnitDropdownOpen(!unitDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100 hover:border-[#064E3B]/30 transition-all dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 btn-master"
                >
                  <Layers className="h-4 w-4 text-[#064E3B] dark:text-[#3FBF75] stroke-[2]" />
                  <span className="hidden sm:inline text-slate-500 font-medium">Unit:</span>
                  <span className="font-extrabold text-[#064E3B] dark:text-[#3FBF75]">{activeUnit || 'Semua Unit'}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {unitDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-56 rounded-[18px] bg-white p-1.5 shadow-2xl border border-slate-200/80 z-50 animate-[masterDropdownSlide_0.2s_ease-out] dark:bg-[#1B2433] dark:border-slate-800">
                    <p className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Pilih Unit Pendidikan
                    </p>
                    {daftarUnitOptions.map((unit) => (
                      <button
                        key={unit.id}
                        type="button"
                        onClick={() => {
                          setActiveUnit(unit.id)
                          setUnitDropdownOpen(false)
                        }}
                        className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${activeUnit === unit.id
                          ? 'bg-[#064E3B]/10 text-[#064E3B] font-bold dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60'
                          }`}
                      >
                        <span>{unit.name}</span>
                        {activeUnit === unit.id && <span className="h-2 w-2 rounded-full bg-[#064E3B] dark:bg-[#3FBF75]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Centered Clean Dynamic Search Bar */}
            <div className="flex-1 flex justify-center max-w-md mx-auto px-2 sm:px-4">
              <div
                onClick={() => setIsSearchModalOpen(true)}
                className="relative w-full hidden md:flex items-center transition-all duration-300 focus-within:max-w-md cursor-pointer group"
              >
                <Search className="absolute left-3 text-slate-400 group-hover:text-[#064E3B] h-4 w-4 transition-colors" />
                <input
                  type="text"
                  readOnly
                  placeholder="Cari siswa, guru, kelas, modul..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/90 pl-9 pr-14 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 group-hover:bg-white group-hover:border-[#064E3B]/40 focus:bg-white focus:border-[#064E3B] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 transition-all duration-200 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder-slate-500 cursor-pointer shadow-2xs"
                />
                <span className="absolute right-3 rounded-md bg-slate-200/70 border border-slate-300/60 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300">
                  Ctrl + K
                </span>
              </div>
            </div>

            {/* Right Controls: Date, Role Switcher, Notifications, Theme, Profile */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-3">
              {/* Realtime Date Display */}
              <div className="hidden lg:flex items-center gap-2 rounded-xl bg-slate-100/70 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                <Calendar className="h-3.5 w-3.5 text-[#064E3B] dark:text-[#3FBF75]" />
                <span>{tanggalTampil}</span>
              </div>

              {/* Super Admin: switch into a representative role session */}
              {hasRole('Super Admin') && !impersonating && (
                <div className="relative" ref={roleAccessRef}>
                  <button
                    type="button"
                    onClick={() => setRoleAccessOpen((open) => !open)}
                    aria-label="Akses Role"
                    aria-haspopup="menu"
                    aria-expanded={roleAccessOpen}
                    className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#064E3B] transition hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
                    title="Masuk sebagai role lain"
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden xl:inline">Akses Role</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>

                  {roleAccessOpen && (
                    <div role="menu" className="absolute left-0 right-auto top-full z-50 mt-2 w-64 rounded-[18px] border border-slate-200/80 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-[#13221f] sm:left-auto sm:right-0">
                      <div className="px-2 pb-2 pt-1">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Login sebagai</p>
                        <p className="mt-0.5 text-[10px] text-slate-500">Pilih role untuk melihat portal dan hak aksesnya.</p>
                      </div>
                      <div className="grid grid-cols-1 gap-0.5">
                        {roleAccessOptions.map((option) => (
                          <button
                            key={option.role}
                            type="button"
                            role="menuitem"
                            disabled={Boolean(roleAccessLoading)}
                            onClick={() => accessAsRole(option)}
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-[#064E3B] disabled:cursor-wait disabled:opacity-60 dark:text-slate-200 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300"
                          >
                            <span>{option.label}</span>
                            {roleAccessLoading === option.role ? (
                              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notification Center (Dynamic Notification Icon on Right) */}
              {!isPortalUser && <NotificationCenter />}

              {/* Mode Tampilan Switcher (Light / Dark Mode) */}
              <div className="relative" ref={themeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                  aria-label="Pilih mode tampilan"
                  aria-haspopup="menu"
                  aria-expanded={themeMenuOpen}
                  className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 transition-all btn-master"
                  title="Pilih Mode Tampilan"
                >
                  {isDarkMode ? <Moon className="h-4 w-4 text-emerald-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
                  <span className="hidden sm:inline font-semibold">{isDarkMode ? 'Night Mode' : 'Light Mode'}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {themeMenuOpen && (
                  <div role="menu" className="absolute right-0 top-full mt-2 w-48 rounded-[18px] bg-white p-1.5 shadow-2xl border border-slate-200/80 z-50 animate-[masterDropdownSlide_0.2s_ease-out] dark:bg-[#13221f] dark:border-slate-800">
                    <p className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Mode Tampilan
                    </p>

                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={!isDarkMode}
                      onClick={() => {
                        setIsDarkMode(false)
                        setThemeMenuOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${!isDarkMode
                        ? 'bg-[#064E3B]/10 text-[#064E3B] font-bold dark:bg-emerald-500/20 dark:text-emerald-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-amber-500" />
                        <span>Light Mode</span>
                      </div>
                      {!isDarkMode && <span className="h-2 w-2 rounded-full bg-[#064E3B] dark:bg-emerald-400" />}
                    </button>

                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={isDarkMode}
                      onClick={() => {
                        setIsDarkMode(true)
                        setThemeMenuOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${isDarkMode
                        ? 'bg-[#064E3B]/10 text-[#064E3B] font-bold dark:bg-emerald-500/20 dark:text-emerald-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4 text-emerald-400" />
                        <span>Night Mode</span>
                      </div>
                      {isDarkMode && <span className="h-2 w-2 rounded-full bg-[#064E3B] dark:bg-emerald-400" />}
                    </button>
                  </div>
                )}
              </div>
              {/* User Profile Avatar Dropdown (Right side of header) */}
              <DropdownMenu>
                <DropdownMenuTrigger className="group flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-all shadow-xs dark:border-slate-800 dark:bg-[#111827] dark:text-slate-200">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#064E3B] text-[10px] font-bold text-white shadow-sm border border-emerald-400/30">
                    {namaTampil.charAt(0).toLowerCase()}
                  </div>
                  <span className="hidden sm:inline font-medium text-slate-900 dark:text-white">{namaTampil}</span>
                  <ChevronDown className="size-3.5 text-slate-400 transition-transform group-data-[state=open]:rotate-180" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-56 p-1.5 border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-[#1B2433]">
                  <DropdownMenuSection>
                    <DropdownMenuHeader className="px-3 py-1.5 space-y-1">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Akun ({roleTampil})
                      </p>
                      {loginTime && (
                        <div className="py-1 px-2 text-[11px] text-emerald-800 dark:text-emerald-300 font-mono bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-100 dark:border-emerald-900/60">
                          <span className="block font-semibold">Login: {new Date(loginTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Browser Sesi Aktif</span>
                        </div>
                      )}
                    </DropdownMenuHeader>
                    <DropdownMenuItem
                      textValue="Lihat Profil"
                      onAction={() => navigate(isFoundationUser ? '/dashboard/yayasan/profil' : '/dashboard/profil-akun')}
                      className="cursor-pointer gap-2.5 py-2 text-xs font-medium text-slate-700 hover:text-emerald-700 dark:text-slate-200"
                    >
                      <UserCircle1 className="size-5 text-[#064E3B] dark:text-[#3FBF75]" />
                      <span>Lihat Profil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      textValue="Notifikasi"
                      onAction={() => {
                        if (isParentRole(roles)) {
                          navigate('/portal-orangtua?tab=notifications')
                        } else if (isStudentRole(roles)) {
                          navigate('/portal-siswa/informasi-sekolah')
                        } else {
                          navigate(isFoundationUser ? '/dashboard/yayasan/notifikasi' : '/notifications')
                        }
                      }}
                      className="cursor-pointer gap-2.5 py-2 text-xs font-medium text-slate-700 hover:text-emerald-700 dark:text-slate-200"
                    >
                      <Bell1 className="size-5 text-slate-400" />
                      <span>Notifikasi</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      textValue="Pengaturan Akun"
                      onAction={() => navigate(isFoundationUser ? '/dashboard/yayasan/profil' : '/dashboard/pengaturan?tab=keamanan')}
                      className="cursor-pointer gap-2.5 py-2 text-xs font-medium text-slate-700 hover:text-emerald-700 dark:text-slate-200"
                    >
                      <Gear1 className="size-5 text-slate-400" />
                      <span>Pengaturan Akun</span>
                    </DropdownMenuItem>
                  </DropdownMenuSection>
                  <DropdownMenuSeparator className="-mx-1.5 my-1 border-slate-200 dark:border-slate-800" />
                  <DropdownMenuItem
                    textValue="Keluar Sistem"
                    onAction={() => logout()}
                    className="cursor-pointer gap-2.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
                  >
                    <Exit className="size-5 text-rose-500" />
                    <span>Keluar Sistem</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Page Workspace Container (Light Gray bg-slate-50) */}
          <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-5 lg:p-6 space-y-6 max-w-7xl w-full mx-auto pb-24 md:pb-10">
            {impersonating && (
              <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-100">
                <div>
                  <p className="text-xs font-extrabold">Mode akses role aktif: {roleTampil}</p>
                  <p className="mt-0.5 text-[11px] opacity-75">Anda sedang melihat sistem sebagai {namaTampil}.</p>
                </div>
                <button
                  type="button"
                  onClick={returnToSuperAdmin}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-amber-800 dark:bg-amber-400 dark:text-amber-950 dark:hover:bg-amber-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Kembali ke Super Admin
                </button>
              </div>
            )}
            <ActiveScheduleNotice />
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation (Responsive Mobile View <= 768px / md:hidden) */}
      <AppBottomNavigation
        items={[
          { to: defaultPortal, label: 'Beranda', icon: LayoutDashboard, end: true },
          ...(canViewStudents && !isStudentRole(roles) && !isParentRole(roles)
            ? [{
              to: '/dashboard/students',
              label: 'Data Siswa',
              icon: Database,
            }]
            : []),
          {
            to: isStudentRole(roles)
              ? '/portal-siswa/profil'
              : isParentRole(roles)
                ? '/portal-orangtua?tab=profile'
                : isFoundationUser
                  ? '/dashboard/yayasan/profil'
                  : '/dashboard/profil-akun',
            label: 'Profil',
            icon: User,
          },
        ]}
        actionCenter={(isStudentRole(roles) && can('student.assignment.view')) || (isParentRole(roles) && can('parent.attendance.view')) || canCreateStudent ? {
          icon: Plus,
          ariaLabel: 'Aksi Cepat',
          onClick: () => navigate(isStudentRole(roles) ? '/portal-siswa/tugas' : isParentRole(roles) ? '/portal-orangtua?tab=attendance' : '/dashboard/students?action=add'),
        } : null}
        onOpenNotifications={() => {
          if (isStudentRole(roles)) navigate('/portal-siswa/informasi-sekolah')
          else if (isParentRole(roles)) navigate('/portal-orangtua?tab=announcements')
          else window.dispatchEvent(new Event('open-notification-center'))
        }}
      />

      {/* Floating Action Button (FAB) for Mobile Quick Add */}
      {!isStudentRole(roles) && !isParentRole(roles) && canCreateStudent && <FAB onClick={() => navigate('/dashboard/students?action=add')} label="Tambah Siswa" />}

      {/* Floating Chat Pop-Up & Melayang Button */}
      <FloatingChatWidget />
      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </div>
  )
}

