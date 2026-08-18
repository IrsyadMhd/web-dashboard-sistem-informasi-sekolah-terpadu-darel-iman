import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  AlertTriangle,
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  HeartPulse,
  ShieldAlert,
  UserCheck,
  Users,
} from 'lucide-react'
import { lmsPresensiService } from '../../services/lmsPresensiService'
import { useAuthStore } from '../../stores/authStore'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import AppBadge from '../../components/app/AppBadge'
import AppEmptyState from '../../components/app/AppEmptyState'
import AppSkeleton from '../../components/app/AppSkeleton'
import { Button } from '@/components/tailgrids/core/button'
import { TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from '@/components/tailgrids/core/table'

export default function HomeroomAttendanceDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [pendingPermissions, setPendingPermissions] = useState([])
  const [followUps, setFollowUps] = useState([])

  useEffect(() => {
    let active = true
    const fetchData = async () => {
      setLoading(true)
      try {
        const [dashRes, permRes, followRes] = await Promise.all([
          lmsPresensiService.getHomeroomDashboard().catch(() => null),
          lmsPresensiService.getHomeroomPermissions({ status: 'submitted' }).catch(() => ({ data: [] })),
          lmsPresensiService.getFollowUps({ status: 'new' }).catch(() => ({ data: [] })),
        ])

        if (!active) return
        setDashboardData(dashRes?.data || dashRes || null)

        const rawPerms = permRes?.data?.data || permRes?.data || []
        setPendingPermissions(Array.isArray(rawPerms) ? rawPerms : [])

        const rawFollow = followRes?.data?.data || followRes?.data || []
        setFollowUps(Array.isArray(rawFollow) ? rawFollow : [])
      } catch (err) {
        console.error('Failed to load homeroom dashboard:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchData()
    return () => {
      active = false
    }
  }, [])

  const rombelInfo = dashboardData?.rombel || { nama: 'Rombel Binaan', tingkat: '-' }
  const stats = dashboardData?.stats || {
    total_students: 0,
    attendance_rate: 95,
    present_today: 0,
    sick_today: 0,
    permission_today: 0,
    absent_today: 0,
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <AppBreadcrumb items={[{ label: 'Absensi', href: '/absensi' }, { label: 'Dashboard Wali Kelas' }]} />
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Dashboard Presensi Wali Kelas
              </h1>
              <span className="rounded-xl bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {rombelInfo.nama}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              Pengawasan presensi, verifikasi izin/sakit, dan tindak lanjut siswa rombel binaan Anda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              appearance="fill"
              size="md"
              onClick={() => navigate('/absensi/rekap-kehadiran')}
            >
              <FileText className="mr-2 h-4 w-4" /> Rekap Presensi
            </Button>
            <Button
              variant="ghost"
              appearance="outline"
              size="md"
              onClick={() => navigate('/absensi/verifikasi-izin')}
            >
              <FileCheck2 className="mr-2 h-4 w-4" /> Verifikasi Izin ({pendingPermissions.length})
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Total Siswa Rombel</span>
            <Users className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{stats.total_students || 0}</p>
          <span className="text-xs font-medium text-slate-500">Siswa Aktif Rombel Binaan</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">% Kehadiran Bulan Ini</span>
            <Award className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-3 text-3xl font-black text-blue-600 dark:text-blue-400">{stats.attendance_rate || 100}%</p>
          <span className="text-xs font-medium text-slate-500">Tingkat Kehadiran Rombel</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Verifikasi Izin Pending</span>
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-3 text-3xl font-black text-amber-600 dark:text-amber-400">{pendingPermissions.length}</p>
          <span className="text-xs font-medium text-slate-500">Menunggu Persetujuan</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Perlu Tindak Lanjut</span>
            <ShieldAlert className="h-5 w-5 text-rose-600" />
          </div>
          <p className="mt-3 text-3xl font-black text-rose-600 dark:text-rose-400">{followUps.length}</p>
          <span className="text-xs font-medium text-slate-500">Siswa Alpa / Bermasalah</span>
        </div>
      </div>

      {/* Main Grid: Pending Permissions & Follow Up Alert */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Permissions List */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-emerald-600" /> Pengajuan Izin Menunggu Verifikasi
            </h2>
            <Link to="/absensi/verifikasi-izin" className="text-xs font-semibold text-emerald-600 hover:underline">
              Kelola Semua &rarr;
            </Link>
          </div>

          {loading ? (
            <AppSkeleton rows={3} />
          ) : pendingPermissions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Tidak ada surat izin/sakit siswa yang menunggu verifikasi saat ini.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {pendingPermissions.slice(0, 5).map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.student?.full_name || item.siswa_nama || 'Nama Siswa'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Jenis: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.permission_type || item.jenis}</span> • Tanggal: {item.start_date || item.tanggal}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    appearance="fill"
                    size="xs"
                    onClick={() => navigate('/absensi/verifikasi-izin')}
                  >
                    Verifikasi
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Student Follow Up Warning */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-rose-600" /> Tindak Lanjut Absensi Siswa
            </h2>
            <Link to="/absensi/tindak-lanjut" className="text-xs font-semibold text-rose-600 hover:underline">
              Lihat Detail &rarr;
            </Link>
          </div>

          {loading ? (
            <AppSkeleton rows={3} />
          ) : followUps.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Tidak ada catatan tindak lanjut presensi siswa yang aktif.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {followUps.slice(0, 5).map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.student?.full_name || item.siswa_nama || 'Siswa'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Tindakan: <span className="font-medium text-slate-700 dark:text-slate-300">{item.action_taken || 'Konseling/Panggilan'}</span>
                    </p>
                  </div>
                  <AppBadge variant="danger">Tindak Lanjut</AppBadge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
