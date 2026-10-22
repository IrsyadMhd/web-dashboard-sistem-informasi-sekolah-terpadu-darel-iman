import { api } from './api'

export const codeGeneratorService = {
  /**
   * Preview nomor bisnis berikutnya tanpa reservasi sequence
   * @param {string} entityType e.g. 'student_nis', 'employee_niy', 'class_code'
   * @param {object} params { unit_id, academic_year_id, jenjang, prefix }
   */
  async preview(entityType, params = {}) {
    try {
      const response = await api.get('/code-generator/preview', {
        params: {
          entity_type: entityType,
          ...params,
        },
      })
      const previewCode = response.data?.data?.preview_code || response.data?.preview_code || ''
      return {
        preview_code: previewCode,
        data: response.data?.data,
        success: true,
      }
    } catch (error) {
      console.warn(`Gagal memuat preview kode untuk ${entityType}`, error)
      return { preview_code: '', success: false }
    }
  },

  async getConfigs() {
    const response = await api.get('/code-generator/configs')
    return response.data?.data || []
  },

  async saveConfig(data) {
    const response = await api.post('/code-generator/configs', data)
    return response.data
  },
}
