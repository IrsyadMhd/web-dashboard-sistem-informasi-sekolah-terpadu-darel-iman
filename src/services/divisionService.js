import { api } from './api'

export const divisionService = {
  getDropdown: async () => {
    const { data } = await api.get('/divisions/dropdown')
    return data?.data || []
  },
  getAll: async (params = {}) => {
    const { data } = await api.get('/divisions', { params })
    return data?.data || []
  },
}

export default divisionService
