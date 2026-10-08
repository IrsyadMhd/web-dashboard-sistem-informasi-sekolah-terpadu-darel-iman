import { api } from './api'

const unwrap = (response) => response?.data?.data ?? response?.data ?? {}

export const reportService = {
  attendance: async (params = {}) => {
    try {
      const res = await api.get('/lesson-attendance/report', { params })
      return res?.data?.data ?? res?.data ?? {}
    } catch {
      const res2 = await api.get('/attendance/reports/summary', { params })
      return res2?.data?.data ?? res2?.data ?? {}
    }
  },
  employees: async (params = {}) => unwrap(await api.get('/employees', { params: { ...params, per_page: 100 } })),
  employeeStats: async () => unwrap(await api.get('/employees/dashboard')),
  grades: async (params = {}) => unwrap(await api.get('/grades', { params: { ...params, per_page: 100 } })),
  materialStats: async () => unwrap(await api.get('/lms/materi/stats')),
  assignmentStats: async () => unwrap(await api.get('/lms/penugasan/stats')),
  submissionStats: async () => unwrap(await api.get('/lms/pengumpulan-tugas/stats')),
  reportCardStats: async (params = {}) => unwrap(await api.get('/lms/rapor/stats', { params })),
  submissions: async (params = {}) => unwrap(await api.get('/lms/pengumpulan-tugas', { params: { ...params, per_page: 100 } })),
  tahfizhReport: async (params = {}) => unwrap(await api.get('/tahfizh/report', { params })),
  tahfizhAnalytics: async () => unwrap(await api.get('/mutabaah/analytics/recap')),
  alumni: async (params = {}) => unwrap(await api.get('/alumni', { params })),
  alumniStats: async () => unwrap(await api.get('/alumni/stats')),
  notifications: async (params = {}) => unwrap(await api.get('/notifications', { params })),
  notificationUnreadCount: async () => unwrap(await api.get('/notifications/unread-count')),
  markNotificationRead: async (id) => unwrap(await api.post(`/notifications/${id}/read`)),
  markAllNotificationsRead: async () => unwrap(await api.post('/notifications/mark-all-read')),

  // Foundation Report Endpoints
  getFoundationSdmReport: async (params = {}) => unwrap(await api.get('/foundation/laporan/sdm', { params })),
  getFoundationSdmDetail: async (id) => unwrap(await api.get(`/foundation/laporan/sdm/detail/${id}`)),

  getFoundationSiswaReport: async (params = {}) => unwrap(await api.get('/foundation/laporan/siswa', { params })),
  getFoundationSiswaDetail: async (id) => unwrap(await api.get(`/foundation/laporan/siswa/detail/${id}`)),

  getFoundationMutasiReport: async (params = {}) => unwrap(await api.get('/foundation/laporan/mutasi', { params })),
  getFoundationMutasiDetail: async (id) => unwrap(await api.get(`/foundation/laporan/mutasi/detail/${id}`)),

  getFoundationKelulusanReport: async (params = {}) => unwrap(await api.get('/foundation/laporan/kelulusan', { params })),
  getFoundationKelulusanDetail: async (id) => unwrap(await api.get(`/foundation/laporan/kelulusan/detail/${id}`)),

  getFoundationAlumniReport: async (params = {}) => unwrap(await api.get('/foundation/laporan/alumni', { params })),
  getFoundationAlumniDetail: async (id) => unwrap(await api.get(`/foundation/laporan/alumni/detail/${id}`)),

  getFoundationLintasUnitReport: async (params = {}) => unwrap(await api.get('/foundation/laporan/lintas-unit', { params })),

  getFoundationPrestasiReport: async (params = {}) => unwrap(await api.get('/foundation/laporan/prestasi', { params })),
  getFoundationPrestasiDetail: async (id) => unwrap(await api.get(`/foundation/laporan/prestasi/detail/${id}`)),

  // Dual-Role Prestasi Report (Foundation vs Unit School)
  getPrestasiReport: async (params = {}, user = null, isFoundation = true) => {
    if (isFoundation) {
      return unwrap(await api.get('/foundation/laporan/prestasi', { params }))
    }
    const cleanParams = { ...params }
    if (cleanParams.unit_id === 'all' || cleanParams.unit_id === 'semua') {
      delete cleanParams.unit_id
    }
    const res = await api.get('/dashboard-pemantauan/rekap-prestasi-siswa', { params: cleanParams })
    const raw = res?.data ?? {}
    return adaptUnitPrestasiResponse(raw, user, params)
  },
  getPrestasiDetail: async (id, isFoundation = true) => {
    if (isFoundation) {
      return unwrap(await api.get(`/foundation/laporan/prestasi/detail/${id}`))
    }
    const res = await api.get(`/dashboard-pemantauan/rekap-prestasi-siswa/${id}`)
    return adaptUnitPrestasiDetail(res?.data ?? {})
  },

  exportFoundationReport: async (type, params = {}) => {
    const token = sessionStorage.getItem('school_erp_token') || localStorage.getItem('school_erp_token')
    try {
      const response = await api.get(`/foundation/laporan/${type}/export`, {
        params,
        responseType: 'blob',
      })
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || (params.format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
      })
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      const contentDisposition = response.headers['content-disposition']
      let fileName = `Laporan_${type}_${new Date().toISOString().slice(0, 10)}.${params.format === 'pdf' ? 'pdf' : 'xlsx'}`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/)
        if (match && match[1]) fileName = match[1]
      }
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.warn('Axios blob export fallback to URL open:', err)
      const queryParams = new URLSearchParams({ ...params })
      if (token) queryParams.set('token', token)
      const url = `${api.defaults.baseURL}/foundation/laporan/${type}/export?${queryParams.toString()}`
      window.open(url, '_blank')
    }
  },
}

