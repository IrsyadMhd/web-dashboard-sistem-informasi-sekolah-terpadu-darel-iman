import api from './api'

export const alumniPortalService = {
  getDashboard: async () => {
    const response = await api.get('/portal/alumni/dashboard')
    return response.data
  },

  updateProfile: async (data) => {
    const response = await api.put('/portal/alumni/profile', data)
    return response.data
  },
}
