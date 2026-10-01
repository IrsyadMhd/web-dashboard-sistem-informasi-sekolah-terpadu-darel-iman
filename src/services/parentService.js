import { api } from './api'
import { downloadFileFromApi } from '../utils/exportUtils'

export const parentService = {
  getParents: async (params = {}) => {
    const { data } = await api.get('/parents', { params })
    return data
  },

  getParent: async (id) => {
    const { data } = await api.get(`/parents/${id}`)
    return data
  },

  createParent: async (payload) => {
    const { data } = await api.post('/parents', payload)
    return data
  },

  updateParent: async (id, payload) => {
    const { data } = await api.put(`/parents/${id}`, payload)
    return data
  },

  deleteParent: async (id) => {
    const { data } = await api.delete(`/parents/${id}`)
    return data
  },

  importParents: async (dataRows) => {
    const { data } = await api.post('/parents/import', { data: dataRows })
    return data
  },

  exportParents: async (params = {}, format = 'xlsx') => {
    return downloadFileFromApi('/parents/export', params, format, 'data_orang_tua')
  },
}
