import { api } from './api'

export const wilayahService = {
  getProvinsi: async () => {
    const { data } = await api.get('/v1/wilayah/provinsi')
    return data?.data || []
  },

  getKota: async (provinsi) => {
    const { data } = await api.get('/v1/wilayah/kota', {
      params: { provinsi: provinsi || undefined },
    })
    return data?.data || []
  },

  getKecamatan: async (kota, provinsi) => {
    const { data } = await api.get('/v1/wilayah/kecamatan', {
      params: {
        provinsi: provinsi || undefined,
        kota: kota || undefined,
      },
    })
    return data?.data || []
  },

  getKelurahan: async (kecamatan, kota, provinsi) => {
    const { data } = await api.get('/v1/wilayah/kelurahan', {
      params: {
        provinsi: provinsi || undefined,
        kota: kota || undefined,
        kecamatan: kecamatan || undefined,
      },
    })
    return data?.data || []
  },
}
