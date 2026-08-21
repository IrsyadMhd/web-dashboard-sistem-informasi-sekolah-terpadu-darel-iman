/**
 * Print Clean Datatable Utility
 * Prints a clean datatable without opening a new tab or window.
 * Uses a hidden iframe within the current document context.
 */
export function printCleanTable({ title, subtitle = '', headers = [], rows = [] }) {
  const headerHtml = headers.map((h) => `<th>${h}</th>`).join('')
  const rowsHtml = rows
    .map(
      (r) =>
        `<tr>${r
          .map((cell) => `<td>${cell !== null && cell !== undefined ? String(cell) : '-'}</td>`)
          .join('')}</tr>`
    )
    .join('')

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Remove existing print iframe if present
  let iframe = document.getElementById('simsit-print-iframe')
  if (iframe) {
    document.body.removeChild(iframe)
  }

  // Create hidden iframe in current document to avoid opening a new tab/window
  iframe = document.createElement('iframe')
  iframe.id = 'simsit-print-iframe'
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0px'
  iframe.style.height = '0px'
  iframe.style.border = 'none'
  iframe.style.zIndex = '-9999'

  document.body.appendChild(iframe)

  const doc = iframe.contentWindow.document
  doc.open()
  doc.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 12mm 15mm;
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 9.5pt;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 12px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .print-header {
          border-bottom: 2.5px solid #0e5c44;
          padding-bottom: 12px;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .print-brand {
          font-size: 8pt;
          font-weight: 800;
          color: #0e5c44;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .print-title {
          font-size: 16pt;
          font-weight: 800;
          color: #0e5c44;
          margin: 0;
          line-height: 1.2;
        }
        .print-subtitle {
          font-size: 9pt;
          color: #64748b;
          margin: 4px 0 0 0;
          font-weight: 500;
        }
        .print-meta {
          font-size: 8.5pt;
          color: #475569;
          font-weight: 600;
          text-align: right;
          line-height: 1.4;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }
        th {
          background-color: #f1f5f9;
          color: #0f172a;
          font-size: 8.5pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 8px 10px;
          border: 1px solid #cbd5e1;
          text-align: left;
        }
        td {
          padding: 7px 10px;
          font-size: 9pt;
          border: 1px solid #e2e8f0;
          color: #334155;
          vertical-align: middle;
        }
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .print-footer {
          margin-top: 24px;
          padding-top: 10px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 8pt;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <div>
          <div class="print-brand">Sistem Informasi Sekolah Terpadu (SIMSIT)</div>
          <h1 class="print-title">${title}</h1>
          ${subtitle ? `<p class="print-subtitle">${subtitle}</p>` : ''}
        </div>
        <div class="print-meta">
          <div>Tanggal Cetak: ${currentDate}</div>
          <div>Total Record: ${rows.length} Data</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>${headerHtml}</tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="' + headers.length + '" style="text-align:center;">Tidak ada data.</td></tr>'}
        </tbody>
      </table>

      <div class="print-footer">
        <span>Dokumen Laporan Resmi — Akademik SIMSIT</span>
        <span>Laporan Cetak Murni</span>
      </div>
    </body>
    </html>
  `)
  doc.close()

  setTimeout(() => {
    iframe.contentWindow.focus()
    iframe.contentWindow.print()
  }, 250)
}

/**
 * Export PDF Datatable Utility
 * Triggers PDF export / save dialog for datatable.
 */
export function downloadPdfTable({ title, subtitle = '', headers = [], rows = [], filename }) {
  const safeFilename = filename || `Laporan_${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
  printCleanTable({
    title,
    subtitle: subtitle ? `${subtitle} (Berkas PDF)` : 'Berkas PDF Laporan Resmi',
    headers,
    rows,
  })
}
