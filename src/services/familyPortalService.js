import api from './api'

const childParams = (childId) => ({ params: childId ? { child_id: childId } : {} })
export const familyPortalService = {
  children: async () => (await api.get('/portal/children')).data,
  updateChildPassword: async (childId, payload) => (await api.put(`/portal/children/${childId}/password`, payload)).data,
  dashboard: async (childId) => (await api.get('/portal/dashboard', childParams(childId))).data,
  list: async (resource, childId) => (await api.get(`/portal/${resource}`, childParams(childId))).data,
  submitPermission: async (payload) => (await api.post('/portal/permissions', payload)).data,

  // Parent Chat
  chatContacts: async (childId) => (await api.get('/portal/chat/contacts', childParams(childId))).data,
  chatMessages: async (teacherId, childId) => (await api.get(`/portal/chat/${teacherId}`, childParams(childId))).data,
  sendMessage: async (teacherId, childId, message) => (await api.post(`/portal/chat/${teacherId}`, { child_id: childId, message })).data,

  // Teacher Chat
  teacherConversations: async () => (await api.get('/teacher/chat/conversations')).data,
  teacherMessages: async (parentUserId, studentId) => (await api.get(`/teacher/chat/parent/${parentUserId}/student/${studentId}`)).data,
  sendTeacherMessage: async (parentUserId, studentId, message) => (await api.post(`/teacher/chat/parent/${parentUserId}/student/${studentId}`, { message })).data,

  // Employee-to-Employee Chat
  employeeContacts: async (search, unitId) => (await api.get('/employee/chat/contacts', { params: { search, unit_id: unitId } })).data,
  employeeConversations: async () => (await api.get('/employee/chat/conversations')).data,
  employeeMessages: async (recipientUserId) => (await api.get(`/employee/chat/messages/${recipientUserId}`)).data,
  sendEmployeeMessage: async (recipientUserId, message) => (await api.post(`/employee/chat/messages/${recipientUserId}`, { message })).data,

  downloadReport: async (reportId, childId) => (await api.get(`/portal/reports/${reportId}/download`, { ...childParams(childId), responseType: 'blob' })).data,
}
