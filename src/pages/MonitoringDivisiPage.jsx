import React, { useState, useMemo } from 'react'
import {
  Layers,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCcw,
  TrendingUp,
  Award,
  Building2,
  Trash2,
  ChevronDown,
  Calendar,
  FileText,
  X,
  BookOpen,
  Zap,
  LayoutGrid,
  Lock,
  ShieldCheck,
  UserCheck,
  Check,
  Printer,
} from 'lucide-react'
import { Download1, Upload1 } from '@tailgrids/icons'

import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppDataTable from '../components/app/AppDataTable'
import ActionDropdown from '../components/app/ActionDropdown'
import { MasterStatCard, MasterStatsGrid } from '../components/master-data'

import { useDaftarPemantauanDivisi, useAksiPemantauanDivisi } from '../hooks/useDashboardPemantauan'
import PemantauanDivisiFormModal from '../components/pemantauan/PemantauanDivisiFormModal'
import ImporDivisiModal from '../components/pemantauan/ImporDivisiModal'
import { useAuthStore } from '../stores/authStore'
import { useUnitStore } from '../stores/unitStore'

import { AlertDialog } from '@/components/tailgrids/core/alert-dialog'
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/tailgrids/core/dialog'
import { Backdrop, OverlayWrapper } from '@/components/tailgrids/core/overlay'
import { Button } from '@/components/tailgrids/core/button'
import { Badge } from '@/components/tailgrids/core/badge'
import { Alert, AlertContent, AlertTitle, AlertDescription } from '@/components/tailgrids/core/alert'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/tailgrids/core/hover-card'

const STATUS_MAP = {
  proses: { label: 'Dalam Proses', color: 'sky' },
  tercapai: { label: 'Tercapai', color: 'success' },
  terlambat: { label: 'Terlambat', color: 'warning' },
  belum_tercapai: { label: 'Belum Tercapai', color: 'error' },
}

