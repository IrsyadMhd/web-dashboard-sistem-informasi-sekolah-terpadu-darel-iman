import React, { useState } from 'react'
import { Calendar, RotateCcw, Check, RefreshCw, Eye, Printer, FileText, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/tailgrids/core/button'
import { Alert, AlertIndicator, AlertContent, AlertDescription } from '@/components/tailgrids/core/alert'

export function ReportPeriodFilter({
  period = 'year',
  startDate = '',
  endDate = '',
  onChange,
  onReset,
  onRefresh,
  onOpenPreview,
  onPrint,
  onExportPdf,
  onExportExcel,
  loading = false,
}) {
  const [selectedPeriod, setSelectedPeriod] = useState(period)
  const [customStart, setCustomStart] = useState(startDate)
  const [customEnd, setCustomEnd] = useState(endDate)
  const [errorMsg, setErrorMsg] = useState('')

  const handleApply = () => {
    setErrorMsg('')
    if (selectedPeriod === 'custom') {
      if (!customStart || !customEnd) {
        setErrorMsg('Tanggal mulai dan selesai wajib diisi untuk periode kustom.')
        return
      }
      if (new Date(customEnd) < new Date(customStart)) {
        setErrorMsg('Tanggal selesai tidak boleh lebih kecil dari tanggal mulai.')
        return
      }
    }

    if (onChange) {
      onChange({
        period: selectedPeriod,
        tanggal_mulai: selectedPeriod === 'custom' ? customStart : '',
        tanggal_selesai: selectedPeriod === 'custom' ? customEnd : '',
      })
    }
  }

  const handleReset = () => {
    setSelectedPeriod('year')
    setCustomStart('')
    setCustomEnd('')
    setErrorMsg('')
    if (onReset) onReset()
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#1B2433] print:hidden space-y-4">
      {/* Baris 1: Header Filter & Action Buttons (Refresh, Preview, Cetak, PDF, Excel) */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800/80 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5 text-sm font-extrabold text-slate-900 dark:text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Calendar className="h-4 w-4" />
          </div>
          <span>Filter Periode & Aksi Laporan</span>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            pending={loading}
            prefixIcon={<RefreshCw className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            appearance="outline"
            size="sm"
            onClick={onOpenPreview}
            prefixIcon={<Eye className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
          >
            Preview
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onPrint}
            prefixIcon={<Printer className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />}
          >
            Cetak
          </Button>

          <Button
            variant="danger"
            appearance="outline"
            size="sm"
            onClick={onExportPdf}
            prefixIcon={<FileText className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />}
          >
            PDF
          </Button>

          <Button
            variant="success"
            appearance="fill"
            size="sm"
            onClick={onExportExcel}
            prefixIcon={<FileSpreadsheet className="h-3.5 w-3.5" />}
          >
            Excel
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div>
          <Alert status="error">
            <AlertIndicator />
            <AlertContent>
              <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
            </AlertContent>
          </Alert>
        </div>
      )}

      {/* Baris 2: Selection Form + Terapkan Periode & Reset */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pilihan Periode
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
            >
              <option value="today">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="last_month">Bulan Lalu</option>
              <option value="semester">Semester Aktif</option>
              <option value="academic_year">Tahun Ajaran Aktif</option>
              <option value="year">Tahun Ini (2026)</option>
              <option value="custom">Periode Kustom...</option>
            </select>
          </div>

          {selectedPeriod === 'custom' && (
            <>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="success"
            appearance="fill"
            size="sm"
            onClick={handleApply}
            prefixIcon={<Check className="h-3.5 w-3.5" />}
          >
            Terapkan Periode
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            prefixIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
