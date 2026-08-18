import { api } from './api'

export const equranService = {
  /** Fetch surah dari API sekolah sebagai source of truth. */
  getSurahs: async (params = {}) => {
    const res = await api.get('/equran/surah', { params })
    const rawList = res.data?.data || []

    // Normalize keys so frontend components always get consistent property names
    return rawList.map((item) => ({
      id: item.id || item.nomor,
      nomor: Number(item.nomor),
      nama: item.nama || '',
      nama_latin: item.namaLatin || item.nama_latin || '',
      jumlah_ayat: Number(item.jumlahAyat || item.jumlah_ayat || 0),
      tempat_turun: item.tempatTurun || item.tempat_turun || '',
      arti: item.arti || '',
      deskripsi: item.deskripsi || '',
      audio_full: item.audioFull?.['05'] || item.audio_full || null,
    }))
  },

  /**
   * Fetch Surah Detail along with list of Ayahs (No Ayat, Arab, Latin, Terjemahan)
   */
  getSurahDetail: async (nomorOrId) => {
    const res = await api.get(`/equran/surah/${nomorOrId}`)
    const surah = res.data?.data
    if (!surah) throw new Error('Detail surah tidak tersedia.')

    return {
      surah: {
        id: surah.id || surah.nomor,
        nomor: Number(surah.nomor),
        nama: surah.nama || '',
        nama_latin: surah.namaLatin || surah.nama_latin || '',
        jumlah_ayat: Number(surah.jumlahAyat || surah.jumlah_ayat || 0),
        tempat_turun: surah.tempatTurun || surah.tempat_turun || '',
        arti: surah.arti || '',
        deskripsi: surah.deskripsi || '',
        audio_full: surah.audioFull?.['05'] || surah.audio_full || null,
      },
      ayat: res.data?.ayat || [],
    }
  },

  /**
   * Create a new Surah entry in database
   */
  createSurah: async (payload) => {
    const res = await api.post('/equran/surah', payload)
    return res.data
  },

  /**
   * Update Surah entry in database
   */
  updateSurah: async (id, payload) => {
    const res = await api.put(`/equran/surah/${id}`, payload)
    return res.data
  },

  /**
   * Delete Surah from database
   */
  deleteSurah: async (id) => {
    const res = await api.delete(`/equran/surah/${id}`)
    return res.data
  },

  /**
   * Auto sync 114 Surahs from EQuran.id API into local database
   */
  syncSurah: async () => {
    const res = await api.post('/equran/sync-surah')
    return res.data
  },

  /**
   * Fetch Jadwal Sholat for today & kota (default kabkota 1 = Jakarta/Sekitarnya)
   */
  getJadwalSholat: async (kabkotaId = '1', tanggal = null) => {
    const today = tanggal || new Date().toISOString().split('T')[0]
    const res = await api.get('/equran/jadwal-sholat', {
      params: { kabkota_id: kabkotaId, tanggal: today },
    })
    return res.data
  },

  /**
   * Fetch list of Provinces (GET /api/v2/shalat/provinsi)
   */
  getProvinsi: async () => {
    const res = await api.get('/v2/shalat/provinsi')
    return res.data
  },

  /**
   * Fetch list of Kab/Kota (POST /api/v2/shalat/kabkota)
   */
  getKabkota: async (provinsi = 'Jawa Barat') => {
    const res = await api.post('/v2/shalat/kabkota', { provinsi })
    return res.data
  },

  /**
   * Fetch Monthly Prayer Schedule (POST /api/v2/shalat)
   */
  getJadwalShalatBulanan: async (provinsi = 'Jawa Barat', kabkota = 'Kota Bogor', bulan = 1, tahun = 2026) => {
    const res = await api.post('/v2/shalat', { provinsi, kabkota, bulan, tahun })
    return res.data
  },

  /**
   * Save prayer schedule to DB as Master Data
   */
  saveMasterShalat: async (payload) => {
    const res = await api.post('/v2/shalat/save-master', payload)
    return res.data
  },

  /**
   * Fetch Master Data Sholat stored in DB
   */
  getMasterShalatList: async (params = {}) => {
    const res = await api.get('/v2/shalat/master-list', { params })
    return res.data
  },

  /**
   * Delete single Master Data Sholat record from DB
   */
  deleteMasterShalat: async (id) => {
    const res = await api.delete(`/v2/shalat/master-list/${id}`)
    return res.data
  },

  /**
   * Fetch Doa & Dzikir items (GET /api/doa with params: grup, tag, search)
   */
  getDoas: async (params = {}) => {
    const res = await api.get('/doa', { params })
    return res.data
  },

  /**
   * Fetch single Doa detail by ID (GET /api/doa/{id})
   */
  getDoaDetail: async (id) => {
    const res = await api.get(`/doa/${id}`)
    return res.data
  },

  /**
   * Sync Doa & Dzikir items from EQuran.id to DB (POST /api/doa/sync)
   */
  syncDoas: async () => {
    const res = await api.post('/doa/sync')
    return res.data
  },

  /**
   * Create new manual Doa entry (POST /api/doa)
   */
  createDoa: async (payload) => {
    const res = await api.post('/doa', payload)
    return res.data
  },

  /**
   * Update Doa entry (PUT /api/doa/{id})
   */
  updateDoa: async (id, payload) => {
    const res = await api.put(`/doa/${id}`, payload)
    return res.data
  },

  /**
   * Delete Doa entry (DELETE /api/doa/{id})
   */
  deleteDoa: async (id) => {
    const res = await api.delete(`/doa/${id}`)
    return res.data
  },
}
