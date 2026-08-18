import api from './api'

export const waliKelasDashboardService = {
  getOverview: async (params = {}) => {
    const response = await api.get('/dashboard/wali-kelas', { params })
    return response.data
  },
}
