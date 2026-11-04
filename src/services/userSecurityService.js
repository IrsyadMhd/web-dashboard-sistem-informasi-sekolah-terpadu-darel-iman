import { api } from './api'

export const userSecurityService = {
  getSessions: async () => {
    const res = await api.get('/profile/sessions')
    return res.data?.data || []
  },

  deleteSession: async (id) => {
    const res = await api.delete(`/profile/sessions/${id}`)
    return res.data
  },

  revokeOtherSessions: async () => {
    const res = await api.post('/profile/sessions/revoke-others')
    return res.data
  },

  getActivities: async (params = {}) => {
    const res = await api.get('/profile/activities', { params })
    return res.data
  },

  exportActivities: async () => {
    const res = await api.get('/profile/activities/export', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `riwayat_aktivitas_login_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  },

  get2faStatus: async () => {
    const res = await api.get('/profile/2fa/status')
    return res.data?.data || {}
  },

  verify2fa: async (otp) => {
    const res = await api.post('/profile/2fa/verify', { otp })
    return res.data
  },

  disable2fa: async (password) => {
    const res = await api.post('/profile/2fa/disable', { password })
    return res.data
  },
}
