import { useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  School,
  Users,
  UserCheck,
  Plus,
  FileSpreadsheet,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Download,
  Search,
  X,
  ArrowRightLeft,
  Check,
} from 'lucide-react'
import { kelasService } from '../services/kelasService'
import { studentService } from '../services/studentService'
import { ActionDropdown, AppBadge, PersonIdentityCell } from '../components/app'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  MasterActionButton,
  MasterDataSection,
  MasterDataPage,
  MasterPageHeader,
  MasterStatsGrid,
  MasterStatCard,
  MasterFilterSelect,
  MasterFormModal,
  MasterDetailModal,
  MasterDeleteDialog,
} from '../components/master-data'
import { useAuthStore } from '../stores/authStore'
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/tailgrids/core/dialog'
import { Badge } from '../components/tailgrids/core/badge'
import { Button } from '../components/tailgrids/core/button'
import PersonAvatar from '../components/ui/PersonAvatar'

const UNIT_COLORS = {
  TKIT: { bg: 'bg-emerald-800', text: 'text-white', border: 'border-emerald-700' },
  TAUD: { bg: 'bg-emerald-700', text: 'text-white', border: 'border-emerald-600' },
  SDIT: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-500' },
  MIT: { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-400' },
  SMPIT: { bg: 'bg-cyan-600', text: 'text-white', border: 'border-cyan-500' },
  SMAIT: { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-600' },
  MA: { bg: 'bg-purple-700', text: 'text-white', border: 'border-purple-600' },
  PONPES: { bg: 'bg-emerald-900', text: 'text-white', border: 'border-emerald-800' },
  Mahad: { bg: 'bg-amber-800', text: 'text-white', border: 'border-amber-700' },
}

const EMPTY_OPTIONS = []
const SISWA_MODAL_PAGE_SIZE = 8

function getUnitBadgeStyle(type) {
  return (
    UNIT_COLORS[type] || {
      bg: 'bg-slate-700',
      text: 'text-white',
      border: 'border-slate-600',
    }
  )
}

function initialFormState() {
  return {
    id: null,
    unit_pendidikan_id: '',
    tahun_ajaran_id: '',
    semester_id: '',
    jenjang: 'SDIT',
    tingkat: '1',
    kode_kelas: '',
    nama_kelas: '',
    wali_kelas_id: '',
    kapasitas: 30,
    ruangan: '',
    status: 'Aktif',
  }
}

export default function MasterKelasPage({ embedded = false, hidePageHeader = false, hideBreadcrumb = false }) {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  // Role Access Check for Unit Pendidikan Filter
  const canSeeUnitFilter = useMemo(() => {
    if (!user) return true
    const userRoles = Array.isArray(user.roles)
      ? user.roles.map((r) => (typeof r === 'string' ? r : r.name || ''))
      : typeof user.role === 'string'
        ? [user.role]
        : []
    const normalized = userRoles.map((r) => String(r).toLowerCase().replace(/[\s_-]+/g, ''))
    const allowedRoles = ['superadmin', 'admin', 'yayasan', 'ketuayayasan', 'pengurusyayasan', 'sekretarisyayasan', 'bendaharayayasan']
    return normalized.some((r) => allowedRoles.includes(r))
  }, [user])

  // Role Access Check for Managing Students (Pindah Kelas) for Kepala Sekolah, Admin, Superadmin, etc.
  const canManageSiswaKelas = useMemo(() => {
    if (!user) return true
    const userRoles = Array.isArray(user.roles)
      ? user.roles.map((r) => (typeof r === 'string' ? r : r.name || ''))
      : typeof user.role === 'string'
        ? [user.role]
        : []
    const normalized = userRoles.map((r) => String(r).toLowerCase().replace(/[\s_-]+/g, ''))
    const allowed = ['superadmin', 'admin', 'kepalasekolah', 'kepsek', 'yayasan', 'ketuayayasan', 'pengurusyayasan', 'divisipendidikan', 'tatausaha']
    return normalized.some((r) => allowed.includes(r))
  }, [user])

  // State Filter & Search
  const [search, setSearch] = useState('')
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('')
  const [selectedTahunFilter, setSelectedTahunFilter] = useState('')
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState('')
  const [selectedKelasFilter, setSelectedKelasFilter] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  // Modal Form State Wizard
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(initialFormState())
  const [formErrors, setFormErrors] = useState({})

  // Modal Detail & Delete State
  const [detailKelas, setDetailKelas] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Modal Student List State
  const [selectedKelasSiswa, setSelectedKelasSiswa] = useState(null)
  const [isSiswaModalOpen, setIsSiswaModalOpen] = useState(false)
  const [siswaSearch, setSiswaSearch] = useState('')
  const [siswaModalPage, setSiswaModalPage] = useState(1)

  // State for Class Transfer (Pindah Kelas)
  const [selectedStudentIds, setSelectedStudentIds] = useState([])
  const [singleStudentToMove, setSingleStudentToMove] = useState(null)
  const [targetKelasId, setTargetKelasId] = useState('')
  const [isPindahModalOpen, setIsPindahModalOpen] = useState(false)
  const [movingLoading, setMovingLoading] = useState(false)

  // Options Query
  const { data: optionsData } = useQuery({
    queryKey: ['kelas-options'],
    queryFn: () => kelasService.getOptions(),
  })

  const masterUnits = optionsData?.units || EMPTY_OPTIONS
  const masterTahunAjaran = optionsData?.tahun_ajaran || EMPTY_OPTIONS
  const masterSemesters = optionsData?.semesters || EMPTY_OPTIONS
  const masterEmployees = optionsData?.employees || optionsData?.guru || EMPTY_OPTIONS
  const masterJenjang = optionsData?.jenjang || EMPTY_OPTIONS
  const masterTingkat = optionsData?.tingkat || EMPTY_OPTIONS

  // Fetch Lista Kelas
  const {
    data: classData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      'kelas-list',
      page,
      search,
      selectedUnitFilter,
      selectedTahunFilter,
      selectedSemesterFilter,
      selectedKelasFilter,
      selectedStatusFilter,
    ],
    queryFn: () =>
      kelasService.getDaftar({
        page,
        per_page: 10,
        search: selectedKelasFilter ? selectedKelasFilter : (search || undefined),
        unit_pendidikan_id: selectedUnitFilter || undefined,
        tahun_ajaran_id: selectedTahunFilter || undefined,
        semester_id: selectedSemesterFilter || undefined,
        status: selectedStatusFilter || undefined,
      }),
  })

  const rawList = classData?.data || []
  const stats = classData?.statistik || {
    total_kelas: 0,
    total_aktif: 0,
    wali_terisi: 0,
    total_kapasitas: 0,
  }

  // Generate Master Kelas Options for Dropdown Filter
  const masterKelasOptions = useMemo(() => {
    const list = []
    const seen = new Set()
    const all = [...(optionsData?.kelas || []), ...(rawList || [])]
    all.forEach((k) => {
      const name = k.nama_kelas || k.name
      if (name && !seen.has(name)) {
        seen.add(name)
        list.push({ id: k.id, nama_kelas: name, kode_kelas: k.kode_kelas || '' })
      }
    })
    return list.sort((a, b) => a.nama_kelas.localeCompare(b.nama_kelas))
  }, [optionsData?.kelas, rawList])

  // Destination Classes for Pindah Kelas (Restricted to the SAME tingkat e.g. Tingkat 1 -> Tingkat 1)
  const destinationClasses = useMemo(() => {
    if (!selectedKelasSiswa) return []
    const all = [...(optionsData?.kelas || []), ...(rawList || [])]
    const list = []
    const seen = new Set()
    const currentTingkat = String(selectedKelasSiswa.tingkat || '')

    all.forEach((k) => {
      const classId = k.id
      const classTingkat = String(k.tingkat || '')
      if (classId && classId !== selectedKelasSiswa.id && !seen.has(classId)) {
        // Enforce same tingkat rule (siswa tingkat 1 hanya bisa ke rombel lain di tingkat 1)
        if (!currentTingkat || !classTingkat || classTingkat === currentTingkat) {
          seen.add(classId)
          list.push({
            id: classId,
            nama_kelas: k.nama_kelas || k.name,
            kode_kelas: k.kode_kelas || '',
            tingkat: k.tingkat || '',
            jenjang: k.jenjang || '',
            unit_id: k.unit_pendidikan_id || k.unit_id,
          })
        }
      }
    })
    return list.sort((a, b) => a.nama_kelas.localeCompare(b.nama_kelas))
  }, [selectedKelasSiswa, optionsData?.kelas, rawList])

  const paginationInfo = {
    total: classData?.meta?.total || rawList.length,
    from: classData?.meta?.from || (rawList.length > 0 ? 1 : 0),
    to: classData?.meta?.to || rawList.length,
    last_page: classData?.meta?.last_page || 1,
    current_page: classData?.meta?.current_page || 1,
    per_page: classData?.meta?.per_page || 10,
  }

  const availableSemestersForm = useMemo(() => {
    if (!formData.tahun_ajaran_id) return masterSemesters
    return masterSemesters.filter((s) => s.academic_year_id === formData.tahun_ajaran_id)
  }, [masterSemesters, formData.tahun_ajaran_id])

  const filteredEmployeesForm = useMemo(() => {
    if (!formData.unit_pendidikan_id) return masterEmployees
    return masterEmployees.filter((e) => !e.unit_id || e.unit_id === formData.unit_pendidikan_id)
  }, [masterEmployees, formData.unit_pendidikan_id])

  // Query for Students in Modal
  const siswaQuery = useQuery({
    queryKey: ['kelas-siswa-list', selectedKelasSiswa?.id],
    queryFn: async () => {
      if (!selectedKelasSiswa?.id) return []
      const res = await kelasService.getSiswaRombel(selectedKelasSiswa.id)
      return res?.siswa || res?.data || res || []
    },
    enabled: Boolean(selectedKelasSiswa?.id && isSiswaModalOpen),
  })

  const siswaList = useMemo(() => {
    const data = siswaQuery.data
    return Array.isArray(data) ? data : []
  }, [siswaQuery.data])

  const filteredSiswaList = useMemo(() => {
    if (!siswaSearch.trim()) return siswaList
    const q = siswaSearch.toLowerCase().trim()
    return siswaList.filter((s) => {
      const name = (s.full_name || s.nama || '').toLowerCase()
      const nis = (s.nis || '').toLowerCase()
      const nisn = (s.nisn || '').toLowerCase()
      return name.includes(q) || nis.includes(q) || nisn.includes(q)
    })
  }, [siswaList, siswaSearch])

  const siswaTotalPages = Math.max(1, Math.ceil(filteredSiswaList.length / SISWA_MODAL_PAGE_SIZE))
  const paginatedSiswaList = useMemo(() => {
    return filteredSiswaList.slice((siswaModalPage - 1) * SISWA_MODAL_PAGE_SIZE, siswaModalPage * SISWA_MODAL_PAGE_SIZE)
  }, [filteredSiswaList, siswaModalPage])

  // Open Siswa Modal Handler
  const openSiswaModal = (kelasItem) => {
    setSelectedKelasSiswa(kelasItem)
    setSiswaSearch('')
    setSiswaModalPage(1)
    setSelectedStudentIds([])
    setSingleStudentToMove(null)
    setTargetKelasId('')
    setIsSiswaModalOpen(true)
  }

  // Checkbox Select Handlers
  const toggleSelectAllStudents = () => {
    if (selectedStudentIds.length === filteredSiswaList.length) {
      setSelectedStudentIds([])
    } else {
      setSelectedStudentIds(filteredSiswaList.map((s) => s.id))
    }
  }

  const toggleSelectStudent = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Open Single Move Dialog
  const openSingleMoveDialog = (siswaItem) => {
    setSingleStudentToMove(siswaItem)
    setTargetKelasId('')
    setIsPindahModalOpen(true)
  }

  // Open Batch Move Dialog
  const openBatchMoveDialog = () => {
    setSingleStudentToMove(null)
    setTargetKelasId('')
    setIsPindahModalOpen(true)
  }

  // Execute Class Transfer (Pindah Kelas)
  const executePindahKelas = async () => {
    if (!targetKelasId) {
      Swal.fire('Pilih Kelas', 'Silakan pilih kelas tujuan terlebih dahulu.', 'warning')
      return
    }

    const targets = singleStudentToMove
      ? [singleStudentToMove]
      : siswaList.filter((s) => selectedStudentIds.includes(s.id))

    if (!targets.length) {
      Swal.fire('Peringatan', 'Tidak ada siswa yang dipilih untuk dipindahkan.', 'warning')
      return
    }

    try {
      setMovingLoading(true)
      for (const studentItem of targets) {
        await studentService.pindahKelas(studentItem.id, targetKelasId, studentItem)
      }

      const targetObj = destinationClasses.find((c) => c.id === targetKelasId)
      Swal.fire({
        title: 'Berhasil Dipindahkan!',
        text: `${targets.length} siswa berhasil dipindahkan ke kelas ${targetObj?.nama_kelas || 'tujuan'}.`,
        icon: 'success',
        confirmButtonText: 'Selesai',
        confirmButtonColor: '#065F46',
      })

      setIsPindahModalOpen(false)
      setSelectedStudentIds([])
      setSingleStudentToMove(null)
      setTargetKelasId('')
      siswaQuery.refetch()
      queryClient.invalidateQueries({ queryKey: ['kelas-list'] })
    } catch (err) {
      let rawMsg = err?.response?.data?.message || ''
      let textMsg = 'Terjadi kesalahan saat memindahkan kelas siswa.'
      if (rawMsg.includes('does not have the right permissions') || rawMsg.includes('does not have permission') || rawMsg.includes('Unauthorized')) {
        textMsg = 'Akun Anda tidak memiliki hak akses (izin) untuk mengubah data siswa pada unit pendidikan ini.'
      } else if (rawMsg) {
        textMsg = rawMsg
      }
      Swal.fire({
        title: 'Gagal Memindahkan Siswa',
        text: textMsg,
        icon: 'error',
        confirmButtonText: 'Mengerti',
        confirmButtonColor: '#DC2626',
      })
    } finally {
      setMovingLoading(false)
    }
  }

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload) => kelasService.tambah(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kelas-list'] })
      queryClient.invalidateQueries({ queryKey: ['kelas-options'] })
      Swal.fire({ title: 'Berhasil!', text: 'Data kelas/rombel baru berhasil ditambahkan.', icon: 'success', confirmColor: '#065F46' })
      closeFormModal()
    },
    onError: (err) => {
      const respErrors = err?.response?.data?.errors || {}
      setFormErrors(respErrors)
      Swal.fire('Gagal!', err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan data kelas.', 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => kelasService.ubah({ id, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kelas-list'] })
      Swal.fire({ title: 'Berhasil!', text: 'Data kelas/rombel berhasil diperbarui.', icon: 'success', confirmColor: '#065F46' })
      closeFormModal()
    },
    onError: (err) => {
      const respErrors = err?.response?.data?.errors || {}
      setFormErrors(respErrors)
      Swal.fire('Gagal!', err?.response?.data?.message || 'Terjadi kesalahan saat memperbarui data.', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => kelasService.hapus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kelas-list'] })
      setIsDeleteModalOpen(false)
      setDeleteTarget(null)
      Swal.fire({ title: 'Terhapus!', text: 'Data kelas berhasil dihapus (soft delete).', icon: 'success', confirmColor: '#065F46' })
    },
    onError: (err) => {
      Swal.fire('Gagal!', err?.response?.data?.message || 'Gagal menghapus data kelas.', 'error')
    },
  })

  // Handlers
  const openCreateModal = () => {
    setIsEditMode(false)
    setCurrentStep(1)
    setFormErrors({})
    const defaultUnit = masterUnits[0]?.id || ''
    const defaultTahun = masterTahunAjaran.find((t) => t.is_active)?.id || masterTahunAjaran[0]?.id || ''
    const defaultSem = masterSemesters.find((s) => s.is_active)?.id || masterSemesters[0]?.id || ''
    setFormData({ ...initialFormState(), unit_pendidikan_id: defaultUnit, tahun_ajaran_id: defaultTahun, semester_id: defaultSem })
    setIsFormModalOpen(true)
  }

  const openEditModal = (item) => {
    setIsEditMode(true)
    setCurrentStep(1)
    setFormErrors({})
    setFormData({
      id: item.id,
      unit_pendidikan_id: item.unit_pendidikan_id || '',
      tahun_ajaran_id: item.tahun_ajaran_id || '',
      semester_id: item.semester_id || '',
      jenjang: item.jenjang || 'SDIT',
      tingkat: item.tingkat || '1',
      kode_kelas: item.kode_kelas || '',
      nama_kelas: item.nama_kelas || '',
      wali_kelas_id: item.wali_kelas_id || '',
      kapasitas: item.kapasitas || 30,
      ruangan: item.ruangan || '',
      status: item.status || 'Aktif',
    })
    setIsFormModalOpen(true)
  }

  const closeFormModal = () => {
    setIsFormModalOpen(false)
    setFormData(initialFormState())
    setFormErrors({})
    setCurrentStep(1)
  }

  const handleNextStep = () => {
    setFormErrors({})
    if (currentStep === 1) {
      if (!formData.unit_pendidikan_id) return setFormErrors({ unit_pendidikan_id: ['Pilih Unit Pendidikan terlebih dahulu.'] })
      if (!formData.tahun_ajaran_id) return setFormErrors({ tahun_ajaran_id: ['Pilih Tahun Ajaran terlebih dahulu.'] })
    } else if (currentStep === 2) {
      if (!formData.semester_id) return setFormErrors({ semester_id: ['Pilih Semester terlebih dahulu.'] })
      if (!formData.jenjang || !formData.tingkat) return setFormErrors({ jenjang: ['Lengkapi jenjang dan tingkat kelas.'] })
    } else if (currentStep === 3) {
      if (!formData.nama_kelas.trim()) return setFormErrors({ nama_kelas: ['Nama kelas wajib diisi.'] })
      if (!formData.kode_kelas.trim()) return setFormErrors({ kode_kelas: ['Kode kelas wajib diisi.'] })
      if (Number(formData.kapasitas) < 1) return setFormErrors({ kapasitas: ['Kapasitas minimal 1 siswa.'] })
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4))
  }

  const handleSubmitForm = (e) => {
    e?.preventDefault()
    if (isEditMode) {
      updateMutation.mutate({ id: formData.id, payload: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleExportExcel = () => {
    if (rawList.length === 0) return Swal.fire('Informasi', 'Tidak ada data kelas untuk diexport.', 'info')
    const headers = ['No', 'Kode Kelas', 'Nama Kelas', 'Jenjang', 'Tingkat', 'Wali Kelas', 'Jumlah Siswa', 'Kapasitas', 'Ruangan', 'Status']
    const csvRows = rawList.map((item, index) => [
      index + 1,
      `"${item.kode_kelas || ''}"`,
      `"${item.nama_kelas || ''}"`,
      `"${item.jenjang || ''}"`,
      `"${item.tingkat || ''}"`,
      `"${item.wali_kelas?.nama_tampil || '-'}"`,
      item.jumlah_siswa || 0,
      item.kapasitas || 30,
      `"${item.ruangan || '-'}"`,
      `"${item.status || ''}"`,
    ])
    const csvContent = [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Data_Master_Kelas_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const resetFilters = () => {
    setSearch('')
    setSelectedUnitFilter('')
    setSelectedTahunFilter('')
    setSelectedSemesterFilter('')
    setSelectedKelasFilter('')
    setSelectedStatusFilter('')
    setPage(1)
  }

  const pageActions = (
    <>
      <MasterActionButton variant="export" icon={FileSpreadsheet} onClick={handleExportExcel}>Export</MasterActionButton>
      <MasterActionButton icon={Plus} onClick={openCreateModal}>Tambah Kelas</MasterActionButton>
    </>
  )

  const shouldHideBreadcrumb = embedded || hideBreadcrumb
  const shouldHideHeader = embedded || hidePageHeader

  return (
    <PageContainer maxW="7xl">
      {!shouldHideBreadcrumb && <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Data Kelas' }]} />}
      <MasterDataPage className="education-unit-page" hideBreadcrumb>
      {!shouldHideHeader && (
        <MasterPageHeader
          tone="brand"
          icon={School}
          title="Data Kelas & Rombongan Belajar"
          description="Kelola seluruh rombongan belajar, penugasan wali kelas, alokasi ruangan, dan pemindahan kelas siswa."
          actions={pageActions}
        />
      )}

      {/* Ringkasan Stats */}
      <MasterStatsGrid className="education-unit-kpis">
        <MasterStatCard icon={School} label="TOTAL KELAS" value={stats.total_kelas} description="Rombongan belajar terdaftar" variant="success" loading={isLoading} />
        <MasterStatCard icon={CheckCircle2} label="KELAS AKTIF" value={stats.total_aktif} description="Status operasional aktif" variant="info" loading={isLoading} />
        <MasterStatCard icon={UserCheck} label="WALI KELAS TERISI" value={stats.wali_terisi} description="Memiliki wali kelas" variant="warning" loading={isLoading} />
        <MasterStatCard icon={Users} label="TOTAL KAPASITAS" value={stats.total_kapasitas} description="Total kuota tempat duduk" variant="neutral" loading={isLoading} />
      </MasterStatsGrid>

      <MasterDataSection
        title="Daftar Kelas & Rombel"
        description="Data kelas sesuai periode, unit, kelas, dan status yang dipilih."
        countLabel={`${Number(paginationInfo.total).toLocaleString('id-ID')} kelas`}
        actions={pageActions}
        search={{
          value: search,
          onValueChange: (value) => { setSearch(value); setPage(1) },
          placeholder: 'Cari kode kelas, nama kelas, atau nama wali kelas...',
          'aria-label': 'Cari kelas atau rombongan belajar',
        }}
        filters={
          <>
            {/* Filter Unit Pendidikan - Only for Superadmin, Admin & Pengurus Yayasan */}
            {canSeeUnitFilter && (
              <MasterFilterSelect aria-label="Filter unit pendidikan" value={selectedUnitFilter} onChange={(e) => { setSelectedUnitFilter(e.target.value); setPage(1) }}>
                <option value="">Semua Unit Pendidikan</option>
                {masterUnits.map((u) => (<option key={u.id} value={u.id}>{u.name}</option>))}
              </MasterFilterSelect>
            )}

            <MasterFilterSelect aria-label="Filter tahun ajaran" value={selectedTahunFilter} onChange={(e) => { setSelectedTahunFilter(e.target.value); setSelectedSemesterFilter(''); setPage(1) }}>
              <option value="">Semua Tahun Ajaran</option>
              {masterTahunAjaran.map((tahun) => (<option key={tahun.id} value={tahun.id}>{tahun.name}</option>))}
            </MasterFilterSelect>

            <MasterFilterSelect aria-label="Filter semester" value={selectedSemesterFilter} onChange={(e) => { setSelectedSemesterFilter(e.target.value); setPage(1) }}>
              <option value="">Semua Semester</option>
              {masterSemesters
                .filter((semester) => !selectedTahunFilter || semester.academic_year_id === selectedTahunFilter)
                .map((semester) => (<option key={semester.id} value={semester.id}>{semester.name}</option>))}
            </MasterFilterSelect>

            {/* Filter Kelas Rombel */}
            <MasterFilterSelect aria-label="Filter kelas" value={selectedKelasFilter} onChange={(e) => { setSelectedKelasFilter(e.target.value); setPage(1) }}>
              <option value="">Semua Kelas</option>
              {masterKelasOptions.map((k) => (<option key={k.id || k.nama_kelas} value={k.nama_kelas}>{k.nama_kelas} ({k.kode_kelas})</option>))}
            </MasterFilterSelect>

            <MasterFilterSelect aria-label="Filter status" value={selectedStatusFilter} onChange={(e) => { setSelectedStatusFilter(e.target.value); setPage(1) }}>
              <option value="">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
            </MasterFilterSelect>
          </>
        }
        onReset={resetFilters}
        resetDisabled={!search && !selectedUnitFilter && !selectedTahunFilter && !selectedSemesterFilter && !selectedKelasFilter && !selectedStatusFilter}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        isEmpty={!isLoading && !isError && rawList.length === 0}
        emptyTitle="Data Kelas Tidak Ditemukan"
        emptyDescription="Belum ada data rombongan belajar yang sesuai dengan kriteria filter Anda."
        pagination={{ meta: paginationInfo, page, onPageChange: setPage }}
        ariaLabel="Data kelas dan rombongan belajar"
      >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F4EB] dark:bg-slate-900/80 text-gray-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider border-b border-gray-200 dark:border-slate-800">
                <th className="py-4 px-4 w-12 text-center">NO</th>
                <th className="py-4 px-4 w-14 text-center">LOGO</th>
                <th className="py-4 px-4">KODE & KELAS</th>
                <th className="py-4 px-4">JENJANG / TINGKAT</th>
                <th className="py-4 px-4">UNIT PENDIDIKAN</th>
                <th className="py-4 px-4">WALI KELAS</th>
                <th className="py-4 px-4">KAPASITAS & RUANGAN</th>
                <th className="py-4 px-4 text-center">STATUS</th>
                <th className="py-4 px-4 text-center w-36">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-xs font-medium">
              {rawList.map((item, index) => {
                const styleUnit = getUnitBadgeStyle(item.jenjang || item.unit_pendidikan?.level)
                const recordNo = (paginationInfo.current_page - 1) * 10 + index + 1

                return (
                  <tr key={item.id} className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/50 transition-colors">
                    {/* NO */}
                    <td className="py-4 px-4 text-center text-gray-500 dark:text-slate-400 font-bold">
                      {recordNo}
                    </td>

                    {/* LOGO */}
                    <td className="py-4 px-4 text-center">
                      <div className={`w-9 h-9 rounded-full ${styleUnit.bg} ${styleUnit.text} font-black text-xs flex items-center justify-center shadow-xs mx-auto border ${styleUnit.border}`}>
                        {(item.jenjang || item.unit_pendidikan?.level || 'SD').slice(0, 3)}
                      </div>
                    </td>

                    {/* KODE & KELAS */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{item.nama_kelas}</div>
                      <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{item.kode_kelas}</div>
                    </td>

                    {/* JENJANG / TINGKAT */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${styleUnit.bg} ${styleUnit.text} ${styleUnit.border}`}>
                        {item.jenjang} - Tkt {item.tingkat}
                      </span>
                    </td>

                    {/* UNIT PENDIDIKAN */}
                    <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {item.unit_pendidikan?.name || '-'}
                    </td>

                    {/* WALI KELAS */}
                    <td className="py-4 px-4">
                      <PersonIdentityCell
                        src={item.wali_kelas?.photo_url || item.wali_kelas?.avatar_url || item.wali_kelas?.foto}
                        name={item.wali_kelas?.nama_tampil || item.wali_kelas?.name || 'Belum diatur'}
                        subtitle={item.wali_kelas?.niy ? `NIY ${item.wali_kelas.niy}` : 'Wali kelas'}
                      />
                    </td>

                    {/* KAPASITAS & RUANGAN */}
                    <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-300">
                      <button
                        type="button"
                        onClick={() => openSiswaModal(item)}
                        className="group/btn flex items-center gap-1.5 text-left font-bold text-slate-900 hover:text-emerald-700 dark:text-white dark:hover:text-emerald-400 transition-colors"
                        title="Klik untuk melihat data siswa, wali kelas & pindah kelas"
                      >
                        <span><strong>{item.jumlah_siswa || 0}</strong> / {item.kapasitas || 30} Siswa</span>
                        <Users className="h-3.5 w-3.5 text-slate-400 group-hover/btn:text-emerald-600" />
                      </button>
                      <div className="text-slate-500 dark:text-slate-400 font-medium mt-0.5">Ruang: {item.ruangan || '-'}</div>
                    </td>

                    {/* STATUS */}
                    <td className="py-4 px-4 text-center">
                      <AppBadge variant={item.status === 'Aktif' ? 'success' : 'neutral'} dot>
                        {item.status || 'Tidak Aktif'}
                      </AppBadge>
                    </td>

                    {/* AKSI */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex justify-center">
                        <ActionDropdown
                          onView={() => { setDetailKelas(item); setIsDetailModalOpen(true) }}
                          onEdit={() => openEditModal(item)}
                          onDelete={() => { setDeleteTarget(item); setIsDeleteModalOpen(true) }}
                          extraItems={[
                            {
                              label: 'Kelola & Lihat Data Siswa',
                              icon: <Users className="h-4 w-4 text-sky-600" />,
                              onClick: () => openSiswaModal(item),
                            },
                          ]}
                        />
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
      </MasterDataSection>

      {/* Form Modal Wizard */}
      <MasterFormModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        icon={School}
        title={isEditMode ? 'Edit Data Rombongan Belajar' : 'Tambah Rombongan Belajar Baru'}
        description={`Langkah ${currentStep} dari 4: Selesaikan pembuatan data kelas.`}
        footer={
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
              disabled={currentStep === 1}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Kembali
            </button>
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-emerald-800 px-5 text-xs font-semibold text-white hover:bg-emerald-900"
              >
                Lanjut <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitForm}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-800 px-6 text-xs font-semibold text-white hover:bg-emerald-900 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" /> {isEditMode ? 'Simpan Perubahan' : 'Simpan Kelas'}
              </button>
            )}
          </div>
        }
      >
        <div className="p-6 space-y-5">
          {/* Stepper Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${currentStep === step ? 'bg-emerald-800 text-white' : currentStep > step ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                  {step}
                </div>
                <span className={`hidden text-xs font-semibold sm:inline ${currentStep === step ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step === 1 ? 'Unit & TA' : step === 2 ? 'Semester & Jenjang' : step === 3 ? 'Info Kelas' : 'Wali & Ruangan'}
                </span>
              </div>
            ))}
          </div>

          {/* Form Step Contents */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800">Unit Pendidikan *</label>
                <select
                  value={formData.unit_pendidikan_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, unit_pendidikan_id: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700"
                >
                  <option value="">-- Pilih Unit Pendidikan --</option>
                  {masterUnits.map((u) => (<option key={u.id} value={u.id}>{u.name} ({u.level})</option>))}
                </select>
                {formErrors.unit_pendidikan_id && <p className="mt-1 text-xs text-rose-600">{formErrors.unit_pendidikan_id[0]}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800">Tahun Ajaran *</label>
                <select
                  value={formData.tahun_ajaran_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tahun_ajaran_id: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700"
                >
                  <option value="">-- Pilih Tahun Ajaran --</option>
                  {masterTahunAjaran.map((t) => (<option key={t.id} value={t.id}>{t.name} {t.is_active ? '(Aktif)' : ''}</option>))}
                </select>
                {formErrors.tahun_ajaran_id && <p className="mt-1 text-xs text-rose-600">{formErrors.tahun_ajaran_id[0]}</p>}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800">Semester *</label>
                <select
                  value={formData.semester_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, semester_id: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700"
                >
                  <option value="">-- Pilih Semester --</option>
                  {availableSemestersForm.map((s) => (<option key={s.id} value={s.id}>{s.name} ({s.academic_year_name || 'TA'})</option>))}
                </select>
                {formErrors.semester_id && <p className="mt-1 text-xs text-rose-600">{formErrors.semester_id[0]}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-800">Jenjang *</label>
                  <select
                    value={formData.jenjang}
                    onChange={(e) => setFormData((prev) => ({ ...prev, jenjang: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700"
                  >
                    {masterJenjang.map((j) => (<option key={j} value={j}>{j}</option>))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-800">Tingkat Kelas *</label>
                  <select
                    value={formData.tingkat}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tingkat: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700"
                  >
                    {masterTingkat.map((t) => (<option key={t} value={t}>Tingkat {t}</option>))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800">Nama Kelas / Rombel *</label>
                <input
                  type="text"
                  value={formData.nama_kelas}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nama_kelas: e.target.value }))}
                  placeholder="Contoh: 7-A Tahfizh, Kelas 1 Binar"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700"
                />
                {formErrors.nama_kelas && <p className="mt-1 text-xs text-rose-600">{formErrors.nama_kelas[0]}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800">Kode Kelas (Unique) *</label>
                <input
                  type="text"
                  value={formData.kode_kelas}
                  onChange={(e) => setFormData((prev) => ({ ...prev, kode_kelas: e.target.value }))}
                  placeholder="Contoh: KLS-7A-SMP"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 font-mono text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700"
                />
                {formErrors.kode_kelas && <p className="mt-1 text-xs text-rose-600">{formErrors.kode_kelas[0]}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800">Kapasitas Maksimal Siswa</label>
                <input
                  type="number"
                  value={formData.kapasitas}
                  onChange={(e) => setFormData((prev) => ({ ...prev, kapasitas: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700"
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800">Penugasan Wali Kelas</label>
                <select
                  value={formData.wali_kelas_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, wali_kelas_id: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700"
                >
                  <option value="">-- Pilih Wali Kelas (Opsional) --</option>
                  {filteredEmployeesForm.map((emp) => (<option key={emp.id} value={emp.id}>{emp.nama_tampil || emp.name}</option>))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800">Lokasi Ruangan</label>
                <input
                  type="text"
                  value={formData.ruangan}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ruangan: e.target.value }))}
                  placeholder="Contoh: Gedung Al-Farabi Lt. 2 (R-204)"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800">Status Operasional</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </MasterFormModal>

      {/* Detail Modal */}
      <MasterDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        icon={School}
        title="Detail Rombongan Belajar"
        description="Informasi spesifikasi kelas, unit pendidikan, dan wali kelas"
      >
        {detailKelas && (
          <div className="p-6 space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{detailKelas.nama_kelas}</h3>
                <p className="font-mono text-xs font-bold text-emerald-800 mt-0.5">{detailKelas.kode_kelas}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDetailModalOpen(false)
                  openSiswaModal(detailKelas)
                }}
              >
                <Users className="h-4 w-4 mr-1.5 text-sky-600" /> Kelola & Lihat Siswa Rombel
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-bold text-slate-400 uppercase">Unit Pendidikan</p>
                <p className="font-semibold text-slate-800 mt-1">{detailKelas.unit_pendidikan?.name || '-'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-bold text-slate-400 uppercase">Jenjang & Tingkat</p>
                <p className="font-semibold text-slate-800 mt-1">{detailKelas.jenjang} - Tingkat {detailKelas.tingkat}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-bold text-slate-400 uppercase">Wali Kelas</p>
                <p className="font-semibold text-emerald-800 mt-1">{detailKelas.wali_kelas?.nama_tampil || detailKelas.wali_kelas?.name || 'Belum ditugaskan'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-bold text-slate-400 uppercase">Kapasitas / Terisi</p>
                <p className="font-semibold text-slate-800 mt-1">{detailKelas.jumlah_siswa || 0} / {detailKelas.kapasitas || 30} Siswa</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 col-span-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Lokasi Ruangan</p>
                <p className="font-semibold text-slate-800 mt-1">{detailKelas.ruangan || 'Belum diatur'}</p>
              </div>
            </div>
          </div>
        )}
      </MasterDetailModal>

      {/* Modal Lihat & Kelola Data Siswa Rombel */}
      {isSiswaModalOpen && selectedKelasSiswa && (
        <Dialog
          isOpen={isSiswaModalOpen}
          onOpenChange={(open) => !open && setIsSiswaModalOpen(false)}
          className="w-full max-w-4xl max-h-[90vh] flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
        >
          <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Data Siswa Rombel: {selectedKelasSiswa.nama_kelas}
                </DialogTitle>
                <Badge color="primary" size="md">
                  {filteredSiswaList.length} Siswa
                </Badge>
              </div>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Kode Rombel: <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{selectedKelasSiswa.kode_kelas}</span> • Unit: {selectedKelasSiswa.unit_pendidikan?.name || '-'} • Ruangan: {selectedKelasSiswa.ruangan || '-'}
              </DialogDescription>
            </div>
          </DialogHeader>

          <DialogBody className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Wali Kelas Card Banner */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800/80 dark:to-slate-800/40 p-4 rounded-xl border border-emerald-200/60 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <PersonAvatar
                  src={selectedKelasSiswa.wali_kelas?.photo_url || selectedKelasSiswa.wali_kelas?.avatar_url || selectedKelasSiswa.wali_kelas?.foto}
                  name={selectedKelasSiswa.wali_kelas?.nama_tampil || selectedKelasSiswa.wali_kelas?.name || 'Wali Kelas'}
                  size="detail"
                />
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Wali Kelas Penanggung Jawab</span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedKelasSiswa.wali_kelas?.nama_tampil || selectedKelasSiswa.wali_kelas?.name || 'Belum Ditugaskan'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedKelasSiswa.wali_kelas?.niy ? `NIY: ${selectedKelasSiswa.wali_kelas.niy}` : 'Wali kelas rombongan belajar'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-center shadow-xs">
                  <span className="block text-slate-400 text-[10px]">TERISI / KAPASITAS</span>
                  <strong className="text-sm text-slate-900 dark:text-white">{selectedKelasSiswa.jumlah_siswa || filteredSiswaList.length} / {selectedKelasSiswa.kapasitas || 30}</strong>
                </div>
                <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-center shadow-xs">
                  <span className="block text-slate-400 text-[10px]">JENJANG - TINGKAT</span>
                  <strong className="text-sm text-emerald-600 dark:text-emerald-400">{selectedKelasSiswa.jenjang || 'SD'} - Tkt {selectedKelasSiswa.tingkat || 1}</strong>
                </div>
              </div>
            </div>

            {/* Modal Toolbar: Search, Batch Pindah Kelas, & Export */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama siswa, NIS, atau NISN..."
                  value={siswaSearch}
                  onChange={(e) => { setSiswaSearch(e.target.value); setSiswaModalPage(1) }}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {siswaSearch && (
                  <button
                    type="button"
                    onClick={() => { setSiswaSearch(''); setSiswaModalPage(1) }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Batch Pindah Kelas Action Button */}
                {canManageSiswaKelas && selectedStudentIds.length > 0 && (
                  <button
                    type="button"
                    onClick={openBatchMoveDialog}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    Pindahkan ({selectedStudentIds.length}) Siswa
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const headers = ['NO', 'NAMA SISWA', 'NIS', 'NISN', 'JENIS KELAMIN', 'STATUS']
                    const csvRows = filteredSiswaList.map((s, idx) => [
                      idx + 1,
                      `"${s.full_name || s.nama || ''}"`,
                      `"${s.nis || ''}"`,
                      `"${s.nisn || ''}"`,
                      `"${s.gender === 'male' || s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}"`,
                      `"${s.is_active !== false ? 'Aktif' : 'Nonaktif'}"`,
                    ])
                    const csv = [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\n')
                    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `Siswa_${selectedKelasSiswa.kode_kelas}_${new Date().toISOString().slice(0, 10)}.csv`
                    link.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-600" />
                  Unduh CSV
                </button>
              </div>
            </div>

            {/* Datatable Siswa */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    {canManageSiswaKelas && (
                      <th className="py-3 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={filteredSiswaList.length > 0 && selectedStudentIds.length === filteredSiswaList.length}
                          onChange={toggleSelectAllStudents}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </th>
                    )}
                    <th className="py-3 px-4 w-12">NO</th>
                    <th className="py-3 px-4">SISWA</th>
                    <th className="py-3 px-4">NIS / NISN</th>
                    <th className="py-3 px-4 text-center">JENIS KELAMIN</th>
                    <th className="py-3 px-4 text-center">STATUS</th>
                    {canManageSiswaKelas && <th className="py-3 px-4 text-center w-28">AKSI</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {siswaQuery.isLoading ? (
                    <tr>
                      <td colSpan={canManageSiswaKelas ? 7 : 6} className="py-8 text-center text-slate-500 font-medium">
                        Memuat data siswa rombel...
                      </td>
                    </tr>
                  ) : paginatedSiswaList.length > 0 ? (
                    paginatedSiswaList.map((siswaItem, idx) => {
                      const isChecked = selectedStudentIds.includes(siswaItem.id)

                      return (
                        <tr key={siswaItem.id || idx} className={`transition-colors ${isChecked ? 'bg-purple-50/60 dark:bg-purple-950/20' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'}`}>
                          {canManageSiswaKelas && (
                            <td className="py-3 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelectStudent(siswaItem.id)}
                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                            </td>
                          )}
                          <td className="py-3 px-4 font-bold text-slate-500">
                            {(siswaModalPage - 1) * SISWA_MODAL_PAGE_SIZE + idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <PersonIdentityCell
                              src={siswaItem.photo_url || siswaItem.photo}
                              name={siswaItem.full_name || siswaItem.nama || 'Siswa'}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono text-slate-800 dark:text-slate-200 font-bold">{siswaItem.nis || '-'}</div>
                            <div className="text-[11px] text-slate-400 font-mono">NISN: {siswaItem.nisn || '-'}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge color={siswaItem.gender === 'male' || siswaItem.gender === 'L' ? 'blue' : 'pink'} size="sm">
                              {siswaItem.gender === 'male' || siswaItem.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <AppBadge variant={siswaItem.is_active !== false ? 'success' : 'neutral'} dot>
                              {siswaItem.is_active !== false ? 'Aktif' : 'Nonaktif'}
                            </AppBadge>
                          </td>
                          {canManageSiswaKelas && (
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => openSingleMoveDialog(siswaItem)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-purple-700 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-300 rounded-md border border-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
                                title="Pindahkan siswa ke kelas lain"
                              >
                                <ArrowRightLeft className="h-3 w-3" /> Pindah
                              </button>
                            </td>
                          )}
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={canManageSiswaKelas ? 7 : 6} className="py-8 text-center text-slate-400 font-medium">
                        {siswaSearch ? 'Tidak ada siswa yang cocok dengan pencarian.' : 'Belum ada siswa terdaftar di rombel ini.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DialogBody>

          <DialogFooter className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan {filteredSiswaList.length ? (siswaModalPage - 1) * SISWA_MODAL_PAGE_SIZE + 1 : 0}–{Math.min(siswaModalPage * SISWA_MODAL_PAGE_SIZE, filteredSiswaList.length)} dari {filteredSiswaList.length} siswa
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mr-4">
                <button
                  type="button"
                  disabled={siswaModalPage === 1}
                  onClick={() => setSiswaModalPage((prev) => prev - 1)}
                  className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300">
                  {siswaModalPage} / {siswaTotalPages}
                </span>
                <button
                  type="button"
                  disabled={siswaModalPage === siswaTotalPages}
                  onClick={() => setSiswaModalPage((prev) => prev + 1)}
                  className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <Button variant="ghost" onClick={() => setIsSiswaModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </DialogFooter>
        </Dialog>
      )}

      {/* Modal Dialog Konfirmasi Pindah Kelas */}
      {isPindahModalOpen && selectedKelasSiswa && (
        <Dialog
          isOpen={isPindahModalOpen}
          onOpenChange={(open) => !open && !movingLoading && setIsPindahModalOpen(false)}
          className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
        >
          <DialogHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                <ArrowRightLeft className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Pindahkan Kelas Siswa
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  {singleStudentToMove
                    ? `Siswa: ${singleStudentToMove.full_name || singleStudentToMove.nama} (${singleStudentToMove.nis || 'NIS'})`
                    : `Jumlah: ${selectedStudentIds.length} Siswa Terpilih`}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogBody className="py-4 space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              <span className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Kelas Asal Rombel:</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">{selectedKelasSiswa.nama_kelas} ({selectedKelasSiswa.kode_kelas})</span>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200/80 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <span className="font-bold block">Ketentuan Pemindahan Kelas:</span>
              <span>Siswa pada Tingkat {selectedKelasSiswa.tingkat || 1} hanya dapat dipindahkan ke rombel lain pada tingkat yang sama (Tingkat {selectedKelasSiswa.tingkat || 1}). Pemindahan ke tingkat di atasnya tidak diperbolehkan.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Pilih Kelas Tujuan Rombel (Tingkat {selectedKelasSiswa.tingkat || 1}) *
              </label>
              <select
                value={targetKelasId}
                onChange={(e) => setTargetKelasId(e.target.value)}
                className="w-full h-11 px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- Pilih Kelas Tujuan (Tingkat {selectedKelasSiswa.tingkat || 1}) --</option>
                {destinationClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nama_kelas} (Kode: {c.kode_kelas}) - Tingkat {c.tingkat}
                  </option>
                ))}
              </select>
            </div>
          </DialogBody>

          <DialogFooter className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              disabled={movingLoading}
              onClick={() => setIsPindahModalOpen(false)}
            >
              Batal
            </Button>
            <button
              type="button"
              disabled={movingLoading || !targetKelasId}
              onClick={executePindahKelas}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-sm disabled:opacity-50 transition-colors"
            >
              {movingLoading ? 'Memindahkan...' : 'Proses Pindah Kelas'}
            </button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <MasterDeleteDialog
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setDeleteTarget(null) }}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
        title="Hapus Data Kelas?"
        description={`Apakah Anda yakin ingin menghapus data kelas ${deleteTarget?.nama_kelas}? Data akan dimasukkan ke arsip soft delete.`}
      />
    </MasterDataPage>
    </PageContainer>
  )
}
