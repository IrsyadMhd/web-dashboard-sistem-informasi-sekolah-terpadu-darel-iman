import { api } from './api'

export const systemMaintenanceService = {
  /**
   * Mengambil status metrik database dan server cache.
   */
  getStatus: async () => {
    const { data } = await api.get('/v1/system-maintenance/status')
    return data?.data || {}
  },

  /**
   * Menjalankan optimize:clear dan cache:clear di server.
   */
  optimizeClear: async () => {
    const { data } = await api.post('/v1/system-maintenance/optimize-clear')
    return data
  },

  /**
   * Menjalankan reset database (Hanya Super Admin, butuh kata kunci konfirmasi).
   * @param {{ confirmation_key: string, scope?: string }} payload
   */
  resetDatabase: async (payload) => {
    const { data } = await api.post('/v1/system-maintenance/reset-database', payload)
    return data
  },

  /**
   * Download file ekspor master data (parsial per tabel atau semua tabel).
   * @param {string} table
   */
  downloadExport: async (table = 'all') => {
    const response = await api.get(`/v1/system-maintenance/export/${table}`, {
      responseType: 'blob',
      timeout: 180000,
    })
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    link.download = `master_${table}_${timestamp}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    return true
  },

  /**
   * Download template impor data.
   * @param {string} table
   */
  downloadTemplate: async (table) => {
    const response = await api.get(`/v1/system-maintenance/template/${table}`, {
      responseType: 'blob',
      timeout: 180000,
    })
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `template_impor_${table}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    return true
  },

  /**
   * Mengunggah berkas Excel/CSV untuk diimpor.
   * @param {string} table
   * @param {File|FormData} fileOrFormData
   */
  importTable: async (table, fileOrFormData) => {
    let formData = fileOrFormData
    if (fileOrFormData instanceof File) {
      formData = new FormData()
      formData.append('file', fileOrFormData)
    }
    const { data } = await api.post(`/v1/system-maintenance/import/${table}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    })
    return data
  },
}

export default systemMaintenanceService
