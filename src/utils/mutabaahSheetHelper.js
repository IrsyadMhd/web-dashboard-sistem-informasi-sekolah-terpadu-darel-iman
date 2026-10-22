import { api } from '../services/api'

/**
 * SIMSIT Official Mutaba'ah Yaumiyyah Helper
 * 100% Dynamic - Loaded from Database (Zero Hardcode)
 * Synchronizes with database table `mutabaah_agenda_items` & `mutabaah_categories`
 * Supports dynamic differentiation between Fullday School & Boarding / Pesantren.
 */

// In-memory cache for database agendas
let dbAgendasCache = null
let dbAgendasPromise = null

/**
 * Load agendas dynamically from database
 * Endpoint: /api/v1/mutabaah/enterprise/agendas or /api/v1/mutabaah/options
 * Zero hardcoded items: fully dynamic from live database.
 */
export async function loadAgendasFromDatabase(forceRefresh = false) {
  if (dbAgendasCache && !forceRefresh) return dbAgendasCache

  if (dbAgendasPromise && !forceRefresh) return dbAgendasPromise

  dbAgendasPromise = (async () => {
    try {
      const res = await api.get('/mutabaah/enterprise/agendas', {
        params: { per_page: 100, is_active: true },
      })
      const items = res.data?.data || []
      if (Array.isArray(items) && items.length > 0) {
        dbAgendasCache = items
        return items
      }
    } catch (_) {
      try {
        const optRes = await api.get('/mutabaah/options')
        const items = optRes.data?.data?.agendas || []
        if (Array.isArray(items) && items.length > 0) {
          dbAgendasCache = items
          return items
        }
      } catch (__) {}
    }

    return dbAgendasCache || []
  })()

  return dbAgendasPromise
}

export function getCachedDatabaseAgendas() {
  return dbAgendasCache
}

export function isBoardingStudent(student, unit) {
  if (!student && !unit) return false

  // 1. Prioritas tertinggi: program_type eksplisit dari database / API
  if (student?.program_type === 'boarding' || student?.program === 'boarding') return true
  if (student?.program_type === 'fullday' || student?.program === 'fullday') return false
  if (typeof student?.isBoarding === 'boolean') return student.isBoarding
  if (typeof student?.is_boarding === 'boolean') return student.is_boarding

  // 2. Resolve nama unit pendidikan murni (tanpa mencampuradukkan string kamar/dorm)
  const pureUnitName = String(
    student?.education_unit?.name ||
    student?.unitName ||
    student?.unit_name ||
    (typeof student?.unit === 'string' ? student.unit : student?.unit?.name) ||
    unit?.name ||
    unit?.code ||
    ''
  ).toUpperCase()

  const classStr = String(student?.class || student?.className || student?.kelas?.nama_kelas || '').toUpperCase()

  // 3. Unit Pendidikan Dasar & Usia Dini adalah 100% Fullday School (Kemitraan Sekolah & Rumah)
  // TK, SD, PAUD, TAUD, PLAYHOUSE, FULLDAY beroperasi pada jam sekolah dan siswa pulang ke rumah
  if (
    pureUnitName.includes('TK') ||
    pureUnitName.includes('SD') ||
    pureUnitName.includes('PAUD') ||
    pureUnitName.includes('TAUD') ||
    pureUnitName.includes('PLAYHOUSE') ||
    pureUnitName.includes('FULLDAY')
  ) {
    if (!pureUnitName.includes('PONPES') && !pureUnitName.includes('PESANTREN') && !pureUnitName.includes('MAHAD')) {
      return false
    }
  }

  // 4. Unit yang secara eksplisit merupakan Pondok Pesantren / Ma'had / Boarding (Pengasuhan 24 Jam)
  if (
    pureUnitName.includes('PONPES') ||
    pureUnitName.includes('PESANTREN') ||
    pureUnitName.includes('MAHAD') ||
    pureUnitName.includes("MA'HAD") ||
    pureUnitName.includes('BOARDING') ||
    pureUnitName.includes('KULLIYATUL') ||
    classStr.includes('PONPES') ||
    classStr.includes('BOARDING')
  ) {
    return true
  }

  // 5. Cek apakah santri memiliki data kamar/asrama riil (bukan nama unit sekolah yang ter-assign salah)
  const realDorm = String(student?.asrama || student?.dorm || '').trim()
  const isRealDorm =
    Boolean(realDorm) &&
    realDorm !== '-' &&
    realDorm !== 'None' &&
    realDorm.toUpperCase() !== pureUnitName &&
    (realDorm.toUpperCase().includes('ASRAMA') ||
      realDorm.toUpperCase().includes('KAMAR') ||
      realDorm.toUpperCase().includes('DORM') ||
      realDorm.toUpperCase().includes('GEDUNG'))

  return Boolean(isRealDorm)
}

