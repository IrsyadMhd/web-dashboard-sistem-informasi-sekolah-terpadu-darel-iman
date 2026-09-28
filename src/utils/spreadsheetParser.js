import * as XLSX from 'xlsx'

/**
 * Membaca berkas spreadsheet (.xlsx, .xls, .csv, .tsv, .txt, .json)
 * menjadi array of objects secara universal dan aman.
 *
 * @param {File} file Berkas dari file input atau dropzone
 * @param {Object} [options]
 * @param {Record<string, string>} [options.headerMap] Kamus pemetaan nama kolom/header
 * @param {Function} [options.transformRow] Fungsi transformasi opsional untuk setiap baris
 * @returns {Promise<Array<Record<string, any>>>}
 */
export async function parseSpreadsheetFile(file, options = {}) {
  if (!file) throw new Error('Berkas tidak ditemukan.')

  const ext = file.name.split('.').pop()?.toLowerCase() || ''

  // 1. Dukungan format JSON
  if (ext === 'json') {
    const text = await file.text()
    const parsed = JSON.parse(text)
    let rows = []
    if (Array.isArray(parsed)) {
      rows = parsed
    } else if (parsed && Array.isArray(parsed.data)) {
      rows = parsed.data
    } else if (parsed && Array.isArray(parsed.rows)) {
      rows = parsed.rows
    } else {
      throw new Error('Format JSON harus berupa array objek data.')
    }
    if (options.transformRow && typeof options.transformRow === 'function') {
      return rows.map(options.transformRow)
    }
    return rows
  }

  // 2. Dukungan format Excel (.xlsx, .xls) dan teks berpemisah (.csv, .tsv, .txt)
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, {
    type: 'array',
    raw: false,
    cellDates: false,
  })

  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    throw new Error('Berkas spreadsheet kosong atau tidak memiliki lembar kerja (sheet).')
  }

  const worksheet = workbook.Sheets[sheetName]
  const rawRows = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false,
  })

  if (!rawRows || rawRows.length === 0) {
    throw new Error('Berkas spreadsheet tidak memiliki baris data.')
  }

  // Normalisasi & pemetaan header jika diberikan headerMap
  const map = options.headerMap || {}
  const normalizedMap = {}
  Object.keys(map).forEach((k) => {
    normalizedMap[k.trim().toLowerCase()] = map[k]
  })

  const processedRows = rawRows.map((row, rowIndex) => {
    const newRow = {}
    for (const [key, value] of Object.entries(row)) {
      const cleanKey = String(key).trim()
      const lookupKey = cleanKey.toLowerCase()
      const targetKey = normalizedMap[lookupKey] || map[cleanKey] || cleanKey
      newRow[targetKey] = typeof value === 'string' ? value.trim() : (value ?? '')
    }

    if (options.transformRow && typeof options.transformRow === 'function') {
      return options.transformRow(newRow, rowIndex)
    }
    return newRow
  })

  return processedRows
}

/**
 * Mengunduh array of objects menjadi template/data spreadsheet (.xlsx atau .csv)
 *
 * @param {Array<Record<string, any>>} data
 * @param {string} fileName
 * @param {'xlsx'|'xls'|'csv'} [format='xlsx']
 * @param {string} [sheetName='Template']
 */
export function downloadSpreadsheetTemplate(data, fileName, format = 'xlsx', sheetName = 'Template') {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  if (format === 'csv') {
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet)
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } else {
    XLSX.writeFile(workbook, `${fileName}.${format === 'xls' ? 'xls' : 'xlsx'}`)
  }
}
