import { api } from './api'

export const helpService = {
  getFaqs: async (params = {}) => {
    const res = await api.get('/help/faqs', { params })
    return res.data?.data || { faqs: [], categories: [] }
  },

  voteFaq: async (id, vote) => {
    const res = await api.post(`/help/faqs/${id}/vote`, { vote })
    return res.data
  },

  submitTicket: async (ticketData) => {
    const res = await api.post('/help/tickets', ticketData)
    return res.data
  },

  getManuals: async () => {
    const res = await api.get('/help/manuals')
    return res.data?.data || []
  },
}
