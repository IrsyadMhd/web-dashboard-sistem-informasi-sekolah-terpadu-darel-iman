import api from './api'

export const studentLmsService = {
  overview: async () => (await api.get('/portal/lms/exams')).data,
  startExam: async (examId) => (await api.post(`/portal/lms/exams/${examId}/start`)).data,
  saveAnswers: async (sessionId, answers) => (
    await api.post(`/portal/lms/exam-sessions/${sessionId}/answers`, { jawaban: answers })
  ).data,
  finishExam: async (sessionId, answers) => (
    await api.post(`/portal/lms/exam-sessions/${sessionId}/finish`, { jawaban: answers })
  ).data,
}
