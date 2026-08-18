import React, { useState } from 'react'
import { Calendar, Filter, RotateCcw, Check, AlertCircle } from 'lucide-react'

export function ReportPeriodFilter({
  period = 'year',
  startDate = '',
  endDate = '',
  onChange,
  onReset,
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
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1B2433] print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
          <Calendar className="h-4 w-4 text-[#0E5C44] dark:text-emerald-400" />
          <span>Filter Periode Laporan</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0E5C44] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0B4936] transition"
          >
            <Check className="h-3.5 w-3.5" />
            Terapkan Periode
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">Pilihan Periode</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-600 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
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
              <label className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">Tanggal Mulai</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-600 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">Tanggal Selesai</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-600 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
