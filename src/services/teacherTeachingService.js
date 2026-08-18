import api from './api'

export const teacherTeachingService = {
  async schedules(params = {}) {
    const { data } = await api.get('/teacher/step04/schedules', { params })
    return data?.data || { schedules: [] }
  },

  async scanCard(payload) {
    const { data } = await api.post('/teacher/teaching-attendance/scan', payload)
    return data?.data
  },

  async startSession(sessionId, durationMinutes = 60) {
    const { data } = await api.post(`/teacher/teaching-sessions/${sessionId}/start`, {
      duration_minutes: durationMinutes,
    })
    return data?.data
  },

  async closeSession(sessionId) {
    const { data } = await api.post(`/teacher/teaching-sessions/${sessionId}/close`)
    return data?.data
  },

  async heartbeat(deviceId, deviceName) {
    const { data } = await api.post('/teacher/presence/heartbeat', {
      device_id: deviceId,
      device_name: deviceName,
    })
    return data?.data
  },
}
