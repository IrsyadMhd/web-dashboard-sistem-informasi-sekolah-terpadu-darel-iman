import api from './api'

const unwrap = (res) => res?.data?.data ?? res?.data ?? res

export const alumniService = {
  getAlumniList: async (params = {}) => unwrap(await api.get('/alumni', { params })),
  getAlumniStats: async () => unwrap(await api.get('/alumni/stats')),
  createAlumni: async (data) => unwrap(await api.post('/alumni', data)),
  updateAlumni: async (id, data) => unwrap(await api.put(`/alumni/${id}`, data)),
  pindahUnitAlumni: async (id, data) => unwrap(await api.post(`/alumni/${id}/pindah-unit`, data)),
  pindahKeluarAlumni: async (id, data) => unwrap(await api.post(`/alumni/${id}/pindah-keluar`, data)),
  deleteAlumni: async (id) => unwrap(await api.delete(`/alumni/${id}`)),
}

export default alumniService
