import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowRightLeft,
  Award,
  BookOpen,
  Building2,
  FileSpreadsheet,
  GraduationCap,
  ShieldCheck,
  Trophy,
  Users,
} from 'lucide-react'
import {
  MasterDataPage,
  MasterPageHeader,
  masterStyles,
} from '../../components/master-data'

export function FoundationReportsPage() {
  const reports = [
    {
      id: 'sdm',
      title: 'Laporan Sumber Daya Manusia',
      description: 'Laporan tenaga pendidik dan kependidikan, rasio guru, status kepegawaian, dan distribusi per unit.',
      path: '/dashboard/yayasan/laporan/sdm',
      icon: Users,
      color: 'border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300',
    },
    {
      id: 'siswa',
      title: 'Laporan Data Siswa',
      description: 'Laporan jumlah, distribusi gender, jenjang, kelas/rombel, dan pertumbuhan siswa aktif.',
      path: '/dashboard/yayasan/laporan/siswa',
      icon: GraduationCap,
      color: 'border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300',
    },
    {
      id: 'mutasi',
      title: 'Laporan Mutasi Siswa',
      description: 'Laporan perpindahan siswa masuk, keluar, dan antarunit beserta selisih net pertumbuhan.',
      path: '/dashboard/yayasan/laporan/mutasi',
      icon: ArrowRightLeft,
      color: 'border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-300',
    },
    {
      id: 'kelulusan',
      title: 'Laporan Kelulusan Siswa',
      description: 'Laporan hasil penetapan kelulusan, persentase kelulusan, dan kelulusan tepat waktu.',
      path: '/dashboard/yayasan/laporan/kelulusan',
      icon: Award,
      color: 'border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300',
    },
    {
      id: 'alumni',
      title: 'Laporan Data Alumni',
      description: 'Laporan penelusuran karir alumni, angkatan, perguruan tinggi lanjutan, dan status pekerjaan.',
      path: '/dashboard/yayasan/laporan/alumni',
      icon: BookOpen,
      color: 'border-pink-100 bg-pink-50 text-pink-600 dark:border-pink-800/60 dark:bg-pink-950/40 dark:text-pink-300',
    },
    {
      id: 'prestasi',
      title: 'Laporan Rekapitulasi Prestasi Siswa',
      description: 'Laporan rekapitulasi prestasi siswa per unit, kepala sekolah, dan divisi pendidikan dengan kartu apresiasi siswa.',
      path: '/dashboard/yayasan/laporan/prestasi',
      icon: Trophy,
      color: 'border-yellow-100 bg-yellow-50 text-yellow-600 dark:border-yellow-800/60 dark:bg-yellow-950/40 dark:text-yellow-300',
    },
    {
      id: 'lintas-unit',
      title: 'Laporan Lintas Unit (Eksekutif)',
      description: 'Laporan eksekutif perbandingan komparatif seluruh unit pendidikan di bawah yayasan.',
      path: '/dashboard/yayasan/laporan/lintas-unit',
      icon: Building2,
      color: 'border-teal-100 bg-teal-50 text-teal-600 dark:border-teal-800/60 dark:bg-teal-950/40 dark:text-teal-300',
    },
  ]

  return (
    <MasterDataPage hideBreadcrumb className="foundation-reports-page">
      <MasterPageHeader
        title="Daftar Modul Laporan"
        description="Pilih salah satu menu laporan eksekutif di bawah ini untuk melihat KPI, grafik, rekap, data rinci, dan export."
        tone="brand"
        icon={FileSpreadsheet}
        actions={(
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
            <ShieldCheck className="h-3 w-3" />
            Pusat Laporan Eksekutif Pengurus Yayasan
          </span>
        )}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`${masterStyles.card} ui-enter group flex flex-col justify-between p-6 transition hover:-translate-y-1`}
            >
              <div className="space-y-4">
                <div className={`w-fit rounded-xl border p-3 ${item.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 transition group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-emerald-800 dark:border-slate-800 dark:text-emerald-400">
                <span>Buka Laporan Full</span>
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          )
        })}
      </div>
    </MasterDataPage>
  )
}
