import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowRightLeft,
  Award,
  BookOpen,
  Building2,
  GraduationCap,
  Trophy,
  Users,
} from 'lucide-react'
import {
  MasterDataPage,
  masterStyles,
} from '../../components/master-data'
import { Breadcrumbs } from '../../components/tailgrids/core/breadcrumbs'

export function FoundationReportsPage() {
  const reports = [
    {
      id: 'sdm',
      title: 'Laporan Sumber Daya Manusia',
      description: 'Laporan tenaga pendidik dan kependidikan, rasio guru, status kepegawaian, dan distribusi per unit.',
      path: '/dashboard/yayasan/laporan/sdm',
      icon: Users,
      badge: 'Kepegawaian & Guru',
      iconBg: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 ring-1 ring-emerald-500/20',
      cardStyle: 'bg-gradient-to-br from-emerald-50/80 via-white to-emerald-100/30 border-emerald-200/80 hover:border-emerald-400/90 hover:shadow-lg hover:shadow-emerald-900/5 dark:from-emerald-950/30 dark:via-[#1B2433] dark:to-emerald-900/10 dark:border-emerald-800/60 dark:hover:border-emerald-600',
      accentColor: 'bg-emerald-500',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      badgeColor: 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    },
    {
      id: 'siswa',
      title: 'Laporan Data Siswa',
      description: 'Laporan jumlah, distribusi gender, jenjang, kelas/rombel, dan pertumbuhan siswa aktif.',
      path: '/dashboard/yayasan/laporan/siswa',
      icon: GraduationCap,
      badge: 'Statistik Siswa',
      iconBg: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 ring-1 ring-blue-500/20',
      cardStyle: 'bg-gradient-to-br from-blue-50/80 via-white to-blue-100/30 border-blue-200/80 hover:border-blue-400/90 hover:shadow-lg hover:shadow-blue-900/5 dark:from-blue-950/30 dark:via-[#1B2433] dark:to-blue-900/10 dark:border-blue-800/60 dark:hover:border-blue-600',
      accentColor: 'bg-blue-500',
      textColor: 'text-blue-700 dark:text-blue-400',
      badgeColor: 'bg-blue-100/80 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    },
    {
      id: 'mutasi',
      title: 'Laporan Mutasi Siswa',
      description: 'Laporan perpindahan siswa masuk, keluar, dan antarunit beserta selisih net pertumbuhan.',
      path: '/dashboard/yayasan/laporan/mutasi',
      icon: ArrowRightLeft,
      badge: 'Arus & Net Pertumbuhan',
      iconBg: 'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 ring-1 ring-indigo-500/20',
      cardStyle: 'bg-gradient-to-br from-indigo-50/80 via-white to-indigo-100/30 border-indigo-200/80 hover:border-indigo-400/90 hover:shadow-lg hover:shadow-indigo-900/5 dark:from-indigo-950/30 dark:via-[#1B2433] dark:to-indigo-900/10 dark:border-indigo-800/60 dark:hover:border-indigo-600',
      accentColor: 'bg-indigo-500',
      textColor: 'text-indigo-700 dark:text-indigo-400',
      badgeColor: 'bg-indigo-100/80 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    },
    {
      id: 'kelulusan',
      title: 'Laporan Kelulusan Siswa',
      description: 'Laporan hasil penetapan kelulusan, persentase kelulusan, dan kelulusan tepat waktu.',
      path: '/dashboard/yayasan/laporan/kelulusan',
      icon: Award,
      badge: 'Penetapan Kelulusan',
      iconBg: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 ring-1 ring-amber-500/20',
      cardStyle: 'bg-gradient-to-br from-amber-50/80 via-white to-amber-100/30 border-amber-200/80 hover:border-amber-400/90 hover:shadow-lg hover:shadow-amber-900/5 dark:from-amber-950/30 dark:via-[#1B2433] dark:to-amber-900/10 dark:border-amber-800/60 dark:hover:border-amber-600',
      accentColor: 'bg-amber-500',
      textColor: 'text-amber-700 dark:text-amber-400',
      badgeColor: 'bg-amber-100/80 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    },
    {
      id: 'alumni',
      title: 'Laporan Data Alumni',
      description: 'Laporan penelusuran karir alumni, angkatan, perguruan tinggi lanjutan, dan status pekerjaan.',
      path: '/dashboard/yayasan/laporan/alumni',
      icon: BookOpen,
      badge: 'Tracer Study',
      iconBg: 'bg-pink-500/10 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300 ring-1 ring-pink-500/20',
      cardStyle: 'bg-gradient-to-br from-pink-50/80 via-white to-pink-100/30 border-pink-200/80 hover:border-pink-400/90 hover:shadow-lg hover:shadow-pink-900/5 dark:from-pink-950/30 dark:via-[#1B2433] dark:to-pink-900/10 dark:border-pink-800/60 dark:hover:border-pink-600',
      accentColor: 'bg-pink-500',
      textColor: 'text-pink-700 dark:text-pink-400',
      badgeColor: 'bg-pink-100/80 text-pink-800 dark:bg-pink-950 dark:text-pink-300',
    },
    {
      id: 'prestasi',
      title: 'Laporan Rekapitulasi Prestasi Siswa',
      description: 'Laporan rekapitulasi prestasi siswa per unit, kepala sekolah, dan divisi pendidikan dengan kartu apresiasi siswa.',
      path: '/dashboard/yayasan/laporan/prestasi',
      icon: Trophy,
      badge: 'Prestasi & Apresiasi',
      iconBg: 'bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300 ring-1 ring-yellow-500/20',
      cardStyle: 'bg-gradient-to-br from-yellow-50/80 via-white to-amber-100/30 border-yellow-200/80 hover:border-yellow-400/90 hover:shadow-lg hover:shadow-yellow-900/5 dark:from-yellow-950/30 dark:via-[#1B2433] dark:to-yellow-900/10 dark:border-yellow-800/60 dark:hover:border-yellow-600',
      accentColor: 'bg-yellow-500',
      textColor: 'text-yellow-700 dark:text-yellow-400',
      badgeColor: 'bg-yellow-100/80 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
    },
    {
      id: 'lintas-unit',
      title: 'Laporan Lintas Unit (Eksekutif)',
      description: 'Laporan eksekutif perbandingan komparatif seluruh unit pendidikan di bawah yayasan.',
      path: '/dashboard/yayasan/laporan/lintas-unit',
      icon: Building2,
      badge: 'Eksekutif Lintas Unit',
      iconBg: 'bg-teal-500/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300 ring-1 ring-teal-500/20',
      cardStyle: 'bg-gradient-to-br from-teal-50/80 via-white to-teal-100/30 border-teal-200/80 hover:border-teal-400/90 hover:shadow-lg hover:shadow-teal-900/5 dark:from-teal-950/30 dark:via-[#1B2433] dark:to-teal-900/10 dark:border-teal-800/60 dark:hover:border-teal-600',
      accentColor: 'bg-teal-500',
      textColor: 'text-teal-700 dark:text-teal-400',
      badgeColor: 'bg-teal-100/80 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
    },
  ]

  return (
    <MasterDataPage hideBreadcrumb className="foundation-reports-page space-y-6">
      <div className="print:hidden">
        <Breadcrumbs
          dividerType="chevron"
          items={[
            { href: '/dashboard/yayasan', label: 'Yayasan' },
            { label: 'Laporan Eksekutif' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`relative overflow-hidden rounded-[20px] border p-6 transition-all duration-300 hover:-translate-y-1 ${item.cardStyle} group flex flex-col justify-between`}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 ${item.accentColor} opacity-80`} />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-fit rounded-xl p-3 ${item.iconBg}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>

                <div>
                  <h3 className={`text-base font-extrabold text-slate-900 transition group-hover:${item.textColor} dark:text-white`}>
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className={`mt-6 flex items-center justify-between border-t border-slate-200/60 pt-4 text-xs font-bold ${item.textColor} dark:border-slate-800`}>
                <span>Buka Laporan Full</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>
          )
        })}
      </div>
    </MasterDataPage>
  )
}
