import { api } from './api'

export const businessOptionService = {
  /**
   * Mengambil opsi dropdown dinamis berdasarkan kelompok (group)
   * @param {string} group e.g. 'parent_occupation', 'residence_type', 'education_level'
   */
  async getDropdown(group) {
    try {
      const response = await api.get(`/master/options/dropdown/${group}`)
      const rawData = response.data?.data || response.data || []
      const items = Array.isArray(rawData) ? rawData : []
      return {
        data: items,
        items,
        success: true,
      }
    } catch (error) {
      console.warn(`Gagal memuat dropdown opsi untuk grup: ${group}`, error)
      return { data: [], items: [], success: false }
    }
  },

  /**
   * Mengambil daftar master opsi untuk manajemen/pengaturan
   */
  async getAll(params = {}) {
    const response = await api.get('/master/options', { params })
    return response.data?.data || []
  },

  async create(data) {
    const response = await api.post('/master/options', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/master/options/${id}`, data)
    return response.data
  },

  async toggleStatus(id) {
    const response = await api.post(`/master/options/${id}/toggle-status`)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/master/options/${id}`)
    return response.data
  },
}
