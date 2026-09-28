import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Printer,
  Download,
  Users,
  Eye,
  Compass,
  CheckCircle2,
  Building,
  X,
  Sparkles,
  FileSpreadsheet,
  CheckSquare,
  Square,
  Layers,
} from 'lucide-react'
import { useUnitStore } from '../../stores/unitStore'
import { useAuthStore } from '../../stores/authStore'
import { resolveUnitDetails, isCentralOrYayasanRole } from '../../utils/printHelper'
import { PrintHeader } from '../common/PrintHeader'

export function PrintOptionModal({
  isOpen,
  open,
  onClose,
  onPrint,
  onDownload,
  onDownloadPdf,
  onExportExcel,
  title = 'Laporan',
  subtitle = '',
  teachersList = [],
  selectedTeacherId = '',
  onTeacherChange,
  activeUnit = null,
  columnsList = [],
  selectedColumns = null,
  onToggleColumn = null,
  onSelectAllColumns = null,
  onClearAllColumns = null,
}) {
  const isModalOpen = isOpen ?? open ?? false
  const [orientation, setOrientation] = useState('portrait')
  const [showPreview, setShowPreview] = useState(false)
  const storeActiveUnit = useUnitStore((s) => s.activeUnit)
  const user = useAuthStore((s) => s.user)

  const isCentral = isCentralOrYayasanRole(user)
  const userUnit = user?.unit || user?.employee?.unit?.name || null
  const effectiveUnit =
    activeUnit !== undefined && activeUnit !== null
      ? activeUnit
      : isCentral
      ? 'semua'
      : userUnit || storeActiveUnit
  const currentUnit = resolveUnitDetails(effectiveUnit, user)

  if (!isModalOpen) return null

  return (
    <AnimatePresence>
      <div
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby="print-option-modal-title"
        className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={`font-sans w-full ${showPreview ? 'max-w-2xl' : 'max-w-lg'} my-auto`}
        >
          <div className="relative flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
            {/* Top Accent Gradient Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30 shrink-0">
                  <Printer className="h-5 w-5 text-white" strokeWidth={2.25} />
                </div>
                <div>
                  <h3
                    id="print-option-modal-title"
                    className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
                  >
                    <span>Opsi &amp; Scope Cetak {title}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                      <Sparkles className="size-3" />
                      Cetak &amp; PDF
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pilih orientasi kertas, cakupan data, dan tindakan ekspor dokumen resmi.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup modal"
                className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer shrink-0"
              >
                <X className="size-4 text-white" strokeWidth={2.25} />
              </button>
            </div>

            {/* Body */}
            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* 1. Active Unit / Scope Badge */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                    {currentUnit.isUnitScope !== false && currentUnit.logoUrl ? (
                      <img
                        src={currentUnit.logoUrl}
                        alt={currentUnit.unitType}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <Building className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {currentUnit.isUnitScope !== false ? 'Unit Header Cetak' : 'Lingkup Dokumen Cetak'}
                    </div>
                    <div className="text-xs font-black text-[#047857] dark:text-emerald-400 truncate">
                      {currentUnit.isUnitScope !== false
                        ? currentUnit.name
                        : `Kop Tingkat Pusat — ${currentUnit.name || 'Yayasan'}`}
                    </div>
                  </div>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-[#047857] dark:text-emerald-300 font-black text-[10px] tracking-wider uppercase border border-emerald-300/60">
                  {currentUnit.isUnitScope !== false ? currentUnit.unitType : 'PUSAT / YAYASAN'}
                </span>
              </div>

              {/* 2. Orientation Selector */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <Compass className="size-3.5 text-emerald-600" />
                  <span>Orientasi Kertas A4</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setOrientation('portrait')}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      orientation === 'portrait'
                        ? 'border-[#047857] bg-emerald-50/80 text-[#047857] dark:bg-emerald-950/50 dark:border-emerald-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-5 border-2 border-current rounded-xs shrink-0" />
                      <span>Portrait (Tegak)</span>
                    </div>
                    {orientation === 'portrait' && <CheckCircle2 className="size-4 text-[#047857]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrientation('landscape')}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      orientation === 'landscape'
                        ? 'border-[#047857] bg-emerald-50/80 text-[#047857] dark:bg-emerald-950/50 dark:border-emerald-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-4 border-2 border-current rounded-xs shrink-0" />
                      <span>Landscape (Melebar)</span>
                    </div>
                    {orientation === 'landscape' && <CheckCircle2 className="size-4 text-[#047857]" />}
                  </button>
                </div>
              </div>

              {/* 3. Kolom Checklist (Jika Tersedia) */}
              {Array.isArray(columnsList) && columnsList.length > 0 && selectedColumns && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      <Layers className="size-3.5 text-emerald-600" />
                      <span>Pilih Kolom yang Ditampilkan</span>
                    </label>
                    <div className="flex items-center gap-2 text-[11px]">
                      {onSelectAllColumns && (
                        <button
                          type="button"
                          onClick={onSelectAllColumns}
                          className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          Pilih Semua
                        </button>
                      )}
                      {onSelectAllColumns && onClearAllColumns && <span className="text-slate-300">•</span>}
                      {onClearAllColumns && (
                        <button
                          type="button"
                          onClick={onClearAllColumns}
                          className="font-bold text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-h-36 overflow-y-auto pr-1">
                    {columnsList.map((col) => {
                      const isChecked = selectedColumns.includes(col.key)
                      return (
                        <button
                          key={col.key}
                          type="button"
                          onClick={() => onToggleColumn && onToggleColumn(col.key)}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-[11px] font-semibold transition-colors text-left cursor-pointer ${
                            isChecked
                              ? 'bg-white border-emerald-300 text-emerald-900 dark:bg-slate-800 dark:border-emerald-700 dark:text-emerald-200 shadow-2xs'
                              : 'bg-slate-50/80 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-800'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="size-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Square className="size-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{col.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 4. Filter Guru (Jika Tersedia) */}
              {Array.isArray(teachersList) && teachersList.length > 0 && (
                <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    <Users className="size-4 text-emerald-700 dark:text-emerald-400" />
                    <span>Filter Cetak Berdasarkan Guru Pengampu</span>
                  </label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => onTeacherChange && onTeacherChange(e.target.value)}
                    className="w-full h-10 px-3 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-600 dark:text-white shadow-2xs"
                  >
                    <option value="">-- Semua Guru (Cetak Seluruh Data) --</option>
                    {teachersList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nama_lengkap} {g.niy ? `(NIY ${g.niy})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 5. Live Visual Header Preview Toggle */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
                >
                  <Eye className="size-3.5" />
                  <span>{showPreview ? 'Sembunyikan Pratinjau Kop' : 'Lihat Pratinjau Kop Resmi Cetak'}</span>
                </button>

                {showPreview && (
                  <div className="mt-2.5 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-inner max-h-56 overflow-y-auto">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 text-center tracking-wider">
                      — Pratinjau Format Header Dokumen —
                    </div>
                    <PrintHeader
                      unit={currentUnit}
                      title={title}
                      subtitle={subtitle}
                      showDivider={true}
                      showTitle={true}
                      className="scale-95 origin-top"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer dengan Tombol Squircle Emas */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-[#131B27] shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer shadow-sm shadow-rose-500/20"
              >
                <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                  <X className="size-3.5 text-white" strokeWidth={2.2} />
                </div>
                <span>Batal</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {/* Opsi Ekspor Excel/CSV jika disediakan */}
                {onExportExcel && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onExportExcel(orientation)
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white px-4 py-2.5 text-xs font-extrabold border border-amber-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-amber-500/20"
                  >
                    <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                      <FileSpreadsheet className="size-3.5 text-white" strokeWidth={2.2} />
                    </div>
                    <span>Ekspor Excel</span>
                  </button>
                )}

                {/* Opsi Unduh PDF */}
                {(onDownload || onDownloadPdf) && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      const downloadAction = onDownload || onDownloadPdf
                      downloadAction && downloadAction(orientation)
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-4 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-emerald-500/20"
                  >
                    <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                      <Download className="size-3.5 text-white" strokeWidth={2.2} />
                    </div>
                    <span>Unduh PDF</span>
                  </button>
                )}

                {/* Opsi Cetak Dokumen */}
                {onPrint && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onPrint(orientation)
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white px-5 py-2.5 text-xs font-extrabold border border-indigo-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-indigo-600/20"
                  >
                    <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                      <Printer className="size-3.5 text-white" strokeWidth={2.2} />
                    </div>
                    <span>Cetak Dokumen</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default PrintOptionModal
