import { api } from './api'

const unwrap = (response) => response?.data?.data ?? response?.data ?? {}

export const reportService = {
  attendance: async (params = {}) => {
    try {
      const res = await api.get('/lesson-attendance/report', { params })
      return res?.data?.data ?? res?.data ?? {}
    } catch {
      const res2 = await api.get('/attendance/reports/summary', { params })
      return res2?.data?.data ?? res2?.data ?? {}
    }
  },
  employees: async (params = {}) => unwrap(await api.get('/employees', { params: { ...params, per_page: 100 } })),
  employeeStats: async () => unwrap(await api.get('/employees/dashboard')),
  grades: async (params = {}) => unwrap(await api.get('/grades', { params: { ...params, per_page: 100 } })),
  materialStats: async () => unwrap(await api.get('/lms/materi/stats')),
  assignmentStats: async () => unwrap(await api.get('/lms/penugasan/stats')),
  submissionStats: async () => unwrap(await api.get('/lms/pengumpulan-tugas/stats')),
  reportCardStats: async (params = {}) => unwrap(await api.get('/lms/rapor/stats', { params })),
  submissions: async (params = {}) => unwrap(await api.get('/lms/pengumpulan-tugas', { params: { ...params, per_page: 100 } })),
  tahfizhReport: async (params = {}) => unwrap(await api.get('/tahfizh/report', { params })),
  tahfizhAnalytics: async () => unwrap(await api.get('/mutabaah/analytics/recap')),
  alumni: async (params = {}) => unwrap(await api.get('/alumni', { params })),
  alumniStats: async () => unwrap(await api.get('/alumni/stats')),
  notifications: async (params = {}) => unwrap(await api.get('/notifications', { params })),
  notificationUnreadCount: async () => unwrap(await api.get('/notifications/unread-count')),
  markNotificationRead: async (id) => unwrap(await api.post(`/notifications/${id}/read`)),
  markAllNotificationsRead: async () => unwrap(await api.post('/notifications/mark-all-read')),

  // Foundation Report Endpoints
  getFoundationSdmReport: async (params = {}) => unwrap(await api.get('/foundation/laporan/sdm', { params })),
  getFoundationSdmDetail: async (id) => unwrap(await api.get(`/foundation/laporan/sdm/detail/${id}`)),

  getFoundationSiswaReport: async (params = {}) => unwrap(await api.get('/foundation/laporan/siswa', { params })),
  getFoundationSiswaDetail: async (id) => unwrap(await api.get(`/foundation/laporan/siswa/detail/${id}`)),

  getFoundationMutasiReport: async (params = {}) => unwrap(await api.get('/foundation/laporan/mutasi', { params })),
  getFoundationMutasiDetail: async (id) => unwrap(await api.get(`/foundation/laporan/mutasi/detail/${id}`)),

  getFoundationKelulusanReport: async (params = {}) => unwrap(await api.get('/foundation/laporan/kelulusan', { params })),
  getFoundationKelulusanDetail: async (id) => unwrap(await api.get(`/foundation/laporan/kelulusan/detail/${id}`)),

  getFoundationAlumniReport: async (params = {}) => unwrap(await api.get('/foundation/laporan/alumni', { params })),
  getFoundationAlumniDetail: async (id) => unwrap(await api.get(`/foundation/laporan/alumni/detail/${id}`)),

  getFoundationLintasUnitReport: async (params = {}) => unwrap(await api.get('/foundation/laporan/lintas-unit', { params })),

  getFoundationPrestasiReport: async (params = {}) => unwrap(await api.get('/foundation/laporan/prestasi', { params })),
  getFoundationPrestasiDetail: async (id) => unwrap(await api.get(`/foundation/laporan/prestasi/detail/${id}`)),

  exportFoundationReport: (type, params = {}) => {
    const query = new URLSearchParams(params).toString()
    return `${api.defaults.baseURL}/foundation/laporan/${type}/export?${query}`
  },
}


