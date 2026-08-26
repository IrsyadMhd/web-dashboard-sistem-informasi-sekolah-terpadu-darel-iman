import { api } from './api'
import { tahunAjaranService } from './tahunAjaranService'
import { educationUnitService } from './educationUnitService'

const USER_EVENTS_KEY = 'school_academic_calendar_user_events'
const OLD_LEGACY_KEY = 'school_academic_calendar_events'

/**
 * Service API & Provider Murni untuk Kalender Akademik Terpadu.
 * Memuat data agenda murni dari API backend database (/master/tahun-ajaran & /portal/school-information),
 * menarik data Unit Pendidikan resmi dari database (/education-units),
 * serta menyimpan agenda buatan pengguna dengan kategori custom, warna, dan unit sekolah.
 */
export const academicCalendarService = {
  /**
   * Mengambil daftar Unit Pendidikan resmi dari database API backend
   */
  getEducationUnits: async () => {
    let units = [
      { value: 'Semua Unit', label: 'Semua Unit (Yayasan Dar El-Iman)' }
    ]

    try {
      const res = await educationUnitService.getDaftar({ per_page: 100 })
      const list = res?.data || res || []
      if (Array.isArray(list) && list.length > 0) {
        list.forEach((item) => {
          const val = item.name || item.code || item.level
          if (val && !units.some((u) => u.value === val)) {
            units.push({
              value: val,
              label: item.code ? `${item.name} (${item.code})` : item.name
            })
          }
        })
      }
    } catch {
      // Abaikan jika koneksi API backend tidak tersedia
    }

    // Jika API belum mengembalikan data, sediakan fallback unit standar
    if (units.length === 1) {
      units.push(
        { value: 'TK', label: 'TK / PAUD IT' },
        { value: 'SD', label: 'SD IT' },
        { value: 'SMP', label: 'SMP IT' },
        { value: 'SMA', label: 'SMA IT' }
      )
    }

    return units
  },

  /**
   * Mengambil daftar agenda kalender dari backend API & agenda buatan pengguna.
   */
  getEvents: async (params = {}) => {
    try {
      localStorage.removeItem(OLD_LEGACY_KEY)
    } catch {
      // Ignore
    }

    let realApiEvents = []

    // 1. Ambil data Master Tahun Ajaran dari API Backend database
    try {
      const resTahun = await tahunAjaranService.getDaftar({ per_page: 50, ...params })
      const listTahun = resTahun?.data || []

      if (Array.isArray(listTahun) && listTahun.length > 0) {
        listTahun.forEach((t) => {
          if (t.start_date && t.end_date) {
            realApiEvents.push({
              id: `api-ta-${t.id}`,
              title: `Tahun Ajaran ${t.name} ${t.is_active ? '(Aktif)' : ''}`,
              category: 'mulai_kbm',
              customCategoryLabel: '',
              color: 'emerald',
              startDate: t.start_date,
              endDate: t.end_date,
              unit: 'Semua Unit',
              targetModule: '/dashboard/master-tahun-ajaran',
              audience: 'Semua Civitas',
              isPublished: true,
              notes: t.keterangan || `Periode resmi akademik tahun ajaran ${t.name}`
            })
          }
        })
      }
    } catch {
      // Abaikan jika koneksi API backend belum tersedia
    }

    // 2. Ambil data agenda dari Portal Informasi Sekolah / Kalender Pendidikan Backend
    try {
      const { data: schoolInfoRes } = await api.get('/portal/school-information', {
        params: { type: 'calendar', ...params }
      })
      const infoList = schoolInfoRes?.data || schoolInfoRes || []
      if (Array.isArray(infoList)) {
        infoList.forEach((item) => {
          if (item.title) {
            const startDate = item.event?.start_at || item.calendar_date || item.published_at || new Date().toISOString().split('T')[0]
            const endDate = item.event?.end_at || startDate
            realApiEvents.push({
              id: `api-info-${item.id}`,
              title: item.title,
              category: item.category || 'kegiatan',
              customCategoryLabel: item.custom_category || '',
              color: item.color || 'sky',
              startDate: String(startDate).split('T')[0],
              endDate: String(endDate).split('T')[0],
              unit: item.education_unit || 'Semua Unit',
              targetModule: item.target_url || '/dashboard/berita-informasi',
              audience: item.audience || 'Semua Civitas',
              isPublished: true,
              notes: item.content || item.description || ''
            })
          }
        })
      }
    } catch {
      // Abaikan jika endpoint portal belum tersedia
    }

    // 3. Ambil data agenda buatan pengguna dari LocalStorage
    let userEvents = []
    try {
      const saved = localStorage.getItem(USER_EVENTS_KEY)
      userEvents = saved ? JSON.parse(saved) : []
    } catch {
      userEvents = []
    }

    // Gabungkan data murni tanpa duplikasi
    const mergedMap = new Map()
    userEvents.forEach((evt) => mergedMap.set(evt.id, evt))
    realApiEvents.forEach((evt) => mergedMap.set(evt.id, evt))

    return Array.from(mergedMap.values()).sort((a, b) => (a.startDate > b.startDate ? 1 : -1))
  },

  /**
   * Menyimpan / memperbarui agenda kalender dengan dukungan kategori custom & warna
   */
  simpanEvent: async (payload) => {
    let currentEvents = []
    try {
      const saved = localStorage.getItem(USER_EVENTS_KEY)
      currentEvents = saved ? JSON.parse(saved) : []
    } catch {
      currentEvents = []
    }

    let updatedEvents = []
    if (payload.id) {
      updatedEvents = currentEvents.map((item) => (item.id === payload.id ? { ...item, ...payload } : item))
    } else {
      const newEvt = {
        ...payload,
        id: `evt-${Date.now()}`
      }
      updatedEvents = [newEvt, ...currentEvents]
    }

    try {
      localStorage.setItem(USER_EVENTS_KEY, JSON.stringify(updatedEvents))
    } catch {
      // Ignore write errors
    }

    // Kirim juga ke API backend jika endpoint tersedia
    try {
      await api.post('/portal/school-information', {
        title: payload.title,
        type: 'calendar',
        category: payload.category,
        custom_category: payload.customCategoryLabel,
        color: payload.color,
        education_unit: payload.unit,
        start_date: payload.startDate,
        end_date: payload.endDate,
        notes: payload.notes
      })
    } catch {
      // Abaikan jika backend belum siap
    }

    return academicCalendarService.getEvents()
  },

  /**
   * Menghapus agenda kalender buatan pengguna
   */
  hapusEvent: async (id) => {
    let currentEvents = []
    try {
      const saved = localStorage.getItem(USER_EVENTS_KEY)
      currentEvents = saved ? JSON.parse(saved) : []
    } catch {
      currentEvents = []
    }

    const updatedEvents = currentEvents.filter((item) => item.id !== id)
    try {
      localStorage.setItem(USER_EVENTS_KEY, JSON.stringify(updatedEvents))
    } catch {
      // Ignore write errors
    }
    return academicCalendarService.getEvents()
  },

  /**
   * Membersihkan data agenda lokal
   */
  clearUserEvents: () => {
    try {
      localStorage.removeItem(USER_EVENTS_KEY)
      localStorage.removeItem(OLD_LEGACY_KEY)
    } catch {
      // Ignore
    }
    return academicCalendarService.getEvents()
  }
}
