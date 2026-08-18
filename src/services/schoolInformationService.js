import api from './api'

const context = (studentId, params = {}) => ({ params: { ...params, ...(studentId ? { child_id: studentId } : {}) } })

export const schoolInformationService = {
  list: async (studentId, params) => (await api.get('/portal/school-information', context(studentId, params))).data,
  summary: async (studentId) => (await api.get('/portal/school-information/summary', context(studentId))).data,
  updateState: async (id, action, studentId) => (await api.patch(`/portal/school-information/${id}/state`, { action, ...(studentId ? { child_id: studentId } : {}) })).data,
  markAllRead: async (studentId) => (await api.patch('/portal/school-information/read-all', studentId ? { child_id: studentId } : {})).data,
}
