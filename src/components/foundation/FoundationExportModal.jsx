import { useState } from 'react'
import Swal from 'sweetalert2'
import { FileSpreadsheet, FileText, LoaderCircle } from 'lucide-react'
import { MasterFormModal } from '../master-data'

function buildCsv(rows) {
  if (!rows || rows.length === 0) return ''
  const headers = Object.keys(rows[0] || {})
  const escape = (value) => {
    const text = value === null || value === undefined ? '' : String(value)
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replace(/"/g, '""')}"`
    }
    return text
  }
  const lines = [headers.map(escape).join(';')]
  rows.forEach((row) => lines.push(headers.map((h) => escape(row[h])).join(';')))
  return lines.join('\n')
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8;` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function FoundationExportModal({ isOpen, onClose, title, rows, filename }) {
  const [format, setFormat] = useState('xlsx')
  const [exporting, setExporting] = useState(false)

  if (!isOpen) return null

  const handleExport = () => {
    setExporting(true)
    window.setTimeout(() => {
      try {
        const baseName = filename || 'Laporan_Yayasan'
        if (format === 'pdf') {
          const headers = Object.keys(rows[0] || {})
          const headRow = headers.map((h) => `<th>${h}</th>`).join('')
          const bodyRows = rows
            .map((row) => `<tr>${headers.map((h) => `<td>${row[h] ?? '-'}</td>`).join('')}</tr>`)
            .join('')
          const win = window.open('', '_blank')
          if (win) {
            win.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Arial,sans-serif;padding:24px}h1{font-size:18px;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #cbd5e1;padding:8px;font-size:12px;text-align:left}th{background:#0E5C44;color:#fff}</style></head><body><h1>${title}</h1><p>Diekspor pada ${new Date().toLocaleString('id-ID')}</p><table><thead><tr>${headRow}</tr></thead><tbody>${bodyRows}</tbody></table></body></html>`)
            win.document.close()
            win.focus()
            win.print()
          }
        } else {
          downloadBlob(buildCsv(rows), `${baseName}.csv`, 'text/csv')
        }
        Swal.fire('Export Berhasil', `Data berhasil diekspor ke format ${format === 'pdf' ? 'PDF' : 'Excel (.xlsx)'}.`, 'success')
        onClose()
      } catch {
        Swal.fire('Export Gagal', 'Terjadi kesalahan saat mengekspor data.', 'error')
      } finally {
        setExporting(false)
      }
    }, 900)
  }

  return (
    <MasterFormModal
      isOpen={isOpen}
      onClose={onClose}
      icon={FileSpreadsheet}
      title="Export Data"
      description={title}
      maxWidth="max-w-md"
      footer={(
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-11 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700">Batal</button>
          <button type="button" onClick={handleExport} disabled={exporting} className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-800 px-4 text-xs font-semibold text-white disabled:opacity-60">
            {exporting && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {exporting ? 'Mengekspor...' : 'Export Sekarang'}
          </button>
        </div>
      )}
    >
      <div className="space-y-4 p-5">
        <p className="text-sm text-slate-600">Pilih format berkas laporan yang ingin diunduh.</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormat('xlsx')}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-xs font-bold transition ${format === 'xlsx' ? 'border-emerald-700 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600 hover:border-emerald-300'}`}
          >
            <FileSpreadsheet className="h-6 w-6" />
            Excel (.xlsx)
          </button>
          <button
            type="button"
            onClick={() => setFormat('pdf')}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-xs font-bold transition ${format === 'pdf' ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-600 hover:border-rose-300'}`}
          >
            <FileText className="h-6 w-6" />
            PDF
          </button>
        </div>
        <p className="text-[11px] text-slate-400">Akan diekspor {rows?.length || 0} baris data sesuai filter aktif.</p>
      </div>
    </MasterFormModal>
  )
}
