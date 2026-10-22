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
}

export default studentStatusService
