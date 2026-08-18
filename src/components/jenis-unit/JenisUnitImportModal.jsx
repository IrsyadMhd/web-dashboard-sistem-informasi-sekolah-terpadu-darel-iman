import React, { useState } from 'react'
import { AlertTriangle, CheckCircle2, Download, FileInput, UploadCloud, X } from 'lucide-react'

export default function JenisUnitImportModal({ isOpen, onClose, onImport, isSubmitting = false, result = null }) {
  const [parsedData, setParsedData] = useState([])
  const [parseError, setParseError] = useState('')

  if (!isOpen) return null

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target.result
        // Check if CSV or JSON
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text)
          if (Array.isArray(parsed)) {
            setParsedData(parsed)
            setParseError('')
          } else {
            setParseError('Format file JSON harus berupa Array of Object.')
          }
        } else if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
          const lines = text.split('\n').filter((l) => l.trim() !== '')
          if (lines.length <= 1) {
            setParseError('File CSV kosong atau hanya berisi baris header.')
            return
          }
          const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
          const rows = []

          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''))
            if (cols.length >= 2) {
              const item = {}
              headers.forEach((h, idx) => {
                item[h] = cols[idx] || ''
              })
              rows.push(item)
            }
          }
          setParsedData(rows)
          setParseError('')
        } else {
          setParseError('Format file tidak didukung. Harap gunakan CSV atau JSON.')
        }
      } catch (err) {
        setParseError('Gagal membaca file: ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  const handleDownloadTemplate = () => {
    const csvContent =
      'kode_jenis,nama_jenis,singkatan,jenjang,urutan,warna_badge,icon,status,keterangan\n' +
      'SDIT,Sekolah Dasar Islam Terpadu,SDIT,SD,1,#10B981,School,true,Unit SDIT Terpadu\n' +
      'SMPIT,Sekolah Menengah Pertama Islam Terpadu,SMPIT,SMP,2,#6366F1,Graduation,true,Unit SMPIT Terpadu\n'

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'template_import_jenis_unit.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (parsedData.length === 0) {
      setParseError('Belum ada data valid yang diunggah.')
      return
    }
    onImport(parsedData)
  }

  return (
    <div
      id="jenis-unit-import-modal"
      className="overlay modal overlay-open:opacity-100 overlay-open:duration-300 fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="jenis-unit-import-title"
      tabIndex={-1}
    >
      <div className="modal-dialog font-sans w-full max-w-xl">
        <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
          {/* Header Modal */}
          <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                <FileInput className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <div>
                <h3 id="jenis-unit-import-title" className="modal-title text-base font-bold text-slate-800 dark:text-white">Import Data Jenis Unit Pendidikan</h3>
                <p className="text-xs text-slate-500">Impor data sekaligus melalui file CSV atau JSON.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup import data"
              data-overlay="#jenis-unit-import-modal"
              className="btn btn-text btn-circle btn-sm absolute end-3 top-3 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="size-4" strokeWidth={2.25} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="modal-body min-h-0 flex-1 space-y-5 overflow-y-auto p-5 text-sm text-slate-700 dark:text-slate-200">
              {/* Download Template Step */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">Unduh Template Contoh</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Gunakan format CSV standar agar proses impor berjalan lancar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  Template CSV
                </button>
              </div>

              {/* Upload Area */}
              <div>
                <label className="block font-semibold text-gray-800 mb-2 dark:text-slate-200">Unggah File (CSV / JSON)</label>
                <div className="min-h-44 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/40 p-6 text-center transition-colors hover:border-emerald-500 dark:border-slate-600 dark:bg-slate-800/40">
                  <UploadCloud className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">Klik atau seret file CSV / JSON ke sini</p>
                  <p className="text-xs text-gray-500 mt-1">File maks. 5 MB (CSV/JSON)</p>
                  <input
                    type="file"
                    accept=".csv, .json, .txt"
                    onChange={handleFileUpload}
                    className="mt-3 text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                  />
                </div>
              </div>

              {parseError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {parsedData.length > 0 && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>
                      Berhasil membaca <strong>{parsedData.length}</strong> data siap diimpor.
                    </span>
                  </div>
                </div>
              )}

              {result?.rows?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-white">Data Berhasil Diimpor</h3>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">{result.rows.length} data</span>
                  </div>
                  <div className="max-h-48 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full min-w-[480px] text-left text-xs">
                      <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase text-slate-500 dark:bg-slate-800">
                        <tr><th className="px-3 py-2">Kode</th><th className="px-3 py-2">Nama Jenis Unit</th><th className="px-3 py-2">Jenjang</th><th className="px-3 py-2">Status</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {result.rows.map((row, index) => (
                          <tr key={`${row.kode_jenis || index}-${index}`}>
                            <td className="px-3 py-2 font-bold text-emerald-800">{row.kode_jenis || '-'}</td>
                            <td className="px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">{row.nama_jenis || '-'}</td>
                            <td className="px-3 py-2 text-slate-500">{row.jenjang || '-'}</td>
                            <td className="px-3 py-2"><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Berhasil</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-soft btn-secondary"
                data-overlay="#jenis-unit-import-modal"
              >
                {result ? 'Tutup' : 'Batal'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || parsedData.length === 0 || Boolean(result)}
                className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50"
              >
                <FileInput className="h-4 w-4" />
                {isSubmitting ? 'Memproses...' : result ? 'Import Selesai' : 'Mulai Import'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
