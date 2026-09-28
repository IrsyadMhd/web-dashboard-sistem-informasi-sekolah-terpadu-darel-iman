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

export default function JabatanImportModal({ isOpen, onClose, onImport, isSubmitting = false }) {
  const [file, setFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [parseError, setParseError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  if (!isOpen) return null

  const parseFile = async (selected) => {
    if (!selected) return
    setFile(selected)
    setParseError('')
    setParsedData([])

    try {
      const headerMap = {
        'kode_jabatan': 'kode_jabatan',
        'kode jabatan': 'kode_jabatan',
        'nama_jabatan': 'nama_jabatan',
        'nama jabatan': 'nama_jabatan',
        'satuan_kerja': 'satuan_kerja',
        'satuan kerja': 'satuan_kerja',
        'scope_akses': 'scope_akses',
        'scope akses': 'scope_akses',
        'level_jabatan': 'level_jabatan',
        'level jabatan': 'level_jabatan',
        'urutan': 'urutan',
        'warna': 'warna',
        'ikon': 'ikon',
        'deskripsi': 'deskripsi',
        'status': 'status',
        'tampil_struktur': 'tampil_struktur',
        'boleh_login': 'boleh_login',
      }

      const rows = await parseSpreadsheetFile(selected, {
        headerMap,
        transformRow: (row) => ({
          ...row,
          kode_jabatan: row.kode_jabatan || '',
          nama_jabatan: row.nama_jabatan || '',
          satuan_kerja: row.satuan_kerja || 'Unit Pendidikan',
          scope_akses: row.scope_akses || 'unit_sendiri',
          level_jabatan: Number(row.level_jabatan) || 8,
          urutan: Number(row.urutan) || 1,
          warna: row.warna || '#3B82F6',
          ikon: row.ikon || 'UserCheck',
          status: row.status || 'Aktif',
          tampil_struktur: row.tampil_struktur !== undefined && row.tampil_struktur !== '' ? row.tampil_struktur : true,
          boleh_login: row.boleh_login !== undefined && row.boleh_login !== '' ? row.boleh_login : true,
        }),
      })

      const validRows = rows.filter((r) => r.kode_jabatan || r.nama_jabatan)
      if (validRows.length === 0) {
        setParseError('Berkas tidak memiliki data jabatan yang valid (minimal kode_jabatan atau nama_jabatan).')
      } else {
        setParsedData(validRows)
      }
    } catch (err) {
      setParseError('Gagal membaca berkas: ' + (err.message || 'Format tidak didukung.'))
    }
  }

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) parseFile(selected)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const selected = e.dataTransfer.files[0]
    if (selected) parseFile(selected)
  }

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)

  const handleDownloadTemplate = (type = 'xlsx') => {
    const sampleData = [
      {
        kode_jabatan: 'JBT-101',
        nama_jabatan: 'Koordinator Ekstrakurikuler',
        satuan_kerja: 'Unit Pendidikan',
        scope_akses: 'siswa_binaan',
        level_jabatan: 8,
        urutan: 15,
        warna: '#3B82F6',
        ikon: 'UserCheck',
        deskripsi: 'Mengkoordinasi seluruh kegiatan ekstrakurikuler siswa',
        status: 'Aktif',
        tampil_struktur: true,
        boleh_login: true,
      },
    ]

    if (type === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sampleData, null, 2))
      const a = document.createElement('a')
      a.setAttribute('href', dataStr)
      a.setAttribute('download', 'template_import_master_jabatan.json')
      document.body.appendChild(a)
      a.click()
      a.remove()
    } else {
      downloadSpreadsheetTemplate(sampleData, 'template_import_master_jabatan', type)
    }
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
          className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="jabatan-import-title"
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
                      id="jabatan-import-title"
                      className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
                    >
                      Import Data Jabatan
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-800/60">
                        <Sparkles className="size-3" /> Batch Import
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Unggah file JSON atau CSV berisi daftar jabatan secara massal.
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
                        Gunakan template resmi (Excel/CSV/JSON) agar pemetaan jabatan tepat.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplate('xlsx')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 px-3 py-2 text-[11px] font-extrabold text-white shadow-sm shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 transition-all duration-200 border border-emerald-300/40 cursor-pointer shrink-0"
                      >
                        <Download className="size-3.5" />
                        Excel (.xlsx)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplate('csv')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 px-3 py-2 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 shadow-2xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer shrink-0"
                      >
                        <Download className="size-3.5" />
                        CSV
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplate('json')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-2 text-[11px] font-extrabold text-slate-700 dark:text-slate-300 shadow-2xs hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
                      >
                        <Download className="size-3.5" />
                        JSON
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
                        id="file-upload-jabatan"
                      />
                      {file ? (
                        <>
                          <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                          <p className="text-sm font-black text-emerald-800 dark:text-emerald-300 truncate px-4">{file.name}</p>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-0.5">
                            {parsedData.length > 0 ? `${parsedData.length} baris data siap diimpor` : 'Memproses file...'}
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

                  {/* Parse Error Feedback */}
                  {parseError && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 flex items-start gap-2.5">
                      <AlertTriangle className="size-4 shrink-0 text-rose-600 mt-0.5" strokeWidth={2.2} />
                      <span className="leading-snug">{parseError}</span>
                    </div>
                  )}

                  {/* Parse Success Feedback */}
                  {parsedData.length > 0 && !parseError && (
                    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2.2} />
                        <div>
                          <p className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                            Data Siap Diimpor
                          </p>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                            Berhasil membaca <strong>{parsedData.length} baris</strong> data jabatan — siap untuk diproses.
                          </p>
                        </div>
                      </div>

                      {/* Mini Preview Table */}
                      <div className="mt-3 overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 max-h-36">
                        <table className="w-full min-w-[420px] text-left text-[10px]">
                          <thead className="bg-emerald-100/80 dark:bg-emerald-950/60">
                            <tr>
                              <th className="px-3 py-2 font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">No</th>
                              <th className="px-3 py-2 font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Kode Jabatan</th>
                              <th className="px-3 py-2 font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Nama Jabatan</th>
                              <th className="px-3 py-2 font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Level</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                            {parsedData.slice(0, 5).map((row, idx) => (
                              <tr key={idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
                                <td className="px-3 py-1.5 font-bold text-slate-400">{idx + 1}</td>
                                <td className="px-3 py-1.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                  {row.kode_jabatan || '-'}
                                </td>
                                <td className="px-3 py-1.5 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                                  {row.nama_jabatan || row.name || '-'}
                                </td>
                                <td className="px-3 py-1.5 text-slate-500">
                                  {row.level_jabatan ? `Level ${row.level_jabatan}` : '-'}
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
                </div>

                {/* Footer */}
                <div className="modal-footer px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-900/40">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleClose}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || parsedData.length === 0}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 text-white px-5 py-2.5 text-xs font-extrabold shadow-md shadow-sky-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer border border-sky-300/40"
                  >
                    {isSubmitting ? (
                      <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <FileInput className="size-4" strokeWidth={2} />
                    )}
                    <span>{isSubmitting ? 'Memproses Import...' : `Mulai Import${parsedData.length > 0 ? ` (${parsedData.length})` : ''}`}</span>
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
