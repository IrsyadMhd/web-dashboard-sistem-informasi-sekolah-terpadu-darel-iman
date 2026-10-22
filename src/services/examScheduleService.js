import { api } from './api'

export const examScheduleService = {
  // Jadwal Ujian
  getSchedules: async (params = {}) => {
    const response = await api.get('/exam-schedules', { params })
    return response.data || response
  },

  getScheduleDetail: async (id) => {
    const response = await api.get(`/exam-schedules/${id}`)
    return response.data || response
  },

  createSchedule: async (data) => {
    const response = await api.post('/exam-schedules', data)
    return response.data || response
  },

  updateSchedule: async (id, data) => {
    const response = await api.put(`/exam-schedules/${id}`, data)
    return response.data || response
  },

  deleteSchedule: async (id) => {
    const response = await api.delete(`/exam-schedules/${id}`)
    return response.data || response
  },

  getOptions: async (params = {}) => {
    const response = await api.get('/exam-schedules-options', { params })
    return response.data?.data || response.data || response
  },

  // Kategori Ujian (Dinamis)
  getCategories: async () => {
    const response = await api.get('/exam-categories')
    return response.data?.data || response.data || []
  },

  createCategory: async (data) => {
    const response = await api.post('/exam-categories', data)
    return response.data || response
  },

  updateCategory: async (id, data) => {
    const response = await api.put(`/exam-categories/${id}`, data)
    return response.data || response
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/exam-categories/${id}`)
    return response.data || response
  },
}
