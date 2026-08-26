import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  User,
  Lock,
  ShieldCheck,
  Monitor,
  Activity,
  Grid,
  KeyRound,
  Sparkles,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { PageContainer } from '@/components/app'
import AppBreadcrumb from '@/components/app/AppBreadcrumb'
import { useAuthStore } from '../stores/authStore'
import { Badge } from '@/components/tailgrids/core/badge'
import { Alert, AlertContent, AlertDescription, AlertIndicator, AlertTitle } from '@/components/tailgrids/core/alert'
import { hasAnyRole } from '../auth/portalResolver'
import { useMemo } from 'react'

import UserProfileCard from '../components/auth/UserProfileCard'
import ChangePasswordCard from '../components/auth/ChangePasswordCard'
import ChildPasswordManagementCard from '../components/auth/ChildPasswordManagementCard'
import TwoFactorAuthCard from '../components/auth/TwoFactorAuthCard'
import SessionLoginCard from '../components/auth/SessionLoginCard'
import ActivityLoginCard from '../components/auth/ActivityLoginCard'
import SelectUnitCard from '../components/auth/SelectUnitCard'
import SelectAcademicYearCard from '../components/auth/SelectAcademicYearCard'

const VALID_TABS = ['profil', 'ganti-password', 'password-anak', '2fa', 'session-login', 'activity-login', 'unit-tahun']

