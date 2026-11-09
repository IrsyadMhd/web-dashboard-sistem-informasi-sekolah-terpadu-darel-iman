import { api } from './api'

/**
 * Service API untuk Manajemen Hak Akses (Role & Permission — Spatie).
 */
export const hakAksesService = {
  // ─────────────────────────────────────────────────
  // ROLE
  // ─────────────────────────────────────────────────

  getDaftarRole: async (params = {}) => {
    const { data } = await api.get('/hak-akses/roles', { params })
    return data
  },

  getDetailRole: async (id) => {
    const { data } = await api.get(`/hak-akses/roles/${id}`)
    return data?.data || {}
  },

  tambahRole: async (payload) => {
    const { data } = await api.post('/hak-akses/roles', payload)
    return data
  },

  ubahRole: async ({ id, payload }) => {
    const { data } = await api.put(`/hak-akses/roles/${id}`, payload)
    return data
  },

  hapusRole: async (id) => {
    const { data } = await api.delete(`/hak-akses/roles/${id}`)
    return data
  },

  // ─────────────────────────────────────────────────
  // PERMISSION
  // ─────────────────────────────────────────────────

  getDaftarPermission: async (params = {}) => {
    const { data } = await api.get('/hak-akses/permissions', { params })
    return data
  },

  tambahPermission: async (payload) => {
    const { data } = await api.post('/hak-akses/permissions', payload)
    return data
  },

  hapusPermission: async (id) => {
    const { data } = await api.delete(`/hak-akses/permissions/${id}`)
    return data
  },

  // ─────────────────────────────────────────────────
  // STATS
  // ─────────────────────────────────────────────────

  getStats: async () => {
    const { data } = await api.get('/hak-akses/stats')
    return data?.data || {}
  },

  // ─────────────────────────────────────────────────
  // PEGAWAI HAK AKSES (MENARIK DATA PEGAWAI)
  // ─────────────────────────────────────────────────

  getPegawaiHakAkses: async (params = {}) => {
    const { data } = await api.get('/hak-akses/pegawai', { params })
    return data
  },

  assignPegawaiRole: async ({ employeeId, payload }) => {
    const { data } = await api.post(`/hak-akses/pegawai/${employeeId}/assign-role`, payload)
    return data
  },

  // ─────────────────────────────────────────────────
  // AKUN LOGIN & PASSWORD
  // ─────────────────────────────────────────────────

  getUsers: async (params = {}) => {
    const { data } = await api.get('/hak-akses/users', { params })
    return data
  },

  tambahUser: async (payload) => {
    const { data } = await api.post('/hak-akses/users', payload)
    return data
  },

  ubahUser: async ({ id, payload }) => {
    const { data } = await api.put(`/hak-akses/users/${id}`, payload)
    return data
  },

  resetPassword: async ({ id, payload }) => {
    const { data } = await api.put(`/hak-akses/users/${id}/password`, payload)
    return data
  },

  hapusUser: async (id) => {
    const { data } = await api.delete(`/hak-akses/users/${id}`)
    return data
  },

  importUsers: async (payload) => {
    let dataToSend = payload
    let config = {}
    if (payload instanceof FormData) {
      config = { headers: { 'Content-Type': 'multipart/form-data' } }
    } else if (payload?.file) {
      const fd = new FormData()
      fd.append('file', payload.file)
      if (payload.overwrite !== undefined) {
        fd.append('overwrite', payload.overwrite ? '1' : '0')
      }
      dataToSend = fd
      config = { headers: { 'Content-Type': 'multipart/form-data' } }
    }
    const { data } = await api.post('/hak-akses/users/import', dataToSend, config)
    return data
  },

  downloadUserTemplate: async () => {
    const response = await api.get('/hak-akses/users/import-template', {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'Template_Import_Akun_Pengguna.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  syncEntities: async (payload = {}) => {
    const { data } = await api.post('/hak-akses/users/sync-entities', payload, {
      timeout: 120000,
    })
    return data
  },
}
