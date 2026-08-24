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
} from 'lucide-react'

import { AppPageHeader, PageContainer } from '@/components/app'
import { useAuthStore } from '../stores/authStore'
import { Badge } from '@/components/tailgrids/core/badge'
import { Alert, AlertContent, AlertDescription, AlertIndicator, AlertTitle } from '@/components/tailgrids/core/alert'

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
  const primaryRole = Array.isArray(user?.roles) && user.roles.length > 0
    ? user.roles[0]
    : user?.role || 'Pegawai'

  const userRoles = Array.isArray(user?.roles) ? user.roles : [user?.role || user?.roles].filter(Boolean)
  const ALLOWED_ADMIN_ROLES = [
    'super admin', 'superadmin', 'super_admin',
    'admin',
    'pengurus yayasan', 'yayasan', 'ketua yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan',
    'kepala sekolah', 'kepala_sekolah', 'kepsek',
    'divisi pendidikan', 'divisi_pendidikan'
  ]
  const canEditUnitAndRole = userRoles.some((r) => ALLOWED_ADMIN_ROLES.includes(String(r).toLowerCase()))
  const isParent = userRoles.some((r) =>
    ['orang tua', 'orang_tua', 'orang-tua', 'orangtua', 'wali murid', 'parent'].includes(String(r).toLowerCase())
  )

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
    { id: 'profil', label: 'Profil User', icon: User },
    { id: 'ganti-password', label: 'Ganti Password', icon: Lock },
    ...(isParent ? [{ id: 'password-anak', label: 'Password Login Anak', icon: KeyRound }] : []),
    { id: '2fa', label: 'Keamanan 2FA', icon: ShieldCheck },
    { id: 'session-login', label: 'Session Login', icon: Monitor },
    { id: 'activity-login', label: 'Activity Login', icon: Activity },
    { id: 'unit-tahun', label: 'Unit & Tahun Ajaran', icon: Grid, restricted: !canEditUnitAndRole },
  ]

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* Master Canonical Page Header */}
      <AppPageHeader
        variant="brand"
        icon={User}
        eyebrow="Portal Pegawai & Profil User"
        title="Profil & Keamanan Akun"
        description="Kelola data diri, ganti password, keamanan 2FA, session login, dan aktivitas akun Anda secara terpadu."
        chips={[
          `Role: ${primaryRole}`,
          `User: ${user?.name || user?.fullName || 'Pengguna'}`,
        ]}
        actions={
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white/10 backdrop-blur-md rounded-xl text-emerald-100 text-xs font-semibold border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Status: {primaryRole} (Aktif)</span>
          </div>
        }
      />

      {/* Tabs Bar Container */}
      <div className="bg-white p-2 rounded-[18px] border border-slate-200/80 shadow-xs overflow-x-auto flex gap-1.5 dark:border-slate-800 dark:bg-[#1B2433]">
        {tabs.map((tab) => {
          const IconComp = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#0E5C44] text-white shadow-md shadow-[#0E5C44]/20 dark:bg-[#3FBF75] dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              <IconComp className={`w-4 h-4 ${isActive ? 'text-emerald-200 dark:text-slate-900' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.restricted && (
                <Badge color="warning" size="sm" className="py-0 px-1.5 text-[10px]">
                  🔒 Terkunci
                </Badge>
              )}
            </button>
          )
        })}
      </div>

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

