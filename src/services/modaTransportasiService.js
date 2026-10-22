import { api } from './api'

export const FALLBACK_MODA_TRANSPORTASI = [
  { value: 'Jalan Kaki', label: 'Jalan Kaki' },
  { value: 'Sepeda', label: 'Sepeda' },
  { value: 'Sepeda Motor', label: 'Sepeda Motor' },
  { value: 'Mobil', label: 'Mobil' },
  { value: 'Transportasi Umum', label: 'Transportasi Umum' },
  { value: 'Diantar Jemput', label: 'Diantar Jemput' },
]

/**
 * Service API untuk Opsi Master Moda Transportasi.
 */
export const modaTransportasiService = {
  getAll: async () => {
    try {
      const { data } = await api.get('/master/moda-transportasi/dropdown')
      return data
    } catch (e) {
      console.warn('Gagal memuat moda transportasi dari server:', e)
      return { data: [] }
    }
  },
  getDropdown: async () => {
    try {
      const { data } = await api.get('/master/moda-transportasi/dropdown')
      const items = data?.data || []
      if (Array.isArray(items)) {
        return items.map((item) => ({
          value: item.name || item.value,
          label: item.name || item.label,
        }))
      }
      return []
    } catch (e) {
      console.warn('Gagal memuat dropdown moda transportasi dari server:', e)
      return []
    }
  },
}