export default function UserProfileManagementPage() {
  const user = useAuthStore((state) => state.user)

  const userRoles = useMemo(() => {
    if (!user) return []
    const rolesList = Array.isArray(user.roles) ? user.roles : [user.role || user.roles].filter(Boolean)
    return rolesList.map((r) => (typeof r === 'string' ? r : r?.name || r?.slug || ''))
  }, [user])

  const primaryRole = userRoles[0] || (typeof user?.role === 'string' ? user?.role : user?.role?.name) || 'Pegawai'

  const canEditUnitAndRole = useMemo(() => {
    if (!user) return false
    if (user.is_super_admin || user.is_admin || user.id === 1) return true
    return hasAnyRole(userRoles, [
      'Super Admin', 'SuperAdmin', 'super_admin', 'superadmin',
      'Admin', 'admin', 'administrator',
      'Pengurus Yayasan', 'Yayasan', 'Ketua Yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan',
      'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek',
      'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan',
      'Operator', 'operator', 'TU', 'Tata Usaha', 'tata_usaha'
    ])
  }, [userRoles, user])

  const isParent = useMemo(() => {
    return hasAnyRole(userRoles, ['Orang Tua', 'orang_tua', 'orang-tua', 'orangtua', 'wali murid', 'parent'])
  }, [userRoles])

  const [searchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(
    VALID_TABS.includes(tabFromUrl) ? tabFromUrl : 'profil'
  )

  // Sync tab when URL param changes
  useEffect(() => {
    if (tabFromUrl && VALID_TABS.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  const tabs = [
    {
      id: 'profil',
      label: 'Profil User',
      icon: User,
      activeColor: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30',
      inactiveColor: 'bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white hover:shadow-md hover:shadow-emerald-600/30',
    },
    {
      id: 'ganti-password',
      label: 'Ganti Password',
      icon: Lock,
      activeColor: 'bg-sky-600 text-white shadow-md shadow-sky-600/30',
      inactiveColor: 'bg-sky-100/90 text-sky-700 hover:bg-sky-600 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-600 dark:hover:text-white hover:shadow-md hover:shadow-sky-600/30',
    },
    ...(isParent
      ? [
          {
            id: 'password-anak',
            label: 'Password Login Anak',
            icon: KeyRound,
            activeColor: 'bg-amber-500 text-white shadow-md shadow-amber-500/30',
            inactiveColor: 'bg-amber-100/90 text-amber-700 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white hover:shadow-md hover:shadow-amber-500/30',
          },
        ]
      : []),
    {
      id: '2fa',
      label: 'Keamanan 2FA',
      icon: ShieldCheck,
      activeColor: 'bg-violet-600 text-white shadow-md shadow-violet-600/30',
      inactiveColor: 'bg-violet-100/90 text-violet-700 hover:bg-violet-600 hover:text-white dark:bg-violet-950/60 dark:text-violet-300 dark:hover:bg-violet-600 dark:hover:text-white hover:shadow-md hover:shadow-violet-600/30',
    },
    {
      id: 'session-login',
      label: 'Session Login',
      icon: Monitor,
      activeColor: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30',
      inactiveColor: 'bg-indigo-100/90 text-indigo-700 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white hover:shadow-md hover:shadow-indigo-600/30',
    },
    {
      id: 'activity-login',
      label: 'Activity Login',
      icon: Activity,
      activeColor: 'bg-rose-600 text-white shadow-md shadow-rose-600/30',
      inactiveColor: 'bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-600 dark:hover:text-white hover:shadow-md hover:shadow-rose-600/30',
    },
    {
      id: 'unit-tahun',
      label: 'Unit & Tahun Ajaran',
      icon: Grid,
      restricted: !canEditUnitAndRole,
      activeColor: 'bg-teal-600 text-white shadow-md shadow-teal-600/30',
      inactiveColor: 'bg-teal-100/90 text-teal-700 hover:bg-teal-600 hover:text-white dark:bg-teal-950/60 dark:text-teal-300 dark:hover:bg-teal-600 dark:hover:text-white hover:shadow-md hover:shadow-teal-600/30',
    },
  ]

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* Navigation Breadcrumb */}
      <AppBreadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Pengaturan Akun' },
          { label: 'Profil & Keamanan' },
        ]}
      />

      {/* MODERN HERO CARD HEADER (MATCHING PORTAL STYLE) */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <User className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                    <Sparkles className="size-3 text-amber-300 animate-pulse" />
                    Profil & Keamanan Akun
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    Role: {primaryRole}
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Pengaturan Profil & Keamanan Akun
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                  Kelola data pribadi {user?.name || user?.fullName || 'Pengguna'}, ganti kata sandi, verifikasi 2FA, pantau riwayat sesi login & aktivitas akun Anda secara terpadu.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 z-10">
              <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500/10 dark:bg-emerald-950/50 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/30 shadow-xs">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Akun Aktif ({primaryRole})</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modern TailGrids Soft Pastel Tab Bar */}
      <nav className="rounded-[18px] border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {tabs.map((tab) => {
            const IconComp = tab.icon
            const isActive = activeTab === tab.id
            return (
              <motion.button
                key={tab.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                  isActive ? tab.activeColor : tab.inactiveColor
                }`}
              >
                <IconComp className="size-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.restricted && (
                  <Badge color="warning" size="sm" className="py-0 px-1.5 text-[10px] ml-1">
                    🔒 Terkunci
                  </Badge>
                )}
              </motion.button>
            )
          })}
        </div>
      </nav>

      {/* Tab Content */}
      <div className="transition-all duration-200">
        {activeTab === 'profil' && <UserProfileCard />}
        {activeTab === 'ganti-password' && <ChangePasswordCard />}
        {activeTab === 'password-anak' && <ChildPasswordManagementCard />}
        {activeTab === '2fa' && <TwoFactorAuthCard />}
        {activeTab === 'session-login' && <SessionLoginCard />}
        {activeTab === 'activity-login' && <ActivityLoginCard />}
        {activeTab === 'unit-tahun' && (
          <div className="space-y-6">
            {!canEditUnitAndRole && (
              <Alert status="warning" className="rounded-[18px]">
                <AlertIndicator>
                  <Lock className="w-5 h-5" />
                </AlertIndicator>
                <AlertContent>
                  <AlertTitle>Akses Terbatas: Pemilihan Unit Pendidikan & Tahun Ajaran</AlertTitle>
                  <AlertDescription>
                    Fitur pergantian Unit Pendidikan & Tahun Ajaran aktif <strong>terkunci</strong> dan tidak dapat diubah oleh role Anda. Akses ini hanya diberikan kepada <strong>Super Admin, Admin, Pengurus Yayasan, Kepala Sekolah, dan Divisi Pendidikan</strong>.
                  </AlertDescription>
                </AlertContent>
              </Alert>
            )}
            <SelectUnitCard disabled={!canEditUnitAndRole} />
            <SelectAcademicYearCard disabled={!canEditUnitAndRole} />
          </div>
        )}
      </div>
    </PageContainer>
  )
}