export function adaptUnitPrestasiResponse(rawResponse, user = null, filters = {}) {
  const items = Array.isArray(rawResponse?.data)
    ? rawResponse.data
    : Array.isArray(rawResponse)
    ? rawResponse
    : []

  const total = Number(rawResponse?.total ?? items.length)
  const currentPage = Number(rawResponse?.current_page ?? filters.page ?? 1)
  const perPage = Number(rawResponse?.per_page ?? filters.per_page ?? 15)
  const lastPage = Number(rawResponse?.last_page ?? (Math.ceil(total / (perPage || 15)) || 1))

  const firstItem = items[0]
  const resolvedUnitName =
    user?.unit?.name ||
    user?.unit_name ||
    firstItem?.siswa?.education_unit?.name ||
    firstItem?.data_tambahan?.unit_name ||
    'Mahad Abu Ja\'far'

  const resolvedUnitCode =
    user?.unit?.code ||
    user?.unit_code ||
    firstItem?.siswa?.education_unit?.code ||
    (resolvedUnitName.toLowerCase().includes('mahad') ? 'MAHAD-01' : 'UNIT')

  const unitName = resolvedUnitName
  const unitCode = resolvedUnitCode
  const principalName = user?.name || 'Kepala Sekolah'

  // Summary aggregation
  const uniqueStudents = new Set()
  let countTahfizh = 0
  let countSantri = 0
  let countOlahraga = 0
  let countLomba = 0
  let countAkademik = 0
  let countNasional = 0
  let countProvinsi = 0
  let countKabKota = 0
  let countInternal = 0

  const details = items.map((item) => {
    const student = item.siswa || item.student || {}
    const sId = item.id_siswa || student.id || item.id
    if (sId) uniqueStudents.add(sId)

    const jenis = String(item.jenis_prestasi || '').toLowerCase()
    if (jenis.includes('tahfizh')) countTahfizh++
    else if (jenis.includes('santri') || jenis.includes('adab')) countSantri++
    else if (jenis.includes('olahraga') || jenis.includes('seni') || jenis.includes('ekskul')) countOlahraga++
    else if (jenis.includes('lomba')) countLomba++
    else countAkademik++

    const tingkat = String(item.tingkat_prestasi || '')
    if (tingkat.toLowerCase().includes('nasional')) countNasional++
    else if (tingkat.toLowerCase().includes('provinsi')) countProvinsi++
    else if (tingkat.toLowerCase().includes('kabupaten') || tingkat.toLowerCase().includes('kota')) countKabKota++
    else countInternal++

    const rowUnitName =
      student.education_unit?.name ||
      item.data_tambahan?.unit_name ||
      unitName

    const rowUnitCode =
      student.education_unit?.code ||
      (rowUnitName.toLowerCase().includes('mahad') ? 'MAHAD-01' : unitCode)

    const rowClassName =
      student.kelas?.nama_kelas ||
      student.kelas?.name ||
      item.data_tambahan?.kelas_name ||
      item.class_name ||
      'Kelas Terdaftar'

    return {
      id: item.id,
      student_id: sId,
      student_name: student.full_name || item.student_name || 'Siswa',
      nis: student.nis || item.nis || '-',
      unit_code: rowUnitCode,
      unit_name: rowUnitName,
      class_name: rowClassName,
      nama_prestasi: item.nama_prestasi || '-',
      jenis_prestasi: item.jenis_prestasi || 'akademik',
      tingkat_prestasi: item.tingkat_prestasi || 'Internal Sekolah',
      tanggal_prestasi: item.tanggal_prestasi ? String(item.tanggal_prestasi).slice(0, 10) : '-',
      nilai_prestasi: Number(item.nilai_prestasi || 0),
      tahun_ajaran: item.tahun_ajaran || '2026/2027',
      keterangan: item.keterangan || '-',
      avatar_url: student.avatar_url || null,
      student: {
        id: sId,
        full_name: student.full_name || item.student_name || 'Siswa',
        nis: student.nis || item.nis || '-',
        avatar_url: student.avatar_url || null,
      },
    }
  })

  const totalCount = total || details.length
  const totalSiswaBerprestasi = uniqueStudents.size || details.length

  const summary = {
    total_prestasi: totalCount,
    total_siswa_berprestasi: totalSiswaBerprestasi,
    tingkat_nasional: countNasional,
    tingkat_provinsi: countProvinsi,
    tingkat_kab_kota: countKabKota,
    tingkat_internal: countInternal,
    kategori_tahfizh: countTahfizh,
    kategori_santri: countSantri,
    kategori_olahraga: countOlahraga,
    kategori_lomba: countLomba,
    kategori_akademik: countAkademik,
  }

  const topStudent = details[0]
    ? {
        full_name: details[0].student_name,
        avatar_url: details[0].avatar_url,
      }
    : null

  const unit_recaps = [
    {
      unit_id: user?.unit_id || 'unit-user',
      unit_code: unitCode,
      unit_name: unitName,
      principal_name: principalName,
      total_prestasi: totalCount,
      siswa_berprestasi_count: totalSiswaBerprestasi,
      tahfizh_count: countTahfizh,
      santri_count: countSantri,
      olahraga_count: countOlahraga,
      lomba_count: countLomba,
      akademik_count: countAkademik,
      top_student: topStudent,
    },
  ]

  const unit_recaps_total = {
    unit_name: `Total ${unitName}`,
    total_prestasi: totalCount,
    siswa_berprestasi_count: totalSiswaBerprestasi,
    tahfizh_count: countTahfizh,
    santri_count: countSantri,
    olahraga_count: countOlahraga,
    lomba_count: countLomba,
    akademik_count: countAkademik,
  }

  const kepala_sekolah_recaps = [
    {
      unit_id: user?.unit_id || 'unit-user',
      unit_name: unitName,
      kepala_sekolah_name: principalName,
      total_prestasi_diverifikasi: totalCount,
      total_prestasi_menunggu: 0,
      tingkat_tertinggi: countNasional > 0 ? 'Nasional' : countProvinsi > 0 ? 'Provinsi' : 'Internal Sekolah',
      skor_rata_rata: details.length > 0 ? Math.round(details.reduce((a, b) => a + b.nilai_prestasi, 0) / details.length) : 0,
      status_laporan: 'Tervalidasi Unit',
    },
  ]

  const divisi_pendidikan_recaps = {
    total_unit_berpartisipasi: 1,
    total_keseluruhan: totalCount,
    distribusi_kategori: [
      { name: 'Tahfizh Al-Qur’an', count: countTahfizh, percent: totalCount > 0 ? Math.round((countTahfizh / totalCount) * 100) : 0, color: '#10B981' },
      { name: 'Adab & Karakter Santri', count: countSantri, percent: totalCount > 0 ? Math.round((countSantri / totalCount) * 100) : 0, color: '#06B6D4' },
      { name: 'Olahraga & Ekskul', count: countOlahraga, percent: totalCount > 0 ? Math.round((countOlahraga / totalCount) * 100) : 0, color: '#F59E0B' },
      { name: 'Lomba Pembelajaran', count: countLomba, percent: totalCount > 0 ? Math.round((countLomba / totalCount) * 100) : 0, color: '#8B5CF6' },
      { name: 'Akademik Umum', count: countAkademik, percent: totalCount > 0 ? Math.round((countAkademik / totalCount) * 100) : 0, color: '#EC4899' },
    ],
    distribusi_tingkat: [
      { name: 'Tingkat Nasional', count: countNasional, percent: totalCount > 0 ? Math.round((countNasional / totalCount) * 100) : 0 },
      { name: 'Tingkat Provinsi', count: countProvinsi, percent: totalCount > 0 ? Math.round((countProvinsi / totalCount) * 100) : 0 },
      { name: 'Tingkat Kota/Kabupaten', count: countKabKota, percent: totalCount > 0 ? Math.round((countKabKota / totalCount) * 100) : 0 },
      { name: 'Internal Sekolah', count: countInternal, percent: totalCount > 0 ? Math.round((countInternal / totalCount) * 100) : 0 },
    ],
  }

  const top_students_cards = details.slice(0, 3).map((d) => ({
    id: d.id,
    student_id: d.student_id,
    full_name: d.student_name,
    student_name: d.student_name,
    avatar_url: d.avatar_url,
    unit_name: unitName,
    unit_code: unitCode,
    class_name: d.class_name,
    nama_prestasi: d.nama_prestasi,
    badge_kategori: d.jenis_prestasi,
    tingkat_prestasi: d.tingkat_prestasi,
    jenis_prestasi: d.jenis_prestasi,
    nilai_prestasi: d.nilai_prestasi,
  }))

  const charts = {
    unit_comparison: [
      { unit_name: unitCode, jumlah_prestasi: totalCount },
    ],
  }

  const insights = [
    {
      type: 'success',
      title: 'Rekapitulasi Prestasi Siswa Terpadu',
      description: `Tercatat ${totalCount} capaian prestasi siswa pada unit ${unitName}.`,
    },
  ]

  const periodLabel = filters.period === 'month' ? 'Bulan Ini' : filters.period === 'all' ? 'Semua Periode' : 'Tahun 2026'

  return {
    summary,
    unit_recaps,
    unit_recaps_total,
    kepala_sekolah_recaps,
    divisi_pendidikan_recaps,
    top_students_cards,
    details,
    charts,
    insights,
    meta: {
      total: totalCount,
      current_page: currentPage,
      last_page: lastPage,
      per_page: perPage,
    },
    report: {
      title: `Laporan Rekapitulasi Prestasi Siswa ${unitName}`,
      description: `Rekapitulasi capaian prestasi siswa unit ${unitName} terverifikasi sistem.`,
      period: {
        label: periodLabel,
      },
    },
  }
}

export function adaptUnitPrestasiDetail(raw) {
  const item = raw?.data ?? raw ?? {}
  const student = item.siswa || item.student || {}
  return {
    ...item,
    student: {
      id: student.id || item.id_siswa,
      full_name: student.full_name || item.student_name || 'Siswa',
      nis: student.nis || item.nis || '-',
      avatar_url: student.avatar_url || null,
    },
    student_name: student.full_name || item.student_name || 'Siswa',
    nis: student.nis || item.nis || '-',
    unit_name: student.unit?.name || item.unit_name || 'Unit Sekolah',
    class_name: student.kelas?.name || item.class_name || 'Kelas Terdaftar',
    nama_prestasi: item.nama_prestasi || '-',
    tingkat_prestasi: item.tingkat_prestasi || 'Internal Sekolah',
    jenis_prestasi: item.jenis_prestasi || 'akademik',
    tanggal_prestasi: item.tanggal_prestasi ? String(item.tanggal_prestasi).slice(0, 10) : '-',
    nilai_prestasi: Number(item.nilai_prestasi || 0),
    keterangan: item.keterangan || '-',
  }
}

export default reportService

