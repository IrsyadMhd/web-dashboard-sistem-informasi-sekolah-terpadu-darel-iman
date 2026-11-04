import api from './api'
import { educationUnitService } from './educationUnitService'
import { employeeService } from './employeeService'
import { dashboardPemantauanService } from './dashboardPemantauanService'

const STORAGE_KEYS = {
  SUPERVISI_KBM: 'divisi_pendidikan_supervisi_kbm_v1',
  KURASI_SOAL: 'divisi_pendidikan_kurasi_soal_v1',
  MUNAQASYAH: 'divisi_pendidikan_munaqasyah_v1',
  BAHASA: 'divisi_pendidikan_bahasa_v1',
  PELATIHAN: 'divisi_pendidikan_pelatihan_v1',
  LAPORAN_FEEDBACK: 'divisi_pendidikan_laporan_feedback_v1',
  RADAR_AKREDITASI: 'divisi_pendidikan_radar_akreditasi_v1',
}

const getStored = (key) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    console.error(`Error reading ${key}:`, e)
    return null
  }
}

const setStored = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error(`Error saving ${key}:`, e)
  }
}

export const divisiPendidikanWorkspaceService = {
  // Fetch real context data (Education Units & Teachers)
  getUnitOptions: async () => {
    try {
      const res = await educationUnitService.getDaftar({ per_page: 100 })
      const list = res?.data?.data || res?.data || (Array.isArray(res) ? res : [])
      return list.map((u) => ({
        id: u.id,
        name: u.name || u.nama || u.code,
        code: u.code || u.kode,
        jenjang: u.jenjang || u.level || 'Sekolah',
      }))
    } catch {
      return []
    }
  },

  getTeacherOptions: async (unitId = null) => {
    try {
      const params = { per_page: 100 }
      if (unitId && unitId !== 'all') params.unit_id = unitId
      const res = await api.get('/employees', { params })
      const list = res?.data?.data || res?.data || []
      return (Array.isArray(list) ? list : []).map((e) => ({
        id: e.id,
        name: e.nama_lengkap || e.name || e.nama || 'Guru',
        niy: e.niy || e.nip || e.nik || '-',
        unit_id: e.unit_id || e.education_unit_id,
        unit_name: e.unit?.name || e.education_unit?.name || '-',
        position: e.position?.name || e.jabatan || 'Guru Pengajar',
      }))
    } catch {
      return []
    }
  },

  // 1. Supervisi KBM & Observasi Kelas Guru (PostgreSQL Database API)
  getSupervisiKbmList: async (params = {}) => {
    try {
      const res = await api.get('/divisi/supervisi-kbm', { params })
      const list = res?.data?.data || res?.data || []
      return Array.isArray(list) ? list : []
    } catch (e) {
      console.error('Failed to fetch supervisi kbm from API:', e)
      return []
    }
  },

  saveSupervisiKbm: async (payload) => {
    try {
      if (payload.id && !String(payload.id).startsWith('SUP-NEW')) {
        const res = await api.put(`/divisi/supervisi-kbm/${payload.id}`, payload)
        return res?.data?.data
      } else {
        const res = await api.post('/divisi/supervisi-kbm', payload)
        return res?.data?.data
      }
    } catch (e) {
      console.error('Failed to save supervisi kbm:', e)
      throw e
    }
  },

  deleteSupervisiKbm: async (id) => {
    try {
      await api.delete(`/divisi/supervisi-kbm/${id}`)
      return true
    } catch (e) {
      console.error('Failed to delete supervisi kbm:', e)
      throw e
    }
  },

  // 2. Kurasi Bank Soal & Ujian Bersama (PostgreSQL Database API)
  getKurasiSoalList: async (params = {}) => {
    try {
      const res = await api.get('/divisi/kurasi-soal', { params })
      const list = res?.data?.data || res?.data || []
      return Array.isArray(list) ? list : []
    } catch (e) {
      console.error('Failed to fetch kurasi soal from API:', e)
      return []
    }
  },

  getKurasiSoalOptions: async () => {
    try {
      const res = await api.get('/divisi/kurasi-soal-options')
      return res?.data?.data || { units: [], subjects: [], teachers: [] }
    } catch (e) {
      console.error('Failed to fetch kurasi soal options:', e)
      return { units: [], subjects: [], teachers: [] }
    }
  },

  saveKurasiSoal: async (payload) => {
    try {
      if (payload.id && !String(payload.id).startsWith('SOAL-NEW')) {
        const res = await api.put(`/divisi/kurasi-soal/${payload.id}`, payload)
        return res?.data?.data
      } else {
        const res = await api.post('/divisi/kurasi-soal', payload)
        return res?.data?.data
      }
    } catch (e) {
      console.error('Failed to save kurasi soal:', e)
      throw e
    }
  },

  approveKurasiSoal: async (id, catatan) => {
    try {
      const res = await api.post(`/divisi/kurasi-soal/${id}/approve`, { catatan_kurator: catatan })
      return res?.data?.data
    } catch (e) {
      console.error('Failed to approve kurasi soal:', e)
      throw e
    }
  },

  deleteKurasiSoal: async (id) => {
    try {
      await api.delete(`/divisi/kurasi-soal/${id}`)
      return true
    } catch (e) {
      console.error('Failed to delete kurasi soal:', e)
      throw e
    }
  },

  // 3. Penjaminan Mutu & Munaqasyah Akbar Tahfizh (PostgreSQL Database API)
  getMunaqasyahList: async (params = {}) => {
    try {
      const res = await api.get('/divisi/munaqasyah-tahfizh', { params })
      const list = res?.data?.data || res?.data || []
      return Array.isArray(list) ? list : []
    } catch (e) {
      console.error('Failed to fetch munaqasyah tahfizh from API:', e)
      return []
    }
  },

  getMunaqasyahOptions: async () => {
    try {
      const res = await api.get('/divisi/munaqasyah-tahfizh-options')
      return res?.data?.data || { units: [], students: [], examiners: [] }
    } catch (e) {
      console.error('Failed to fetch munaqasyah options:', e)
      return { units: [], students: [], examiners: [] }
    }
  },

  saveMunaqasyah: async (payload) => {
    try {
      if (payload.id && !String(payload.id).startsWith('MNQ-NEW')) {
        const res = await api.put(`/divisi/munaqasyah-tahfizh/${payload.id}`, payload)
        return res?.data?.data
      } else {
        const res = await api.post('/divisi/munaqasyah-tahfizh', payload)
        return res?.data?.data
      }
    } catch (e) {
      console.error('Failed to save munaqasyah:', e)
      throw e
    }
  },

  deleteMunaqasyah: async (id) => {
    try {
      await api.delete(`/divisi/munaqasyah-tahfizh/${id}`)
      return true
    } catch (e) {
      console.error('Failed to delete munaqasyah:', e)
      throw e
    }
  },

  // 4. Pembiasaan Bahasa Asing & Mufradat Pekanan (Two-Tier Approval & Setoran)
  getBahasaList: async (params = {}) => {
    try {
      const res = await api.get('/vocabulary/banks', { params })
      const data = res?.data?.data?.data || res?.data?.data || res?.data || []
      if (Array.isArray(data)) {
        return data.map((item) => ({
          id: item.id,
          unit_id: item.unit_id,
          unit_name: item.unit?.name || 'Unit Pendidikan',
          pekan_ke: item.theme || 'Kosakata Pekanan',
          tema: item.theme || 'Umum',
          arab: item.language === 'arab' ? item.word : (item.phonetic || '-'),
          inggris: item.language === 'inggris' ? item.word : (item.translation || '-'),
          word: item.word,
          language: item.language,
          arti: item.translation,
          contoh_kalimat: item.example_sentence || '-',
          target_level: item.target_level,
          status: item.status,
          creator_name: item.creator?.name || 'Guru Mapel',
          principal_notes: item.principal_notes,
          divisi_notes: item.divisi_notes,
        }))
      }
    } catch (e) {
      console.warn('API error in getBahasaList:', e)
    }
    return []
  },

  approveBahasaPrincipal: async (id, payload) => {
    try {
      const res = await api.put(`/vocabulary/banks/${id}/approve-principal`, payload)
      return res?.data?.data
    } catch (e) {
      console.error('Error approveBahasaPrincipal:', e)
      throw e
    }
  },

  approveBahasaDivisi: async (id, payload) => {
    try {
      const res = await api.put(`/vocabulary/banks/${id}/approve-divisi`, payload)
      return res?.data?.data
    } catch (e) {
      console.error('Error approveBahasaDivisi:', e)
      throw e
    }
  },

  getBahasaSubmissions: async (params = {}) => {
    try {
      const res = await api.get('/vocabulary/submissions', { params })
      const data = res?.data?.data?.data || res?.data?.data || res?.data || []
      return Array.isArray(data) ? data : []
    } catch (e) {
      console.error('Error getBahasaSubmissions:', e)
      return []
    }
  },

  saveBahasa: async (payload) => {
    try {
      await api.post('/vocabulary/banks', {
        word: payload.arab || payload.inggris || payload.word,
        translation: payload.arti,
        language: payload.arab ? 'arab' : 'inggris',
        phonetic: payload.phonetic || '',
        example_sentence: payload.contoh_kalimat,
        theme: payload.tema || payload.pekan_ke,
        target_level: payload.target_level || 'Umum',
        unit_id: payload.unit_id,
      })
      return await divisiPendidikanWorkspaceService.getBahasaList()
    } catch (e) {
      console.error('Error saveBahasa:', e)
      throw e
    }
  },

  deleteBahasa: async (id) => {
    const list = await divisiPendidikanWorkspaceService.getBahasaList()
    const updated = list.filter((item) => item.id !== id)
    setStored(STORAGE_KEYS.BAHASA, updated)
    return updated
  },

  // 5. Manajemen Pelatihan Guru & Jam Pelatihan (JP) (PostgreSQL Database API)
  getPelatihanList: async (params = {}) => {
    try {
      const res = await api.get('/divisi/pelatihan-guru', { params })
      const list = res?.data?.data || res?.data || []
      return Array.isArray(list) ? list : []
    } catch (e) {
      console.error('Failed to fetch pelatihan guru from API:', e)
      return []
    }
  },

  getPelatihanOptions: async () => {
    try {
      const res = await api.get('/divisi/pelatihan-guru-options')
      return res?.data?.data || { units: [], categories: [], teachers: [] }
    } catch (e) {
      console.error('Failed to fetch pelatihan options:', e)
      return { units: [], categories: [], teachers: [] }
    }
  },

  savePelatihan: async (payload) => {
    try {
      if (payload.id && !String(payload.id).startsWith('TRN-NEW')) {
        const res = await api.put(`/divisi/pelatihan-guru/${payload.id}`, payload)
        return res?.data?.data
      } else {
        const res = await api.post('/divisi/pelatihan-guru', payload)
        return res?.data?.data
      }
    } catch (e) {
      console.error('Failed to save pelatihan guru:', e)
      throw e
    }
  },

  deletePelatihan: async (id) => {
    try {
      await api.delete(`/divisi/pelatihan-guru/${id}`)
      return true
    } catch (e) {
      console.error('Failed to delete pelatihan guru:', e)
      throw e
    }
  },

  // 6. Workflow Review & Catatan Revisi Laporan Bulanan (PostgreSQL Database API)
  getLaporanReviewList: async (params = {}) => {
    try {
      const res = await api.get('/divisi/revisi-laporan', { params })
      const list = res?.data?.data || res?.data || []
      return Array.isArray(list) ? list : []
    } catch (e) {
      console.error('Failed to fetch laporan review list from API:', e)
      return []
    }
  },

  getLaporanReviewOptions: async () => {
    try {
      const res = await api.get('/divisi/revisi-laporan-options')
      return res?.data?.data || { units: [], active_year: '2026/2027', statuses: [] }
    } catch (e) {
      console.error('Failed to fetch laporan review options:', e)
      return { units: [], active_year: '2026/2027', statuses: [] }
    }
  },

  saveLaporanReview: async (payload) => {
    try {
      const res = await api.post('/divisi/revisi-laporan', payload)
      return res?.data?.data
    } catch (e) {
      console.error('Failed to save laporan review:', e)
      throw e
    }
  },

  updateLaporanReview: async (id, payload) => {
    try {
      const res = await api.post(`/divisi/revisi-laporan/${id}/review`, payload)
      return res?.data?.data
    } catch (e) {
      console.error('Failed to update laporan review:', e)
      throw e
    }
  },

  deleteLaporanReview: async (id) => {
    try {
      await api.delete(`/divisi/revisi-laporan/${id}`)
      return true
    } catch (e) {
      console.error('Failed to delete laporan review:', e)
      throw e
    }
  },

  // 7. Radar Kesiapan Akreditasi & Rapor Mutu SNP (PostgreSQL Database API)
  getAkreditasiList: async (params = {}) => {
    try {
      const res = await api.get('/divisi/radar-akreditasi', { params })
      const list = res?.data?.data || res?.data || []
      return Array.isArray(list) ? list : []
    } catch (e) {
      console.error('Failed to fetch radar akreditasi from API:', e)
      return []
    }
  },

  getAkreditasiOptions: async () => {
    try {
      const res = await api.get('/divisi/radar-akreditasi-options')
      return res?.data?.data || { units: [], default_standards: [], ranks: [] }
    } catch (e) {
      console.error('Failed to fetch radar akreditasi options:', e)
      return { units: [], default_standards: [], ranks: [] }
    }
  },

  saveAkreditasi: async (payload) => {
    try {
      if (payload.id && !String(payload.id).startsWith('AKR-NEW')) {
        const res = await api.put(`/divisi/radar-akreditasi/${payload.id}`, payload)
        return res?.data?.data
      } else {
        const res = await api.post('/divisi/radar-akreditasi', payload)
        return res?.data?.data
      }
    } catch (e) {
      console.error('Failed to save radar akreditasi:', e)
      throw e
    }
  },

  updateAkreditasiStandar: async (id, standarIndex, newSkor, bukti = '') => {
    try {
      const res = await api.post(`/divisi/radar-akreditasi/${id}/standar`, {
        standar_index: standarIndex,
        skor: newSkor,
        bukti,
      })
      return res?.data?.data
    } catch (e) {
      console.error('Failed to update standar akreditasi:', e)
      throw e
    }
  },

  deleteAkreditasi: async (id) => {
    try {
      await api.delete(`/divisi/radar-akreditasi/${id}`)
      return true
    } catch (e) {
      console.error('Failed to delete radar akreditasi:', e)
      throw e
    }
  },

  // Dynamic Workspace Overview Stats for Master KPI Grid (Anti-Hardcode)
  getWorkspaceOverviewStats: async () => {
    try {
      const [supervisi, soal, tahfizh, bahasa, pelatihan, laporan, akreditasi] = await Promise.all([
        divisiPendidikanWorkspaceService.getSupervisiKbmList().catch(() => []),
        divisiPendidikanWorkspaceService.getKurasiSoalList().catch(() => []),
        divisiPendidikanWorkspaceService.getMunaqasyahList().catch(() => []),
        divisiPendidikanWorkspaceService.getBahasaList().catch(() => []),
        divisiPendidikanWorkspaceService.getPelatihanList().catch(() => []),
        divisiPendidikanWorkspaceService.getLaporanReviewList().catch(() => []),
        divisiPendidikanWorkspaceService.getAkreditasiList().catch(() => []),
      ])

      const supervisiList = Array.isArray(supervisi) ? supervisi : []
      const selesaiSupervisi = supervisiList.filter((s) => s.status === 'selesai')
      const avgSupervisiSkor = selesaiSupervisi.length
        ? Math.round(selesaiSupervisi.reduce((a, b) => a + Number(b.skor_total || 0), 0) / selesaiSupervisi.length)
        : (supervisiList.length ? Math.round(supervisiList.reduce((a, b) => a + Number(b.skor_total || 0), 0) / supervisiList.length) : 0)

      const soalList = Array.isArray(soal) ? soal : []
      const pendingSoal = soalList.filter((s) => s.status_kurasi === 'menunggu_kurasi' || s.status === 'menunggu_reviu' || s.status === 'menunggu_kurasi' || s.status === 'perlu_revisi').length
      const approvedSoal = soalList.filter((s) => s.status_kurasi === 'disetujui' || s.status === 'disetujui').length

      const tahfizhList = Array.isArray(tahfizh) ? tahfizh : []
      const lulusTahfizh = tahfizhList.filter((t) => t.status === 'lulus').length

      const pelList = Array.isArray(pelatihan) ? pelatihan : []
      const totalJP = pelList.reduce((a, b) => a + Number(b.jam_pelatihan || b.jp || 0), 0)
      const totalAgenda = pelList.length

      const lapList = Array.isArray(laporan) ? laporan : []
      const revisiLaporan = lapList.filter((l) => l.status_validasi === 'revisi' || l.status === 'perlu_revisi').length
      const disetujuiLaporan = lapList.filter((l) => l.status_validasi === 'disetujui' || l.status === 'disetujui').length

      const akrList = Array.isArray(akreditasi) ? akreditasi : []
      const avgAkreditasi = akrList.length
        ? Math.round(akrList.reduce((a, b) => a + Number(b.kesiapan_total || 0), 0) / akrList.length)
        : 0

      return {
        supervisi: { total: supervisiList.length, selesai: selesaiSupervisi.length, avgSkor: avgSupervisiSkor },
        soal: { total: soalList.length, pending: pendingSoal, approved: approvedSoal },
        tahfizh: { total: tahfizhList.length, lulus: lulusTahfizh },
        bahasa: { totalPekan: (Array.isArray(bahasa) ? bahasa.length : 0) },
        pelatihan: { totalAgenda, totalJP },
        laporan: { total: lapList.length, disetujui: disetujuiLaporan, revisi: revisiLaporan },
        akreditasi: { totalUnit: akrList.length, avgKesiapan: avgAkreditasi },
      }
    } catch (e) {
      console.error('Failed to get overview stats:', e)
      return {
        supervisi: { total: 0, selesai: 0, avgSkor: 0 },
        soal: { total: 0, pending: 0, approved: 0 },
        tahfizh: { total: 0, lulus: 0 },
        bahasa: { totalPekan: 0 },
        pelatihan: { totalAgenda: 0, totalJP: 0 },
        laporan: { total: 0, disetujui: 0, revisi: 0 },
        akreditasi: { totalUnit: 0, avgKesiapan: 0 },
      }
    }
  },
}
