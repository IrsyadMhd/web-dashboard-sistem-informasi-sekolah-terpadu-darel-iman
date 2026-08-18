import api from './api'

export const kepalaSekolahDashboardService = {
  getOverview: async (params = {}) => {
    const response = await api.get('/dashboard/kepala-sekolah', { params })
    return response.data
  },
}
