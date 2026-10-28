import { api } from './api'

export const adminNavigationService = {
  getNavigationData: async (platform = null) => {
    const params = platform ? { platform } : {}
    const res = await api.get('/admin/navigation', { params })
    return res.data?.data || { modules: [], roles: [], permissions: [], registries: {} }
  },

  createModule: async (moduleData) => {
    const res = await api.post('/admin/navigation/modules', moduleData)
    return res.data?.data
  },

  updateModule: async (id, moduleData) => {
    const res = await api.put(`/admin/navigation/modules/${id}`, moduleData)
    return res.data?.data
  },

  deleteModule: async (id) => {
    const res = await api.delete(`/admin/navigation/modules/${id}`)
    return res.data
  },

  createMenu: async (menuData) => {
    const res = await api.post('/admin/navigation/menus', menuData)
    return res.data?.data
  },

  updateMenu: async (id, menuData) => {
    const res = await api.put(`/admin/navigation/menus/${id}`, menuData)
    return res.data?.data
  },

  deleteMenu: async (id) => {
    const res = await api.delete(`/admin/navigation/menus/${id}`)
    return res.data
  },

  reorder: async (type, items) => {
    const res = await api.post('/admin/navigation/reorder', { type, items })
    return res.data
  },

  syncMobileConfig: async () => {
    const res = await api.post('/admin/navigation/sync-mobile-config')
    return res.data
  },

  resetDefaults: async () => {
    const res = await api.post('/admin/navigation/reset-defaults')
    return res.data
  },
}

export default adminNavigationService
