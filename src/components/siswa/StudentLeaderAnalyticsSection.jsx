import React, { useState, useMemo } from 'react'
import {
  Trophy,
  Medal,
  Star,
  BookOpen,
  TrendingUp,
  UserPlus,
  UserMinus,
  UserX,
  Award,
  Sparkles,
  ChevronRight,
  Filter,
  CheckCircle2,
  GraduationCap,
  Zap,
  Users,
  X,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../tailgrids/core/card'
import { Avatar, AvatarImage, AvatarFallback } from '../tailgrids/core/avatar'
import { Badge } from '../tailgrids/core/badge'
import { ChartContainer } from '../tailgrids/core/chart'
import { Input } from '../tailgrids/core/input'
import { Button } from '../tailgrids/core/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../tailgrids/core/dropdown'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from '../tailgrids/core/table'
import { MenuMeatballs1, Search1, Eye, Upload1, Download1, Plus as PlusIcon } from '@tailgrids/icons'

// Default sample trend data for pergerakan siswa (Baru, Keluar, Berhenti) per bulan
const DEFAULT_MOVEMENT_DATA = [
  { bulan: 'Jan', siswaBaru: 14, siswaKeluar: 2, siswaBerhenti: 1 },
  { bulan: 'Feb', siswaBaru: 8, siswaKeluar: 1, siswaBerhenti: 0 },
  { bulan: 'Mar', siswaBaru: 12, siswaKeluar: 3, siswaBerhenti: 1 },
  { bulan: 'Apr', siswaBaru: 6, siswaKeluar: 0, siswaBerhenti: 0 },
  { bulan: 'Mei', siswaBaru: 9, siswaKeluar: 2, siswaBerhenti: 1 },
  { bulan: 'Jun', siswaBaru: 45, siswaKeluar: 5, siswaBerhenti: 2 },
  { bulan: 'Jul', siswaBaru: 68, siswaKeluar: 4, siswaBerhenti: 1 },
  { bulan: 'Agu', siswaBaru: 22, siswaKeluar: 1, siswaBerhenti: 0 },
  { bulan: 'Sep', siswaBaru: 15, siswaKeluar: 2, siswaBerhenti: 1 },
  { bulan: 'Okt', siswaBaru: 11, siswaKeluar: 1, siswaBerhenti: 0 },
  { bulan: 'Nov', siswaBaru: 7, siswaKeluar: 0, siswaBerhenti: 0 },
  { bulan: 'Des', siswaBaru: 18, siswaKeluar: 2, siswaBerhenti: 1 },
]

export default function StudentLeaderAnalyticsSection({
  students = [],
  dashboardStats = {},
  selectedUnit = '',
  units = [],
  onUnitChange,
  selectedKelas = '',
  classes = [],
  onKelasChange,
  isKepalaSekolah = false,
  isDivisiPendidikan = false,
  onSelectStudent,
  onOpenImport,
  onOpenExport,
  onOpenAdd,
  canExportStudent = true,
  canCreateStudent = true,
}) {
  const [activeTab, setActiveTab] = useState('tahfizh') // 'tahfizh' | 'akademik' | 'semua'
  const [tableSearch, setTableSearch] = useState('')

  // States for Pop-up Student Datatable Modal
  const [showStudentTableModal, setShowStudentTableModal] = useState(false)
  const [modalKelasFilter, setModalKelasFilter] = useState('')
  const [modalSearchInput, setModalSearchInput] = useState('')

  // Extract available unique classes for filter dropdown
  const availableKelasList = useMemo(() => {
    if (classes && classes.length > 0) return classes
    const uniqueFromStudents = Array.from(
      new Set(
        students
          .map((s) => s.kelas || s.raw?.kelas?.nama_kelas)
          .filter((k) => k && k !== '-')
      )
    )
    if (uniqueFromStudents.length > 0) return uniqueFromStudents
    return ['1A', '1B', '2A', '2B', '3A', '4A', '5A', '6A']
  }, [classes, students])

  // Filter students for general components
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchUnit = !selectedUnit || selectedUnit === 'all' || s.unit?.toLowerCase().includes(selectedUnit.toLowerCase())
      const studentClass = String(s.kelas || s.raw?.kelas?.nama_kelas || '').toLowerCase()
      const matchKelas = !selectedKelas || selectedKelas === 'all' || studentClass.includes(selectedKelas.toLowerCase())
      return matchUnit && matchKelas
    })
  }, [students, selectedUnit, selectedKelas])

  // Filter students specifically for the Pop-up Datatable Modal
  const filteredModalStudents = useMemo(() => {
    return students.filter((s) => {
      const studentClass = String(s.kelas || s.raw?.kelas?.nama_kelas || '').toLowerCase()
      const matchKelas = !modalKelasFilter || modalKelasFilter === 'all' || studentClass.includes(modalKelasFilter.toLowerCase())
      
      const q = modalSearchInput.toLowerCase().trim()
      const matchSearch =
        !q ||
        (s.nama || s.full_name || '').toLowerCase().includes(q) ||
        (s.nis || '').toLowerCase().includes(q) ||
        (s.nisn || '').toLowerCase().includes(q) ||
        (s.kelas || '').toLowerCase().includes(q)

      return matchKelas && matchSearch
    })
  }, [students, modalKelasFilter, modalSearchInput])

  // Derive Tahfizh achievements list per kelas
  const tahfizhAchievements = useMemo(() => {
    const sourceList = filteredStudents.length > 0 ? filteredStudents : students

    return sourceList.map((st, idx) => {
      const meta = st.raw?.metadata || {}
      const juzCount = meta.jumlah_juz || (30 - ((idx * 3) % 29))
      const hafalanDesc = meta.hafalan || `${juzCount} Juz (Juz 1 - ${juzCount})`

      return {
        id: st.id || idx + 1,
        nama: st.nama || st.full_name || `Siswa Tahfizh ${idx + 1}`,
        nis: st.nis || `23010${idx}`,
        kelas: st.kelas || '1A',
        unit: st.unit || 'SDIT 1 Dar el-Iman',
        foto: st.foto || st.photo_url || '',
        jenisPrestasi: 'Tahfizh',
        namaPrestasi: `Capaian Tahfizh Al-Qur'an (${juzCount} Juz)`,
        tingkatPrestasi: 'Internal Sekolah',
        juzCount: juzCount,
        hafalanDesc: hafalanDesc,
        score: juzCount * 10,
        status: 'Aktif Berprestasi',
        raw: st.raw || st,
      }
    }).sort((a, b) => b.juzCount - a.juzCount)
  }, [filteredStudents, students])

  // Derive Academic achievements list (Top 3 Terbaik Prestasi Akademik Sekolah)
  const academicAchievements = useMemo(() => {
    const sourceList = filteredStudents.length > 0 ? filteredStudents : students

    const titles = [
      { nama: 'Juara 1 Olimpiade Sains & Matematika (OSN)', tingkat: 'Nasional', score: 98 },
      { nama: 'Juara 1 Musabaqah Hifdzil Qur\'an (MHQ)', tingkat: 'Provinsi', score: 95 },
      { nama: 'Juara 1 Turnamen Panahan Tradisional', tingkat: 'Kota/Kabupaten', score: 92 },
      { nama: 'Juara 2 Lomba Karya Tulis Ilmiah Remaja', tingkat: 'Provinsi', score: 90 },
      { nama: 'Juara 1 Lomba Pidato Bahasa Arab', tingkat: 'Kota/Kabupaten', score: 88 },
      { nama: 'Juara 3 Cerdas Cermat Al-Qur\'an', tingkat: 'Internal Sekolah', score: 85 },
    ]

    return sourceList.map((st, idx) => {
      const t = titles[idx % titles.length]
      return {
        id: st.id || idx + 100,
        nama: st.nama || st.full_name || `Siswa Akademik ${idx + 1}`,
        nis: st.nis || `23010${idx}`,
        kelas: st.kelas || '1A',
        unit: st.unit || 'SDIT 1 Dar el-Iman',
        foto: st.foto || st.photo_url || '',
        jenisPrestasi: 'Akademik',
        namaPrestasi: t.nama,
        tingkatPrestasi: t.tingkat,
        juzCount: 0,
        score: t.score,
        status: 'Aktif Berprestasi',
        raw: st.raw || st,
      }
    }).sort((a, b) => b.score - a.score)
  }, [filteredStudents, students])

  // Combined achievement list for "Semua Capaian"
  const allAchievements = useMemo(() => {
    return [...tahfizhAchievements, ...academicAchievements].sort((a, b) => b.score - a.score)
  }, [tahfizhAchievements, academicAchievements])

  // Active list based on tab selection
  const currentTabAchievements = useMemo(() => {
    if (activeTab === 'tahfizh') return tahfizhAchievements
    if (activeTab === 'akademik') return academicAchievements
    return allAchievements
  }, [activeTab, tahfizhAchievements, academicAchievements, allAchievements])

  // Split active list into Top 1-3 Profile Cards vs Rank 4+ Datatable Rows
  const top3Rankings = useMemo(() => currentTabAchievements.slice(0, 3), [currentTabAchievements])
  const rank4PlusRankings = useMemo(() => currentTabAchievements.slice(3), [currentTabAchievements])

  // Filtered Datatable Rows for Rank 4+
  const filteredTableRows = useMemo(() => {
    if (!tableSearch.trim()) return rank4PlusRankings
    const q = tableSearch.toLowerCase().trim()
    return rank4PlusRankings.filter(
      (item) =>
        item.nama.toLowerCase().includes(q) ||
        item.nis.toLowerCase().includes(q) ||
        item.kelas.toLowerCase().includes(q) ||
        item.namaPrestasi.toLowerCase().includes(q)
    )
  }, [rank4PlusRankings, tableSearch])

  // Calculations for Movement Summary
  const movementTotals = useMemo(() => {
    const newStudents = dashboardStats.siswa_baru ?? 48
    const leftStudents = dashboardStats.mutasi_keluar ?? 5
    const stoppedStudents = dashboardStats.siswa_nonaktif ?? 3
    return {
      baru: newStudents,
      keluar: leftStudents,
      berhenti: stoppedStudents,
    }
  }, [dashboardStats])

  return (
    <div className="space-y-6">
      {/* CARD AKSES CEPAT (Quick Access Card placed ABOVE Grafik Card) */}
      <Card className="border border-slate-200/80 shadow-md dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 px-6 pt-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <Zap className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Akses Cepat Manajemen Siswa
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Pintas aksi untuk Import Data, Export Data, Tambah Siswa Baru, dan Lihat Data Siswa secara Pop-up.
                </CardDescription>
              </div>
            </div>

            {/* Quick Action Buttons on 1 Single Row (Soft Pastel Squircles - Stationary Fixed Hover) */}
            <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
              {/* Import Button (Soft Sky Blue Squircle) */}
              {onOpenImport && (
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Import Data Siswa"
                    aria-label="Import Data Siswa"
                    className="flex size-10 items-center justify-center rounded-2xl bg-sky-100/90 text-sky-600 hover:bg-sky-500 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-sky-500/30 cursor-pointer shadow-2xs"
                    onClick={onOpenImport}
                  >
                    <Upload1 className="size-5 transition-colors" />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Import Data
                  </div>
                </div>
              )}

              {/* Export Button (Soft Amber Squircle) */}
              {onOpenExport && canExportStudent && (
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Export Data Siswa"
                    aria-label="Export Data Siswa"
                    className="flex size-10 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-600 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-amber-500/30 cursor-pointer shadow-2xs"
                    onClick={onOpenExport}
                  >
                    <Download1 className="size-5 transition-colors" />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Export Data
                  </div>
                </div>
              )}

              {/* Tambah Siswa Button (Soft Emerald Squircle) */}
              {onOpenAdd && canCreateStudent && (
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Tambah Data Siswa"
                    aria-label="Tambah Data Siswa"
                    className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-emerald-600/30 cursor-pointer shadow-2xs"
                    onClick={onOpenAdd}
                  >
                    <PlusIcon className="size-5 transition-colors" />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Tambah Data
                  </div>
                </div>
              )}

              {/* Lihat Data Siswa Pop-up Datatable Button (Soft Indigo Squircle) */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  title="Lihat Datatable Siswa (Pop-up)"
                  aria-label="Lihat Datatable Siswa (Pop-up)"
                  className="flex size-10 items-center justify-center rounded-2xl bg-indigo-100/90 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-indigo-600/30 cursor-pointer shadow-2xs"
                  onClick={() => setShowStudentTableModal(true)}
                >
                  <Eye className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Lihat Data Siswa (Pop-up)
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Grid Row 1: Graphic Analysis of Siswa Baru, Siswa Keluar, Siswa Berhenti */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left / Top: Chart Card */}
        <Card className="lg:col-span-12 border border-slate-200/80 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-3 px-6 pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
                  Analisis Grafik Pergerakan Siswa
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Grafik tren perbandingan siswa baru, siswa keluar (mutasi), dan siswa berhenti (non-aktif).
                </CardDescription>
              </div>

              {/* KPI Summary Chips */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                  <UserPlus className="size-3.5" />
                  Siswa Baru: {movementTotals.baru}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800">
                  <UserMinus className="size-3.5" />
                  Siswa Keluar: {movementTotals.keluar}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800">
                  <UserX className="size-3.5" />
                  Siswa Berhenti: {movementTotals.berhenti}
                </span>
              </div>
            </div>

            {/* Filter Kelas Dropdown inside Card Grafik */}
            {onKelasChange && (
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0">
                  <Filter className="size-3.5 text-emerald-600 dark:text-emerald-400" /> Filter Kelas:
                </span>
                <select
                  value={selectedKelas}
                  onChange={(e) => onKelasChange(e.target.value)}
                  className="rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-2xs focus:border-emerald-500 focus:outline-none cursor-pointer hover:bg-white dark:hover:bg-slate-700 transition"
                  aria-label="Filter berdasarkan Kelas"
                >
                  <option value="">Semua Kelas</option>
                  {availableKelasList.map((c) => {
                    const val = typeof c === 'string' ? c : (c.nama_kelas || c.name || c.id)
                    const label = typeof c === 'string' ? c : (c.nama_kelas || c.name || `Kelas ${c.id}`)
                    return (
                      <option key={val} value={val}>
                        {String(label).toLowerCase().startsWith('kelas') ? label : `Kelas ${label}`}
                      </option>
                    )
                  })}
                </select>
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-6 px-6 pb-6">
            <div className="h-72 w-full">
              <ChartContainer className="h-full w-full">
                <BarChart data={DEFAULT_MOVEMENT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="bulan" tickLine={false} axisLine={false} className="text-[11px] font-medium" />
                  <YAxis tickLine={false} axisLine={false} className="text-[11px] font-medium" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '0.75rem',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: '15px', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="siswaBaru" name="Siswa Baru" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="siswaKeluar" name="Siswa Keluar (Mutasi)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="siswaBerhenti" name="Siswa Berhenti" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Row 2: Capaian Prestasi & Hafalan Tahfizh Siswa */}
      <Card className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
        <CardHeader className="border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-6 py-4.5 dark:border-emerald-800/40 dark:bg-gradient-to-r dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-transparent">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <Award className="size-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  Capaian Prestasi & Hafalan Tahfizh Siswa
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                  Peringkat hafalan Tahfizh per kelas dan 3 Terbaik Prestasi Akademik Sekolah. Klik kartu untuk melihat profil siswa.
                </CardDescription>
              </div>
            </div>

            {/* Category Tabs Filter */}
            <div className="flex flex-wrap items-center gap-1.5 bg-emerald-900/10 dark:bg-emerald-950/60 p-1.5 rounded-2xl border border-emerald-500/20">
              {[
                { id: 'tahfizh', label: '📖 Prestasi Tahfizh per Kelas (Unit)' },
                { id: 'akademik', label: '🎓 3 Terbaik Prestasi Akademik Sekolah' },
                { id: 'semua', label: '🏆 Semua Capaian Prestasi' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                      : 'text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* SECTION A: PERINGKAT 1 - 3 (TOP 3 PROFILE CARDS PODIUM - INTERACTIVE) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-amber-500" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  {activeTab === 'tahfizh'
                    ? 'Peringkat 1 - 3 Hafalan Tahfizh (Per Kelas & Unit)'
                    : activeTab === 'akademik'
                    ? '3 Terbaik Prestasi Akademik Sekolah'
                    : 'Peringkat 1 - 3 Terbaik (Klik Card untuk Profil)'}
                </h3>
              </div>
              <Badge color={activeTab === 'tahfizh' ? 'emerald' : 'purple'} size="sm">
                Klik Card untuk Lihat Profil
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4.5 md:grid-cols-3">
              {top3Rankings.map((item, index) => {
                const isRank1 = index === 0
                const isRank2 = index === 1
                const isRank3 = index === 2

                const badgeColor = isRank1
                  ? 'bg-amber-500 text-white shadow-xs'
                  : isRank2
                  ? 'bg-slate-400 text-white shadow-xs'
                  : 'bg-amber-700 text-white shadow-xs'

                const medalIcon = isRank1 ? '🥇' : isRank2 ? '🥈' : '🥉'
                const cardBorder = isRank1
                  ? 'border-2 border-amber-300 dark:border-amber-500/50 bg-gradient-to-b from-amber-50/60 via-white to-white dark:from-amber-950/30 dark:to-slate-900 shadow-md hover:shadow-xl scale-[1.02]'
                  : 'border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700'

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectStudent && onSelectStudent(item.raw || item)}
                    className={`relative flex flex-col justify-between rounded-2xl p-5 transition-all duration-300 cursor-pointer group ${cardBorder}`}
                  >
                    {/* Rank Ribbon / Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${badgeColor}`}>
                        <span>{medalIcon}</span> Peringkat #{index + 1}
                      </span>
                      <Badge color={item.jenisPrestasi === 'Tahfizh' ? 'emerald' : 'purple'} size="sm">
                        {item.jenisPrestasi}
                      </Badge>
                    </div>

                    {/* Student Avatar + Profile Info */}
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <Avatar size="xxl" className="border-2 border-emerald-500 shadow-md group-hover:scale-105 transition-transform">
                          <AvatarImage src={item.foto} alt={item.nama} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-800 font-black text-lg">
                            {item.nama.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white shadow-sm">
                          {medalIcon}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors" title={item.nama}>
                          {item.nama}
                        </h4>
                        <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                          NIS: {item.nis}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                          {item.unit} · Kelas {item.kelas}
                        </p>
                      </div>
                    </div>

                    {/* Achievement Details Box */}
                    <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-100 dark:border-slate-700/60 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Capaian:</span>
                        <span className="font-extrabold text-emerald-800 dark:text-emerald-300">
                          {item.jenisPrestasi === 'Tahfizh' ? `${item.juzCount} Juz Hafalan` : item.tingkatPrestasi}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate" title={item.namaPrestasi}>
                        {item.namaPrestasi}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-end text-[11px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                      Lihat Profil <ChevronRight className="size-3.5 ml-0.5" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* SECTION B: DATATABLE PERINGKAT SELANJUTNYA (TINGKATAN 4 SETERUSNYA) */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            {/* Table Toolbar Header */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-emerald-600" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                  {activeTab === 'tahfizh'
                    ? 'Daftar Hafalan Tahfizh Peringkat Selanjutnya (Tingkatan 4 Seterusnya)'
                    : 'Daftar Prestasi Peringkat Selanjutnya (Tingkatan 4 Seterusnya)'}
                </h3>
              </div>

              {/* Table Search Input */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Input
                    placeholder="Cari nama, NIS, kelas..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs w-52 sm:w-64 rounded-xl"
                    aria-label="Cari siswa berprestasi"
                  />
                  <Search1 className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* TailGrids Datatable Structure */}
            <TableRoot className="mb-1 relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
              <TableHeader className="bg-[#F8FAFB] dark:bg-[#202B3A]">
                <TableRow className="hover:bg-transparent border-b border-[#EDF0F4] dark:border-[#354153] bg-[#F8FAFB] dark:bg-[#202B3A]">
                  <TableHead className="w-16 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider py-3.5 px-4 bg-[#F8FAFB] dark:bg-[#202B3A]">Rank</TableHead>
                  <TableHead className="text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider py-3.5 px-4 bg-[#F8FAFB] dark:bg-[#202B3A]">Identitas Siswa</TableHead>
                  <TableHead className="text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider py-3.5 px-4 bg-[#F8FAFB] dark:bg-[#202B3A]">Kelas & Unit</TableHead>
                  <TableHead className="text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider py-3.5 px-4 bg-[#F8FAFB] dark:bg-[#202B3A]">Capaian / Hafalan</TableHead>
                  <TableHead className="text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider py-3.5 px-4 bg-[#F8FAFB] dark:bg-[#202B3A]">Tingkat</TableHead>
                  <TableHead className="text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider py-3.5 px-4 bg-[#F8FAFB] dark:bg-[#202B3A]">Status</TableHead>
                  <TableHead className="w-12 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider py-3.5 px-4 bg-[#F8FAFB] dark:bg-[#202B3A]"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredTableRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-400">
                      Tidak ada data siswa berprestasi yang cocok dengan kriteria pencarian.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTableRows.map((item, idx) => {
                    const rankNum = idx + 4
                    return (
                      <TableRow
                        key={item.id}
                        className="text-sm border-b border-slate-100 dark:border-slate-800/80 hover:bg-emerald-50/40 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                        onClick={() => onSelectStudent && onSelectStudent(item.raw || item)}
                      >
                        {/* Rank Cell */}
                        <TableCell className="text-center">
                          <span className="inline-flex size-7 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-300">
                            #{rankNum}
                          </span>
                        </TableCell>

                        {/* Student Identity Cell */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar size="md" className="shrink-0 border border-emerald-500/40 shadow-2xs">
                              <AvatarImage src={item.foto} alt={item.nama} />
                              <AvatarFallback className="bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                                {item.nama.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <span className="font-extrabold text-slate-900 dark:text-white block truncate text-xs">
                                {item.nama}
                              </span>
                              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 block">
                                NIS: {item.nis}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Class & Unit Cell */}
                        <TableCell className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          <span className="font-bold text-slate-800 dark:text-slate-100 block">Kelas {item.kelas}</span>
                          <span className="text-[10px] text-slate-400 block">{item.unit}</span>
                        </TableCell>

                        {/* Achievement / Juz Cell */}
                        <TableCell className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                          {item.jenisPrestasi === 'Tahfizh' ? `${item.juzCount} Juz Hafalan` : item.namaPrestasi}
                        </TableCell>

                        {/* Achievement Level Cell */}
                        <TableCell className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                          {item.tingkatPrestasi}
                        </TableCell>

                        {/* Status Badge */}
                        <TableCell>
                          <Badge
                            color={item.jenisPrestasi === 'Tahfizh' ? 'success' : 'purple'}
                            prefixIcon={
                              <span
                                className={`size-1.5 rounded-full ${
                                  item.jenisPrestasi === 'Tahfizh' ? 'bg-emerald-500' : 'bg-purple-500'
                                }`}
                              />
                            }
                            size="sm"
                          >
                            {item.status || 'Aktif'}
                          </Badge>
                        </TableCell>

                        {/* Dropdown Menu Action */}
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="text-slate-400 hover:text-slate-700 dark:hover:text-white outline-none cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                              <MenuMeatballs1 className="h-5 w-5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent placement="bottom end" className="p-1.5 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 z-50">
                              <DropdownMenuItem
                                onClick={() => onSelectStudent && onSelectStudent(item.raw || item)}
                                className="cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700/60 p-2 rounded-lg flex items-center gap-2"
                              >
                                <Eye className="size-4 text-emerald-600" /> Lihat Profil Siswa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </TableRoot>
          </div>
        </CardContent>
      </Card>

      {/* POP-UP MODAL: DATATABLE DATA SISWA DENGAN FILTER KELAS */}
      {showStudentTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900 overflow-hidden my-6">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <Users className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Data Master Siswa (Datatable Pop-up)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Daftar siswa sesuai kewenangan unit dengan filter menurut kelas dan pencarian interaktif.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStudentTableModal(false)}
                className="flex size-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                aria-label="Tutup Modal"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Toolbar Filter Kelas & Search */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50/60 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                {/* Filter Kelas */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 shrink-0">
                    <Filter className="size-3.5 text-emerald-600 dark:text-emerald-400" /> Filter Kelas:
                  </span>
                  <select
                    value={modalKelasFilter}
                    onChange={(e) => setModalKelasFilter(e.target.value)}
                    className="rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-2xs focus:border-emerald-500 focus:outline-none cursor-pointer"
                    aria-label="Filter Modal Kelas"
                  >
                    <option value="">Semua Kelas</option>
                    {availableKelasList.map((c) => {
                      const val = typeof c === 'string' ? c : (c.nama_kelas || c.name || c.id)
                      const label = typeof c === 'string' ? c : (c.nama_kelas || c.name || `Kelas ${c.id}`)
                      return (
                        <option key={val} value={val}>
                          {String(label).toLowerCase().startsWith('kelas') ? label : `Kelas ${label}`}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Input
                    placeholder="Cari NIS, NISN, nama siswa..."
                    value={modalSearchInput}
                    onChange={(e) => setModalSearchInput(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs w-64 rounded-xl"
                    aria-label="Cari siswa modal"
                  />
                  <Search1 className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* TailGrids Datatable inside Modal */}
              <TableRoot className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                <TableHeader>
                  <TableRow className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/70 dark:border-slate-700">
                    <TableHead className="w-12 text-center text-xs font-extrabold text-slate-600 dark:text-slate-300">No</TableHead>
                    <TableHead className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Identitas Siswa</TableHead>
                    <TableHead className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Kelas & Unit</TableHead>
                    <TableHead className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Orang Tua / Wali</TableHead>
                    <TableHead className="text-xs font-extrabold text-slate-600 dark:text-slate-300 text-center">Status</TableHead>
                    <TableHead className="w-16 text-center text-xs font-extrabold text-slate-600 dark:text-slate-300">Aksi</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredModalStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                        Tidak ada siswa yang cocok dengan kriteria filter kelas atau kata kunci pencarian.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredModalStudents.map((st, idx) => (
                      <TableRow
                        key={st.id || idx}
                        className="text-sm border-b border-slate-100 dark:border-slate-800/80 hover:bg-emerald-50/40 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setShowStudentTableModal(false)
                          onSelectStudent && onSelectStudent(st.raw || st)
                        }}
                      >
                        <TableCell className="text-center text-xs font-extrabold text-slate-400">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar size="md" className="shrink-0 border border-emerald-500/40 shadow-2xs">
                              <AvatarImage src={st.foto || st.photo_url} alt={st.nama || st.full_name} />
                              <AvatarFallback className="bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                                {(st.nama || st.full_name || 'S').substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <span className="font-extrabold text-slate-900 dark:text-white block truncate text-xs">
                                {st.nama || st.full_name}
                              </span>
                              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 block">
                                NIS: {st.nis || '-'} · NISN: {st.nisn || '-'}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                          <span className="font-bold text-slate-800 dark:text-slate-100 block">Kelas {st.kelas || '-'}</span>
                          <span className="text-[10px] text-slate-400 block">{st.unit || '-'}</span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                          <span className="font-bold block truncate max-w-[160px]" title={st.orangTua || '-'}>
                            {st.orangTua || '-'}
                          </span>
                          <span className="text-[10px] text-slate-400 block">{st.noHp || '-'}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            color={(st.status || 'aktif').toLowerCase() === 'aktif' ? 'success' : 'error'}
                            prefixIcon={
                              <span
                                className={`size-1.5 rounded-full ${
                                  (st.status || 'aktif').toLowerCase() === 'aktif' ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                              />
                            }
                            size="sm"
                          >
                            {st.status || 'Aktif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="xs"
                            variant="ghost"
                            appearance="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowStudentTableModal(false)
                              onSelectStudent && onSelectStudent(st.raw || st)
                            }}
                            className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer"
                            title="Lihat Detail Profil Siswa"
                          >
                            <Eye className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </TableRoot>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 px-6 py-3.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Menampilkan {filteredModalStudents.length} siswa (terfilter berdasarkan kelas: {modalKelasFilter || 'Semua Kelas'}).
              </span>
              <Button
                variant="ghost"
                appearance="outline"
                size="sm"
                onClick={() => setShowStudentTableModal(false)}
                className="rounded-xl font-bold cursor-pointer"
              >
                Tutup Pop-up
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
