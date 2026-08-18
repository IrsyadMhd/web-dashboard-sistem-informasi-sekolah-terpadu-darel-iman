import { useState, useEffect } from 'react'
import {
  UploadCloud,
  FileText,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  BookOpen,
  Eye,
  ExternalLink,
  File,
  AlertTriangle,
  FileCheck,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { lmsPengumpulanTugasService } from '../services/lmsPengumpulanTugasService'
import { api } from '../services/api'
import {
  AppPageHeader,
  KpiCard,
  AppFilterBar,
  AppSearch,
  ActionDropdown,
  AppModal,
  AppDrawer,
  PersonAvatar,
  PersonIdentityCell,
} from '../components/app'

export default function LmsPengumpulanTugasPage({ embedded, hidePageHeader, tabNav }) {
  const [dataPengumpulan, setDataPengumpulan] = useState([])
  const [options, setOptions] = useState({
    penugasan: [],
    siswa: [],
    status: [
      { id: 'belum', label: 'Belum Kumpul' },
      { id: 'dikumpulkan', label: 'Dikumpulkan' },
      { id: 'terlambat', label: 'Terlambat' },
      { id: 'dinilai', label: 'Sudah Dinilai' },
      { id: 'revisi', label: 'Perlu Revisi' },
    ],
  })

  const [stats, setStats] = useState({
    total: 0,
    dikumpulkan: 0,
    terlambat: 0,
    dinilai: 0,
    belum_dinilai: 0,
    revisi: 0,
  })

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Filters & Pagination
  const [search, setSearch] = useState('')
  const [selectedPenugasan, setSelectedPenugasan] = useState('')
  const [selectedSiswa, setSelectedSiswa] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  // Modal Form State (Submit / Grade / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const [formData, setFormData] = useState({
    penugasan_id: '',
    siswa_id: '',
    file: '',
    link: '',
    catatan: '',
    nilai: '',
    status: 'dikumpulkan',
  })

  // Detail Drawer State
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const fetchOptionsAndStats = async () => {
    try {
      let penugasanOptions = []
      let siswaOptions = []

      try {
        const optRes = await lmsPengumpulanTugasService.getOptions()
        const optData = optRes?.data || optRes
        if (optData) {
          if (Array.isArray(optData.penugasan) && optData.penugasan.length > 0) {
            penugasanOptions = optData.penugasan
          }
          if (Array.isArray(optData.siswa) && optData.siswa.length > 0) {
            siswaOptions = optData.siswa
          }
        }
      } catch (errOpt) {
        console.warn('Error from main options endpoint:', errOpt)
      }

      // Fallback for Penugasan if empty
      if (penugasanOptions.length === 0) {
        try {
          const penRes = await api.get('/lms/penugasan', { params: { per_page: 100 } })
          const penList = penRes?.data?.data || penRes?.data || []
          if (Array.isArray(penList)) {
            penugasanOptions = penList.map((p) => ({
              id: p.id,
              label: p.judul_tugas || p.judul || 'Penugasan',
              subject: p.subject?.nama_mapel || p.subject?.name || (typeof p.subject === 'string' ? p.subject : null),
              kelas: p.kelas?.nama_kelas || p.kelas?.kode_kelas || (typeof p.kelas === 'string' ? p.kelas : null),
            }))
          }
        } catch (errPen) {
          console.warn('Fallback penugasan error:', errPen)
        }
      }

      // Fallback for Siswa if empty
      if (siswaOptions.length === 0) {
        try {
          const stdRes = await api.get('/students', { params: { per_page: 100 } })
          const stdList = stdRes?.data?.data || stdRes?.data || []
          if (Array.isArray(stdList)) {
            siswaOptions = stdList.map((s) => ({
              id: s.id,
              label: s.full_name || s.name || s.nama_lengkap || 'Siswa',
              nisn: s.nisn || s.metadata?.nisn || null,
            }))
          }
        } catch (errStd) {
          console.warn('Fallback student error:', errStd)
        }
      }

      setOptions((prev) => ({
        ...prev,
        penugasan: penugasanOptions,
        siswa: siswaOptions,
      }))

      try {
        const statRes = await lmsPengumpulanTugasService.getStats()
        if (statRes && (statRes.data || statRes.total !== undefined)) {
          setStats(statRes.data || statRes)
        }
      } catch (errStat) {
        console.warn('Error fetching stats:', errStat)
      }
    } catch (err) {
      console.error('Error in fetchOptionsAndStats:', err)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const params = {
        page,
        per_page: 15,
        search: search || undefined,
        penugasan_id: selectedPenugasan || undefined,
        siswa_id: selectedSiswa || undefined,
        status: selectedStatus || undefined,
      }
      const res = await lmsPengumpulanTugasService.getDaftar(params)
      if (res && res.data) {
        setDataPengumpulan(res.data)
        if (res.meta) {
          setPagination({
            current_page: res.meta.current_page || 1,
            last_page: res.meta.last_page || 1,
            total: res.meta.total || res.data.length,
            per_page: res.meta.per_page || 15,
          })
        }
      }
    } catch (err) {
      setErrorMsg('Gagal memuat data pengumpulan tugas.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOptionsAndStats()
  }, [])

  useEffect(() => {
    fetchData()
  }, [page, selectedPenugasan, selectedSiswa, selectedStatus])

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault()
    setPage(1)
    fetchData()
  }

  const handleResetFilter = () => {
    setSearch('')
    setSelectedPenugasan('')
    setSelectedSiswa('')
    setSelectedStatus('')
    setPage(1)
  }

  const handleOpenCreateModal = () => {
    setEditId(null)
    setFormData({
      penugasan_id: '',
      siswa_id: '',
      file: '',
      link: '',
      catatan: '',
      nilai: '',
      status: 'dikumpulkan',
    })
    if (options.penugasan.length === 0 || options.siswa.length === 0) {
      fetchOptionsAndStats()
    }
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item) => {
    setEditId(item.id)
    setFormData({
      penugasan_id: item.penugasan_id || '',
      siswa_id: item.siswa_id || '',
      file: item.file || item.file_path || '',
      link: item.link || item.url_link || '',
      catatan: item.catatan || item.catatan_guru || item.jawaban_teks || '',
      nilai: item.nilai !== null && item.nilai !== undefined ? item.nilai : (item.nilai_guru ?? ''),
      status: item.status || 'dikumpulkan',
    })
    setIsModalOpen(true)
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const payload = {
        penugasan_id: formData.penugasan_id,
        siswa_id: formData.siswa_id,
        file: formData.file,
        link: formData.link,
        catatan: formData.catatan,
        nilai: formData.nilai !== '' ? parseFloat(formData.nilai) : null,
        status: formData.status,
      }

      if (editId) {
        await lmsPengumpulanTugasService.update(editId, payload)
        setSuccessMsg('Pengumpulan tugas & penilaian berhasil diperbarui.')
      } else {
        await lmsPengumpulanTugasService.create(payload)
        setSuccessMsg('Submission pengumpulan tugas baru berhasil ditambahkan.')
      }

      setIsModalOpen(false)
      fetchData()
      fetchOptionsAndStats()
    } catch (err) {
      console.error(err)
      const errRes = err.response?.data?.message || 'Gagal menyimpan pengumpulan tugas.'
      setErrorMsg(errRes)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id, namaSiswa) => {
    const result = await Swal.fire({
      title: 'Hapus Submission?',
      text: `Apakah Anda yakin ingin menghapus data pengumpulan tugas dari ${namaSiswa || 'Siswa'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0E5C44',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white',
      },
    })

    if (result.isConfirmed) {
      try {
        await lmsPengumpulanTugasService.delete(id)
        Swal.fire({
          title: 'Berhasil!',
          text: 'Data pengumpulan tugas berhasil dihapus.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        })
        fetchData()
        fetchOptionsAndStats()
      } catch (err) {
        console.error(err)
        Swal.fire('Error!', 'Gagal menghapus data pengumpulan tugas.', 'error')
      }
    }
  }

  const handleOpenDetail = (item) => {
    setSelectedDetail(item)
    setIsDetailOpen(true)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'dinilai':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Sudah Dinilai
          </span>
        )
      case 'dikumpulkan':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900">
            <UploadCloud className="w-3.5 h-3.5" />
            Dikumpulkan
          </span>
        )
      case 'terlambat':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900">
            <Clock className="w-3.5 h-3.5" />
            Terlambat
          </span>
        )
      case 'revisi':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900">
            <AlertTriangle className="w-3.5 h-3.5" />
            Perlu Revisi
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5" />
            Belum Kumpul
          </span>
        )
    }
  }

  const activeFilterCount =
    (selectedPenugasan ? 1 : 0) + (selectedSiswa ? 1 : 0) + (selectedStatus ? 1 : 0) + (search ? 1 : 0)

  return (
    <div className="space-y-6 pb-12">
      {/* Master Canonical Page Header (Hidden when embedded) */}
      {!embedded && !hidePageHeader && (
        <AppPageHeader
          variant="brand"
          icon={UploadCloud}
          eyebrow="LMS Pelaksanaan Pembelajaran"
          title="Pengumpulan Tugas Siswa"
          description="Kelola submission tugas siswa, riwayat pengumpulan file & link, serta proses koreksi dan penilaian hasil kerja secara terpadu."
          actions={
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0E5C44] font-semibold text-sm shadow-lg hover:bg-emerald-50 transition-all duration-200 active:scale-95 dark:bg-slate-900 dark:text-[#3FBF75] dark:hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" />
              Input / Kumpul Tugas
            </button>
          }
        />
      )}

      {/* Alert Notifications */}
      {successMsg && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium dark:bg-emerald-950/60 dark:border-emerald-900 dark:text-emerald-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-rose-800 dark:hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Canonical KPI Cards (Interactive Click Filters) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Pengumpulan"
          value={stats.total || 0}
          icon={UploadCloud}
          tone="emerald"
          subtitle="Seluruh submission tugas siswa"
          loading={loading}
          onClick={() => {
            setSelectedStatus('')
            setPage(1)
          }}
          className={selectedStatus === '' ? 'ring-2 ring-emerald-500/30 border-emerald-500' : ''}
        />
        <KpiCard
          title="Sudah Dinilai"
          value={stats.dinilai || 0}
          icon={Award}
          tone="green"
          subtitle="Telah diberi nilai oleh guru"
          loading={loading}
          onClick={() => {
            setSelectedStatus('dinilai')
            setPage(1)
          }}
          className={selectedStatus === 'dinilai' ? 'ring-2 ring-emerald-500/30 border-emerald-500' : ''}
        />
        <KpiCard
          title="Belum Dinilai"
          value={stats.dikumpulkan || stats.belum_dinilai || 0}
          icon={Clock}
          tone="blue"
          subtitle="Menunggu pemeriksaan guru"
          loading={loading}
          onClick={() => {
            setSelectedStatus('dikumpulkan')
            setPage(1)
          }}
          className={selectedStatus === 'dikumpulkan' ? 'ring-2 ring-sky-500/30 border-sky-500' : ''}
        />
        <KpiCard
          title="Terlambat Kumpul"
          value={stats.terlambat || 0}
          icon={AlertTriangle}
          tone="amber"
          subtitle="Melewati deadline"
          loading={loading}
          onClick={() => {
            setSelectedStatus('terlambat')
            setPage(1)
          }}
          className={selectedStatus === 'terlambat' ? 'ring-2 ring-amber-500/30 border-amber-500' : ''}
        />
      </div>

      {/* Tab Navigation (Pindahkan di atas card datatable) */}
      {tabNav && <div className="my-2">{tabNav}</div>}

      {/* Main Datatable Card with Integrated Header & Filter Toolbar */}
      <div className="bg-white rounded-[18px] border border-slate-200/80 shadow-sm overflow-hidden dark:border-slate-800 dark:bg-[#1B2433]">
        {/* Toolbar Baris 1: Title + Action Buttons */}
        <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#0E5C44] dark:text-[#3FBF75] flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Daftar Pengumpulan & Submission Tugas</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pemeriksaan dan penilaian lembar kerja siswa</p>
            </div>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-[#0E5C44] dark:bg-emerald-950/80 dark:text-emerald-300">
              {pagination.total}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0E5C44] text-white text-xs font-semibold hover:bg-[#1E8E5A] transition-colors dark:bg-[#3FBF75] dark:text-slate-900"
            >
              <Plus className="w-4 h-4" />
              Input / Kumpul Tugas
            </button>
          </div>
        </div>

        {/* Toolbar Baris 2: Search + Filters */}
        <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1B2433] flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="w-full md:w-80">
            <AppSearch
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari siswa, tugas, catatan, berkas..."
              className="w-full"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <select
              value={selectedPenugasan}
              onChange={(e) => {
                setSelectedPenugasan(e.target.value)
                setPage(1)
              }}
              className="h-9 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 text-xs font-medium text-slate-700 outline-none focus:border-[#0E5C44] focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="">Semua Penugasan</option>
              {options.penugasan.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>

            <select
              value={selectedSiswa}
              onChange={(e) => {
                setSelectedSiswa(e.target.value)
                setPage(1)
              }}
              className="h-9 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 text-xs font-medium text-slate-700 outline-none focus:border-[#0E5C44] focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="">Semua Siswa</option>
              {options.siswa.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setPage(1)
              }}
              className="h-9 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 text-xs font-medium text-slate-700 outline-none focus:border-[#0E5C44] focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="">Semua Status</option>
              {options.status.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleSearchSubmit}
              className="h-9 px-3 bg-[#0E5C44] text-white rounded-xl text-xs font-semibold hover:bg-[#1E8E5A] transition-colors dark:bg-[#3FBF75] dark:text-slate-900"
            >
              Terapkan
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilter}
                className="h-9 px-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-300"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3 dark:text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#0E5C44] dark:text-[#3FBF75]" />
            <p className="text-sm font-medium">Memuat data pengumpulan tugas...</p>
          </div>
        ) : dataPengumpulan.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3 dark:text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-base font-semibold text-slate-700 dark:text-slate-200">Belum ada pengumpulan tugas</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">Silakan tambahkan submission atau ubah kata kunci filter Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-3.5 px-4">Siswa</th>
                  <th className="py-3.5 px-4">Penugasan & Mapel</th>
                  <th className="py-3.5 px-4">File / Link</th>
                  <th className="py-3.5 px-4">Waktu Kumpul</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Nilai & Catatan</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
                {dataPengumpulan.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <PersonIdentityCell
                        name={item.siswa?.nama || 'Siswa'}
                        subtitle={item.siswa?.nisn ? `NISN: ${item.siswa.nisn}` : 'NISN -'}
                        avatarSrc={item.siswa?.foto || item.siswa?.photo_url || item.siswa?.avatar_url}
                      />
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.penugasan?.judul || item.penugasan?.judul_tugas || 'Penugasan'}
                      </div>
                      <div className="text-xs text-[#0E5C44] font-medium dark:text-[#3FBF75]">
                        {item.penugasan?.subject || 'Mata Pelajaran'} • {item.penugasan?.kelas || 'Kelas'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 text-xs">
                        {item.file || item.file_path ? (
                          <a
                            href={item.file || item.file_path}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 font-medium hover:underline dark:text-emerald-400 dark:hover:text-emerald-300"
                          >
                            <File className="w-3.5 h-3.5" />
                            Berkas Lampiran
                          </a>
                        ) : null}

                        {item.link || item.url_link ? (
                          <a
                            href={item.link || item.url_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Link Tautan External
                          </a>
                        ) : null}

                        {!item.file && !item.file_path && !item.link && !item.url_link && (
                          <span className="text-slate-400 dark:text-slate-500 italic">Hanya Jawaban Teks</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                      <div>{item.waktu_kumpul || '-'}</div>
                      {item.waktu_kumpul_formatted && (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">{item.waktu_kumpul_formatted}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="py-3.5 px-4">
                      {item.nilai !== null && item.nilai !== undefined ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-[#0E5C44] font-bold text-sm dark:bg-emerald-950/80 dark:text-[#3FBF75]">
                            {item.nilai} / 100
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500 italic">Belum Dinilai</span>
                      )}
                      {item.catatan && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 italic">
                          "{item.catatan}"
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <ActionDropdown
                        onView={() => handleOpenDetail(item)}
                        onEdit={() => handleOpenEditModal(item)}
                        onDelete={() => handleDelete(item.id, item.siswa?.nama)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && dataPengumpulan.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div>
              Halaman <span className="font-semibold text-slate-700 dark:text-slate-200">{pagination.current_page}</span> dari{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{pagination.last_page}</span> (Total {pagination.total} data)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.current_page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => setPage((prev) => prev + 1)}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form for Create / Edit / Grade using AppModal */}
      <AppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editId ? 'Koreksi & Form Penilaian' : 'Input Submission Pengumpulan Tugas'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 text-sm">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Penugasan <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.penugasan_id}
              onChange={(e) => setFormData({ ...formData, penugasan_id: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              <option value="">-- Pilih Penugasan --</option>
              {options.penugasan.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label || p.judul_tugas || p.judul} {p.subject ? `(${p.subject})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Siswa <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.siswa_id}
              onChange={(e) => setFormData({ ...formData, siswa_id: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              <option value="">-- Pilih Siswa --</option>
              {options.siswa.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label || s.full_name || s.name || s.nama_lengkap} {s.nisn ? `(${s.nisn})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Submission
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                {options.status.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nilai (0 - 100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="Contoh: 90"
                value={formData.nilai}
                onChange={(e) => setFormData({ ...formData, nilai: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              URL / Path File Lampiran (file)
            </label>
            <input
              type="text"
              placeholder="https://drive.google.com/... atau /storage/tugas/file.pdf"
              value={formData.file}
              onChange={(e) => setFormData({ ...formData, file: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Link Tautan Eksternal (link)
            </label>
            <input
              type="url"
              placeholder="https://github.com/... atau https://docs.google.com/..."
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan / Ulasan Guru & Teks Jawaban (catatan)
            </label>
            <textarea
              rows="3"
              placeholder="Tuliskan catatan apresiasi, saran perbaikan, atau rangkuman jawaban siswa..."
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E5C44]/20 focus:border-[#0E5C44] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2.5 bg-[#0E5C44] text-white rounded-xl font-semibold shadow-lg hover:bg-[#1E8E5A] transition-all flex items-center gap-2 disabled:opacity-50 dark:bg-[#3FBF75] dark:text-slate-900"
            >
              {formLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
              {editId ? 'Simpan Koreksi' : 'Kumpulkan Tugas'}
            </button>
          </div>
        </form>
      </AppModal>

      {/* Detail Drawer using AppDrawer */}
      <AppDrawer
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Detail Pengumpulan Tugas"
      >
        {selectedDetail && (
          <div className="space-y-6 text-sm">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Identitas Siswa</p>
              <PersonIdentityCell
                name={selectedDetail.siswa?.nama || 'Siswa'}
                subtitle={`NISN: ${selectedDetail.siswa?.nisn || '-'}`}
                avatarSrc={selectedDetail.siswa?.foto || selectedDetail.siswa?.photo_url || selectedDetail.siswa?.avatar_url}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Penugasan</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedDetail.penugasan?.judul || 'Judul Penugasan'}</p>
              <p className="text-xs text-[#0E5C44] dark:text-[#3FBF75] font-medium">
                {selectedDetail.penugasan?.subject} • Kelas {selectedDetail.penugasan?.kelas}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Nilai Akhir</p>
                <p className="text-xl font-bold text-[#0E5C44] dark:text-[#3FBF75] mt-0.5">
                  {selectedDetail.nilai !== null && selectedDetail.nilai !== undefined ? `${selectedDetail.nilai} / 100` : 'Belum Dinilai'}
                </p>
              </div>
              <div className="bg-blue-50/50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-100 dark:border-blue-900">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status</p>
                <div className="mt-1">{getStatusBadge(selectedDetail.status)}</div>
              </div>
            </div>

            {selectedDetail.jawaban_teks && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Teks Jawaban Siswa</p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 whitespace-pre-line">
                  {selectedDetail.jawaban_teks}
                </div>
              </div>
            )}

            {selectedDetail.file || selectedDetail.file_path ? (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Berkas File</p>
                <a
                  href={selectedDetail.file || selectedDetail.file_path}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 font-medium hover:bg-emerald-100 transition-colors"
                >
                  <File className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="flex-1 truncate">{selectedDetail.file || selectedDetail.file_path}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ) : null}

            {selectedDetail.link || selectedDetail.url_link ? (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tautan External</p>
                <a
                  href={selectedDetail.link || selectedDetail.url_link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 font-medium hover:bg-blue-100 transition-colors"
                >
                  <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="flex-1 truncate">{selectedDetail.link || selectedDetail.url_link}</span>
                </a>
              </div>
            ) : null}

            {selectedDetail.catatan && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Catatan Guru / Penilai</p>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 italic">
                  "{selectedDetail.catatan}"
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Waktu Kumpul:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{selectedDetail.waktu_kumpul || '-'}</span>
              </div>
              {selectedDetail.penilai && (
                <div className="flex justify-between">
                  <span>Penilai (Guru):</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{selectedDetail.penilai.nama}</span>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  setIsDetailOpen(false)
                  handleOpenEditModal(selectedDetail)
                }}
                className="w-full py-2.5 bg-[#0E5C44] text-white rounded-xl font-semibold hover:bg-[#1E8E5A] transition-colors flex items-center justify-center gap-2 dark:bg-[#3FBF75] dark:text-slate-900"
              >
                <FileCheck className="w-4 h-4" />
                Koreksi / Beri Nilai
              </button>
            </div>
          </div>
        )}
      </AppDrawer>
    </div>
  )
}
