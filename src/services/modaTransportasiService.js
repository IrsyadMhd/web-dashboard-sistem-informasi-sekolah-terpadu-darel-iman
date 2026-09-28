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
  getDropdown: async () => {
    try {
      const { data } = await api.get('/master/moda-transportasi/dropdown')
      const items = data?.data || []
      if (Array.isArray(items) && items.length > 0) {
        return items.map((item) => ({
          value: item.name || item.value,
          label: item.name || item.label,
        }))
      }
    } catch (e) {
      // Quiet fallback
    }
    return FALLBACK_MODA_TRANSPORTASI
  },
}
