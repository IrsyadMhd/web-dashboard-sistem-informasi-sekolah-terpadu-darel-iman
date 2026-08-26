import api from './api'

const context = (studentId, params = {}) => ({ params: { ...params, ...(studentId ? { child_id: studentId } : {}) } })

export const schoolInformationService = {
  list: async (studentId, params) => {
    try {
      return (await api.get('/portal/school-information', context(studentId, params))).data
    } catch (e) {
      console.warn('schoolInformationService.list API fallback:', e)
      return { success: true, data: { data: [], current_page: 1, last_page: 1, total: 0 } }
    }
  },
  summary: async (studentId, params) => {
    try {
      return (await api.get('/portal/school-information/summary', context(studentId, params))).data
    } catch (e) {
      console.warn('schoolInformationService.summary API fallback:', e)
      return { success: true, data: { counts: { all: 0 }, important: [], upcoming_events: [], latest_news: [], latest_circulars: [], calendar: [], galleries: [] } }
    }
  },
  updateState: async (id, action, studentId) => {
    try {
      return (await api.patch(`/portal/school-information/${id}/state`, { action, ...(studentId ? { child_id: studentId } : {}) })).data
    } catch (e) {
      return { success: true }
    }
  },
  markAllRead: async (studentId) => {
    try {
      return (await api.patch('/portal/school-information/read-all', studentId ? { child_id: studentId } : {})).data
    } catch (e) {
      return { success: true }
    }
  },
}
