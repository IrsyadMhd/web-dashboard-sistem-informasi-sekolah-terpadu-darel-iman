import api from './api'

export const disciplineService = {
  // Master Kategori Pelanggaran
  getCategories: async (params = {}) => {
    const res = await api.get('/discipline/categories', { params })
    return res.data
  },

  createCategory: async (data) => {
    const res = await api.post('/discipline/categories', data)
    return res.data
  },

  updateCategory: async (id, data) => {
    const res = await api.put(`/discipline/categories/${id}`, data)
    return res.data
  },

  deleteCategory: async (id) => {
    const res = await api.delete(`/discipline/categories/${id}`)
    return res.data
  },

  // Ambang Batas Poin Sanksi (1 - 250 Poin)
  getThresholds: async () => {
    const res = await api.get('/discipline/thresholds')
    return res.data
  },

  updateThreshold: async (id, data) => {
    const res = await api.put(`/discipline/thresholds/${id}`, data)
    return res.data
  },

  // Transaksi & Ledger Poin
  getViolations: async (params = {}) => {
    const res = await api.get('/discipline/violations', { params })
    return res.data
  },

  recordViolation: async (data) => {
    const res = await api.post('/discipline/violations', data)
    return res.data
  },

  // Cari Santri Dinamis untuk Input Pelanggaran
  searchStudents: async (params = {}) => {
    const res = await api.get('/discipline/students', { params })
    return res.data
  },

  // Ringkasan Skor Santri (Speedometer 0 - 250 Poin)
  getStudentSummary: async (studentId) => {
    const res = await api.get(`/discipline/students/${studentId}/summary`)
    return res.data
  },

  // Surat Peringatan & Teguran (ST, SP1, SP2, Keluar)
  issueWarningLetter: async (data) => {
    const res = await api.post('/discipline/warning-letters', data)
    return res.data
  },

  updateParentSummon: async (id, data) => {
    const res = await api.put(`/discipline/warning-letters/${id}/attendance`, data)
    return res.data
  },

  // Statistik & KPI Dashboard
  getDashboardStats: async () => {
    const res = await api.get('/discipline/stats')
    return res.data
  },

  // Overview Kepala Sekolah (Level Satuan Pendidikan)
  getPrincipalOverview: async (params) => {
    const res = await api.get('/discipline/principal-overview', { params })
    return res.data
  },

  // Overview Divisi Pendidikan (Supervisi Komparatif Lintas Unit)
  getDivisiOverview: async () => {
    const res = await api.get('/discipline/divisi-overview')
    return res.data
  },

  // Overview Pengurus Yayasan (Executive Makro & Critical Watchlist)
  getFoundationOverview: async () => {
    const res = await api.get('/discipline/foundation-overview')
    return res.data
  },
}
