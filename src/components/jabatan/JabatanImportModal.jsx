import React, { useState } from 'react'
import { X as FaTimes, FileInput as FaFileImport, Download as FaDownload, UploadCloud as FaUpload, CircleCheck as FaCheckCircle, CircleAlert as FaExclamationCircle } from 'lucide-react'

export default function JabatanImportModal({ isOpen, onClose, onImport, isSubmitting = false }) {
  const [file, setFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [parseError, setParseError] = useState('')

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    setFile(selected)
    setParseError('')
    setParsedData([])

    if (!selected) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target.result
        if (selected.name.endsWith('.json')) {
          const json = JSON.parse(text)
          if (Array.isArray(json)) {
            setParsedData(json)
          } else if (json.data && Array.isArray(json.data)) {
            setParsedData(json.data)
          } else {
            setParseError('Format file JSON harus berupa array objek data jabatan.')
          }
        } else if (selected.name.endsWith('.csv') || selected.name.endsWith('.txt')) {
          const lines = text.split('\n').filter((line) => line.trim() !== '')
          if (lines.length < 2) {
            setParseError('File CSV minimal harus memiliki header dan 1 baris data.')
            return
          }
          const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
          const rows = lines.slice(1).map((line) => {
            const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
            const obj = {}
            headers.forEach((h, idx) => {
              obj[h] = values[idx] || ''
            })
            return obj
          })
          setParsedData(rows)
        } else {
          setParseError('Format file tidak didukung. Harap gunakan CSV atau JSON.')
        }
      } catch (err) {
        setParseError('Gagal membaca file: ' + err.message)
      }
    }
    reader.readAsText(selected)
  }

  const handleDownloadTemplate = () => {
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

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sampleData, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', 'template_import_master_jabatan.json')
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (parsedData.length === 0) {
      setParseError('Pilih file yang berisi data valid terlebih dahulu.')
      return
    }
    onImport(parsedData)
  }

  return (
    <div
      id="jabatan-import-modal"
      className="overlay modal overlay-open:opacity-100 overlay-open:duration-300 fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="impor-jabatan-title"
      tabIndex={-1}
    >
      <div className="modal-dialog font-sans w-full max-w-xl">
        <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
          {/* Header Bar */}
          <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-[#054e3b] font-bold dark:bg-emerald-950/50 dark:text-emerald-300">
                <FaFileImport className="w-5 h-5" />
              </div>
              <div>
                <h3 id="impor-jabatan-title" className="modal-title text-base font-bold text-slate-900 dark:text-white">
                  Impor Data Jabatan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unggah file JSON atau CSV berisi daftar jabatan batch.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-text btn-circle btn-sm absolute end-3 top-3"
              aria-label="Close"
              data-overlay="#jabatan-import-modal"
            >
              <span className="icon-[tabler--x] size-4"></span>
            </button>
          </div>

          {/* Content Form */}
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="modal-body min-h-0 flex-1 space-y-5 overflow-y-auto p-5 text-sm text-slate-700 dark:text-slate-200">
              {/* Template Download Option */}
              <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-2xl border border-slate-200/90 text-xs dark:bg-slate-800/50 dark:border-slate-700">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Belum punya format template?</p>
                  <p className="text-slate-500 mt-0.5">Unduh contoh berkas struktur data yang sesuai.</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
                >
                  <FaDownload className="size-3.5" />
                  <span>Unduh Template</span>
                </button>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-[#10b981] rounded-2xl p-6 text-center hover:bg-emerald-50/20 transition-colors bg-emerald-50/10 dark:bg-slate-800/40 dark:border-slate-600">
                <input
                  type="file"
                  accept=".json,.csv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload-jabatan"
                />
                <label htmlFor="file-upload-jabatan" className="cursor-pointer space-y-2 block">
                  <FaUpload className="w-8 h-8 mx-auto text-[#047857] dark:text-emerald-400" />
                  <p className="text-sm font-bold text-[#0f172a] dark:text-slate-200">
                    {file ? file.name : 'Upload File CSV / JSON'}
                  </p>
                  <p className="text-xs text-slate-400">Ukuran maksimal file 5MB</p>
                </label>
              </div>

              {/* Validation Feedback */}
              {parseError && (
                <div className="p-3.5 bg-rose-50 text-rose-700 rounded-2xl text-xs flex items-center space-x-2 border border-rose-200">
                  <FaExclamationCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {parsedData.length > 0 && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl text-xs flex items-center space-x-2 border border-emerald-200">
                  <FaCheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span>Berhasil membaca <strong>{parsedData.length} baris</strong> data siap diimpor.</span>
                </div>
              )}
            </div>

            {/* Modal Footer Bar */}
            <div className="modal-footer flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-soft btn-secondary"
                data-overlay="#jabatan-import-modal"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSubmitting || parsedData.length === 0}
                className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50"
              >
                <FaFileImport className="size-3.5" />
                <span>{isSubmitting ? 'Memproses Impor...' : 'Save changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
