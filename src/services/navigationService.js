import { api } from './api'

/**
 * Service API untuk Dynamic Navigation Modules (Database-Driven RBAC).
 */
export const navigationService = {
  /**
   * Mengambil daftar modul dan menu navigasi untuk pengguna terautentikasi.
   * Filter platform wajib menggunakan 'web'.
   *
   * @param {string} [platform='web']
   * @returns {Promise<{ user: object, modules: Array }>}
   */
  getModules: async (platform = 'web') => {
    const { data } = await api.get('/v1/navigation/modules', {
      params: { platform },
    })
    return data?.data || { user: null, modules: [] }
  },
}

export default navigationService
