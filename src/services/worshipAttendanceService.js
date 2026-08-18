import { api } from './api'

export const worshipAttendanceService = {
  getTemplates: (params) => api.get('/worship-attendance/templates', { params }),
  createTemplate: (data) => api.post('/worship-attendance/templates', data),
  getSessions: (params) => api.get('/worship-attendance/sessions', { params }),
  getSessionDetail: (id) => api.get(`/worship-attendance/sessions/${id}`),
  scanWorship: (sessionId, data) => api.post(`/worship-attendance/sessions/${sessionId}/scan`, data),
  verifyStudent: (sessionId, data) => api.post(`/worship-attendance/sessions/${sessionId}/verify`, data),
  closeSession: (sessionId) => api.post(`/worship-attendance/sessions/${sessionId}/close`),
}

export default worshipAttendanceService
