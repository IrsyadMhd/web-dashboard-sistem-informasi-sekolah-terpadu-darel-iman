import { api } from './api'

export const studentStatusService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/student-statuses', { params })
    return data
  },

  getDropdown: async () => {
    const { data } = await api.get('/student-statuses/dropdown')
    return data
  },

  getById: async (id) => {
    const { data } = await api.get(`/student-statuses/${id}`)
    return data
  },

  create: async (payload) => {
    const { data } = await api.post('/student-statuses', payload)
    return data
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/student-statuses/${id}`, payload)
    return data
  },

  delete: async (id) => {
    const { data } = await api.delete(`/student-statuses/${id}`)
    return data
  },

  prosesImport: async (payload) => {
    if (payload instanceof FormData) {
      const { data } = await api.post('/student-statuses/import', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    }
    const body = Array.isArray(payload) ? { data: payload } : payload
    const { data } = await api.post('/student-statuses/import', body)
    return data
  },

  downloadTemplate: async () => {
    const response = await api.get('/student-statuses/import-template', {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'Template_Import_Status_Siswa.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}

export default studentStatusService
