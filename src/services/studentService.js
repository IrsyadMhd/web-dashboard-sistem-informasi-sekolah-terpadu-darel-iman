import { api } from './api'

export const studentService = {
  getDashboard: async (params = {}) => {
    const { data } = await api.get('/students/dashboard', { params })
    return data
  },

  getDaftar: async (params = {}) => {
    const { data } = await api.get('/students', { params })
    return data
  },

  getDetail: async (id) => {
    const { data } = await api.get(`/students/${id}`)
    return data
  },

  getAttendanceQrToken: async (id) => {
    const { data } = await api.get(`/lesson-attendance/students/${id}/qr-token`)
    return data
  },

  getCardSetting: async (educationUnitId) => {
    const { data } = await api.get('/student-card-settings', {
      params: educationUnitId ? { education_unit_id: educationUnitId } : {},
    })
    return data
  },

  saveCardSetting: async (payload) => {
    const { data } = await api.post('/student-card-settings', payload)
    return data
  },

  tambah: async (payload) => {
    const { data } = await api.post('/students', payload)
    return data
  },

  ubah: async ({ id, payload }) => {
    const { data } = await api.put(`/students/${id}`, payload)
    return data
  },

  hapus: async (id) => {
    const { data } = await api.delete(`/students/${id}`)
    return data
  },

  pindahKelas: async (studentId, targetKelasId, studentObj = {}) => {
    const payload = {
      nis: studentObj.nis || studentObj.metadata?.nis || '000',
      full_name: studentObj.full_name || studentObj.nama || 'Siswa',
      gender: studentObj.gender || 'male',
      unit_id: studentObj.unit_id || studentObj.unit_pendidikan_id || studentObj.education_unit_id,
      kelas_id: targetKelasId,
    }
    const { data } = await api.put(`/students/${studentId}`, payload)
    return data
  },
}
