import api from './api'

const unwrap = (res) => res?.data?.data ?? res?.data ?? res

export const studentMutationService = {
  getMutasiList: async (params = {}) => unwrap(await api.get('/student-mutations', { params })),
  getIncoming: async (params = {}) => unwrap(await api.get('/student-mutations/incoming', { params })),
  requestMutasi: async (data) => unwrap(await api.post('/student-mutations', data)),
  approveMutasi: async (id, data) => unwrap(await api.post(`/student-mutations/${id}/approve`, data)),
  rejectMutasi: async (id, data) => unwrap(await api.post(`/student-mutations/${id}/reject`, data)),
}

export default studentMutationService
