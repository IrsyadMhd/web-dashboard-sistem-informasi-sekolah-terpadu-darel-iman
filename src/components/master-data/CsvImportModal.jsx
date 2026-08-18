import { useRef, useState } from 'react'
import { Download, FileSpreadsheet, Upload, X } from 'lucide-react'

const parseLine = (line, delimiter) => {
  const values = []
  let value = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"' && line[index + 1] === '"' && quoted) { value += '"'; index += 1 }
    else if (char === '"') quoted = !quoted
    else if (char === delimiter && !quoted) { values.push(value.trim()); value = '' }
    else value += char
  }
  values.push(value.trim())
  return values
}

const parseCsv = (text) => {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim())
  if (lines.length < 2) throw new Error('File harus memiliki header dan minimal satu baris data.')
  const delimiter = lines[0].includes(';') && !lines[0].includes(',') ? ';' : ','
  const headers = parseLine(lines[0], delimiter).map((item) => item.trim().toLowerCase())
  return lines.slice(1).map((line) => Object.fromEntries(headers.map((header, index) => [header, parseLine(line, delimiter)[index] ?? ''])))
}

export default function CsvImportModal({ open, onClose, title, columns, onImport }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const downloadTemplate = () => {
    const header = columns.map((item) => item.key).join(',')
    const example = columns.map((item) => `"${item.example ?? ''}"`).join(',')
    const blob = new Blob([`\uFEFF${header}\n${example}\n`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `template-${title.toLowerCase().replaceAll(' ', '-')}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!file) return setError('Pilih file CSV terlebih dahulu.')
    try {
      setBusy(true)
      setError('')
      const rows = parseCsv(await file.text())
      const missing = columns.filter((item) => item.required && !Object.hasOwn(rows[0], item.key))
      if (missing.length) throw new Error(`Kolom wajib tidak ditemukan: ${missing.map((item) => item.key).join(', ')}`)
      await onImport(rows)
      setFile(null)
      onClose()
    } catch (importError) {
      setError(importError?.response?.data?.message || importError.message || 'Import gagal diproses.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      id="csv-import-modal"
      className="overlay modal overlay-open:opacity-100 overlay-open:duration-300 fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div className="modal-dialog font-sans w-full max-w-xl">
        <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
          <div className="modal-header flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
            <div>
              <h3 className="modal-title text-base font-bold text-slate-900 dark:text-white">Import {title}</h3>
              <p className="mt-0.5 text-xs text-slate-500">CSV dapat diedit di Excel. Baris valid diproses satu per satu agar kegagalan mudah dilacak.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-text btn-circle btn-sm absolute end-3 top-3 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Tutup"
              data-overlay="#csv-import-modal"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <div className="modal-body min-h-0 flex-1 space-y-4 overflow-y-auto p-5 text-sm text-slate-700 dark:text-slate-200">
              <button
                type="button"
                onClick={downloadTemplate}
                className="btn btn-primary btn-sm inline-flex items-center gap-2"
              >
                <Download size={16} /> Unduh Template CSV
              </button>

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex min-h-36 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600 transition hover:border-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                <FileSpreadsheet size={32} className="text-emerald-600" />
                <strong className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-200">{file?.name || 'Pilih file CSV'}</strong>
                <small className="mt-1 text-xs text-slate-500">Maksimal mengikuti batas unggah browser</small>
              </button>

              <input ref={inputRef} hidden type="file" accept=".csv,text/csv" onChange={(event) => { setFile(event.target.files?.[0] || null); setError('') }} />

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                <strong>Kolom:</strong> {columns.map((item) => `${item.key}${item.required ? '*' : ''}`).join(', ')}
              </div>

              {error && <p className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">{error}</p>}
            </div>

            <div className="modal-footer flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-soft btn-secondary"
                data-overlay="#csv-import-modal"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={busy || !file}
                className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50"
              >
                <Upload size={16} /> {busy ? 'Mengimpor...' : 'Mulai Import'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
