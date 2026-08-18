import { api } from './api'

export const deleteRequestService = {
  getDeleteRequests: async (params = {}) => {
    const { data } = await api.get('/v2/approval/delete-requests', { params })
    return data
  },

  submitDeleteRequest: async ({ target_table, target_id, target_label, reason, attachment_path, education_unit_id }) => {
    const { data } = await api.post('/v2/approval/delete-requests', {
      target_table,
      target_id,
      target_label,
      reason,
      attachment_path,
      education_unit_id,
    })
    return data
  },

  approveDeleteRequest: async (id) => {
    const { data } = await api.post(`/v2/approval/delete-requests/${id}/approve`)
    return data
  },

  rejectDeleteRequest: async (id, rejection_reason) => {
    const { data } = await api.post(`/v2/approval/delete-requests/${id}/reject`, { rejection_reason })
    return data
  },
}
