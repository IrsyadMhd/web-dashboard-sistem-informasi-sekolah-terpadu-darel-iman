import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Compass,
  Play,
  Save,
  Database,
  RefreshCw,
  Search,
  Trash2,
  Copy,
  Check,
  MapPin,
  Calendar,
  Clock,
  Layers,
  FileCode,
  Globe,
  Sparkles,
  Server,
  Download,
} from 'lucide-react'
import { equranService } from '../services/equranService'
import ActionDropdown from '../components/app/ActionDropdown'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  MasterActionButton,
  MasterDataPage,
  MasterStatsGrid,
  MasterStatCard,
} from '../components/master-data'

function KpiTintedCard({ icon: Icon, label, subtext, value, tone = 'emerald' }) {
  const tones = {
    emerald: {
      card: 'border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 via-emerald-50/60 to-teal-50/40 hover:bg-emerald-100/90 hover:border-emerald-300 dark:border-emerald-800/80 dark:bg-emerald-950/40',
      title: 'text-emerald-800 dark:text-emerald-300',
      iconBox: 'bg-emerald-600 text-white shadow-xs',
      val: 'text-emerald-950 dark:text-white',
      sub: 'text-emerald-700/90 dark:text-emerald-400',
    },
    blue: {
      card: 'border-sky-200/90 bg-gradient-to-br from-sky-50/90 via-sky-50/60 to-blue-50/40 hover:bg-sky-100/90 hover:border-sky-300 dark:border-sky-800/80 dark:bg-sky-950/40',
      title: 'text-sky-800 dark:text-sky-300',
      iconBox: 'bg-sky-600 text-white shadow-xs',
      val: 'text-sky-950 dark:text-white',
      sub: 'text-sky-700/90 dark:text-sky-400',
    },
    amber: {
      card: 'border-amber-200/90 bg-gradient-to-br from-amber-50/90 via-amber-50/60 to-yellow-50/40 hover:bg-amber-100/90 hover:border-amber-300 dark:border-amber-800/80 dark:bg-amber-950/40',
      title: 'text-amber-800 dark:text-amber-300',
      iconBox: 'bg-amber-500 text-white shadow-xs',
      val: 'text-amber-950 dark:text-white',
      sub: 'text-amber-700/90 dark:text-amber-400',
    },
  }

  const t = tones[tone] || tones.emerald

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`text-left rounded-2xl border ${t.card} p-5 shadow-xs transition-all hover:shadow-md group`}
    >
      <div className="flex items-center justify-between">
        <p className={`text-xs font-bold uppercase tracking-wider ${t.title}`}>{label}</p>
        {Icon && (
          <div className={`p-2 rounded-xl ${t.iconBox} shrink-0 transition-transform group-hover:scale-110`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className={`mt-2 text-3xl font-black ${t.val}`}>{value ?? 0}</p>
      {subtext && (
        <p className={`mt-1.5 text-xs font-semibold ${t.sub}`}>
          {subtext}
        </p>
      )}
    </motion.div>
  )
}

export default function MasterJadwalSholatPage() {
  // State for Interactive Testing Form
  const [activeEndpoint, setActiveEndpoint] = useState('POST_SHALAT') // GET_PROVINSI | POST_KABKOTA | POST_SHALAT
  const [provinsiList, setProvinsiList] = useState([])
  const [kabkotaList, setKabkotaList] = useState([])
  const [selectedProvinsi, setSelectedProvinsi] = useState('Jawa Barat')
  const [selectedKabkota, setSelectedKabkota] = useState('Kota Bogor')
  const [selectedBulan, setSelectedBulan] = useState(new Date().getMonth() + 1)
  const [selectedTahun, setSelectedTahun] = useState(2026)

  // Testing Response & Loading
  const [loadingTest, setLoadingTest] = useState(false)
  const [apiResponse, setApiResponse] = useState(null)
  const [savingDb, setSavingDb] = useState(false)
  const [copiedCurl, setCopiedCurl] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Master Data DB Viewer State
  const [masterList, setMasterList] = useState([])
  const [masterStats, setMasterStats] = useState({ total_records: 0, total_provinsi: 0, total_kabkota: 0 })
  const [loadingMaster, setLoadingMaster] = useState(false)
  const [filterProvinsi, setFilterProvinsi] = useState('')
  const [filterKabkota, setFilterKabkota] = useState('')
  const [filterSearch, setFilterSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Load Provinces on mount
  useEffect(() => {
    fetchProvinsi()
    loadMasterFromDb()
  }, [])

  // Load Kabkota when selectedProvinsi changes
  useEffect(() => {
    if (selectedProvinsi) {
      fetchKabkota(selectedProvinsi)
    }
  }, [selectedProvinsi])

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  const fetchProvinsi = async () => {
    try {
      const res = await equranService.getProvinsi()
      if (res?.data) {
        setProvinsiList(res.data)
      }
    } catch (e) {
      console.error('Failed loading provinsi', e)
    }
  }

  const fetchKabkota = async (prov) => {
    try {
      const res = await equranService.getKabkota(prov)
      if (res?.data) {
        setKabkotaList(res.data)
        if (res.data.length > 0 && !res.data.includes(selectedKabkota)) {
          setSelectedKabkota(res.data[0])
        }
      }
    } catch (e) {
      console.error('Failed loading kabkota', e)
    }
  }

  const loadMasterFromDb = async () => {
    setLoadingMaster(true)
    try {
      const res = await equranService.getMasterShalatList({
        provinsi: filterProvinsi,
        kabkota: filterKabkota,
        search: filterSearch,
      })
      if (res?.data) {
        setMasterList(res.data)
        setMasterStats(res.stats || { total_records: res.data.length, total_provinsi: 0, total_kabkota: 0 })
      }
    } catch (e) {
      console.error('Failed loading master shalat from DB', e)
    } finally {
      setLoadingMaster(false)
    }
  }

  const handleRunTest = async () => {
    setLoadingTest(true)
    try {
      let res = null
      if (activeEndpoint === 'GET_PROVINSI') {
        res = await equranService.getProvinsi()
      } else if (activeEndpoint === 'POST_KABKOTA') {
        res = await equranService.getKabkota(selectedProvinsi)
      } else {
        res = await equranService.getJadwalShalatBulanan(
          selectedProvinsi,
          selectedKabkota,
          Number(selectedBulan),
          Number(selectedTahun)
        )
      }
      setApiResponse(res)
      showToast('Uji API berhasil dijalankan!')
    } catch (e) {
      setApiResponse({ code: 500, message: 'Gagal menjalankan uji API', error: e.message })
      showToast('Gagal menjalankan uji API', 'error')
    } finally {
      setLoadingTest(false)
    }
  }

  const handleSaveToDatabase = async () => {
    setSavingDb(true)
    try {
      let payload = {}
      if (apiResponse?.data?.jadwal) {
        payload = {
          provinsi: apiResponse.data.provinsi || selectedProvinsi,
          kabkota: apiResponse.data.kabkota || selectedKabkota,
          bulan: Number(apiResponse.data.bulan || selectedBulan),
          tahun: Number(apiResponse.data.tahun || selectedTahun),
          jadwal: apiResponse.data.jadwal,
        }
      } else {
        // Auto-fetch full monthly schedule first if not fetched yet
        const fetched = await equranService.getJadwalShalatBulanan(
          selectedProvinsi,
          selectedKabkota,
          Number(selectedBulan),
          Number(selectedTahun)
        )
        payload = {
          provinsi: selectedProvinsi,
          kabkota: selectedKabkota,
          bulan: Number(selectedBulan),
          tahun: Number(selectedTahun),
          jadwal: fetched.data?.jadwal || [],
        }
      }

      const res = await equranService.saveMasterShalat(payload)
      if (res?.success) {
        showToast(res.message || 'Data jadwal sholat berhasil disimpan ke Database!')
        loadMasterFromDb()
      } else {
        showToast(res?.message || 'Gagal menyimpan data ke database', 'error')
      }
    } catch (e) {
      console.error('Error saving to DB:', e)
      const errorMsg = e.response?.data?.message || e.message || 'Gagal menyimpan data ke database'
      showToast(errorMsg, 'error')
    } finally {
      setSavingDb(false)
    }
  }

  const handleDeleteMaster = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus rekord master ini?')) return
    try {
      const res = await equranService.deleteMasterShalat(id)
      if (res?.success) {
        showToast(res.message)
        loadMasterFromDb()
      }
    } catch (e) {
      showToast('Gagal menghapus data master', 'error')
    }
  }

  const getCurlSnippet = () => {
    if (activeEndpoint === 'GET_PROVINSI') {
      return `curl -X GET "https://equran.id/api/v2/shalat/provinsi"`
    }
    if (activeEndpoint === 'POST_KABKOTA') {
      return `curl -X POST "https://equran.id/api/v2/shalat/kabkota" \\\n  -H "Content-Type: application/json" \\\n  -d '{"provinsi": "${selectedProvinsi}"}'`
    }
    return `curl -X POST "https://equran.id/api/v2/shalat" \\\n  -H "Content-Type: application/json" \\\n  -d '{"provinsi": "${selectedProvinsi}", "kabkota": "${selectedKabkota}", "bulan": ${selectedBulan}, "tahun": ${selectedTahun}}'`
  }

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(getCurlSnippet())
    setCopiedCurl(true)
    setTimeout(() => setCopiedCurl(false), 2000)
  }

  const exportToCsv = () => {
    if (masterList.length === 0) return
    const headers = ['Provinsi', 'KabKota', 'Tanggal', 'Hari', 'Imsak', 'Subuh', 'Terbit', 'Dhuha', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya']
    const rows = masterList.map((m) => [
      m.provinsi || '',
      m.kabkota_name || '',
      m.tanggal_lengkap || m.tanggal || '',
      m.hari || '',
      m.imsak || '',
      m.subuh || '',
      m.terbit || '',
      m.dhuha || '',
      m.dzuhur || '',
      m.ashar || '',
      m.maghrib || '',
      m.isya || '',
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Master_Jadwal_Sholat_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const bulanNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  return (
    <PageContainer maxW="7xl">
      <AppBreadcrumb className="mb-6" items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Jadwal Sholat' }]} />
      <MasterDataPage className="education-unit-page sholat-master-page" hideBreadcrumb>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-xl text-white font-medium flex items-center gap-2 transition-all ${
            toastMessage.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiTintedCard
          label="Rekord Master Tersimpan"
          value={`${masterStats.total_records || masterList.length} Hari`}
          subtext="Data jadwal dalam DB"
          icon={Database}
          tone="emerald"
        />
        <KpiTintedCard
          label="Provinsi Tercover"
          value={`${masterStats.total_provinsi || 0} / 34`}
          subtext="Seluruh provinsi Indonesia"
          icon={Globe}
          tone="blue"
        />
        <KpiTintedCard
          label="Kab/Kota Tercover"
          value={`${masterStats.total_kabkota || 0} / 517`}
          subtext="Kota dan kabupaten"
          icon={MapPin}
          tone="amber"
        />
      </div>

      {/* Interactive Testing & API Pull Panel (Postman-style) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Testing Interaktif & Tarik Data API EQuran.id</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Uji semua endpoint secara real-time dan simpan hasilnya ke database master.</p>
            </div>
          </div>

          {/* Endpoint Selector Tabs */}
          <div className="flex bg-slate-200 dark:bg-slate-700/60 p-1 rounded-xl gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveEndpoint('GET_PROVINSI')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeEndpoint === 'GET_PROVINSI'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Data Provinsi
            </button>
            <button
              onClick={() => setActiveEndpoint('POST_KABKOTA')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeEndpoint === 'POST_KABKOTA'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Data Kab/Kota
            </button>
            <button
              onClick={() => setActiveEndpoint('POST_SHALAT')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeEndpoint === 'POST_SHALAT'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Data Bulanan
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Controls */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" /> Cari Data
              </h3>

              {/* Provinsi Select */}
              {activeEndpoint !== 'GET_PROVINSI' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Provinsi (Wajib)
                  </label>
                  <select
                    value={selectedProvinsi}
                    onChange={(e) => setSelectedProvinsi(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {provinsiList.map((prov, i) => (
                      <option key={i} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Kabkota Select */}
              {activeEndpoint === 'POST_SHALAT' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Kabupaten / Kota (Wajib)
                  </label>
                  <select
                    value={selectedKabkota}
                    onChange={(e) => setSelectedKabkota(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {kabkotaList.map((kab, i) => (
                      <option key={i} value={kab}>
                        {kab}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Month & Year Select */}
              {activeEndpoint === 'POST_SHALAT' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Bulan (1-12)
                    </label>
                    <select
                      value={selectedBulan}
                      onChange={(e) => setSelectedBulan(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {bulanNames.map((name, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          {idx + 1} - {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Tahun
                    </label>
                    <input
                      type="number"
                      value={selectedTahun}
                      onChange={(e) => setSelectedTahun(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleRunTest}
                  disabled={loadingTest}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow border border-emerald-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Play className={`w-4 h-4 ${loadingTest ? 'animate-spin' : ''}`} />
                  {loadingTest ? 'Memuat Data...' : 'Lihat Data'}
                </button>

                <button
                  onClick={handleSaveToDatabase}
                  disabled={savingDb}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow border border-teal-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
                  title="Simpan Jadwal Sholat ke Database Master"
                >
                  <Save className={`w-4 h-4 ${savingDb ? 'animate-spin' : ''}`} />
                  {savingDb ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>

          {/* Response UI/UX Data Preview */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-slate-900 text-slate-100 rounded-xl p-5 flex-1 flex flex-col border border-slate-800 shadow-inner min-h-[340px]">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  <span className="text-xs font-bold tracking-wider uppercase text-slate-200">
                    PRATINJAU HASIL DATA {apiResponse?.code ? `(Status: ${apiResponse.code})` : ''}
                  </span>
                </div>
                {apiResponse && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                    {apiResponse.message || '200 OK'}
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-auto max-h-[380px]">
                {!apiResponse ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-12">
                    <Server className="w-12 h-12 stroke-[1.5] mb-2 opacity-40 text-emerald-500" />
                    <p className="font-semibold text-slate-400">Data belum ada</p>
                  </div>
                ) : Array.isArray(apiResponse.data) ? (
                  /* Render Grid of Provinces / KabKota */
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Globe className="w-4 h-4" /> Total Data Ditemukan: {apiResponse.data.length} Wilayah
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {apiResponse.data.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 p-2.5 rounded-lg text-xs font-medium text-slate-200 flex items-center gap-2 transition-all"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : apiResponse.data?.jadwal ? (
                  /* Render Monthly Schedule Preview */
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-emerald-900/60 to-teal-900/60 p-3.5 rounded-xl border border-emerald-700/40 flex flex-wrap justify-between items-center gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-emerald-200">
                          {apiResponse.data.provinsi} - {apiResponse.data.kabkota}
                        </h4>
                        <p className="text-xs text-emerald-300/80">
                          Jadwal Shalat Bulanan: {apiResponse.data.bulan_nama || `Bulan ${apiResponse.data.bulan}`} {apiResponse.data.tahun}
                        </p>
                      </div>
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30 font-semibold">
                        {apiResponse.data.jadwal.length} Hari
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-800 text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-700">
                          <tr>
                            <th className="py-2 px-3">Tgl</th>
                            <th className="py-2 px-3">Hari</th>
                            <th className="py-2 px-2 text-center text-slate-400">Imsak</th>
                            <th className="py-2 px-2 text-center text-emerald-400">Subuh</th>
                            <th className="py-2 px-2 text-center text-amber-400">Dzuhur</th>
                            <th className="py-2 px-2 text-center text-indigo-400">Ashar</th>
                            <th className="py-2 px-2 text-center text-orange-400">Maghrib</th>
                            <th className="py-2 px-2 text-center text-purple-400">Isya</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {apiResponse.data.jadwal.slice(0, 10).map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/40 text-slate-300">
                              <td className="py-2 px-3 font-mono font-bold text-emerald-400">{row.tanggal}</td>
                              <td className="py-2 px-3">{row.hari}</td>
                              <td className="py-2 px-2 text-center font-mono text-slate-400">{row.imsak}</td>
                              <td className="py-2 px-2 text-center font-mono font-semibold text-emerald-300">{row.subuh}</td>
                              <td className="py-2 px-2 text-center font-mono text-amber-300">{row.dzuhur}</td>
                              <td className="py-2 px-2 text-center font-mono text-indigo-300">{row.ashar}</td>
                              <td className="py-2 px-2 text-center font-mono font-semibold text-orange-300">{row.maghrib}</td>
                              <td className="py-2 px-2 text-center font-mono text-purple-300">{row.isya}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {apiResponse.data.jadwal.length > 10 && (
                        <p className="text-center py-2 text-[11px] text-slate-500 italic bg-slate-800/30">
                          Menampilkan 10 dari {apiResponse.data.jadwal.length} hari... (Klik "Simpan" untuk memasukkan seluruh data ke Database Master)
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-800 rounded-lg text-xs text-slate-300">
                    <p className="font-semibold text-emerald-400">{apiResponse.message || 'Respon berhasil diterima'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Master Data Table Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Master Data Sholat Tersimpan di Database</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Menampilkan daftar jadwal sholat harian yang tersimpan dan siap digunakan untuk sistem absensi/mutaba'ah.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari provinsi, kota, hari..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadMasterFromDb()}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48"
              />
            </div>

            <button
              onClick={loadMasterFromDb}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition-all"
            >
              <Search className="w-3.5 h-3.5" /> Filter Data
            </button>

            <MasterActionButton
              variant="export"
              icon={Download}
              disabled={masterList.length === 0}
              onClick={exportToCsv}
            >
              Export CSV
            </MasterActionButton>
          </div>
        </div>

        {/* Master Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Provinsi</th>
                <th className="py-3 px-4">Kab / Kota</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Hari</th>
                <th className="py-3 px-3 text-center text-slate-500">Imsak</th>
                <th className="py-3 px-3 text-center text-emerald-600 dark:text-emerald-400">Subuh</th>
                <th className="py-3 px-3 text-center text-slate-500">Terbit</th>
                <th className="py-3 px-3 text-center text-amber-600 dark:text-amber-400">Dhuha</th>
                <th className="py-3 px-3 text-center text-blue-600 dark:text-blue-400">Dzuhur</th>
                <th className="py-3 px-3 text-center text-indigo-600 dark:text-indigo-400">Ashar</th>
                <th className="py-3 px-3 text-center text-orange-600 dark:text-orange-400">Maghrib</th>
                <th className="py-3 px-3 text-center text-purple-600 dark:text-purple-400">Isya</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {loadingMaster ? (
                <tr>
                  <td colSpan="13" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    Memuat data master sholat dari database...
                  </td>
                </tr>
              ) : masterList.length === 0 ? (
                <tr>
                  <td colSpan="13" className="py-12 text-center text-slate-400">
                    Belum ada master data sholat tersimpan di database.
                    <br />
                    <span className="text-xs text-slate-500">
                      Gunakan panel "Testing Interaktif & Tarik Data API" di atas lalu klik "Simpan ke DB".
                    </span>
                  </td>
                </tr>
              ) : (
                masterList.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {row.provinsi || 'Jawa Barat'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {row.kabkota_name || 'Kota Bogor'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {row.tanggal_lengkap || row.tanggal}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {row.hari || '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-500">{row.imsak || '-'}</td>
                    <td className="py-3 px-3 text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20">
                      {row.subuh}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-500">{row.terbit || '-'}</td>
                    <td className="py-3 px-3 text-center font-mono text-amber-600 dark:text-amber-400">{row.dhuha || '-'}</td>
                    <td className="py-3 px-3 text-center font-mono font-medium text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/20">
                      {row.dzuhur}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium text-indigo-600 dark:text-indigo-400">
                      {row.ashar}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-semibold text-orange-600 dark:text-orange-400 bg-orange-50/30 dark:bg-orange-950/20">
                      {row.maghrib}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium text-purple-600 dark:text-purple-400">
                      {row.isya}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">
                        <ActionDropdown onDelete={() => handleDeleteMaster(row.id)} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MasterDataPage>
    </PageContainer>
  )
}
