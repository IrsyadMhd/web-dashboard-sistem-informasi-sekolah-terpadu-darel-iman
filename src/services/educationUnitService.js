import { api } from './api'

export const educationUnitService = {
  getDaftar: async (params = {}) => {
    const { data } = await api.get('/education-units', { params })
    return data
  },

  getAll: async (params = {}) => {
    const { data } = await api.get('/education-units', { params })
    return data
  },

  getDetail: async (id) => {
    const { data } = await api.get(`/education-units/${id}`)
    return data
  },

  tambah: async (payload) => {
    const { data } = await api.post('/education-units', payload)
    return data
  },

  ubah: async ({ id, payload }) => {
    const { data } = await api.put(`/education-units/${id}`, payload)
    return data
  },

  hapus: async (id) => {
    const { data } = await api.delete(`/education-units/${id}`)
    return data
  },

  ekspor: async (params = {}) => {
    const { data } = await api.get('/education-units/export', { params })
    return data?.data || []
  },

  prosesImport: async (dataRows) => {
    const { data } = await api.post('/education-units/import', { data: dataRows })
    return data
  },

  downloadTemplate: async () => {
    const { data } = await api.get('/education-units/import-template')
    return data
  },
}

export default educationUnitService
