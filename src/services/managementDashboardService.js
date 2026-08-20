import api from './api'

export const managementDashboardService = {
  getDivisiPendidikan: async (params = {}) => {
    const response = await api.get('/dashboard/divisi-pendidikan', { params })
    return response.data
  },
  getDivisiPendidikanKpiDetail: async (type, params = {}) => {
    const response = await api.get(`/dashboard/divisi-pendidikan/kpi/${type}`, { params })
    return response.data
  },
  getWakaKurikulum: async (params = {}) => {
    const response = await api.get('/dashboard/waka-kurikulum', { params })
    return response.data
  },
  getWakaKesiswaan: async (params = {}) => {
    const response = await api.get('/dashboard/waka-kesiswaan', { params })
    return response.data
  },
  getTataUsaha: async (params = {}) => {
    const response = await api.get('/dashboard/tata-usaha', { params })
    return response.data
  },
  getTataUsahaKpiDetail: async (type, params = {}) => {
    const response = await api.get(`/dashboard/tata-usaha/kpi/${type}`, { params })
    return response.data
  },
  getGuruTahfizh: async (params = {}) => {
    const response = await api.get('/dashboard/guru-tahfizh', { params })
    return response.data
  },
  getGuruBk: async (params = {}) => {
    const response = await api.get('/dashboard/guru-bk', { params })
    return response.data
  },
  getOperator: async (params = {}) => {
    const response = await api.get('/dashboard/operator', { params })
    return response.data
  },
}
