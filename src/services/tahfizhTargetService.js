import { api } from './api'

export const tahfizhTargetService = {
  // Ambil daftar target KPI dengan filter dan pagination
  getTargets: async (params = {}) => {
    const res = await api.get('/tahfizh/targets', { params })
    return res.data
  },

  // Ambil opsi referensi (unit, jenjang, kelas, tipe program)
  getOptions: async () => {
    const res = await api.get('/tahfizh/targets/options')
    return res.data?.data
  },

  // Detail single target
  getTarget: async (id) => {
    const res = await api.get(`/tahfizh/targets/${id}`)
    return res.data?.data
  },

  // Buat target baru
  createTarget: async (payload) => {
    const res = await api.post('/tahfizh/targets', payload)
    return res.data
  },

  // Perbarui target
  updateTarget: async (id, payload) => {
    const res = await api.put(`/tahfizh/targets/${id}`, payload)
    return res.data
  },

  // Hapus target
  deleteTarget: async (id) => {
    const res = await api.delete(`/tahfizh/targets/${id}`)
    return res.data
  },
}
