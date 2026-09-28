import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  FileInput,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react'
import { parseSpreadsheetFile, downloadSpreadsheetTemplate } from '../../utils/spreadsheetParser'

export default function JenisUnitImportModal({
  isOpen,
  onClose,
  onImport,
  isSubmitting = false,
  result = null,
}) {
  const [file, setFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [parseError, setParseError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const processFile = async (selected) => {
    if (!selected) return
    setFile(selected)
    setParseError('')
    setParsedData([])

    try {
      const headerMap = {
        'kode_jenis': 'kode_jenis',
        'kode jenis': 'kode_jenis',
        'nama_jenis': 'nama_jenis',
        'nama jenis unit': 'nama_jenis',
        'singkatan': 'singkatan',
        'jenjang': 'jenjang',
        'warna_badge': 'warna_badge',
        'warna badge': 'warna_badge',
        'icon': 'icon',
        'urutan': 'urutan',
        'status': 'status',
        'keterangan': 'keterangan',
      }

      const rows = await parseSpreadsheetFile(selected, {
        headerMap,
        transformRow: (row) => ({
          kode_jenis: row.kode_jenis || '',
          nama_jenis: row.nama_jenis || '',
          singkatan: row.singkatan || '',
          jenjang: row.jenjang || '',
          warna_badge: row.warna_badge || '#10B981',
          icon: row.icon || 'School',
          urutan: row.urutan || 1,
          status: row.status !== undefined && row.status !== '' ? row.status : 'true',
          keterangan: row.keterangan || '',
        }),
      })

      const validRows = rows.filter((r) => r.kode_jenis || r.nama_jenis)
      if (validRows.length === 0) {
        setParseError('Berkas tidak memiliki data jenis unit yang valid (minimal kode_jenis atau nama_jenis).')
      } else {
        setParsedData(validRows)
      }
    } catch (err) {
      setParseError('Gagal membaca berkas: ' + (err.message || 'Format tidak didukung.'))
    }
  }

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) processFile(selected)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const selected = e.dataTransfer.files[0]
    if (selected) processFile(selected)
  }

  const handleDownloadTemplate = (type = 'xlsx') => {
    const sampleData = [
      {
        kode_jenis: 'SDIT',
        nama_jenis: 'Sekolah Dasar Islam Terpadu',
        singkatan: 'SDIT',
        jenjang: 'SD',
        urutan: 1,
        warna_badge: '#10B981',
        icon: 'School',
        status: 'true',
        keterangan: 'Unit SDIT Terpadu',
      },
      {
        kode_jenis: 'SMPIT',
        nama_jenis: 'Sekolah Menengah Pertama Islam Terpadu',
        singkatan: 'SMPIT',
        jenjang: 'SMP',
        urutan: 2,
        warna_badge: '#6366F1',
        icon: 'Graduation',
        status: 'true',
        keterangan: 'Unit SMPIT Terpadu',
      },
      {
        kode_jenis: 'SMAIT',
        nama_jenis: 'Sekolah Menengah Atas Islam Terpadu',
        singkatan: 'SMAIT',
        jenjang: 'SMA',
        urutan: 3,
        warna_badge: '#F59E0B',
        icon: 'BookOpen',
        status: 'true',
        keterangan: 'Unit SMAIT Terpadu',
      },
    ]
    downloadSpreadsheetTemplate(sampleData, 'template_import_jenis_unit', type)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (parsedData.length === 0) {
      setParseError('Pilih file yang berisi data valid terlebih dahulu.')
      return
    }
    onImport(parsedData)
  }

  const handleClose = () => {
    if (isSubmitting) return
    setFile(null)
    setParsedData([])
    setParseError('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="jenis-unit-import-modal"
          className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="jenis-unit-import-title"
          tabIndex={-1}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) handleClose()
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="modal-dialog font-sans my-auto w-full max-w-xl"
          >
            <div className="modal-content flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-sky-200/80 bg-white shadow-2xl shadow-sky-950/20 dark:border-sky-900/50 dark:bg-[#182232]">
              {/* Top accent bar — sky blue for import */}
              <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 shrink-0" />

              {/* Header */}
              <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white p-2.5 shadow-md shadow-sky-500/25 border border-sky-300/40 shrink-0">
                    <FileInput className="h-5 w-5 text-white" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3
                      id="jenis-unit-import-title"
                      className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
                    >
                      <span>Import Data Jenis Unit Pendidikan</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-800/60">
                        <Sparkles className="size-3" /> Batch Import
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Unggah berkas CSV atau JSON berisi daftar jenis unit secara massal.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  aria-label="Tutup modal import"
                  className="size-9 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="size-4" strokeWidth={2.25} />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                <div className="modal-body min-h-0 flex-1 space-y-4 overflow-y-auto p-6 text-sm text-slate-700 dark:text-slate-200">
                  {/* Template Download Card */}
                  <div className="flex items-center justify-between rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                    <div>
                      <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <FileSpreadsheet className="size-3.5" />
                        Unduh Template Contoh
                      </h4>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                        Gunakan format Excel atau CSV resmi agar pemetaan kolom berjalan otomatis.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplate('xlsx')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 px-3.5 py-2 text-[11px] font-extrabold text-white shadow-sm shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 transition-all duration-200 border border-emerald-300/40 cursor-pointer shrink-0"
                      >
                        <Download className="size-3.5" />
                        Excel (.xlsx)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplate('csv')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 px-3.5 py-2 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 shadow-2xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer shrink-0"
                      >
                        <Download className="size-3.5" />
                        CSV
                      </button>
                    </div>
                  </div>

                  {/* Dropzone Upload Area */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                      Unggah Berkas Spreadsheet (.xlsx, .xls, .csv, .json)
                    </label>
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => inputRef.current?.click()}
                      className={`min-h-36 cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
                        isDragging
                          ? 'border-sky-500 bg-sky-50/60 dark:border-sky-600 dark:bg-sky-950/30'
                          : file
                          ? 'border-emerald-400/80 bg-emerald-50/40 dark:border-emerald-700 dark:bg-emerald-950/20'
                          : 'border-sky-300/80 bg-sky-50/20 hover:border-sky-400/90 hover:bg-sky-50/40 dark:border-sky-800/60 dark:bg-slate-800/40 dark:hover:border-sky-700'
                      }`}
                    >
                      <input
                        ref={inputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv,.json,.txt"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload-jenis-unit"
                      />
                      {file ? (
                        <>
                          <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                          <p className="text-sm font-black text-emerald-800 dark:text-emerald-300 truncate px-4">{file.name}</p>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-0.5">
                            {parsedData.length > 0 ? `${parsedData.length} baris data siap diimpor` : 'Memproses berkas...'}
                          </p>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="mx-auto mb-2 h-8 w-8 text-sky-500 dark:text-sky-400" />
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            {isDragging ? 'Lepaskan berkas di sini...' : 'Klik atau seret & lepas berkas ke sini'}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Format: Excel (.xlsx, .xls), CSV, JSON · Maks. 5 MB</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Error Notification */}
                  {parseError && (
                    <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200/80 bg-rose-50/70 p-3.5 text-xs font-semibold text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                      <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{parseError}</span>
                    </div>
                  )}

                  {/* Data Preview */}
                  {parsedData.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Pratinjau Data ({parsedData.length} baris terdeteksi)
                        </span>
                        <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                          Menampilkan maks. 5 baris pertama
                        </span>
                      </div>
                      <div className="max-h-48 overflow-auto rounded-2xl border border-sky-100 bg-white shadow-2xs dark:border-sky-950 dark:bg-slate-900/50">
                        <table className="w-full text-left text-xs">
                          <thead className="sticky top-0 bg-sky-50/80 dark:bg-slate-800 text-[10px] uppercase font-bold text-sky-900 dark:text-sky-300">
                            <tr>
                              <th className="px-3 py-2">Kode</th>
                              <th className="px-3 py-2">Nama Jenis Unit</th>
                              <th className="px-3 py-2">Jenjang</th>
                              <th className="px-3 py-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {parsedData.slice(0, 5).map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                <td className="px-3 py-2 font-mono font-bold text-sky-700 dark:text-sky-400">
                                  {row.kode_jenis || row.kode || '-'}
                                </td>
                                <td className="px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">
                                  {row.nama_jenis || row.nama || '-'}
                                </td>
                                <td className="px-3 py-2 text-slate-500">
                                  {row.jenjang || '-'}
                                </td>
                                <td className="px-3 py-2">
                                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
                                    {String(row.status) === 'true' || row.status === 'Aktif' ? 'Aktif' : 'Nonaktif'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {parsedData.length > 5 && (
                              <tr>
                                <td colSpan={4} className="px-3 py-1.5 text-center text-[10px] font-semibold text-slate-400 italic">
                                  ... dan {parsedData.length - 5} baris lainnya
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Result Success Rows */}
                  {result?.rows?.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Data Berhasil Diimpor</h4>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                          {result.rows.length} data
                        </span>
                      </div>
                      <div className="max-h-48 overflow-auto rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60">
                        <table className="w-full text-left text-xs">
                          <thead className="sticky top-0 bg-emerald-100/90 dark:bg-emerald-950 text-[10px] uppercase font-bold text-emerald-950 dark:text-emerald-200">
                            <tr>
                              <th className="px-3 py-2">Kode</th>
                              <th className="px-3 py-2">Nama Jenis Unit</th>
                              <th className="px-3 py-2">Jenjang</th>
                              <th className="px-3 py-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-emerald-100 dark:divide-emerald-900/40 bg-white dark:bg-[#1B2433]">
                            {result.rows.map((row, index) => (
                              <tr key={`${row.kode_jenis || index}-${index}`}>
                                <td className="px-3 py-2 font-mono font-bold text-emerald-800 dark:text-emerald-300">{row.kode_jenis || '-'}</td>
                                <td className="px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">{row.nama_jenis || '-'}</td>
                                <td className="px-3 py-2 text-slate-500">{row.jenjang || '-'}</td>
                                <td className="px-3 py-2">
                                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                    Berhasil
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="modal-footer px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleClose}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer disabled:opacity-50"
                  >
                    <X className="size-3.5 text-slate-500 dark:text-slate-400" strokeWidth={2.2} />
                    <span>{result ? 'Tutup' : 'Batal'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || parsedData.length === 0 || Boolean(result)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 text-white px-5 py-2.5 text-xs font-extrabold shadow-md shadow-sky-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer border border-sky-300/40"
                  >
                    {isSubmitting ? (
                      <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <FileInput className="size-4" strokeWidth={2} />
                    )}
                    <span>
                      {isSubmitting
                        ? 'Memproses Import...'
                        : result
                        ? 'Import Selesai'
                        : `Mulai Import${parsedData.length > 0 ? ` (${parsedData.length})` : ''}`}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
