import api from './api'

export const superAdminDashboardService = {
  getOverview: async (params = {}) => {
    const response = await api.get('/dashboard/super-admin', { params })
    return response.data
  },
}
