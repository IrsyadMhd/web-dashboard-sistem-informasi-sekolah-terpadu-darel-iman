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

const SAMPLE_ROWS = [
  {
    kode_kurikulum: 'KUR-SD-SIT-2026',
    nama_kurikulum: 'Kurikulum Merdeka SIT SD 2026',
    jenis_kurikulum: 'SIT',
    jenjang: 'SD',
    status: 'aktif',
    deskripsi: 'Kurikulum SIT untuk jenjang Sekolah Dasar 2026/2027',
  },
  {
    kode_kurikulum: 'KUR-SMP-SIT-2026',
    nama_kurikulum: 'Kurikulum Merdeka SIT SMP 2026',
    jenis_kurikulum: 'SIT',
    jenjang: 'SMP',
    status: 'aktif',
    deskripsi: 'Kurikulum SIT untuk jenjang SMPIT 2026/2027',
  },
  {
    kode_kurikulum: 'KUR-SMA-SIT-2026',
    nama_kurikulum: 'Kurikulum Nasional Plus Pesantren SMA',
    jenis_kurikulum: 'Pesantren',
    jenjang: 'SMA',
    status: 'aktif',
    deskripsi: 'Kurikulum terpadu pesantren dan nasional',
  },
]

export default function KurikulumImportModal({
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
  const [useManualJson, setUseManualJson] = useState(false)
  const [manualJsonText, setManualJsonText] = useState('')
  const inputRef = useRef(null)

  const processFile = async (selected) => {
    if (!selected) return
    setFile(selected)
    setParseError('')
    setParsedData([])

    try {
      const headerMap = {
        'kode_kurikulum': 'kode_kurikulum',
        'kode kurikulum': 'kode_kurikulum',
        'nama_kurikulum': 'nama_kurikulum',
        'nama kurikulum': 'nama_kurikulum',
        'jenis_kurikulum': 'jenis_kurikulum',
        'jenis kurikulum': 'jenis_kurikulum',
        'jenjang': 'jenjang',
        'status': 'status',
        'deskripsi': 'deskripsi',
      }

      const rows = await parseSpreadsheetFile(selected, {
        headerMap,
        transformRow: (row) => ({
          kode_kurikulum: row.kode_kurikulum || '',
          nama_kurikulum: row.nama_kurikulum || '',
          jenis_kurikulum: row.jenis_kurikulum || 'Nasional',
          jenjang: row.jenjang || '',
          status: row.status || 'aktif',
          deskripsi: row.deskripsi || '',
        }),
      })

      const validRows = rows.filter((r) => r.kode_kurikulum || r.nama_kurikulum)
      if (validRows.length === 0) {
        setParseError('Berkas tidak memiliki data kurikulum yang valid (minimal kode_kurikulum atau nama_kurikulum).')
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

  const handleDownloadTemplateExcel = () => {
    downloadSpreadsheetTemplate(SAMPLE_ROWS, 'template_import_master_kurikulum', 'xlsx')
  }

  const handleDownloadTemplateCsv = () => {
    downloadSpreadsheetTemplate(SAMPLE_ROWS, 'template_import_master_kurikulum', 'csv')
  }

  const handleDownloadTemplateJson = () => {
    const jsonStr = JSON.stringify(SAMPLE_ROWS, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'template_import_master_kurikulum.json')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleManualJsonParse = () => {
    setParseError('')
    if (!manualJsonText.trim()) {
      setParseError('Payload data JSON tidak boleh kosong.')
      return
    }
    try {
      const parsed = JSON.parse(manualJsonText)
      if (Array.isArray(parsed)) {
        setParsedData(parsed)
      } else if (typeof parsed === 'object') {
        setParsedData([parsed])
      } else {
        setParseError('Format harus berupa array objek data kurikulum.')
      }
    } catch (err) {
      setParseError('Format JSON tidak valid: ' + err.message)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (useManualJson && parsedData.length === 0 && manualJsonText.trim()) {
      try {
        const parsed = JSON.parse(manualJsonText)
        const rows = Array.isArray(parsed) ? parsed : [parsed]
        onImport(rows)
        return
      } catch (err) {
        setParseError('Format JSON tidak valid: ' + err.message)
        return
      }
    }

    if (parsedData.length === 0) {
      setParseError('Pilih file CSV/JSON yang valid atau masukkan teks JSON terlebih dahulu.')
      return
    }
    onImport(parsedData)
  }

  const resetModal = () => {
    setFile(null)
    setParsedData([])
    setParseError('')
    setManualJsonText('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) resetModal()
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="modal-dialog font-sans my-auto w-full max-w-2xl"
          >
            <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-sky-200/80 bg-white shadow-2xl shadow-sky-950/20 dark:border-sky-900/50 dark:bg-[#182232]">
              {/* Garis Aksen Gradasi Atas Sky Blue */}
              <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 shrink-0" />

              {/* Header Modal */}
              <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white p-2.5 shadow-md shadow-sky-500/30 border border-sky-300/30 shrink-0">
                    <FileInput className="h-5 w-5 text-white" strokeWidth={2.25} />
                  </div>
                  <div>
                    <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Import Data Kurikulum</span>
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-800/60">
                        <Sparkles className="size-3 text-sky-600" />
                        Batch CSV / JSON
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Unggah berkas kurikulum massal sesuai struktur format SIT.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={resetModal}
                  className="size-9 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer disabled:opacity-50"
                  aria-label="Tutup modal"
                >
                  <X className="size-4" strokeWidth={2.25} />
                </button>
              </div>

              {/* Body Modal */}
              <div className="modal-body p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                {/* Result Callout */}
                {result && (
                  <div
                    className={`rounded-2xl p-4 text-xs flex items-start gap-3 border ${
                      result.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="size-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">{result.message || (result.success ? 'Import Sukses' : 'Gagal Import')}</p>
                      {result.count !== undefined && (
                        <p className="mt-1 text-[11px] font-semibold">Total diproses: {result.count} data kurikulum</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Download Template Card */}
                <div className="rounded-2xl border border-sky-200/80 bg-gradient-to-r from-sky-50/70 via-blue-50/40 to-transparent p-4 dark:border-sky-900/60 dark:bg-sky-950/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm shadow-sky-500/30">
                        <FileSpreadsheet className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Unduh Template Contoh
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Format Excel, CSV, atau JSON standar dengan atribut kurikulum lengkap.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleDownloadTemplateExcel}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 dark:bg-sky-950/40 px-3 py-1.5 text-xs font-bold text-sky-800 dark:text-sky-300 shadow-2xs hover:bg-sky-100 transition cursor-pointer"
                      >
                        <Download className="size-3.5" />
                        Excel (.xlsx)
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadTemplateCsv}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-white px-3 py-1.5 text-xs font-bold text-sky-700 shadow-2xs hover:bg-sky-50 dark:border-sky-700 dark:bg-slate-900 dark:text-sky-300 transition cursor-pointer"
                      >
                        <Download className="size-3.5" />
                        CSV
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadTemplateJson}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-white px-3 py-1.5 text-xs font-bold text-sky-700 shadow-2xs hover:bg-sky-50 dark:border-sky-700 dark:bg-slate-900 dark:text-sky-300 transition cursor-pointer"
                      >
                        <Download className="size-3.5" />
                        JSON
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tab Pilihan Metode Input */}
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <button
                    type="button"
                    onClick={() => setUseManualJson(false)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                      !useManualJson
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                    }`}
                  >
                    Unggah Berkas File (.xlsx / .xls / .csv / .json)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseManualJson(true)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                      useManualJson
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                    }`}
                  >
                    Tempel Payload JSON
                  </button>
                </div>

                {!useManualJson ? (
                  /* Dropzone Area */
                  <div>
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv,.json,.txt"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => inputRef.current?.click()}
                      className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 text-center transition-all duration-200 cursor-pointer ${
                        isDragging
                          ? 'border-sky-500 bg-sky-50/60 dark:border-sky-400 dark:bg-sky-950/30'
                          : file
                          ? 'border-sky-300 bg-sky-50/30 dark:border-sky-800 dark:bg-sky-950/10'
                          : 'border-slate-200 bg-slate-50/50 hover:border-sky-300 hover:bg-sky-50/20 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-sky-700'
                      }`}
                    >
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/25 mb-3 group-hover:scale-105 transition-transform">
                        <UploadCloud className="size-6" />
                      </div>

                      {file ? (
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white">{file.name}</p>
                          <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                            {(file.size / 1024).toFixed(1)} KB · Klik untuk mengganti berkas
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Tarik dan letakkan berkas Excel (.xlsx, .xls), CSV, atau JSON di sini
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                            atau klik untuk memilih file dari komputer Anda
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Manual JSON Textarea */
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Payload Teks JSON:
                    </label>
                    <textarea
                      rows={6}
                      value={manualJsonText}
                      onChange={(e) => {
                        setManualJsonText(e.target.value)
                        setParseError('')
                      }}
                      onBlur={handleManualJsonParse}
                      placeholder="Tempel array data JSON di sini... Contoh: [ { &quot;kode_kurikulum&quot;: &quot;KUR-01&quot;, ... } ]"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 font-mono text-xs text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    />
                  </div>
                )}

                {/* Error Box */}
                {parseError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="size-4 shrink-0 text-rose-600" />
                    <span>{parseError}</span>
                  </div>
                )}

                {/* Preview Parsed Data */}
                {parsedData.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-sky-600" />
                        <span>Pratinjau Data ({parsedData.length} baris terdeteksi)</span>
                      </p>
                      <span className="text-[11px] font-bold text-sky-600">Siap diimpor</span>
                    </div>

                    <div className="max-h-40 overflow-auto rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px]">
                      <table className="w-full text-left">
                        <thead className="sticky top-0 bg-slate-100 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <tr>
                            <th className="p-2">#</th>
                            <th className="p-2">Kode</th>
                            <th className="p-2">Nama Kurikulum</th>
                            <th className="p-2">Jenis</th>
                            <th className="p-2">Jenjang</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {parsedData.slice(0, 5).map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                              <td className="p-2 text-slate-400 font-mono">{i + 1}</td>
                              <td className="p-2 font-mono font-bold text-sky-700 dark:text-sky-400">
                                {row.kode_kurikulum || row.kode || '-'}
                              </td>
                              <td className="p-2 font-semibold text-slate-800 dark:text-slate-200">
                                {row.nama_kurikulum || row.nama || '-'}
                              </td>
                              <td className="p-2 text-slate-600 dark:text-slate-400">
                                {row.jenis_kurikulum || row.jenis || '-'}
                              </td>
                              <td className="p-2 text-slate-600 dark:text-slate-400">
                                {row.jenjang || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {parsedData.length > 5 && (
                        <p className="p-2 text-center text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-900/50">
                          ... dan {parsedData.length - 5} baris data lainnya
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Modal */}
              <div className="modal-footer px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-900/40">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={resetModal}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || (parsedData.length === 0 && !manualJsonText.trim())}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white px-5 py-2.5 text-xs font-extrabold shadow-md shadow-sky-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer border border-sky-300/40"
                >
                  {isSubmitting ? (
                    <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <FileInput className="size-4" />
                  )}
                  <span>{isSubmitting ? 'Mengimpor...' : 'Proses Impor Data'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
