import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  X,
  CheckCircle2,
  FileText,
  Loader2,
  Table as TableIcon,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { parseSpreadsheetFile, downloadSpreadsheetTemplate } from '../../utils/spreadsheetParser'

export default function TahunAjaranImportModal({
  isOpen,
  onClose,
  onImport,
  isSubmitting = false,
}) {
  const [previewRows, setPreviewRows] = useState([])
  const [fileName, setFileName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setFileName(file.name)
    setErrorMsg('')

    try {
      const headerMap = {
        'name': 'name',
        'nama tahun ajaran': 'name',
        'tahun ajaran': 'name',
        'nama': 'name',
        'start_date': 'start_date',
        'tanggal mulai': 'start_date',
        'tgl mulai': 'start_date',
        'mulai': 'start_date',
        'end_date': 'end_date',
        'tanggal selesai': 'end_date',
        'tgl selesai': 'end_date',
        'selesai': 'end_date',
        'is_active': 'is_active',
        'status aktif': 'is_active',
        'status': 'is_active',
        'keterangan': 'keterangan',
        'deskripsi': 'keterangan',
      }

      const rows = await parseSpreadsheetFile(file, {
        headerMap,
        transformRow: (row) => ({
          name: row.name || '',
          start_date: row.start_date || '',
          end_date: row.end_date || '',
          is_active: String(row.is_active || 'false'),
          keterangan: row.keterangan || '',
        }),
      })

      const validRows = rows.filter((r) => r.name && r.start_date && r.end_date)
      if (validRows.length === 0) {
        setErrorMsg('Format berkas tidak valid atau tidak memiliki baris data lengkap (name, start_date, end_date).')
      } else {
        setPreviewRows(validRows)
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal membaca berkas. Pastikan format spreadsheet (.xlsx, .xls, .csv) valid.')
    }
  }

  const handleDownloadTemplate = (type = 'xlsx') => {
    const sampleData = [
      {
        name: '2025/2026',
        start_date: '2025-07-01',
        end_date: '2026-06-30',
        is_active: 'false',
        keterangan: 'Tahun ajaran lampau',
      },
      {
        name: '2026/2027',
        start_date: '2026-07-01',
        end_date: '2027-06-30',
        is_active: 'true',
        keterangan: 'Tahun ajaran aktif utama',
      },
      {
        name: '2027/2028',
        start_date: '2027-07-01',
        end_date: '2028-06-30',
        is_active: 'false',
        keterangan: 'Tahun ajaran mendatang',
      },
    ]
    downloadSpreadsheetTemplate(sampleData, 'template_import_tahun_ajaran', type)
  }

  const handleSubmitImport = () => {
    if (previewRows.length === 0) return
    onImport(previewRows)
  }

  const handleClose = () => {
    if (isSubmitting) return
    setPreviewRows([])
    setFileName('')
    setErrorMsg('')
    onClose()
  }

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-tahun-ajaran-title"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !isSubmitting) handleClose()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="my-auto w-full max-w-2xl font-sans"
        >
          <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60">
            {/* Top Accent Gradient Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white p-3 shadow-md shadow-emerald-600/30 border border-emerald-300/30 shrink-0">
                  <Upload className="size-5" strokeWidth={2.25} />
                </div>
                <div>
                  <h3
                    id="import-tahun-ajaran-title"
                    className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white"
                  >
                    Impor Data Tahun Ajaran
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    Unggah berkas CSV/Excel untuk memproses data tahun ajaran secara massal.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleClose}
                aria-label="Tutup modal impor"
                className="size-9 flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <X className="size-4" strokeWidth={2.25} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Template Download Card */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
                    <FileSpreadsheet className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Unduh Template Standar
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      Gunakan format kolom CSV yang telah disesuaikan dengan sistem database.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownloadTemplate('xlsx')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition-colors cursor-pointer shrink-0"
                  >
                    <Download className="size-3.5" />
                    <span>Excel (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadTemplate('csv')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 px-3 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-2xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer shrink-0"
                  >
                    <Download className="size-3.5" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-800 dark:text-slate-100">
                  Pilih Berkas Spreadsheet (.xlsx, .xls, .csv)
                </label>
                <label
                  htmlFor="file-upload-academic"
                  className={cn(
                    'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200',
                    fileName
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-emerald-300/80 bg-emerald-50/15 hover:bg-emerald-50/30 hover:border-emerald-400 dark:border-emerald-800/60 dark:bg-slate-800/40'
                  )}
                >
                  <input
                    id="file-upload-academic"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/25 mb-3">
                    <Upload className="size-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {fileName || 'Klik untuk memilih berkas CSV atau seret ke sini'}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    Maksimal 5MB. Hanya format .csv UTF-8
                  </p>
                </label>
              </div>

              {/* Error Notice */}
              {errorMsg && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200/80 bg-rose-50/70 p-3.5 text-xs font-semibold text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                  <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Data Preview Table */}
              {previewRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <TableIcon className="size-3.5" />
                      <span>Pratinjau Data ({previewRows.length} baris terdeteksi)</span>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60">
                    <div className="max-h-48 overflow-y-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="sticky top-0 bg-emerald-100/90 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-200 font-extrabold border-b border-emerald-200 dark:border-emerald-800">
                          <tr>
                            <th className="px-3 py-2">Nama</th>
                            <th className="px-3 py-2">Mulai</th>
                            <th className="px-3 py-2">Selesai</th>
                            <th className="px-3 py-2">Aktif</th>
                            <th className="px-3 py-2">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-100 dark:divide-emerald-900/40 bg-white dark:bg-[#1B2433]">
                          {previewRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20">
                              <td className="px-3 py-2 font-bold text-slate-800 dark:text-white">{row.name}</td>
                              <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{row.start_date}</td>
                              <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{row.end_date}</td>
                              <td className="px-3 py-2">
                                <span className={cn(
                                  'inline-block px-1.5 py-0.2 rounded font-bold text-[10px]',
                                  row.is_active === 'true' || row.is_active === true
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-600'
                                )}>
                                  {row.is_active === 'true' || row.is_active === true ? 'Aktif' : 'Tidak'}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-slate-500 truncate max-w-[140px]">{row.keterangan || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950 shrink-0">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleClose}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-xs font-extrabold text-slate-700 transition-all duration-200 hover:scale-[1.02] hover:bg-slate-200 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer disabled:opacity-50"
              >
                <X className="size-3.5" strokeWidth={2.2} />
                <span>Batal</span>
              </button>

              <button
                type="button"
                disabled={previewRows.length === 0 || isSubmitting}
                onClick={handleSubmitImport}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-600/30 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" strokeWidth={2.2} />
                )}
                <span>{isSubmitting ? 'Memproses Impor...' : `Impor ${previewRows.length} Data`}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