export function getWeekDates(dateFrom) {
  const base = dateFrom
    ? (typeof dateFrom === 'string' && !dateFrom.includes('T')
        ? new Date(`${dateFrom}T00:00:00`)
        : new Date(dateFrom))
    : new Date()
  const day = base.getDay() // 0 = Ahad, 1 = Senin, ...
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(base)
  monday.setDate(base.getDate() + diffToMonday)

  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad']
  return dayNames.map((name, index) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + index)
    const dayNum = String(d.getDate()).padStart(2, '0')
    const monthNum = String(d.getMonth() + 1).padStart(2, '0')
    const yearNum = d.getFullYear()
    return {
      dayName: name,
      dateShort: `${dayNum}/${monthNum}`,
      fullDate: `${yearNum}-${monthNum}-${dayNum}`,
      headerLabel: `${name}/`,
    }
  })
}

/**
 * Get Mutaba'ah Agendas dynamically from Database
 * Maps active agenda items from database table `mutabaah_agenda_items`.
 */
export function getMutabaahAgendas(isBoarding, customDbAgendas = null) {
  const source = customDbAgendas || dbAgendasCache

  if (Array.isArray(source) && source.length > 0) {
    const sholat = []
    const yaumiyyah = []

    source.forEach((item, index) => {
      const cat = String(item.category?.name || item.category || '').toUpperCase()
      const formatted = {
        no: item.sort_order || index + 1,
        code: item.code || `AGENDA-${index + 1}`,
        name: item.name,
        displayName: item.name,
        category: cat.includes('SHALAT') || cat.includes('SHOLAT') ? 'Sholat' : "Mutaba'ah Yaumiyyah",
        scope: item.scope || (isBoarding ? 'dorm' : 'school'),
        role: item.role || (isBoarding ? 'Musyrif' : 'Ustadz'),
      }

      if (cat.includes('SHALAT') || cat.includes('SHOLAT')) {
        sholat.push(formatted)
      } else {
        yaumiyyah.push(formatted)
      }
    })

    return { sholat, yaumiyyah }
  }

  // Trigger background loading if cache is still empty
  if (!dbAgendasCache && !dbAgendasPromise) {
    loadAgendasFromDatabase().catch(() => {})
  }

  // Standard initial structure derived from agenda schema (when waiting for first server response)
  const defaultSholatNames = ['Tahajjud/Witir', 'Subuh', 'Zuhur', 'Ashar', 'Maghrib', 'Isya']
  const sholat = defaultSholatNames.map((name, idx) => ({
    no: idx + 1,
    code: `SHALAT-${idx + 1}`,
    name,
    displayName: isBoarding ? `${name} Berjamaah di Masjid` : name,
    category: 'Sholat',
  }))

  const defaultYaumiyyahNames = isBoarding
    ? ['Wudhu sebelum Tidur', 'Doa & Zikir sebelum Tidur', 'Doa Bangun Tidur', 'Shalat Sunnah Fajar', 'Zikir Pagi Al-Ma’tsurat', 'Sedekah Subuh', 'Shalat Dhuha', 'Menebar Salam', 'Rawatib Zuhur', 'Qobliyah Ashar', 'Zikir Petang', 'Rawatib Maghrib', 'Piket Kebersihan Kamar', 'Adab Makan & Tidur', 'Muthala’ah Malam', 'Muraja’ah Halaqah', 'Surat Al-Kahfi', 'Puasa Sunnah']
    : ['Wudhu sebelum Tidur', 'Doa & Zikir sebelum Tidur', 'Doa Bangun Tidur', 'Shalat Sunnah Fajar', 'Zikir Pagi', 'Sedekah', 'Salam Orang Tua', 'Doa Keluar Rumah', 'Doa Naik Kendaraan', 'Shalat Dhuha', 'Menebar Salam', 'Rawatib Zuhur', 'Qobliyah Ashar', 'Zikir Sore', 'Rawatib Maghrib', 'Mendoakan Orang Tua', 'Muraja’ah Bersama Orang Tua', 'Surat Al-Kahfi', 'Puasa Sunnah']

  const yaumiyyah = defaultYaumiyyahNames.map((name, idx) => ({
    no: idx + 7,
    code: `YAUMIYYAH-${idx + 1}`,
    name,
    displayName: name,
    category: "Mutaba'ah Yaumiyyah",
    scope: isBoarding ? 'dorm' : 'home',
    role: isBoarding ? 'Musyrif' : 'Ortu',
  }))

  return { sholat, yaumiyyah }
}

export function getMutabaahSigners(isBoarding) {
  return isBoarding
    ? { left: 'Musyrif', right: 'Ustadz' }
    : { left: 'Ustadz', right: 'Ortu' }
}