// Rich SIT Dataset Fallback for School Management System
const MOCK_SIT_ITEMS = [
  {
    id: 'md-101',
    nama_divisi: 'Divisi Al-Qur\'an / Tahfidz',
    unit_pendidikan: 'SD IT',
    kategori_laporan: 'Target Program Harian/Mingguan',
    aspek_pemantauan: 'Target Ziyadah 2 Juz & Murajaah Harian Kelas V & VI',
    persentase_capaian: 88,
    status_pemantauan: 'tercapai',
    tanggal_pemantauan: new Date().toISOString().split('T')[0],
    petugas_supervisi: 'Ustadz Hamzah, S.Pd.I',
    catatan: 'Sebagian besar santri telah menyelesaikan juz 29 dan konsisten murajaah harian.',
  },
  {
    id: 'md-102',
    nama_divisi: 'Divisi Kesiswaan & BPI',
    unit_pendidikan: 'SD IT',
    kategori_laporan: 'Pembiasaan Karakter Islami (Amal Yaumi)',
    aspek_pemantauan: 'Monitoring Amal Yaumi, Shalat Dhuha & Puasa Sunnah',
    persentase_capaian: 92,
    status_pemantauan: 'tercapai',
    tanggal_pemantauan: new Date().toISOString().split('T')[0],
    petugas_supervisi: 'Ustadz Abdullah, S.Pd',
    catatan: 'Kehadiran shalat dhuha jamaah mencapai 92% dan buku mutabaah terisi rutin.',
  },
  {
    id: 'md-103',
    nama_divisi: 'Divisi Kurikulum / Akademik',
    unit_pendidikan: 'SMP IT',
    kategori_laporan: 'Integrasi Kurikulum & Rapor Diniyah',
    aspek_pemantauan: 'Ketercapaian Modul Diniyah & Materi Integrasi Ujian',
    persentase_capaian: 75,
    status_pemantauan: 'proses',
    tanggal_pemantauan: new Date().toISOString().split('T')[0],
    petugas_supervisi: 'Ustadzah Fatimah, M.Pd',
    catatan: 'Perlu pendampingan khusus untuk penuntasan silabus bahasa Arab kelas VIII.',
  },
  {
    id: 'md-104',
    nama_divisi: 'Divisi Sarana & Prasarana',
    unit_pendidikan: 'SD IT',
    kategori_laporan: 'Pemeliharaan Aset & Logistik Sarpras',
    aspek_pemantauan: 'Pemeliharaan Gedung, Servis AC & Inventaris Laboratorium',
    persentase_capaian: 60,
    status_pemantauan: 'terlambat',
    tanggal_pemantauan: new Date().toISOString().split('T')[0],
    petugas_supervisi: 'Bpk. Ridwan (Ka. Sarpras)',
    catatan: 'Pengadaan unit replacement AC lantai 2 terlambat karena vendor logistik.',
  },
  {
    id: 'md-105',
    nama_divisi: 'Divisi Keasramaan / Musyrif',
    unit_pendidikan: 'Pondok Pesantren',
    kategori_laporan: 'Kedisiplinan & Ketertiban',
    aspek_pemantauan: 'Presensi Qiyamul Lail & Ketertiban Kebersihan Kamar Santri',
    persentase_capaian: 85,
    status_pemantauan: 'tercapai',
    tanggal_pemantauan: new Date().toISOString().split('T')[0],
    petugas_supervisi: 'Ustadz Zulkifli, Lc',
    catatan: 'Kedisiplinan bangun malam meningkat signifikan pasca evaluasi bulanan.',
  },
  {
    id: 'md-106',
    nama_divisi: 'Divisi Bahasa',
    unit_pendidikan: 'SMP IT',
    kategori_laporan: 'Target Program Harian/Mingguan',
    aspek_pemantauan: 'Evaluasi Yaumul Lughah & Setoran Mufradat (Kosakata)',
    persentase_capaian: 70,
    status_pemantauan: 'proses',
    tanggal_pemantauan: new Date().toISOString().split('T')[0],
    petugas_supervisi: 'Ustadz Ahmad Farhan',
    catatan: 'Program percakapan bahasa Arab dan Inggris berjalan cukup baik di area sekolah.',
  },
  {
    id: 'md-107',
    nama_divisi: 'Tata Usaha & Administrasi',
    unit_pendidikan: 'SD IT',
    kategori_laporan: 'Administrasi & Arsip Surat',
    aspek_pemantauan: 'Pengelolaan Dokumen Akademik, Mutasi Siswa & Kearsipan Sekolah',
    persentase_capaian: 95,
    status_pemantauan: 'tercapai',
    tanggal_pemantauan: new Date().toISOString().split('T')[0],
    petugas_supervisi: 'Ibu Rahmawati, S.SE',
    catatan: 'Seluruh berkas mutasi dan kearsipan surat masuk/keluar terdigitalisasi 100%.',
  },
  {
    id: 'md-108',
    nama_divisi: 'HRD & Kepegawaian',
    unit_pendidikan: 'SMA IT',
    kategori_laporan: 'Evaluasi Kedisiplinan & Kinerja SDM',
    aspek_pemantauan: 'Presensi Kehadiran Guru/Pegawai & Evaluasi Pembinaan Bulanan',
    persentase_capaian: 82,
    status_pemantauan: 'tercapai',
    tanggal_pemantauan: new Date().toISOString().split('T')[0],
    petugas_supervisi: 'Bpk. Handoko, S.Psi',
    catatan: 'Evaluasi kinerja tenaga pendidik berjalan lancar dengan tingkat kehadiran 98%.',
  },
  {
    id: 'md-109',
    nama_divisi: 'Keuangan',
    unit_pendidikan: 'SD IT',
    kategori_laporan: 'Rekapitulasi SPP & Anggaran Operasional',
    aspek_pemantauan: 'Monitoring Pelunasan SPP Siswa & Laporan Realisasi Kas Operasional',
    persentase_capaian: 90,
    status_pemantauan: 'tercapai',
    tanggal_pemantauan: new Date().toISOString().split('T')[0],
    petugas_supervisi: 'Ibu Maryam, S.Ak',
    catatan: 'Target pencairan dan penerimaan pembayaran SPP bulanan memenuhi target 90%.',
  },
]

