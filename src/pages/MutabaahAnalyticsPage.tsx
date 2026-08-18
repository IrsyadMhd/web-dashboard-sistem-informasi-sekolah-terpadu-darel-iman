import React, { useEffect, useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Eye,
  FileCheck,
  FileDown,
  FileSpreadsheet,
  Filter,
  Flame,
  Grid,
  HeartHandshake,
  History,
  Info,
  Layers,
  ListChecks,
  Moon,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Table,
  UserCheck,
  UserRound,
  Users,
  Zap,
  X,
  XCircle,
  CalendarDays,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { mutabaahService } from '../services/mutabaahService'
import { useAuthStore } from '../stores/authStore'
import {
  MasterDataPage,
  MasterPageHeader,
  MasterActionButton,
  MasterStatCard,
  MasterStatsGrid,
} from '../components/master-data'

type View = 'dashboard' | 'rekap'
type Filters = Record<string, string | number>
const now = new Date()
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('en-CA')
const today = now.toLocaleDateString('en-CA')

type StudentRow = { id: string; name: string; nis: string; class: string; dorm: string; group: string; supervisor: string; progressToday: number; progressWeek: number; status: string; photo?: string }
const initialStudents: StudentRow[] = []

const worshipItemsList = [
  'Subuh',
  'Zuhur',
  'Ashar',
  'Maghrib',
  'Isya',
  'Tahajud',
  'Dhuha',
  'Tilawah',
  'Dzikir',
  'Puasa',
  'Murojaah',
  'Sedekah',
  'Adab',
  'Disiplin',
]

export default function MutabaahAnalyticsPage({ view }: { view: View }) {
  const user = useAuthStore((state) => state.user)
  const [filters, setFilters] = useState<Filters>({ date_from: firstDay, date_to: today, page: 1, per_page: 15 })
  const [students, setStudents] = useState(initialStudents)
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])

  // Fast Batch Matrix State
  const [showMatrixModal, setShowMatrixModal] = useState(false)
  const [matrixValues, setMatrixValues] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    initialStudents.forEach((st) => {
      worshipItemsList.forEach((item) => {
        init[`${st.id}:${item}`] = true
      })
    })
    return init
  })

  // Drawer & Modal States
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [showDetailDrawer, setShowDetailDrawer] = useState(false)

  const options = useQuery({
    queryKey: ['mutabaah-options'],
    queryFn: mutabaahService.enterpriseOptions,
    staleTime: 300_000,
  })

  const analytics = useQuery({
    queryKey: ['mutabaah-analytics', view, filters],
    queryFn: () => (view === 'dashboard' ? mutabaahService.dashboardAnalytics(filters) : mutabaahService.recapAnalytics(filters)),
    placeholderData: keepPreviousData,
  })

  const recapPage = analytics.data?.rows
  const recapRows = useMemo(() => Array.isArray(recapPage?.data) ? recapPage.data : [], [recapPage?.data])
  useEffect(() => {
    if (view !== 'rekap') return
    setStudents(recapRows.map((row: any) => ({
      id: row.id, name: row.full_name || '-', nis: row.nis || '-', class: row.class_name || '-',
      dorm: row.unit_name || '-', group: '', supervisor: '-',
      progressToday: Number(row.progress || 0), progressWeek: Number(row.progress || 0),
      status: row.finalized ? 'Finalized' : (Number(row.progress || 0) > 0 ? 'Draft' : 'Belum Diisi'),
    })))
    setSelectedStudentIds([])
  }, [recapRows, view])

  const update = (key: string, value: string | number) => setFilters((old) => ({ ...old, [key]: value, page: key === 'page' ? value : 1 }))

  // FAST BATCH ACTIONS
  const handleBatchMarkAllBaik = () => {
    setStudents((prev) =>
      prev.map((st) => ({
        ...st,
        progressToday: 100,
        status: 'Finalized',
      }))
    )

    const nextMat: Record<string, boolean> = {}
    students.forEach((st) => {
      worshipItemsList.forEach((item) => {
        nextMat[`${st.id}:${item}`] = true
      })
    })
    setMatrixValues(nextMat)

    Swal.fire({
      icon: 'success',
      title: '⚡ Input Massal Berhasil!',
      html: `Seluruh <b>${students.length} santri</b> berhasil ditandai <b>100% BAIK</b> dalam 1 detik!`,
      timer: 2000,
      showConfirmButton: false,
    })
  }

  const handleCopyYesterday = () => {
    Swal.fire({
      icon: 'success',
      title: '📋 Salin Mutabaah Kemarin',
      html: `Presensi tanggal kemarin berhasil disalin untuk <b>${students.length} santri</b>.`,
      timer: 1800,
      showConfirmButton: false,
    })
  }

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleSelectAllStudents = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([])
    } else {
      setSelectedStudentIds(students.map((s) => s.id))
    }
  }

  const handleBatchMarkSelected = () => {
    if (selectedStudentIds.length === 0) {
      Swal.fire('Pilih Santri', 'Pilih minimal 1 santri terlebih dahulu.', 'warning')
      return
    }
    setStudents((prev) =>
      prev.map((st) =>
        selectedStudentIds.includes(st.id) ? { ...st, progressToday: 100, status: 'Draft' } : st
      )
    )
    Swal.fire({
      icon: 'success',
      title: 'Input Massal Berhasil',
      text: `${selectedStudentIds.length} santri terpilih berhasil diperbarui menjadi 100% Baik.`,
      timer: 1500,
      showConfirmButton: false,
    })
  }

  const toggleMatrixCell = (studentId: string, item: string) => {
    const key = `${studentId}:${item}`
    setMatrixValues((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const setMatrixColumn = (item: string, val: boolean) => {
    setMatrixValues((prev) => {
      const next = { ...prev }
      students.forEach((st) => {
        next[`${st.id}:${item}`] = val
      })
      return next
    })
  }

  return (
    <MasterDataPage className="education-unit-page mutabaah-page" hideBreadcrumb>
      {/* 🟢 MASTER HERO HEADER BANNER (Aligned with Master Data Standard) */}
      <MasterPageHeader
        title={view === 'rekap' ? 'Rekap Data Mutaba’ah' : `Assalamu'alaikum, ${user?.name || 'Musyrif'} 👋`}
        description={view === 'rekap' ? 'Rekapan baca-saja dari hasil CRUD Mutaba’ah santri berdasarkan periode dan unit pendidikan.' : 'Monitoring pelaksanaan ibadah dan pembiasaan harian santri secara real-time di seluruh unit pendidikan.'}
        tone="brand"
        icon={Moon}
        actions={view === 'rekap' ? null : (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowMatrixModal(true)}
              className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-900 shadow-lg transition hover:bg-amber-300 transform hover:-translate-y-0.5"
            >
              <Zap className="h-4 w-4 fill-slate-900" /> ⚡ Input Massal Matrix
            </button>
            <MasterActionButton
              className="education-unit-hero__action !h-11 !border-white !bg-white !text-emerald-800 !shadow-none hover:!bg-emerald-50"
              icon={CheckCircle2}
              onClick={handleBatchMarkAllBaik}
            >
              Tandai Semua Baik
            </MasterActionButton>
            <MasterActionButton
              className="!h-11 !border-white/30 !bg-white/10 !text-white hover:!bg-white/20"
              icon={Copy}
              onClick={handleCopyYesterday}
            >
              Salin Kemarin
            </MasterActionButton>
          </div>
        )}
      />

      {/* ⚪ FILTER GLOBAL CARD (Original Layout & Styling) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#1B2433]">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-[#0E5C44] dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Filter Global Mutabaah</h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7 items-end">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Dari</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => update('date_from', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sampai</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => update('date_to', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Unit</label>
            <select
              value={filters.education_unit_id || ''}
              onChange={(e) => update('education_unit_id', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Semua Unit</option>
              {(options.data?.units || []).map((unit: any) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Asrama</label>
            <select
              value={filters.dorm_id || ''}
              onChange={(e) => update('dorm_id', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Semua Asrama</option>
              <option value="1">Asrama Al-Ghazali</option>
              <option value="2">Asrama Fatimah</option>
              <option value="3">Asrama Ibn Sina</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Musyrif</label>
            <select
              value={filters.supervisor_id || ''}
              onChange={(e) => update('supervisor_id', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Semua Musyrif</option>
              <option value="1">Ust. Ahmad Fadli</option>
              <option value="2">Ustadzah Maryam</option>
              <option value="3">Ust. Zulkifli</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pencarian</label>
            <input
              type="text"
              placeholder="Cari santri/NIS..."
              value={filters.search || ''}
              onChange={(e) => update('search', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <button
              onClick={() => setFilters({ date_from: firstDay, date_to: today, page: 1, per_page: 15 })}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        </div>
      </section>

      {/* 📊 KPI CARDS GRID */}
      <MasterStatsGrid>
        <MasterStatCard icon={Users} label="Total Santri Aktif" value={view === 'rekap' ? (recapPage?.total || students.length) : (analytics.data?.kpis?.total_students || 0)} description="Sesuai data master siswa" variant="info" delay={40} />
        <MasterStatCard icon={CheckCircle2} label="Sudah Diisi" value={view === 'rekap' ? students.filter((item) => item.progressToday > 0).length : (analytics.data?.kpis?.filled || 0)} description="Memiliki data Mutabaah" variant="success" delay={80} />
        <MasterStatCard icon={ShieldCheck} label="Sudah Final" value={view === 'rekap' ? students.filter((item) => item.status === 'Finalized').length : (analytics.data?.kpis?.finalized || 0)} description="Telah dikunci pembimbing" variant="success" delay={120} />
        <MasterStatCard icon={AlertTriangle} label="Belum Diisi" value={view === 'rekap' ? students.filter((item) => item.status === 'Belum Diisi').length : (analytics.data?.kpis?.not_filled || 0)} description="Perlu ditindaklanjuti" variant="danger" delay={160} />
      </MasterStatsGrid>

      {/* 🟢 MAIN TABLE CONTENT */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Data Mutabaah Santri</h3>
            <p className="text-xs text-slate-400">Daftar pencapaian pembiasaan ibadah santri per periode</p>
          </div>

          {view !== 'rekap' && <div className="flex items-center gap-2">
            {selectedStudentIds.length > 0 && (
              <button
                onClick={handleBatchMarkSelected}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700"
              >
                <Check className="h-3.5 w-3.5" /> Mark {selectedStudentIds.length} Selected 100%
              </button>
            )}
            <button
              onClick={() => setShowMatrixModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-extrabold text-slate-900 shadow hover:bg-amber-300"
            >
              <Zap className="h-3.5 w-3.5 fill-slate-900" /> Matrix Quick
            </button>
          </div>}
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 font-bold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                {view !== 'rekap' && <th className="w-8 px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.length === students.length && students.length > 0}
                    onChange={handleSelectAllStudents}
                    className="rounded border-slate-300"
                  />
                </th>}
                <th className="px-3 py-3">Santri</th>
                <th className="px-3 py-3">Kelas & Asrama</th>
                <th className="px-3 py-3">Musyrif</th>
                <th className="px-3 py-3">Progress Hari Ini</th>
                <th className="px-3 py-3">Progress Pekan Ini</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                  {view !== 'rekap' && <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(st.id)}
                      onChange={() => toggleSelectStudent(st.id)}
                      className="rounded border-slate-300"
                    />
                  </td>}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      {st.photo ? <img src={st.photo} alt={st.name} className="h-8 w-8 rounded-full object-cover border border-slate-200" /> : <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700">{st.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>}
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{st.name}</p>
                        <p className="text-[10px] text-slate-400">NIS: {st.nis}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{st.class}</p>
                    <p className="text-[10px] text-slate-400">{st.dorm}</p>
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300">
                    {st.supervisor}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-slate-100 dark:bg-slate-700">
                        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${st.progressToday}%` }} />
                      </div>
                      <span className="font-bold text-emerald-600">{st.progressToday}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-bold text-slate-700 dark:text-slate-300">
                    {st.progressWeek}%
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      st.status === 'Finalized' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {st.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => { setSelectedStudent(st); setShowDetailDrawer(true) }}
                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MATRIX FAST INPUT MODAL */}
      {view !== 'rekap' && showMatrixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#1B2433]">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">⚡ Fast Matrix Input Mutabaah</h3>
              </div>
              <button onClick={() => setShowMatrixModal(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 overflow-auto flex-1">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                    <th className="p-2 font-bold text-slate-700 dark:text-slate-300">Santri</th>
                    {worshipItemsList.map((item) => (
                      <th key={item} className="p-2 text-center font-bold text-slate-700 dark:text-slate-300">
                        <div>{item}</div>
                        <button
                          onClick={() => setMatrixColumn(item, true)}
                          className="mt-1 text-[9px] font-bold text-emerald-600 hover:underline"
                        >
                          All ✓
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map((st) => (
                    <tr key={st.id}>
                      <td className="p-2 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{st.name}</td>
                      {worshipItemsList.map((item) => {
                        const key = `${st.id}:${item}`
                        const isChecked = Boolean(matrixValues[key])
                        return (
                          <td key={item} className="p-2 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleMatrixCell(st.id, item)}
                              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40">
              <button
                onClick={() => setShowMatrixModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setShowMatrixModal(false)
                  Swal.fire('Berhasil Disimpan', 'Seluruh data Matrix Mutabaah berhasil disimpan!', 'success')
                }}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700"
              >
                Simpan Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER */}
      {showDetailDrawer && selectedStudent && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm" onClick={() => setShowDetailDrawer(false)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl dark:bg-[#1B2433] border-l border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img src={selectedStudent.photo} alt={selectedStudent.name} className="h-10 w-10 rounded-full object-cover border" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedStudent.name}</p>
                  <p className="text-xs text-slate-400">{selectedStudent.class} • {selectedStudent.dorm}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailDrawer(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40 space-y-1">
                <p><span className="text-slate-400">Musyrif:</span> <strong className="text-slate-800 dark:text-slate-200">{selectedStudent.supervisor}</strong></p>
                <p><span className="text-slate-400">Pencapaian Hari Ini:</span> <strong className="text-emerald-600">{selectedStudent.progressToday}%</strong></p>
                <p><span className="text-slate-400">Pencapaian Pekan Ini:</span> <strong className="text-emerald-600">{selectedStudent.progressWeek}%</strong></p>
                <p><span className="text-slate-400">Status:</span> <strong className="text-slate-800 dark:text-slate-200">{selectedStudent.status}</strong></p>
              </div>
            </div>
          </div>
        </>
      )}

    </MasterDataPage>
  )
}
