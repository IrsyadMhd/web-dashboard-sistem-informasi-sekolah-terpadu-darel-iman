import React, { useEffect, useState, useMemo } from 'react'
import {
  BookMarked,
  Calendar,
  CalendarDays,
  ChevronRight,
  Download,
  Filter,
  GraduationCap,
  Printer,
  RefreshCw,
  Search,
  Sparkles,
  UserCheck,
  Zap,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { hasAnyRole } from '../../auth/portalResolver'
import api from '../../services/api'
import { Breadcrumbs } from '@/components/tailgrids/core/breadcrumbs'

export default function TahfizhReportSummaryPage() {
  const user = useAuthStore((state) => state.user)

  const breadcrumbItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/tahfizh', label: 'Tahfizh & Murajaah' },
    { href: '/dashboard/tahfizh/rekapan', label: 'Rekapan Tahfizh' },
  ]

  // Determine user roles
  const userRoles = useMemo(() => {
    if (!user) return []
    if (Array.isArray(user.roles)) return user.roles.map((r) => (typeof r === 'string' ? r : r?.name || ''))
    if (user.role) return [typeof user.role === 'string' ? user.role : user.role?.name || '']
    return []
  }, [user])

  const userRoleStr = String(user?.role?.name || user?.role || '').toLowerCase()
  const isTeacher = ['guru', 'guru_mapel', 'guru_tahfizh', 'wali_kelas', 'musyrif'].some((r) => userRoleStr.includes(r))

  const isFoundationOrAdmin = useMemo(() => {
    return hasAnyRole(userRoles, [
      'Pengurus Yayasan', 'Yayasan', 'Ketua Yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan',
      'Super Admin', 'SuperAdmin', 'super_admin',
      'Admin', 'admin', 'administrator'
    ])
  }, [userRoles])

  // Filter States
  const [periodType, setPeriodType] = useState('bulanan') // 'harian', 'mingguan', 'bulanan', 'tahunan'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const [units, setUnits] = useState([])
  const [classes, setClasses] = useState([])
  const [teacherClasses, setTeacherClasses] = useState([])
  const [selectedUnit, setSelectedUnit] = useState('')
  const [selectedClass, setSelectedClass] = useState('')

  const [typeFilter, setTypeFilter] = useState('semua') // 'semua', 'Ziyadah', 'Murajaah', 'Tasmi', 'Ujian'
  const [searchQuery, setSearchQuery] = useState('')
  const [perPage, setPerPage] = useState(15)
  const [currentPage, setCurrentPage] = useState(1)

  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState([])
  const [error, setError] = useState('')

  // Normalize API data structure
  const normalizeTahfizhRecord = (item) => ({
    id: item.id || item.log_id || Math.random(),
    date: item.record_date || item.date || item.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    student_id: item.student_id || item.student?.id,
    student_name: item.student_name || item.student?.nama_lengkap || item.student?.full_name || item.student?.name || 'Siswa',
    nis: item.nis || item.student?.nis || item.student?.nisn || '-',
    class_id: String(item.class_id || item.student?.class_id || item.kelas_id || item.student?.kelas_id || ''),
    class_name: item.class_name || item.student?.class?.name || item.student?.kelas?.nama_kelas || item.kelas_name || 'Rombel',
    unit_name: item.unit_name || item.education_unit_name || item.student?.education_unit?.name || item.student?.unit?.name || item.student?.kelas?.unit_pendidikan?.name || item.class_model?.unit_pendidikan?.name || 'SMA Terpadu SIMSIT',
    type: item.type || item.jenis_setoran || item.category || 'Ziyadah',
    juz: item.juz || item.metadata?.juz || item.hafalan_juz || 30,
    surah_number: item.surah_number || item.hafalan_surah_number || item.surah?.nomor || 1,
    surah_name: item.surah_name || item.hafalan_surah_name || item.surah?.nama_latin || item.surah?.name || 'Surah',
    ayah_start: item.ayah_start || item.hafalan_ayah_start || item.ayat_awal || 1,
    ayah_end: item.ayah_end || item.hafalan_ayah_end || item.ayat_akhir || 1,
    kelancaran: item.kelancaran || item.metadata?.kelancaran || 'Sangat Lancar',
    tajwid: item.tajwid || item.metadata?.tajwid || 'Baik',
    makhraj: item.makhraj || item.metadata?.makhraj || 'Baik',
    teacher_name: item.teacher_name || item.teacher?.user?.name || item.teacher?.nama || 'Pengajar',
  })

  // Fetch Master / Teacher Classes & Units
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        if (isTeacher) {
          // Fetch teacher specific assigned classes from database
          const classRes = await api.get('/teacher/classes').catch(() => ({ data: { data: [] } }))
          const tClasses = classRes?.data?.data || []
          setTeacherClasses(tClasses)
          if (tClasses.length > 0) {
            setSelectedClass(String(tClasses[0].id))
          }
        } else {
          // Admin / Foundation / Kepala Sekolah / Divisi Pendidikan
          const [unitRes, classRes] = await Promise.all([
            api.get('/education-units').catch(() => ({ data: { data: [] } })),
            api.get('/classes').catch(() => ({ data: { data: [] } })),
          ])
          setUnits(unitRes?.data?.data || [])
          setClasses(classRes?.data?.data || [])
        }
      } catch (err) {
        console.error('Error loading master data:', err)
      }
    }
    fetchMaster()
  }, [isTeacher])

  // Fetch Data Tahfizh Summary Records strictly from database
  const fetchTahfizhReport = async () => {
    setLoading(true)
    setError('')
    try {
      const activeClassId = isFoundationOrAdmin ? undefined : (selectedClass || (isTeacher ? teacherClasses[0]?.id : undefined))
      const params = {
        period_type: periodType,
        date: selectedDate,
        start_date: startDate,
        end_date: endDate,
        month: selectedMonth,
        year: selectedYear,
        unit_id: selectedUnit || undefined,
        class_id: activeClassId || undefined,
        type: typeFilter !== 'semua' ? typeFilter : undefined,
        search: searchQuery || undefined,
        per_page: 500,
      }

      let rawData = []
      if (isTeacher) {
        // Fetch from teacher tahfizh database endpoint
        const resTeacher = await api.get('/teacher/tahfizh', { params }).catch(() => null)
        rawData = resTeacher?.data?.data || resTeacher?.data || []
      }

      if (!rawData || (Array.isArray(rawData) && rawData.length === 0)) {
        const resReport = await reportService.tahfizhReport(params).catch(() => null)
        rawData = resReport?.data || resReport || []
      }

      const normalizedList = (Array.isArray(rawData) ? rawData : rawData.data || []).map(normalizeTahfizhRecord)
      setRecords(normalizedList)
    } catch (err) {
      console.error('Error fetching tahfizh report:', err)
      setError('Gagal memuat data rekapan tahfizh dari database.')
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTahfizhReport()
  }, [periodType, selectedDate, startDate, endDate, selectedMonth, selectedYear, selectedUnit, selectedClass, typeFilter, teacherClasses, isFoundationOrAdmin])

  // Filtered & Paginated records with STRICT class scoping for Teacher
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Strict Teacher Class & Rombel Scoping: ONLY display teacher's assigned class/rombel
      if (isTeacher) {
        const teacherClassIds = teacherClasses.map((c) => String(c.id))
        const teacherClassNames = teacherClasses.map((c) => String(c.name || c.nama_kelas || '').toLowerCase())

        if (teacherClassIds.length > 0) {
          const recordClassId = String(rec.class_id || '')
          const recordClassName = String(rec.class_name || '').toLowerCase()

          const matchId = recordClassId && teacherClassIds.includes(recordClassId)
          const matchName = recordClassName && teacherClassNames.some((n) => n && recordClassName.includes(n))

          // Filter out students from other classes or rombels
          if (selectedClass) {
            if (recordClassId && recordClassId !== String(selectedClass)) return false
          } else if (!matchId && !matchName) {
            return false
          }
        }
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = rec.student_name?.toLowerCase().includes(q)
        const matchNis = String(rec.nis || '').includes(q)
        const matchSurah = rec.surah_name?.toLowerCase().includes(q)
        if (!matchName && !matchNis && !matchSurah) return false
      }

      // Type filter
      if (typeFilter !== 'semua' && rec.type !== typeFilter) {
        return false
      }

      return true
    })
  }, [records, searchQuery, typeFilter, isTeacher, teacherClasses, selectedClass])

  const totalPages = Math.ceil(filteredRecords.length / perPage) || 1
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filteredRecords.slice(start, start + perPage)
  }, [filteredRecords, currentPage, perPage])

  // Handle Print Datatable
  const handlePrint = () => {
    window.print()
  }

  // Handle Export Excel / CSV
  const handleExport = () => {
    const csvContent = [
      ['No', 'Tanggal', 'Siswa', 'NIS', isFoundationOrAdmin ? 'Unit Pendidikan' : 'Rombel', 'Jenis Setoran', 'Juz', 'Surah', 'Ayat Awal', 'Ayat Akhir', 'Evaluasi Kelancaran', 'Pengajar'],
      ...filteredRecords.map((r, i) => [
        i + 1,
        r.date,
        `"${r.student_name}"`,
        r.nis || '-',
        isFoundationOrAdmin ? `"${r.unit_name || 'Unit Sekolah'}"` : `"${r.class_name || '-'}"`,
        r.type,
        r.juz,
        r.surah_name,
        r.ayah_start,
        r.ayah_end,
        r.kelancaran || 'Sangat Lancar',
        `"${r.teacher_name || '-'}"`,
      ]),
    ]
      .map((e) => e.join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Rekapan_Tahfizh_${periodType}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const activeTeacherClassName = useMemo(() => {
    if (!isTeacher || teacherClasses.length === 0) return ''
    const current = teacherClasses.find((c) => String(c.id) === String(selectedClass))
    return current ? current.name || current.nama_kelas : teacherClasses.map((c) => c.name || c.nama_kelas).join(', ')
  }, [isTeacher, teacherClasses, selectedClass])

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 space-y-6 max-w-7xl mx-auto pb-12">
      {/* 🧭 TAILGRIDS BREADCRUMBS COMPONENT */}
      <div className="print:hidden">
        <Breadcrumbs items={breadcrumbItems} dividerType="chevron" />
      </div>

      {/* PRINT ONLY HEADER */}
      <div className="hidden print:block mb-6 text-center border-b-2 border-slate-900 pb-4">
        <h1 className="text-xl font-black uppercase text-slate-900">LAPORAN REKAPAN SETORAN TAHFIZH AL-QUR'AN</h1>
        <p className="text-xs text-slate-600 mt-1">SISTEM MANAJEMEN SEKOLAH TERPADU (SIMSIT)</p>
        <p className="text-[11px] font-bold text-slate-700 mt-1">
          Periode: {periodType.toUpperCase()} ({periodType === 'harian' ? selectedDate : periodType === 'mingguan' ? `${startDate} s/d ${endDate}` : periodType === 'bulanan' ? `Bulan ${selectedMonth} ${selectedYear}` : `Tahun ${selectedYear}`})
          {isTeacher ? ` • Rombel ${activeTeacherClassName}` : ''}
        </p>
      </div>

      {/* PAGE HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
              <BookMarked className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Laporan Rekapan Tahfizh
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Rekapitulasi capaian setoran Ziyadah, Murajaah, Tasmi', dan Ujian Tahfizh Al-Qur'an dari database.
          </p>
        </div>

        {/* FOUNDATION & ADMIN SCOPE BADGE */}
        {isFoundationOrAdmin && (
          <div className="flex items-center gap-2 rounded-2xl border border-purple-200 bg-purple-50 px-3.5 py-2 text-xs font-bold text-purple-900 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300">
            <Sparkles className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
            <span>Scope Yayasan & Admin: Laporan Rekapan Seluruh Unit (Filter Rombel Non-Aktif)</span>
          </div>
        )}

        {/* TEACHER ROLE WARNING BADGE */}
        {isTeacher && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            <UserCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Mode Guru Tahfizh: Khusus Rombel {activeTeacherClassName || 'Anda'} (Terkunci dari database)</span>
          </div>
        )}
      </div>

      {/* FILTER PERIODE PILL TAB SWITCHER */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[var(--shadow-soft-xl)] dark:border-slate-800 dark:bg-[#1B2433] print:hidden space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Filter Periode Laporan
            </span>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
            {[
              ['harian', 'Harian', Calendar],
              ['mingguan', 'Mingguan', CalendarDays],
              ['bulanan', 'Bulanan', CalendarDays],
              ['tahunan', 'Tahunan', GraduationCap],
            ].map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setPeriodType(id)
                  setCurrentPage(1)
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  periodType === id
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* DYNAMIC FILTER INPUTS BASED ON PERIOD TYPE */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 items-end">
          {periodType === 'harian' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Pilih Tanggal</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900 dark:text-white outline-none focus:border-emerald-600"
              />
            </div>
          )}

          {periodType === 'mingguan' && (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Tanggal Mulai</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900 dark:text-white outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Tanggal Selesai</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900 dark:text-white outline-none focus:border-emerald-600"
                />
              </div>
            </>
          )}

          {periodType === 'bulanan' && (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Bulan</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900 dark:text-white outline-none focus:border-emerald-600"
                >
                  {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, idx) => (
                    <option key={m} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Tahun</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900 dark:text-white outline-none focus:border-emerald-600"
                >
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {periodType === 'tahunan' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Tahun Akademik</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900 dark:text-white outline-none focus:border-emerald-600"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>Tahun {y}</option>
                ))}
              </select>
            </div>
          )}

          {/* TEACHER SPECIFIC CLASS SELECTOR */}
          {isTeacher && teacherClasses.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Rombel / Kelas Anda</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="h-10 w-full rounded-xl border border-emerald-300 bg-emerald-50/50 px-3 text-xs font-bold text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 outline-none focus:border-emerald-600"
              >
                {teacherClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    Rombel {c.name || c.nama_kelas}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* UNIT & CLASS FILTER */}
          {isFoundationOrAdmin ? (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Unit Pendidikan</label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="h-10 w-full rounded-xl border border-purple-300 bg-purple-50/40 px-3 text-xs font-extrabold text-purple-900 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300 outline-none focus:border-purple-600"
              >
                <option value="">✨ Semua Unit Pendidikan (Konsolidasi)</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.name || u.nama_unit}</option>
                ))}
              </select>
            </div>
          ) : !isTeacher ? (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Unit Pendidikan</label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900 dark:text-white outline-none focus:border-emerald-600"
                >
                  <option value="">Semua Unit</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.name || u.nama_unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Rombel / Kelas</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900 dark:text-white outline-none focus:border-emerald-600"
                >
                  <option value="">Semua Rombel</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || c.nama_kelas}</option>
                  ))}
                </select>
              </div>
            </>
          ) : null}

          {/* JENIS SETORAN FILTER */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Jenis Setoran</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900 dark:text-white outline-none focus:border-emerald-600"
            >
              <option value="semua">Semua Jenis Setoran</option>
              <option value="Ziyadah">Ziyadah (Hafalan Baru)</option>
              <option value="Murajaah">Murajaah (Pengulangan)</option>
              <option value="Tasmi">Tasmi' (Ujian Duduk)</option>
              <option value="Ujian">Ujian Capaian Juz</option>
            </select>
          </div>
        </div>
      </div>

      {/* MASTER DATA TABLE CONTAINER (TAILGRIDS BENCHMARK STRUCTURE) */}
      <div className="rounded-[20px] border border-slate-200/80 bg-white shadow-[var(--shadow-soft-xl)] dark:border-slate-800 dark:bg-[#1B2433] overflow-hidden">
        {/* BARIS 1 TOOLBAR: TITLE + ACTION BUTTONS SOFT PASTEL SQUIRCLE */}
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 print:hidden">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Data Rekapan Setoran Tahfizh
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Total {filteredRecords.length} rekaman setoran ditemukan dari database
            </p>
          </div>

          {/* SOFT PASTEL SQUIRCLE ACTION BUTTONS */}
          <div className="flex items-center gap-3">
            {/* Tombol Cetak Datatable */}
            <div className="relative group">
              <button
                type="button"
                onClick={handlePrint}
                className="w-11 h-11 rounded-[14px] bg-sky-100/90 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800 shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                aria-label="Cetak Laporan"
              >
                <Printer className="w-5 h-5" />
              </button>
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-lg z-20">
                Cetak Datatable Laporan
              </div>
            </div>

            {/* Tombol Download Export */}
            <div className="relative group">
              <button
                type="button"
                onClick={handleExport}
                className="w-11 h-11 rounded-[14px] bg-amber-100/90 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                aria-label="Export CSV"
              >
                <Download className="w-5 h-5" />
              </button>
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-lg z-20">
                Export Data CSV / Excel
              </div>
            </div>

            {/* Tombol Muat Ulang */}
            <div className="relative group">
              <button
                type="button"
                onClick={fetchTahfizhReport}
                disabled={loading}
                className="w-11 h-11 rounded-[14px] bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                aria-label="Muat Ulang"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-lg z-20">
                Muat Ulang Data Database
              </div>
            </div>
          </div>
        </div>

        {/* BARIS 2 TOOLBAR: SEARCH + PERPAGE */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 print:hidden">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa, NIS, atau surah..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-semibold outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Tampilkan:</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {[5, 10, 15, 25, 50, 100].map((num) => (
                <option key={num} value={num}>{num} baris</option>
              ))}
            </select>
          </div>
        </div>

        {/* DATATABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5 w-12 text-center">No</th>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">
                  {isFoundationOrAdmin ? 'Siswa / Unit Pendidikan' : 'Siswa Rombel'}
                </th>
                <th className="p-3.5">Jenis Setoran</th>
                <th className="p-3.5">Capaian Hafalan</th>
                <th className="p-3.5 text-center">Kelancaran</th>
                <th className="p-3.5 text-center">Tajwid</th>
                <th className="p-3.5">Pengajar / Musyrif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRecords.map((item, idx) => {
                const globalIndex = (currentPage - 1) * perPage + idx + 1
                return (
                  <tr
                    key={item.id || idx}
                    className="hover:bg-slate-50/90 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3.5 text-center font-mono text-slate-400 font-semibold">
                      {globalIndex}
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-200">
                          {(item.student_name || 'S').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong className="block text-slate-900 dark:text-white font-extrabold text-xs">
                            {item.student_name}
                          </strong>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {isFoundationOrAdmin ? (
                              <>NIS: {item.nis || '-'} • <span className="font-bold text-purple-700 dark:text-purple-300">Unit: {item.unit_name || 'Unit Sekolah'}</span></>
                            ) : (
                              <>NIS: {item.nis || '-'} • Rombel {item.class_name || '-'}</>
                            )}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                          item.type === 'Ziyadah'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : item.type === 'Murajaah'
                            ? 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300'
                            : item.type === 'Tasmi'
                            ? 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300'
                            : 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div>
                        <strong className="block text-slate-900 dark:text-white text-xs font-extrabold">
                          Juz {item.juz} • {item.surah_name}
                        </strong>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Ayat {item.ayah_start} s/d {item.ayah_end} ({Math.max(item.ayah_end - item.ayah_start + 1, 1)} ayat)
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                          item.kelancaran === 'Sangat Lancar'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.kelancaran === 'Lancar'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {item.kelancaran || 'Sangat Lancar'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {item.tajwid || 'Baik'}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">
                      {item.teacher_name || 'Ustadz Pengajar'}
                    </td>
                  </tr>
                )
              })}

              {paginatedRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500 text-xs">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                        <span>Memuat data rekapan tahfizh dari database...</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-bold text-slate-700 dark:text-slate-300">
                          Tidak ada data setoran tahfizh untuk {isTeacher ? `Rombel ${activeTeacherClassName || 'Anda'}` : 'kriteria terpilih'} pada periode ini.
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {isTeacher
                            ? 'Data siswa dari rombel/kelas lain otomatis disembunyikan sesuai hak akses akun guru.'
                            : 'Belum ada entri setoran hafalan siswa yang tercatat di database.'}
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold print:hidden">
          <span className="text-slate-500">
            Menampilkan {paginatedRecords.length > 0 ? (currentPage - 1) * perPage + 1 : 0} s/d {Math.min(currentPage * perPage, filteredRecords.length)} dari {filteredRecords.length} data
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 font-bold"
            >
              Sebelumnya
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 font-bold"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