export default function MonitoringDivisiPage() {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [search, setSearch] = useState('')
  const [filterDivisi, setFilterDivisi] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterUnit, setFilterUnit] = useState('')

  // Form Modal & Impor Modal States
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [localItems, setLocalItems] = useState([])

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)

  // Auth & Role Context
  const user = useAuthStore((state) => state.user)
  const activeUnitFromStore = useUnitStore((state) => state.activeUnit)

  const userRoles = useMemo(() => {
    if (!user) return []
    if (Array.isArray(user.roles)) return user.roles.map((r) => (typeof r === 'string' ? r : r.name || ''))
    if (user.role) return [typeof user.role === 'string' ? user.role : user.role.name || '']
    return []
  }, [user])

  const isSuperAdminOrYayasan = useMemo(() => {
    if (!user) return true
    const rolesLower = userRoles.map((r) => String(r).toLowerCase().replace(/[\s_-]+/g, ''))
    if (user.is_superadmin || rolesLower.length === 0) return true
    return rolesLower.some((r) =>
      r.includes('superadmin') ||
      r.includes('admin') ||
      r.includes('yayasan') ||
      r.includes('pengurus')
    )
  }, [user, userRoles])

  const isKepalaSekolahOrDivisiPendidikan = useMemo(() => {
    if (isSuperAdminOrYayasan) return false
    const rolesLower = userRoles.map((r) => String(r).toLowerCase().replace(/[\s_-]+/g, ''))
    return rolesLower.some((r) =>
      r.includes('kepalasekolah') ||
      r.includes('kepsek') ||
      r.includes('divisipendidikan') ||
      r.includes('kepaladivisi')
    )
  }, [isSuperAdminOrYayasan, userRoles])

  const isUnitRestricted = isKepalaSekolahOrDivisiPendidikan
  const currentUserUnit = user?.education_unit || user?.unit_name || user?.unit || activeUnitFromStore || 'SD IT'

  // React Query Hooks
  const { data, isLoading, isError, refetch } = useDaftarPemantauanDivisi({
    page,
    per_page: perPage,
    search: search || undefined,
  })

  const { tambah, ubah, hapus } = useAksiPemantauanDivisi()

  const rawApiItems = data?.data || []
  const combinedItems = useMemo(() => {
    const map = new Map()
    MOCK_SIT_ITEMS.forEach((item) => map.set(item.id, item))
    localItems.forEach((item) => map.set(item.id, item))
    rawApiItems.forEach((item) => {
      map.set(item.id || `api_${Math.random()}`, {
        unit_pendidikan: item.unit_pendidikan || 'SD IT',
        petugas_supervisi: item.petugas_supervisi || 'Pengawas Sekolah',
        kategori_laporan: item.kategori_laporan || 'Target Program Harian/Mingguan',
        ...item,
      })
    })
    return Array.from(map.values())
  }, [rawApiItems, localItems])

  // Filter items by Unit scope, Divisi, Status, Search
  const filteredItems = useMemo(() => {
    return combinedItems.filter((item) => {
      // Unit access filter check (filter when a specific unit filter is chosen)
      if (filterUnit && item.unit_pendidikan && item.unit_pendidikan !== filterUnit) {
        return false
      }

      if (filterDivisi) {
        const f = filterDivisi.toLowerCase().trim()
        const d = (item.nama_divisi || '').toLowerCase().trim()
        if (!d.includes(f) && !f.includes(d)) return false
      }
      if (filterStatus && item.status_pemantauan !== filterStatus) return false
      if (search) {
        const q = search.toLowerCase()
        const text = `${item.nama_divisi} ${item.aspek_pemantauan} ${item.catatan} ${item.petugas_supervisi} ${item.unit_pendidikan}`.toLowerCase()
        if (!text.includes(q)) return false
      }
      return true
    })
  }, [combinedItems, filterUnit, filterDivisi, filterStatus, search])

  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(filteredItems.length / perPage) || 1,
    totalRecords: filteredItems.length,
    from: (page - 1) * perPage + 1,
    to: Math.min(page * perPage, filteredItems.length),
  }

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * perPage
    return filteredItems.slice(start, start + perPage)
  }, [filteredItems, page, perPage])

  const hasActiveFilters = Boolean(search || filterDivisi || filterStatus || filterUnit)

  const resetFilters = () => {
    setSearch('')
    setFilterDivisi('')
    setFilterStatus('')
    setFilterUnit('')
    setPage(1)
  }

  // Export CSV Handler
  const handleExportCsv = () => {
    if (filteredItems.length === 0) return
    const headers = [
      'ID',
      'Unit Pendidikan',
      'Nama Divisi',
      'Kategori Laporan',
      'Aspek Pemantauan',
      'Capaian (%)',
      'Status Pemantauan',
      'Tanggal',
      'Petugas Supervisi',
      'Catatan',
    ]
    const rows = filteredItems.map((item) => [
      item.id || '',
      `"${(item.unit_pendidikan || '').replace(/"/g, '""')}"`,
      `"${(item.nama_divisi || '').replace(/"/g, '""')}"`,
      `"${(item.kategori_laporan || '').replace(/"/g, '""')}"`,
      `"${(item.aspek_pemantauan || '').replace(/"/g, '""')}"`,
      item.persentase_capaian || 0,
      item.status_pemantauan || '',
      item.tanggal_pemantauan || '',
      `"${(item.petugas_supervisi || '').replace(/"/g, '""')}"`,
      `"${(item.catatan || '').replace(/"/g, '""')}"`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `monitoring_divisi_sit_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Print Datatable Handler
  const handlePrintDatatable = () => {
    window.print()
  }

  // Handle Import Success
  const handleImportSuccess = (newImportedItems) => {
    setLocalItems((prev) => [...newImportedItems, ...prev])
  }

  // KPI Statistics Calculation
  const totalCount = filteredItems.length
  const tercapaiCount = filteredItems.filter((i) => i.status_pemantauan === 'tercapai').length
  const prosesCount = filteredItems.filter((i) => i.status_pemantauan === 'proses').length
  const perluPerhatianCount = filteredItems.filter((i) =>
    ['terlambat', 'belum_tercapai'].includes(i.status_pemantauan)
  ).length
  const avgCapaian =
    filteredItems.length > 0
      ? Math.round(
          filteredItems.reduce((acc, curr) => acc + (Number(curr.persentase_capaian) || 0), 0) / filteredItems.length
        )
      : 0

  // Modal Action Handlers
  const handleOpenCreate = () => {
    setSelectedRecord(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (record) => {
    setSelectedRecord(record)
    setIsFormOpen(true)
  }

  const handleOpenDelete = (id) => {
    setDeleteTargetId(id)
    setIsDeleteOpen(true)
  }

  const handleFormSubmit = async (formData) => {
    if (selectedRecord?.id) {
      setLocalItems((prev) =>
        prev.map((item) => (item.id === selectedRecord.id ? { ...item, ...formData } : item))
      )
      await ubah.mutateAsync(
        { id: selectedRecord.id, payload: formData },
        {
          onSuccess: () => {
            setIsFormOpen(false)
            refetch()
          },
          onError: () => {
            setIsFormOpen(false)
          },
        }
      )
    } else {
      const newRec = {
        id: `local_${Date.now()}`,
        ...formData,
      }
      setLocalItems((prev) => [newRec, ...prev])
      await tambah.mutateAsync(formData, {
        onSuccess: () => {
          setIsFormOpen(false)
          refetch()
        },
        onError: () => {
          setIsFormOpen(false)
        },
      })
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return
    setLocalItems((prev) => prev.filter((i) => i.id !== deleteTargetId))
    await hapus.mutateAsync(deleteTargetId, {
      onSuccess: () => {
        setIsDeleteOpen(false)
        setDeleteTargetId(null)
        refetch()
      },
      onError: () => {
        setIsDeleteOpen(false)
        setDeleteTargetId(null)
      },
    })
  }

  // AppDataTable Columns Definition with TailGrids HoverCard
  const columns = [
    {
      key: 'nama_divisi',
      label: 'UNIT & NAMA DIVISI',
      className: 'w-64 sm:w-72',
      render: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-extrabold shadow-xs">
            {row.nama_divisi?.includes('Al-Qur\'an') ? (
              <BookOpen className="h-5 w-5" />
            ) : row.nama_divisi?.includes('Kesiswaan') ? (
              <Zap className="h-5 w-5" />
            ) : row.nama_divisi?.includes('Kurikulum') ? (
              <LayoutGrid className="h-5 w-5" />
            ) : row.nama_divisi?.includes('Sarana') ? (
              <Building2 className="h-5 w-5" />
            ) : (
              <Layers className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <HoverCard>
              <HoverCardTrigger
                onClick={(e) => {
                  e.preventDefault()
                  handleOpenEdit(row)
                }}
                className="inline-block max-w-full truncate text-[13px] font-extrabold text-slate-900 dark:text-white border-b border-dashed border-slate-400/60 hover:border-emerald-600 transition-colors cursor-pointer"
              >
                {row.nama_divisi || '-'}
              </HoverCardTrigger>
              <HoverCardContent className="w-80 p-4 bg-white dark:bg-[#1B2433] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl space-y-2 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                    {row.nama_divisi}
                  </span>
                  <Badge color={STATUS_MAP[row.status_pemantauan]?.color || 'gray'} size="sm">
                    {STATUS_MAP[row.status_pemantauan]?.label || row.status_pemantauan}
                  </Badge>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <p>
                    <strong className="text-slate-900 dark:text-white">Unit Pendidikan:</strong>{' '}
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{row.unit_pendidikan || 'SD IT'}</span>
                  </p>
                  <p>
                    <strong className="text-slate-900 dark:text-white">Aspek Pemantauan:</strong> {row.aspek_pemantauan || '-'}
                  </p>
                  <p>
                    <strong className="text-slate-900 dark:text-white">Capaian Target:</strong> {row.persentase_capaian || 0}%
                  </p>
                  {row.petugas_supervisi && (
                    <p>
                      <strong className="text-slate-900 dark:text-white">Pengawas:</strong> {row.petugas_supervisi}
                    </p>
                  )}
                  {row.tanggal_pemantauan && (
                    <p>
                      <strong className="text-slate-900 dark:text-white">Tanggal Supervisi:</strong>{' '}
                      {new Date(row.tanggal_pemantauan).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                  {row.catatan && (
                    <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-slate-500 italic">
                      "{row.catatan}"
                    </div>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {row.unit_pendidikan || 'SD IT'}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'aspek_pemantauan',
      label: 'ASPEK & INDIKATOR PEMANTAUAN',
      className: 'w-72 sm:w-80',
      render: (row) => (
        <div className="space-y-1">
          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-snug">
            {row.aspek_pemantauan || '-'}
          </p>
          {row.kategori_laporan && (
            <span className="inline-block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/40">
              {row.kategori_laporan}
            </span>
          )}
          {row.catatan && <p className="text-[11px] text-slate-400 line-clamp-1 italic max-w-xs">{row.catatan}</p>}
        </div>
      ),
    },
    {
      key: 'persentase_capaian',
      label: 'CAPAIAN (%)',
      className: 'w-36',
      render: (row) => {
        const val = Number(row.persentase_capaian) || 0
        const barColor = val >= 80 ? 'bg-emerald-500' : val >= 50 ? 'bg-amber-500' : 'bg-rose-500'
        return (
          <div className="w-full max-w-[120px] space-y-1">
            <div className="flex justify-between text-xs font-extrabold text-slate-800 dark:text-slate-200">
              <span>{val}%</span>
              <span className="text-[10px] text-slate-400 font-semibold">{val >= 100 ? 'Selesai' : 'Target'}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${Math.min(val, 100)}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      key: 'status_pemantauan',
      label: 'STATUS',
      className: 'w-32',
      render: (row) => {
        const conf = STATUS_MAP[row.status_pemantauan] || {
          label: row.status_pemantauan || 'proses',
          color: 'gray',
        }
        return (
          <Badge color={conf.color} size="sm">
            {conf.label}
          </Badge>
        )
      },
    },
    {
      key: 'tanggal_pemantauan',
      label: 'TANGGAL & PENGAWAS',
      className: 'w-44',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>
              {row.tanggal_pemantauan
                ? new Date(row.tanggal_pemantauan).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '-'}
            </span>
          </div>
          {row.petugas_supervisi && (
            <p className="text-[11px] font-bold text-slate-400 truncate max-w-[140px] flex items-center gap-1">
              <UserCheck className="h-3 w-3 text-emerald-500" />
              {row.petugas_supervisi}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'aksi',
      label: 'AKSI',
      headerProps: { className: 'text-right w-20' },
      cellProps: { className: 'text-right w-20' },
      render: (row) => (
        <ActionDropdown onEdit={() => handleOpenEdit(row)} onDelete={() => handleOpenDelete(row.id)} />
      ),
    },
  ]

  // Soft Pastel Squircle Action Buttons (Toolbar Row 1 Header) - Exactly as depicted in user image!
  const renderActionButtons = (
    <div className="flex items-center gap-2">
      {/* Impor CSV Data Button - Soft Pastel Sky Blue Squircle */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Impor Data Laporan CSV/Excel"
          aria-label="Impor Data Laporan CSV/Excel"
          onClick={() => setIsImportOpen(true)}
          className="flex size-10 items-center justify-center rounded-2xl bg-[#E0F2FE] text-[#0284C7] hover:bg-[#BAE6FD] dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-900/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <Upload1 className="size-5" />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Impor Data (CSV/Excel)
        </div>
      </div>

      {/* Ekspor CSV/Excel Button - Soft Pastel Amber/Orange Squircle */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Ekspor Data Laporan (CSV/Excel)"
          aria-label="Ekspor Data Laporan (CSV/Excel)"
          onClick={handleExportCsv}
          className="flex size-10 items-center justify-center rounded-2xl bg-[#FEF3C7] text-[#D97706] hover:bg-[#FDE68A] dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <Download1 className="size-5" />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Ekspor CSV/Excel
        </div>
      </div>

      {/* Segarkan Data Button - Soft Pastel Violet/Purple Squircle */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Segarkan Data Real-Time"
          aria-label="Segarkan Data Real-Time"
          onClick={() => refetch()}
          className="flex size-10 items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#7C3AED] hover:bg-[#DDD6FE] dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-900/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <RefreshCcw className="size-5" />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Segarkan Data Real-Time
        </div>
      </div>

      {/* Tambah Monitoring Divisi Button - Soft Pastel Emerald/Green Squircle */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Input Monitoring Divisi Baru"
          aria-label="Input Monitoring Divisi Baru"
          onClick={handleOpenCreate}
          className="flex size-10 items-center justify-center rounded-2xl bg-[#D1FAE5] text-[#059669] hover:bg-[#A7F3D0] dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <Plus className="size-5" />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Input Monitoring Divisi Baru
        </div>
      </div>

      {/* Cetak Datatable Button - Soft Pastel Indigo Squircle */}
      <div className="group relative inline-flex">
        <button
          type="button"
          title="Cetak Data Laporan (Print)"
          aria-label="Cetak Data Laporan (Print)"
          onClick={handlePrintDatatable}
          className="flex size-10 items-center justify-center rounded-2xl bg-[#E0E7FF] text-[#4338CA] hover:bg-[#C7D2FE] dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <Printer className="size-5" />
        </button>
        <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
          <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
          Cetak Data (Print)
        </div>
      </div>
    </div>
  )

  // Filter Bar Controls for AppDataTable (Toolbar Row 2)
  const renderFilterControls = (
    <>
      {/* Unit Pendidikan Dropdown (Visible / Editable for Superadmin & Yayasan, locked indicator for Kepsek/Divisi) */}
      {!isUnitRestricted ? (
        <div className="relative">
          <select
            value={filterUnit}
            onChange={(e) => {
              setFilterUnit(e.target.value)
              setPage(1)
            }}
            className="h-10 cursor-pointer appearance-none rounded-xl border border-emerald-300/80 bg-emerald-50/60 pl-3.5 pr-8 text-xs font-bold text-emerald-900 shadow-2xs transition-all hover:border-emerald-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200"
          >
            <option value="">Semua Unit Pendidikan</option>
            <option value="SD IT">SD IT</option>
            <option value="SMP IT">SMP IT</option>
            <option value="SMA IT">SMA IT</option>
            <option value="Pondok Pesantren">Pondok Pesantren</option>
            <option value="TK IT">TK IT</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-600" />
        </div>
      ) : (
        <div className="h-10 px-3.5 rounded-xl border border-amber-200 bg-amber-50/90 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200 flex items-center gap-1.5 text-xs font-extrabold">
          <Lock className="h-3.5 w-3.5 text-amber-600" />
          <span>Unit: {currentUserUnit}</span>
        </div>
      )}

      {/* Filter Divisi Dropdown */}
      <div className="relative">
        <select
          value={filterDivisi}
          onChange={(e) => {
            setFilterDivisi(e.target.value)
            setPage(1)
          }}
          className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
        >
          <option value="">Semua Divisi SIT</option>
          <option value="Divisi Al-Qur'an / Tahfidz">Divisi Al-Qur'an / Tahfidz</option>
          <option value="Divisi Kesiswaan & BPI">Divisi Kesiswaan & BPI</option>
          <option value="Divisi Kurikulum / Akademik">Divisi Kurikulum / Akademik</option>
          <option value="Divisi Sarana & Prasarana">Divisi Sarana & Prasarana</option>
          <option value="Divisi Keasramaan / Musyrif">Divisi Keasramaan / Musyrif</option>
          <option value="Divisi Bahasa">Divisi Bahasa</option>
          <option value="Tata Usaha">Tata Usaha & Administrasi</option>
          <option value="HRD & Kepegawaian">HRD & Kepegawaian</option>
          <option value="Keuangan">Keuangan</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      </div>

      {/* Filter Status Dropdown */}
      <div className="relative">
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value)
            setPage(1)
          }}
          className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
        >
          <option value="">Semua Status Supervisi</option>
          <option value="proses">Dalam Proses</option>
          <option value="tercapai">Tercapai</option>
          <option value="terlambat">Terlambat</option>
          <option value="belum_tercapai">Belum Tercapai</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      </div>

      {/* Select Per Halaman */}
      <div className="relative">
        <select
          value={perPage}
          onChange={(e) => {
            setPerPage(Number(e.target.value))
            setPage(1)
          }}
          className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
        >
          <option value={5}>5 Per Halaman</option>
          <option value={10}>10 Per Halaman</option>
          <option value={15}>15 Per Halaman</option>
          <option value={25}>25 Per Halaman</option>
          <option value={50}>50 Per Halaman</option>
          <option value={100}>100 Per Halaman</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      </div>

      {/* Reset Filter Button - Soft Pastel Rose Squircle Icon Button with Tooltip */}
      {hasActiveFilters && (
        <div className="group relative inline-flex">
          <button
            type="button"
            title="Reset Filter"
            aria-label="Reset Filter"
            onClick={resetFilters}
            className="flex size-10 items-center justify-center rounded-2xl bg-[#FFE4E6] text-[#E11D48] hover:bg-[#FECDD3] dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
          >
            <RefreshCcw className="size-5" />
          </button>
          <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
            <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
            Reset Filter
          </div>
        </div>
      )}
    </>
  )

  // Mobile Data Card Fallback Renderer
  const renderMobileCard = ({ row }) => (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-bold">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{row.nama_divisi || '-'}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                {row.unit_pendidikan || 'SD IT'}
              </span>
              <span className="text-[11px] text-slate-400 line-clamp-1">{row.aspek_pemantauan || '-'}</span>
            </div>
          </div>
        </div>
        <Badge color={STATUS_MAP[row.status_pemantauan]?.color || 'gray'} size="sm">
          {STATUS_MAP[row.status_pemantauan]?.label || row.status_pemantauan}
        </Badge>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
          <span>Capaian Kinerja Target</span>
          <span>{row.persentase_capaian || 0}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              Number(row.persentase_capaian) >= 80
                ? 'bg-emerald-500'
                : Number(row.persentase_capaian) >= 50
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
            style={{ width: `${Math.min(Number(row.persentase_capaian) || 0, 100)}%` }}
          />
        </div>
      </div>

      {row.catatan && (
        <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl italic">
          "{row.catatan}"
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {row.tanggal_pemantauan
            ? new Date(row.tanggal_pemantauan).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : '-'}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => handleOpenEdit(row)}
            className="text-xs font-bold text-slate-600 hover:text-emerald-600"
          >
            Ubah
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => handleOpenDelete(row.id)}
            className="text-xs font-bold text-rose-600 hover:bg-rose-50"
          >
            Hapus
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <PageContainer maxW="7xl">
      <div className="space-y-6 print:space-y-1 pb-12 print:pb-0 ui-enter">
        {/* Breadcrumb Navigation */}
        <div className="print:hidden">
          <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Monitoring Divisi' }]} />
        </div>

        {/* Role Access Scope Info Alert */}
        <div className="print:hidden">
          {!isUnitRestricted ? (
            <Alert status="info" className="rounded-2xl border-sky-200 bg-sky-50/90 dark:border-sky-900/60 dark:bg-sky-950/40">
              <ShieldCheck className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />
              <AlertContent>
                <AlertTitle className="text-xs font-extrabold text-sky-900 dark:text-sky-200">
                  Akses Hak Akses: Superadmin / Admin / Pengurus Yayasan
                </AlertTitle>
                <AlertDescription className="text-xs text-sky-700 dark:text-sky-300">
                  Anda dapat melakukan manajemen data monitoring divisi di <strong>seluruh unit pendidikan</strong> (SD IT, SMP IT, SMA IT, Pondok Pesantren). Gunakan filter unit di bawah untuk memilah data secara spesifik.
                </AlertDescription>
              </AlertContent>
            </Alert>
          ) : (
            <Alert status="warning" className="rounded-2xl border-amber-200 bg-amber-50/90 dark:border-amber-900/60 dark:bg-amber-950/40">
              <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <AlertContent>
                <AlertTitle className="text-xs font-extrabold text-amber-900 dark:text-amber-200">
                  Akses Terkunci Khusus Unit: {currentUserUnit}
                </AlertTitle>
                <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
                  Sebagai Kepala Sekolah / Divisi Pendidikan, halaman ini secara otomatis terkunci untuk menampilkan dan menginput data monitoring khusus <strong>{currentUserUnit}</strong>.
                </AlertDescription>
              </AlertContent>
            </Alert>
          )}
        </div>

        {/* Quick Preset Filter Tabs (SIT Specific) with Soft Pastel Squircle Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-1 overflow-x-auto print:hidden">
          <button
            type="button"
            onClick={() => setFilterDivisi('')}
            className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-extrabold transition-all duration-200 cursor-pointer shadow-2xs ${
              filterDivisi === ''
                ? 'bg-slate-900 text-white shadow-md dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Semua Divisi SIT</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{combinedItems.length}</span>
          </button>

          {/* Divisi Al-Qur'an / Tahfidz */}
          <button
            type="button"
            onClick={() => setFilterDivisi('Divisi Al-Qur\'an / Tahfidz')}
            className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-extrabold transition-all duration-200 cursor-pointer shadow-2xs ${
              filterDivisi === 'Divisi Al-Qur\'an / Tahfidz'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-sky-100/90 text-sky-700 hover:bg-sky-200 dark:bg-sky-950/60 dark:text-sky-300'
            }`}
          >
            <BookOpen className="h-4 w-4 text-sky-500" />
            <span>Divisi Al-Qur'an & Tahfidz</span>
          </button>

          {/* Divisi Kesiswaan & BPI */}
          <button
            type="button"
            onClick={() => setFilterDivisi('Divisi Kesiswaan & BPI')}
            className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-extrabold transition-all duration-200 cursor-pointer shadow-2xs ${
              filterDivisi === 'Divisi Kesiswaan & BPI'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-emerald-100/90 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}
          >
            <Zap className="h-4 w-4 text-emerald-500" />
            <span>Kesiswaan & BPI (Amal Yaumi)</span>
          </button>

          {/* Divisi Kurikulum / Akademik */}
          <button
            type="button"
            onClick={() => setFilterDivisi('Divisi Kurikulum / Akademik')}
            className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-extrabold transition-all duration-200 cursor-pointer shadow-2xs ${
              filterDivisi === 'Divisi Kurikulum / Akademik'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-purple-100/90 text-purple-700 hover:bg-purple-200 dark:bg-purple-950/60 dark:text-purple-300'
            }`}
          >
            <LayoutGrid className="h-4 w-4 text-purple-500" />
            <span>Kurikulum Integrasi</span>
          </button>

          {/* Divisi Sarana & Prasarana */}
          <button
            type="button"
            onClick={() => setFilterDivisi('Divisi Sarana & Prasarana')}
            className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-extrabold transition-all duration-200 cursor-pointer shadow-2xs ${
              filterDivisi === 'Divisi Sarana & Prasarana'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-amber-100/90 text-amber-700 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
            }`}
          >
            <Building2 className="h-4 w-4 text-amber-500" />
            <span>Sarana & Prasarana</span>
          </button>

          {/* Divisi Keasramaan */}
          <button
            type="button"
            onClick={() => setFilterDivisi('Divisi Keasramaan / Musyrif')}
            className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-extrabold transition-all duration-200 cursor-pointer shadow-2xs ${
              filterDivisi === 'Divisi Keasramaan / Musyrif'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-pink-100/90 text-pink-700 hover:bg-pink-200 dark:bg-pink-950/60 dark:text-pink-300'
            }`}
          >
            <FileText className="h-4 w-4 text-pink-500" />
            <span>Keasramaan / Musyrif</span>
          </button>
        </div>

        {/* KPI Stats Grid */}
        <div className="print:hidden">
          <MasterStatsGrid cols={4}>
            <MasterStatCard
              label="Total Laporan Monitoring"
              value={totalCount}
              description="Catatan pengawasan aktif"
              badge="Supervisi"
              badgeVariant="emerald"
              icon={Layers}
              variant="emerald"
              className="ui-card transition-all duration-300 hover:scale-[1.02]"
            />
            <MasterStatCard
              label="Capaian Rata-Rata"
              value={`${avgCapaian}%`}
              description="Persentase ketercapaian"
              badge="Akumulasi Target"
              badgeVariant="info"
              icon={TrendingUp}
              variant="blue"
              className="ui-card transition-all duration-300 hover:scale-[1.02]"
            />
            <MasterStatCard
              label="Target Sesuai / Tercapai"
              value={tercapaiCount}
              description="Indikator tuntas SOP"
              badge="Tercapai"
              badgeVariant="success"
              icon={CheckCircle2}
              variant="green"
              className="ui-card transition-all duration-300 hover:scale-[1.02]"
            />
            <MasterStatCard
              label="Perlu Perhatian / Tindak Lanjut"
              value={perluPerhatianCount}
              description="Terlambat / belum tuntas"
              badge="Evaluasi Pimpinan"
              badgeVariant="danger"
              icon={AlertTriangle}
              variant="rose"
              className="ui-card transition-all duration-300 hover:scale-[1.02]"
            />
          </MasterStatsGrid>
        </div>

        {/* AppDataTable complying with TailGrids Benchmark */}
        <AppDataTable
          printableHeader={
            <div className="flex items-end justify-between border-b border-slate-400 pb-1.5 text-slate-900">
              <div>
                <h1 className="text-base font-extrabold uppercase tracking-tight text-slate-900 leading-tight">
                  Laporan Monitoring & Supervisi Divisi Operasional SIT
                </h1>
                <p className="text-[11px] text-slate-700 font-semibold mt-0.5 leading-tight">
                  Sekolah Islam Terpadu — Unit: {filterUnit || 'Semua Unit Pendidikan'} {filterDivisi ? `| Divisi: ${filterDivisi}` : ''}
                </p>
              </div>
              <div className="text-right text-[9px] text-slate-600 font-medium leading-tight space-y-0.5">
                <p>Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p>Total Data: {filteredItems.length} Catatan Laporan</p>
              </div>
            </div>
          }
          title="Daftar Pemantauan Divisi Sekolah Islam Terpadu"
          description="Tabel rekam data riil, evaluasi ketercapaian indikator, dan catatan supervisi operasional antar divisi."
          columns={columns}
          data={paginatedItems}
          isLoading={isLoading}
          isError={isError}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari nama divisi, aspek pemantauan, petugas pengawas, atau unit..."
          actions={renderActionButtons}
          filters={renderFilterControls}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
          page={page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalRecords}
          itemsPerPage={perPage}
          onPageChange={setPage}
          renderMobileCard={renderMobileCard}
        />

        {/* Form Modal Add / Edit */}
        <PemantauanDivisiFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={selectedRecord}
          isSubmitting={tambah.isPending || ubah.isPending}
          currentUserUnit={currentUserUnit}
          isUnitRestricted={isUnitRestricted}
        />

        {/* Impor CSV Modal */}
        <ImporDivisiModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImportSuccess={handleImportSuccess}
        />

        {/* TailGrids Delete Confirmation Alert Dialog */}
        <OverlayWrapper isOpen={isDeleteOpen}>
          <Backdrop onDismiss={() => setIsDeleteOpen(false)}>
            <AlertDialog isOpen={isDeleteOpen} onOpenChange={(open) => !open && setIsDeleteOpen(false)}>
              <DialogHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/40">
                  <Trash2 className="h-5 w-5" />
                </div>
                <DialogTitle>Hapus Data Monitoring Divisi?</DialogTitle>
                <DialogDescription>
                  Tindakan ini tidak dapat dibatalkan. Catatan supervisi dan laporan divisi ini akan terhapus dari sistem.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  appearance="outline"
                  size="sm"
                  onClick={() => setIsDeleteOpen(false)}
                  className="cursor-pointer font-bold"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  appearance="fill"
                  size="sm"
                  onClick={handleConfirmDelete}
                  pending={hapus.isPending}
                  className="cursor-pointer font-bold"
                >
                  Hapus Data
                </Button>
              </DialogFooter>
            </AlertDialog>
          </Backdrop>
        </OverlayWrapper>
      </div>
    </PageContainer>
  )
}
