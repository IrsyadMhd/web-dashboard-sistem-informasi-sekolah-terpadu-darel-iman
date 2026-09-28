import { api } from './api'

/**
 * Service API untuk Manajemen Master Data Kelas / Rombongan Belajar (Rombel).
 * Menyediakan metode komunikasi ke backend Laravel.
 */
export const kelasService = {
  /**
   * Dapatkan daftar kelas berpaginasi dengan pencarian & filter.
   */
  getDaftar: async (params = {}) => {
    const { data } = await api.get('/kelas', { params })
    return data
  },

  /**
   * Dapatkan seluruh data kelas (untuk opsi dropdown / filter).
   */
  getAll: async (params = {}) => {
    const { data } = await api.get('/kelas', { params: { per_page: 100, ...params } })
    return data?.data?.data || data?.data || data || []
  },

  /**
   * Dapatkan opsi data master dropdown (Unit, Tahun Ajaran, Semester, Pegawai/Guru).
   */
  getOptions: async () => {
    const { data } = await api.get('/kelas/options')
    return data?.data || {}
  },

  /**
   * Dapatkan ringkasan statistik kelas.
   */
  getStats: async () => {
    const { data } = await api.get('/kelas/stats')
    return data?.data || {}
  },

  /**
   * Dapatkan detail kelas berdasarkan ID.
   */
  getDetail: async (id) => {
    const { data } = await api.get(`/kelas/${id}`)
    return data?.data || {}
  },

  /**
   * Tambah kelas / rombel baru.
   */
  tambah: async (payload) => {
    const { data } = await api.post('/kelas', payload)
    return data
  },

  /**
   * Ubah data kelas / rombel.
   */
  ubah: async ({ id, payload }) => {
    const { data } = await api.put(`/kelas/${id}`, payload)
    return data
  },

  /**
   * Hapus data kelas (Soft Delete).
   */
  hapus: async (id) => {
    const { data } = await api.delete(`/kelas/${id}`)
    return data
  },

  /**
   * Pulihkan data kelas yang terhapus (Soft Delete Restore).
   */
  pulihkan: async (id) => {
    const { data } = await api.post(`/kelas/${id}/restore`)
    return data
  },

  /**
   * Dapatkan daftar siswa dalam kelas / rombel tertentu.
   */
  getSiswaRombel: async (id) => {
    try {
      const { data } = await api.get(`/kelas/${id}/siswa`)
      return data?.data || {}
    } catch (err) {
      // Fallback untuk role guru jika memanggil endpoint master kelas
      const fallbackRes = await api.get('/teacher/students', { params: { class_id: id, per_page: 100 } }).catch(() => null)
      if (fallbackRes?.data?.data) {
        const raw = fallbackRes.data.data
        const list = Array.isArray(raw) ? raw : raw.data || []
        return { siswa: list }
      }
      throw err
    }
  },

  /**
   * Impor data kelas dari file / payload JSON.
   */
  prosesImport: async (dataRows) => {
    const { data } = await api.post('/kelas/import', { data: dataRows })
    return data
  },

  /**
   * Ekspor data kelas ke XLSX, XLS, atau CSV.
   */
  exportKelas: async (params = {}, format = 'xlsx') => {
    const { downloadFileFromApi } = await import('../utils/exportUtils')
    return downloadFileFromApi('/kelas/export', params, format, 'data_kelas')
  },
}
