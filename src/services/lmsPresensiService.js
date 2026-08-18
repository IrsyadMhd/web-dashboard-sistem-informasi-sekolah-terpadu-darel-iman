import { api } from './api'

export const lmsPresensiService = {
  getDaftar: async (params = {}) => {
    const { tanggal, jadwal_pelajaran_id, status_hadir, ...sessionParams } = params
    const response = await api.get('/lesson-attendance/sessions', {
      params: {
        ...sessionParams,
        date_from: tanggal || undefined,
        date_to: tanggal || undefined,
      },
    })
    const payload = response.data?.data || {}
    const sessions = Array.isArray(payload.data) ? payload.data : []
    const records = sessions.flatMap((session) => (session.attendances || [])
      .filter((attendance) => !jadwal_pelajaran_id || attendance.jadwal_pelajaran_id === jadwal_pelajaran_id)
      .filter((attendance) => !status_hadir || attendance.status_hadir === status_hadir)
      .map((attendance) => ({
        ...attendance,
        tanggal: attendance.tanggal || session.attendance_date,
        pertemuan_ke: attendance.pertemuan_ke || session.meeting_number,
        siswa: attendance.siswa,
        jadwal: session.schedule,
        session_id: session.id,
        session_status: session.status,
      })))

    return {
      success: response.data?.success === true,
      data: records,
      meta: payload,
    }
  },

  getById: async (id) => {
    const response = await api.get(`/lms/presensi/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/lesson-attendance/sessions', {
      schedule_id: data.jadwal_pelajaran_id,
      attendance_date: data.tanggal,
      meeting_number: data.pertemuan_ke,
      items: [{
        student_id: data.siswa_id,
        status: data.status_hadir,
        notes: data.keterangan || null,
      }],
    })
    return response.data
  },

  createBulk: async (data) => {
    const response = await api.post('/lesson-attendance/sessions', {
      schedule_id: data.jadwal_pelajaran_id,
      attendance_date: data.tanggal,
      meeting_number: data.pertemuan_ke,
      items: data.items.map((item) => ({
        student_id: item.siswa_id,
        status: item.status_hadir,
        notes: item.keterangan || null,
      })),
    })
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/lms/presensi/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/lms/presensi/${id}`)
    return response.data
  },

  restore: async (id) => {
    const response = await api.post(`/lms/presensi/${id}/restore`)
    return response.data
  },

  getStats: async (params = {}) => {
    const response = await lmsPresensiService.getDaftar({ ...params, per_page: 100 })
    const records = response.data || []
    const totals = records.reduce((result, record) => {
      const status = record.status_hadir
      if (Object.prototype.hasOwnProperty.call(result, status)) result[status] += 1
      result.total += 1
      return result
    }, { total: 0, hadir: 0, izin: 0, sakit: 0, alpa: 0, terlambat: 0 })

    return {
      success: true,
      data: {
        ...totals,
        persentase_hadir: totals.total ? Math.round(((totals.hadir + totals.terlambat) / totals.total) * 100) : 0,
      },
    }
  },

  getOptions: async () => {
    const response = await api.get('/lesson-attendance/my-schedules')
    return {
      success: response.data?.success === true,
      data: {
        schedules: response.data?.data || [],
        students: [],
      },
    }
  },

  getMySchedules: async (date) => {
    const response = await api.get('/lesson-attendance/my-schedules', { params: { date } })
    return response.data
  },

  getActiveSchedules: async () => {
    const response = await api.get('/lesson-attendance/active-schedules')
    return response.data
  },

  getScheduleStudents: async (scheduleId, date, attendanceContext = null) => {
    const response = await api.get(`/lesson-attendance/my-schedules/${scheduleId}/students`, {
      params: { date, attendance_context: attendanceContext || undefined },
    })
    return response.data
  },

  getSessions: async (params = {}) => {
    const response = await api.get('/lesson-attendance/sessions', { params })
    return response.data
  },

  getSession: async (id) => {
    const response = await api.get(`/lesson-attendance/sessions/${id}`)
    return response.data
  },

  saveDraft: async (data) => {
    const response = await api.post('/lesson-attendance/sessions', data)
    return response.data
  },

  finalize: async (sessionId) => {
    const response = await api.post(`/lesson-attendance/sessions/${sessionId}/finalize`)
    return response.data
  },

  unlock: async (sessionId, reason) => {
    const response = await api.post(`/lesson-attendance/sessions/${sessionId}/unlock`, { reason })
    return response.data
  },

  cancelSession: async (sessionId, reason) => {
    const response = await api.post(`/lesson-attendance/sessions/${sessionId}/cancel`, { reason })
    return response.data
  },

  getMyAttendance: async (params = {}) => {
    const response = await api.get('/student-attendance/me', { params })
    return response.data
  },

  getPermissionRequests: async () => {
    const response = await api.get('/student-attendance/permissions')
    return response.data
  },

  getPermissions: async (params = {}) => {
    const response = await api.get('/student-attendance/permissions', { params })
    return response.data
  },

  submitPermissionRequest: async (data) => {
    const response = await api.post('/student-attendance/permissions', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    })
    return response.data
  },

  cancelPermissionRequest: async (id) => {
    const response = await api.post(`/student-attendance/permissions/${id}/cancel`)
    return response.data
  },

  updatePermissionRequest: async (id, data) => {
    const response = await api.put(`/student-attendance/permissions/${id}`, data)
    return response.data
  },

  sendPermissionRequest: async (id) => {
    const response = await api.post(`/student-attendance/permissions/${id}/submit`)
    return response.data
  },

  submitCorrection: async (data) => {
    const response = await api.post('/lesson-attendance/corrections', data)
    return response.data
  },

  getCorrections: async (params = {}) => {
    const response = await api.get('/lesson-attendance/corrections', { params })
    return response.data
  },

  reviewCorrection: async (id, data) => {
    const response = await api.post(`/lesson-attendance/corrections/${id}/review`, data)
    return response.data
  },

  cancelCorrection: async (id) => {
    const response = await api.post(`/lesson-attendance/corrections/${id}/cancel`)
    return response.data
  },

  getHomeroomDashboard: async () => {
    const response = await api.get('/homeroom-attendance/dashboard')
    return response.data
  },

  getHomeroomPermissions: async (params = {}) => {
    const response = await api.get('/homeroom-attendance/permissions', { params })
    return response.data
  },

  reviewPermission: async (id, data) => {
    const response = await api.post(`/homeroom-attendance/permissions/${id}/review`, data)
    return response.data
  },

  getFollowUps: async (params = {}) => {
    const response = await api.get('/homeroom-attendance/follow-ups', { params })
    return response.data
  },

  createFollowUp: async (data) => {
    const response = await api.post('/homeroom-attendance/follow-ups', data)
    return response.data
  },

  updateFollowUp: async (id, data) => {
    const response = await api.put(`/homeroom-attendance/follow-ups/${id}`, data)
    return response.data
  },

  completeFollowUp: async (id) => {
    const response = await api.post(`/homeroom-attendance/follow-ups/${id}/complete`)
    return response.data
  },

  closeFollowUp: async (id) => {
    const response = await api.post(`/homeroom-attendance/follow-ups/${id}/close`)
    return response.data
  },

  getReport: async (params = {}) => {
    const response = await api.get('/lesson-attendance/report', { params })
    return response.data
  },

  startCaptureSession: async (id, durationMinutes = 60) => {
    const response = await api.post(`/lesson-attendance/sessions/${id}/start-session`, { duration_minutes: durationMinutes })
    return response.data
  },

  closeCaptureSession: async (id) => {
    const response = await api.post(`/lesson-attendance/sessions/${id}/close-session`)
    return response.data
  },

  manualCheck: async (id, studentId) => {
    const response = await api.post(`/lesson-attendance/sessions/${id}/manual-check`, { student_id: studentId })
    return response.data
  },

  scanAttendance: async (id, method, data) => {
    const response = await api.post(`/lesson-attendance/sessions/${id}/scan/${method}`, data)
    return response.data
  },

  getScanLogs: async (id, params = {}) => {
    const response = await api.get(`/lesson-attendance/sessions/${id}/scan-logs`, { params })
    return response.data
  },
}
