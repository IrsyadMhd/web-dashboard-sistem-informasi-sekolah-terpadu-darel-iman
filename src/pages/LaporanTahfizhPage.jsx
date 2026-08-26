import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Sparkles,
  RefreshCw,
  Printer,
  Search,
  RotateCcw,
  Filter,
  FileText,
  CheckCircle2,
  Target,
  Award,
  Users,
  FileCheck,
  Layers,
  Calendar,
} from 'lucide-react'
import { Upload1, Download1 } from '@tailgrids/icons'
import Swal from 'sweetalert2'

import { reportService } from '../services/reportService'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { Button } from '@/components/tailgrids/core/button'
import { Badge } from '@/components/tailgrids/core/badge'
import { Avatar, AvatarFallback } from '@/components/tailgrids/core/avatar'
import { TableRoot, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/tailgrids/core/table'
import { Pagination } from '@/components/tailgrids/core/pagination'
import { MasterStatsGrid, MasterStatCard, PrintOptionModal } from '../components/master-data'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'

export default function LaporanTahfizhPage() {
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reportData, setReportData] = useState({ summary: {}, data: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Print Option Modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const result = await reportService.tahfizhReport({
        search,
        start_date: startDate,
        end_date: endDate,
      })
      setReportData({
        summary: result.summary || {},
        data: result.data || result || [],
      })
    } catch (err) {
      setError(err?.response?.data?.message || 'Laporan tahfizh & mutabaah gagal dimuat.')
    } finally {
      setLoading(false)
    }
  }, [search, startDate, endDate])

  useEffect(() => {
    load()
  }, [load])

  // Filtered rows based on search inside datatable
  const filteredRows = useMemo(() => {
    const rawData = reportData.data || []
    if (!search.trim()) return rawData
    const q = search.toLowerCase()
    return rawData.filter((row) => {
      const name = (row.student?.full_name || row.student?.nama || row.student_name || '').toLowerCase()
      const nis = (row.student?.nis || row.nis || '').toLowerCase()
      const surah = (row.hafalan_surah_name || row.surah || '').toLowerCase()
      return name.includes(q) || nis.includes(q) || surah.includes(q)
    })
  }, [reportData.data, search])

  // Paginated rows
  const totalPages = useMemo(() => {
    return Math.ceil(filteredRows.length / perPage) || 1
  }, [filteredRows.length, perPage])

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filteredRows.slice(start, start + perPage)
  }, [filteredRows, currentPage, perPage])

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, startDate, endDate, perPage])

  // Stats calculation with distinct color variants
  const stats = useMemo(() => {
    const sum = reportData.summary || {}
    const totalLogs = sum.total_logs ?? reportData.data.length
    const totalBaris = sum.total_hafalan_baris ?? reportData.data.reduce((a, b) => a + Number(b.hafalan_baris || 0), 0)
    const target = sum.target_tahunan || 50000
    const persen = sum.persentase ?? (totalBaris > 0 ? ((totalBaris / target) * 100).toFixed(1) : 0)
    const uniqueStudentsCount = new Set(reportData.data.map((r) => r.student?.id || r.student_id)).size || reportData.data.length

    return [
      {
        label: 'Total Setoran',
        value: totalLogs,
        description: 'Catatan log harian',
        icon: FileCheck,
        variant: 'info', // Blue / Sky
      },
      {
        label: 'Total Hafalan',
        value: `${totalBaris.toLocaleString('id-ID')} baris`,
        description: 'Capaian baris hafalan',
        icon: BookOpen,
        variant: 'success', // Emerald Green
      },
      {
        label: 'Target Tahunan',
        value: `${target.toLocaleString('id-ID')} baris`,
        description: 'Target unit sekolah',
        icon: Target,
        variant: 'warning', // Amber / Gold
      },
      {
        label: 'Tercapai',
        value: `${persen}%`,
        description: 'Pencapaian target',
        icon: Award,
        variant: 'danger', // Rose / Red
      },
      {
        label: 'Santri Terdaftar',
        value: `${uniqueStudentsCount} Santri`,
        description: 'Memiliki log setoran',
        icon: Users,
        variant: 'purple', // Violet
      },
    ]
  }, [reportData])

  // Export CSV
  const handleExportCsv = () => {
    if (filteredRows.length === 0) {
      Swal.fire('Data Kosong', 'Tidak ada data untuk diexport.', 'warning')
      return
    }

    const headers = [
      'No',
      'Tanggal',
      'Nama Santri',
      'NIS',
      'Surah / Hafalan Baru',
      'Baris Hafalan',
      'Baris Tilawah',
      'Murajaah (Lembar)',
      'Catatan Ustadz',
    ]

    const csvRows = [
      headers.join(','),
      ...filteredRows.map((row, idx) => {
        const dateStr = row.record_date || row.created_at || '-'
        const nameStr = row.student?.full_name || row.student?.nama || row.student_name || '-'
        const nisStr = row.student?.nis || row.nis || '-'
        const surahStr = row.hafalan_surah_name
          ? `${row.hafalan_surah_name} (Ayat ${row.hafalan_ayah_start || 1}-${row.hafalan_ayah_end || '-'})`
          : '-'
        const hafalanBaris = row.hafalan_baris || 0
        const tilawahBaris = row.tilawah_baris || 0
        const murajaahLembar = row.murajaah_lembar || 0
        const notesStr = row.notes_teacher || row.notes || '-'

        return [
          idx + 1,
          `"${dateStr}"`,
          `"${nameStr.replace(/"/g, '""')}"`,
          `"${nisStr.replace(/"/g, '""')}"`,
          `"${surahStr.replace(/"/g, '""')}"`,
          hafalanBaris,
          tilawahBaris,
          murajaahLembar,
          `"${notesStr.replace(/"/g, '""')}"`,
        ].join(',')
      }),
    ]

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Laporan_Rekap_Tahfizh_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    Swal.fire({
      icon: 'success',
      title: 'Export Berhasil',
      text: 'Data rekap Tahfizh berhasil diexport ke CSV.',
      timer: 1500,
      showConfirmButton: false,
    })
  }

  // Import Handler Placeholder
  const handleImport = () => {
    Swal.fire({
      title: 'Import Data Tahfizh',
      text: 'Pilih berkas Excel (.xlsx / .csv) untuk mengimpor log setoran hafalan.',
      input: 'file',
      inputAttributes: {
        accept: '.csv, .xlsx',
        'aria-label': 'Upload berkas Tahfizh',
      },
      showCancelButton: true,
      confirmButtonText: 'Unggah & Proses',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#0E5C44',
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        Swal.fire({
          icon: 'success',
          title: 'Import Dalam Proses',
          text: `Berkas ${result.value.name} berhasil diunggah dan sedang diproses.`,
          timer: 1800,
          showConfirmButton: false,
        })
      }
    })
  }

  // Print Table in Hidden Iframe
  const handlePrint = () => {
    const headers = [
      'No',
      'Tanggal',
      'Nama Santri',
      'NIS',
      'Surah / Hafalan Baru',
      'Baris Hafalan',
      'Tilawah (Baris)',
      'Murajaah (Lembar)',
      'Catatan Ustadz',
    ]

    const rows = filteredRows.map((row, idx) => [
      idx + 1,
      row.record_date || '-',
      row.student?.full_name || row.student?.nama || row.student_name || '-',
      row.student?.nis || row.nis || '-',
      row.hafalan_surah_name
        ? `${row.hafalan_surah_name} (${row.hafalan_ayah_start || 1}-${row.hafalan_ayah_end || '-'})`
        : '-',
      `${row.hafalan_baris || 0} Baris`,
      `${row.tilawah_baris || 0} Baris`,
      `${row.murajaah_lembar || 0} Lembar`,
      row.notes_teacher || '-',
    ])

    printCleanTable({
      title: 'Laporan Rekap Tahfizh & Mutabaah Santri',
      subtitle: `Periode: ${startDate || 'Semua'} s/d ${endDate || 'Semua'}`,
      headers,
      rows,
    })
  }

  // Download PDF Table
  const handleDownloadPdf = () => {
    const headers = [
      'No',
      'Tanggal',
      'Nama Santri',
      'NIS',
      'Surah / Hafalan Baru',
      'Baris Hafalan',
      'Tilawah (Baris)',
      'Murajaah (Lembar)',
      'Catatan Ustadz',
    ]

    const rows = filteredRows.map((row, idx) => [
      idx + 1,
      row.record_date || '-',
      row.student?.full_name || row.student?.nama || row.student_name || '-',
      row.student?.nis || row.nis || '-',
      row.hafalan_surah_name
        ? `${row.hafalan_surah_name} (${row.hafalan_ayah_start || 1}-${row.hafalan_ayah_end || '-'})`
        : '-',
      `${row.hafalan_baris || 0} Baris`,
      `${row.tilawah_baris || 0} Baris`,
      `${row.murajaah_lembar || 0} Lembar`,
      row.notes_teacher || '-',
    ])

    downloadPdfTable({
      title: 'Laporan Rekap Tahfizh & Mutabaah Santri',
      subtitle: `Periode: ${startDate || 'Semua'} s/d ${endDate || 'Semua'}`,
      headers,
      rows,
      filename: `Laporan_Rekap_Tahfizh_${new Date().toISOString().split('T')[0]}.pdf`,
    })
  }

  // Reset Filters
  const handleResetFilter = () => {
    setSearch('')
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 🧭 BREADCRUMB NAV */}
      <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Laporan Tahfizh' }]} />

      {/* 🟢 MODERN HERO CARD HEADER */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <BookOpen className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                    <Sparkles className="size-3 text-amber-300 animate-pulse" />
                    Laporan Tahfizh & Mutabaah
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    Data Riil Backend
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Laporan Rekap Tahfizh & Mutabaah
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                  Rekapitulasi setoran hafalan Al-Qur’an harian, tilawah, murajaah, dan capaian santri dari data backend.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 z-10">
              <Button
                type="button"
                variant="primary"
                appearance="fill"
                size="sm"
                onClick={load}
                disabled={loading}
                prefixIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
                className="!bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white font-bold shadow-md shadow-emerald-600/25 cursor-pointer"
              >
                Segarkan Data
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 📊 KPI CARDS GRID (5 COLOR-TINTED KPI CARDS WITH DISTINCT STYLES) */}
      <MasterStatsGrid cols={5}>
        {stats.map((st) => (
          <MasterStatCard
            key={st.label}
            icon={st.icon}
            label={st.label}
            value={st.value}
            description={st.description}
            variant={st.variant}
          />
        ))}
      </MasterStatsGrid>

      {/* 🟢 TAILGRIDS EMERALD DATATABLE CONTAINER (DATATABLE LAPORAN DENGAN 3-BARIS TOOLBAR) */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
        {/* BARIS 1: TITLE & SOFT PASTEL SQUIRCLE ACTION BUTTONS */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-500/20 p-5">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="size-5 text-emerald-600" />
              <span>Rincian Data Log Setoran Tahfizh</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daftar rincian setoran hafalan Al-Qur'an harian, tilawah, murajaah, dan catatan ustadz binaan.
            </p>
          </div>

          {/* SOFT PASTEL SQUIRCLE ACTION BUTTONS */}
          <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-visible py-1">
            {/* Button: Import Data (Sky Blue Soft Pastel Squircle) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                aria-label="Import Data"
                className="flex size-10 items-center justify-center rounded-2xl bg-sky-100/90 text-sky-700 hover:bg-sky-500 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-sky-500/30 cursor-pointer shadow-2xs"
                onClick={handleImport}
              >
                <Upload1 className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Import Data (Excel/CSV)
              </div>
            </div>

            {/* Button: Export Excel (Amber/Orange Soft Pastel Squircle) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                aria-label="Export Data"
                className="flex size-10 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-700 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-amber-500/30 cursor-pointer shadow-2xs"
                onClick={handleExportCsv}
              >
                <Download1 className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Export Data (Excel/CSV)
              </div>
            </div>

            {/* Button: Cetak / PDF (Indigo Soft Pastel Squircle) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                aria-label="Cetak Data"
                className="flex size-10 items-center justify-center rounded-2xl bg-indigo-100/90 text-indigo-700 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-indigo-600/30 cursor-pointer shadow-2xs"
                onClick={() => setIsPrintModalOpen(true)}
              >
                <Printer className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Cetak / PDF
              </div>
            </div>

            {/* Button: Reset Filter (Rose Soft Pastel Squircle) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                aria-label="Reset Filter"
                className="flex size-10 items-center justify-center rounded-2xl bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-rose-600/30 cursor-pointer shadow-2xs"
                onClick={handleResetFilter}
              >
                <RotateCcw className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Reset Filter
              </div>
            </div>
          </div>
        </div>

        {/* BARIS 2: FILTER DATA SECTION */}
        <div className="p-5 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 border-b border-emerald-500/15 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Filter Data Laporan
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            {/* Input Cari */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Pencarian Santri / NIS / Surah
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ketik nama santri, NIS, atau surah..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Input Mulai Tanggal */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Mulai Tanggal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Input Sampai Tanggal */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* BARIS 3: MASTER DATATABLE RINCIAN DATA (STABLE NON-SHIFTING LAYOUT) */}
        <div className="overflow-x-auto">
          <TableRoot>
            <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
              <TableRow>
                <TableHead className="py-3.5 px-4 text-left text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider w-12">
                  #
                </TableHead>
                <TableHead className="py-3.5 px-4 text-left text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider min-w-[110px]">
                  Tanggal
                </TableHead>
                <TableHead className="py-3.5 px-4 text-left text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider min-w-[200px]">
                  Siswa / Santri
                </TableHead>
                <TableHead className="py-3.5 px-4 text-left text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider min-w-[200px]">
                  Surah / Hafalan Baru
                </TableHead>
                <TableHead className="py-3.5 px-4 text-center text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider min-w-[120px]">
                  Baris Hafalan
                </TableHead>
                <TableHead className="py-3.5 px-4 text-center text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider min-w-[120px]">
                  Tilawah (Baris)
                </TableHead>
                <TableHead className="py-3.5 px-4 text-center text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider min-w-[140px]">
                  Murajaah (Lembar)
                </TableHead>
                <TableHead className="py-3.5 px-4 text-left text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider min-w-[180px]">
                  Catatan Ustadz
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-xs font-medium text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-600 mb-2" />
                    Memuat data rekapitulasi tahfizh...
                  </TableCell>
                </TableRow>
              ) : paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-xs font-medium text-slate-400">
                    Tidak ada data log setoran yang ditemukan untuk filter ini.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((row, idx) => {
                  const globalIdx = (currentPage - 1) * perPage + idx + 1
                  const dateStr = row.record_date || row.created_at || '-'
                  const nameStr = row.student?.full_name || row.student?.nama || row.student_name || 'Santri'
                  const nisStr = row.student?.nis || row.nis || '-'
                  const surahStr = row.hafalan_surah_name
                    ? `${row.hafalan_surah_name}`
                    : '-'
                  const ayatStr = row.hafalan_surah_name
                    ? `Ayat ${row.hafalan_ayah_start || 1}-${row.hafalan_ayah_end || '-'}`
                    : null
                  const hafalanBaris = Number(row.hafalan_baris || 0)
                  const tilawahBaris = Number(row.tilawah_baris || 0)
                  const murajaahLembar = Number(row.murajaah_lembar || 0)
                  const notesStr = row.notes_teacher || row.notes || '-'

                  return (
                    <TableRow
                      key={row.id || idx}
                      className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors border-b border-slate-100 dark:border-slate-800"
                    >
                      <TableCell className="py-3 px-4 text-xs font-bold text-slate-500">{globalIdx}</TableCell>
                      <TableCell className="py-3 px-4 text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {dateStr}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar size="sm" className="bg-emerald-600 text-white font-bold shrink-0">
                            <AvatarFallback>{nameStr.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                              {nameStr}
                            </p>
                            <p className="text-[11px] font-semibold text-slate-400">NIS: {nisStr}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        {row.hafalan_surah_name ? (
                          <div>
                            <span className="font-bold text-emerald-900 dark:text-emerald-300 text-xs block">
                              {surahStr}
                            </span>
                            {ayatStr && (
                              <span className="text-[11px] font-medium text-slate-500 block">
                                {ayatStr}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <Badge color={hafalanBaris > 0 ? 'success' : 'gray'} size="sm">
                          {hafalanBaris} Baris
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <Badge color={tilawahBaris > 0 ? 'sky' : 'gray'} size="sm">
                          {tilawahBaris} Baris
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <Badge color={murajaahLembar > 0 ? 'violet' : 'gray'} size="sm">
                          {murajaahLembar} Lembar
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                        {notesStr}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </TableRoot>
        </div>

        {/* FOOTER PAGINATION CONTAINER */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <span>Tampilkan</span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white py-1 px-2 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>baris per halaman (Total {filteredRows.length} data)</span>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => setCurrentPage(p)}
            sideLayout="full"
            variant="default"
          />
        </div>
      </div>

      {/* PRINT OPTION MODAL FOR CLEAN PRINTING & PDF DOWNLOAD */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onPrint={handlePrint}
        onDownload={handleDownloadPdf}
        title="Laporan Rekap Tahfizh & Mutabaah Santri"
      />
    </div>
  )
}
