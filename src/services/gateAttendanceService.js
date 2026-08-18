import { api } from './api'

export const gateAttendanceService = {
  getLogs: (params) => api.get('/gate-attendance/logs', { params }),
  getStats: (params) => api.get('/gate-attendance/stats', { params }),
  getScheduleConfig: (params) => api.get('/gate-attendance/schedule-config', { params }),
  getAllScheduleConfigs: () => api.get('/gate-attendance/schedule-config/all'),
  saveScheduleConfig: (data) => api.post('/gate-attendance/schedule-config', data),
  scanCheckIn: (data) => api.post('/gate-attendance/scan-in', data),
  scanCheckOut: (data) => api.post('/gate-attendance/scan-out', data),
}

export default gateAttendanceService
