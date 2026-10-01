import { toast } from 'sonner'
import { Swal } from '../components/tailgrids/compat/swal-tailgrids'
import { api } from '../services/api'

/**
 * Prompt user to select an export format from the 3 mandatory options: .xlsx, .xls, .csv
 * @param {Object} options
 * @param {string} options.title
 * @param {string} options.defaultFormat
 * @returns {Promise<'xlsx'|'xls'|'csv'|null>}
 */
export async function promptExportFormat({
  title = 'Pilih Format Ekspor Data',
  defaultFormat = 'xlsx',
} = {}) {
  const { value: format } = await Swal.fire({
    title,
    text: 'Pilih format berkas yang Anda butuhkan:',
    icon: 'question',
    input: 'select',
    inputOptions: {
      xlsx: 'Microsoft Excel (.xlsx)',
      xls: 'Microsoft Excel Legacy (.xls)',
      csv: 'Comma Separated Values (.csv)',
    },
    inputValue: defaultFormat,
    showCancelButton: true,
    confirmButtonColor: '#059669',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: 'Unduh Berkas',
    cancelButtonText: 'Batal',
  })

  return format || null
}

/**
 * Download a binary or text file from an API endpoint using axios and auth headers.
 * Uses lightweight sonner toast notification without intrusive SweetAlert2 popups.
 * @param {string} endpoint
 * @param {Object} params
 * @param {'xlsx'|'xls'|'csv'} format
 * @param {string} defaultFilename
 */
export async function downloadFileFromApi(
  endpoint,
  params = {},
  format = 'xlsx',
  defaultFilename = 'export_data'
) {
  const toastId = toast.loading(`Menyiapkan berkas ekspor .${format.toUpperCase()}...`, {
    description: 'Sedang memproses dan mengunduh data dari server.',
  })

  try {
    const response = await api.get(endpoint, {
      params: { ...params, format },
      responseType: 'blob',
    })

    // Try extracting filename from Content-Disposition header
    let filename = `${defaultFilename}_${new Date().toISOString().slice(0, 10)}.${format}`
    const disposition = response.headers['content-disposition'] || response.headers['Content-Disposition']
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition)
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '')
      }
    }

    const mimeTypes = {
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel',
      csv: 'text/csv;charset=utf-8;',
    }

    const blob = new Blob([response.data], {
      type: mimeTypes[format] || response.headers['content-type'] || 'application/octet-stream',
    })

    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(downloadUrl)

    toast.success(`Berkas ${filename} berhasil diunduh.`, {
      id: toastId,
      description: 'Ekspor data selesai dengan sukses.',
    })
    return { success: true, filename }
  } catch (error) {
    console.error('Export error:', error)
    const errorMsg = error.response?.data?.message || 'Terjadi kesalahan saat memproses data ekspor.'
    toast.error('Gagal Mengunduh Berkas', {
      id: toastId,
      description: errorMsg,
    })
    return { success: false, error: errorMsg }
  }
}

/**
 * High-level export handler that prompts for format and downloads directly from server.
 */
export async function handleApiExport({
  endpoint,
  params = {},
  title = 'Ekspor Data',
  defaultFilename = 'data',
  defaultFormat = 'xlsx',
}) {
  const format = await promptExportFormat({ title, defaultFormat })
  if (!format) return
  await downloadFileFromApi(endpoint, params, format, defaultFilename)
}
