import { api } from './api'

export const tahfizhService = {
  // Ambil lembar 7 hari (Senin - Ahad) untuk siswa
  getWeeklySheet: async (studentId, startDate) => {
    const res = await api.get('/tahfizh/weekly-sheet', {
      params: { student_id: studentId, start_date: startDate },
    })
    return res.data?.data
  },

  // Simpan/Update log harian Tahfizh & Murajaah
  saveDailyLog: async (payload) => {
    const res = await api.post('/tahfizh/daily-log', payload)
    return res.data
  },

  // Ambil hafalan terakhir dan data kelanjutan otomatis
  getLastHafalan: async (studentId) => {
    const res = await api.get(`/tahfizh/last-hafalan/${studentId}`)
    return res.data?.data
  },

  // Upload rekaman suara murajaah
  uploadAudio: async (audioFile) => {
    const formData = new FormData()
    formData.append('audio', audioFile)
    const res = await api.post('/tahfizh/upload-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data
  },

  // Ambil kalkulasi progress siswa (surah/ayat dihafal & sisa)
  getStudentProgress: async (studentId) => {
    const res = await api.get(`/tahfizh/student-progress/${studentId}`)
    return res.data?.data
  },

  // Ambil rekap laporan
  getReport: async (params) => {
    const res = await api.get('/tahfizh/report', { params })
    return res.data
  },

  // Ambil Top 5 Santri teratas (Unik & Tervalidasi)
  getTopStudents: async (params = {}) => {
    const res = await api.get('/tahfizh/top-students', { params })
    return res.data
  },

  // Ambil Top 5 Unit Pendidikan
  getTopUnits: async (params = {}) => {
    const res = await api.get('/tahfizh/top-units', { params })
    return res.data
  },

  // Ambil ringkasan pemantauan tahfizh
  getMonitoringOverview: async (params = {}) => {
    const res = await api.get('/tahfizh/monitoring', { params })
    return res.data
  },
}
