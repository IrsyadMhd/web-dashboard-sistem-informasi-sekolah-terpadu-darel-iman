import { useEffect, useMemo, useState } from 'react'
import {
  Award,
  Calendar,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Printer,
  Search,
  Users,
} from 'lucide-react'
import { lmsPresensiService } from '../../services/lmsPresensiService'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import AppBadge from '../../components/app/AppBadge'
import AppSkeleton from '../../components/app/AppSkeleton'
import AppEmptyState from '../../components/app/AppEmptyState'
import { Button } from '@/components/tailgrids/core/button'
import { Input } from '@/components/tailgrids/core/input'
import { Pagination } from '@/components/tailgrids/core/pagination'
import { TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from '@/components/tailgrids/core/table'
import { Avatar, AvatarFallback } from '@/components/tailgrids/core/avatar'

export default function HomeroomAttendanceRecapPage() {
  const [loading, setLoading] = useState(true)
  const [recapData, setRecapData] = useState([])
  const [search, setSearch] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 10

  useEffect(() => {
    let active = true
    const fetchRecap = async () => {
      setLoading(true)
      try {
        const response = await lmsPresensiService.getReport({ month: selectedMonth, per_page: 100 })
        if (!active) return
        const raw = response.data?.data || response.data?.students || response.data || []
        setRecapData(Array.isArray(raw) ? raw : [])
      } catch (err) {
        console.error('Failed to load attendance recap:', err)
        if (active) setRecapData([])
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchRecap()
    return () => {
      active = false
    }
  }, [selectedMonth])

  const filteredRecap = useMemo(() => {
    return recapData.filter((item) => {
      const term = search.toLowerCase()
      const name = (item.student_name || item.nama || item.name || '').toLowerCase()
      const nisn = (item.nisn || '').toLowerCase()
      return !term || name.includes(term) || nisn.includes(term)
    })
  }, [recapData, search])

  const totalPages = Math.ceil(filteredRecap.length / perPage) || 1
  const paginatedRecap = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filteredRecap.slice(start, start + perPage)
  }, [filteredRecap, currentPage])

  const handleExport = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div>
        <AppBreadcrumb items={[{ label: 'Absensi', href: '/absensi' }, { label: 'Rekap Kehadiran Rombel' }]} />
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Rekapitulasi Kehadiran Siswa
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              Rekapitulasi matriks presensi siswa (Hadir, Sakit, Izin, Alpa, Terlambat) per periode bulan.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              appearance="fill"
              size="md"
              onClick={handleExport}
            >
              <Printer className="mr-2 h-4 w-4" /> Cetak / Export Rekap
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Cari NISN atau nama siswa..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Calendar size={14} /> Periode Bulan:
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Recap Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-[#1B2433]">
        {loading ? (
          <div className="p-6">
            <AppSkeleton rows={6} />
          </div>
        ) : paginatedRecap.length === 0 ? (
          <div className="p-8">
            <AppEmptyState title="Tidak ada data rekap presensi" description="Belum ada data rekapitulasi presensi siswa pada bulan ini." />
          </div>
        ) : (
          <>
            <TableRoot fullBleed={false}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Siswa</TableHead>
                  <TableHead className="text-center">Hadir (H)</TableHead>
                  <TableHead className="text-center">Sakit (S)</TableHead>
                  <TableHead className="text-center">Izin (I)</TableHead>
                  <TableHead className="text-center">Alpa (A)</TableHead>
                  <TableHead className="text-center">Terlambat (T)</TableHead>
                  <TableHead className="text-center">% Kehadiran</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecap.map((item, index) => {
                  const studentName = item.student_name || item.nama || item.name || 'Siswa'
                  const initials = studentName.slice(0, 2).toUpperCase()
                  const hadir = item.hadir ?? item.present ?? 0
                  const sakit = item.sakit ?? item.sick ?? 0
                  const izin = item.izin ?? item.permission ?? 0
                  const alpa = item.alpa ?? item.absent ?? 0
                  const terlambat = item.terlambat ?? item.late ?? 0
                  const total = hadir + sakit + izin + alpa + terlambat
                  const rate = total ? Math.round(((hadir + terlambat) / total) * 100) : 100

                  return (
                    <TableRow key={item.id || index} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50">
                      <TableCell className="font-semibold text-slate-500">
                        {(currentPage - 1) * perPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-bold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{studentName}</div>
                            <div className="text-[11px] text-slate-500 font-medium">NISN: {item.nisn || '-'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-emerald-700 dark:text-emerald-400">{hadir}</TableCell>
                      <TableCell className="text-center font-semibold text-blue-600 dark:text-blue-400">{sakit}</TableCell>
                      <TableCell className="text-center font-semibold text-amber-600 dark:text-amber-400">{izin}</TableCell>
                      <TableCell className="text-center font-bold text-rose-600 dark:text-rose-400">{alpa}</TableCell>
                      <TableCell className="text-center font-semibold text-violet-600 dark:text-violet-400">{terlambat}</TableCell>
                      <TableCell className="text-center">
                        <span className="font-black text-slate-900 dark:text-white">{rate}%</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <AppBadge variant={rate >= 90 ? 'success' : rate >= 75 ? 'warning' : 'danger'}>
                          {rate >= 90 ? 'Sangat Baik' : rate >= 75 ? 'Perlu Perhatian' : 'Kritis'}
                        </AppBadge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </TableRoot>

            <div className="w-full border-t border-slate-200 px-4 py-3.5 sm:px-6 dark:border-slate-800">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
                sideLayout="full"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
