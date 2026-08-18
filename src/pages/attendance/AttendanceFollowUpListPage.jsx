import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HeartPulse,
  Plus,
  Search,
  ShieldAlert,
  UserCheck,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { lmsPresensiService } from '../../services/lmsPresensiService'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import AppBadge from '../../components/app/AppBadge'
import AppSkeleton from '../../components/app/AppSkeleton'
import AppEmptyState from '../../components/app/AppEmptyState'
import { Button } from '@/components/tailgrids/core/button'
import { Input } from '@/components/tailgrids/core/input'
import { Pagination } from '@/components/tailgrids/core/pagination'
import { TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from '@/components/tailgrids/core/table'
import { Avatar, AvatarFallback } from '@/components/tailgrids/core/avatar'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/tailgrids/core/dialog'
import { Backdrop } from '@/components/tailgrids/core/overlay'

export default function AttendanceFollowUpListPage() {
  const [loading, setLoading] = useState(true)
  const [followUps, setFollowUps] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 10

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [formData, setFormData] = useState({
    student_id: '',
    action_type: 'panggilan_orang_tua',
    follow_up_date: new Date().toISOString().slice(0, 10),
    notes: '',
  })

  const loadFollowUps = async () => {
    setLoading(true)
    try {
      const response = await lmsPresensiService.getFollowUps({ status: statusFilter === 'all' ? undefined : statusFilter })
      const raw = response.data?.data || response.data || []
      setFollowUps(Array.isArray(raw) ? raw : [])
    } catch (err) {
      console.error('Failed to load follow ups:', err)
      setFollowUps([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFollowUps()
  }, [statusFilter])

  const filteredFollowUps = useMemo(() => {
    return followUps.filter((item) => {
      const term = search.toLowerCase()
      const studentName = (item.student?.full_name || item.student_name || item.siswa_nama || '').toLowerCase()
      const action = (item.action_taken || item.action_type || '').toLowerCase()
      return !term || studentName.includes(term) || action.includes(term)
    })
  }, [followUps, search])

  const totalPages = Math.ceil(filteredFollowUps.length / perPage) || 1
  const paginatedFollowUps = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filteredFollowUps.slice(start, start + perPage)
  }, [filteredFollowUps, currentPage])

  const handleCreateFollowUp = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await lmsPresensiService.createFollowUp(formData)
      Swal.fire({
        icon: 'success',
        title: 'Tindak Lanjut Berhasil Ditambahkan',
        text: 'Catatan penanganan siswa telah disimpan.',
        timer: 2000,
        showConfirmButton: false,
      })
      setCreateModalOpen(false)
      loadFollowUps()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal membuat tindak lanjut',
        text: err.response?.data?.message || 'Terjadi kesalahan.',
      })
    } finally {
      setBusy(false)
    }
  }

  const handleComplete = async (id) => {
    try {
      await lmsPresensiService.completeFollowUp(id)
      Swal.fire({
        icon: 'success',
        title: 'Tindak Lanjut Selesai',
        text: 'Status tindak lanjut telah diperbarui menjadi Selesai.',
        timer: 1500,
        showConfirmButton: false,
      })
      loadFollowUps()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal memperbarui status',
        text: err.response?.data?.message || 'Terjadi kesalahan.',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div>
        <AppBreadcrumb items={[{ label: 'Absensi', href: '/absensi' }, { label: 'Tindak Lanjut Siswa' }]} />
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Tindak Lanjut Siswa Bermasalah Presensi
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              Pencatatan dan pemantauan penanganan siswa yang sering tidak hadir / alpa.
            </p>
          </div>
          <Button
            variant="primary"
            appearance="fill"
            size="md"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Tambah Catatan Tindak Lanjut
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Cari nama siswa atau jenis penanganan..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Status Penanganan:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="all">Semua Status</option>
            <option value="new">Baru</option>
            <option value="in_progress">Dalam Penanganan</option>
            <option value="completed">Selesai</option>
          </select>
        </div>
      </div>

      {/* Datatable */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-[#1B2433]">
        {loading ? (
          <div className="p-6">
            <AppSkeleton rows={5} />
          </div>
        ) : paginatedFollowUps.length === 0 ? (
          <div className="p-8">
            <AppEmptyState title="Tidak ada catatan tindak lanjut" description="Belum ada data penanganan siswa bermasalah presensi." />
          </div>
        ) : (
          <>
            <TableRoot fullBleed={false}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Siswa & Rombel</TableHead>
                  <TableHead>Jenis Tindakan</TableHead>
                  <TableHead>Tanggal Penanganan</TableHead>
                  <TableHead>Catatan & Hasil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFollowUps.map((item, index) => {
                  const studentName = item.student?.full_name || item.student_name || item.siswa_nama || 'Siswa'
                  const initials = studentName.slice(0, 2).toUpperCase()
                  const status = item.status || 'new'

                  return (
                    <TableRow key={item.id || index} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50">
                      <TableCell className="font-semibold text-slate-500">
                        {(currentPage - 1) * perPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            <AvatarFallback className="bg-rose-100 text-rose-800 text-xs font-bold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{studentName}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{item.student?.rombel?.name || item.rombel || '-'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="rounded-md bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                          {item.action_taken || item.action_type || 'Panggilan Orang Tua'}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {item.follow_up_date || item.tanggal || '-'}
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-slate-700 dark:text-slate-300 max-w-xs line-clamp-2">
                          {item.notes || item.catatan || '-'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <AppBadge variant={status === 'completed' ? 'success' : status === 'in_progress' ? 'warning' : 'danger'}>
                          {status === 'completed' ? 'Selesai' : status === 'in_progress' ? 'Diproses' : 'Baru'}
                        </AppBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        {status !== 'completed' && (
                          <Button
                            variant="primary"
                            appearance="fill"
                            size="xs"
                            onClick={() => handleComplete(item.id)}
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Tandai Selesai
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </TableRoot>

            <div className="w-full border-t border-slate-200 px-4 py-3.5 sm:px-6 dark:border-slate-800">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
                sideLayout="full"
              />
            </div>
          </>
        )}
      </div>

      {/* Modal Add Follow Up */}
      {createModalOpen && (
        <Backdrop isOpen={createModalOpen} onOpenChange={setCreateModalOpen}>
          <Dialog className="max-w-md">
            <form onSubmit={handleCreateFollowUp}>
              <DialogHeader>
                <DialogTitle>Tambah Catatan Tindak Lanjut Siswa</DialogTitle>
                <DialogDescription>Input tindakan konseling/panggilan untuk siswa bermasalah absensi.</DialogDescription>
              </DialogHeader>
              <DialogBody className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">ID Siswa / NISN:</label>
                  <Input
                    required
                    type="text"
                    placeholder="Masukkan ID/NISN siswa..."
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    className="mt-1 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Jenis Tindakan:</label>
                  <select
                    value={formData.action_type}
                    onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <option value="panggilan_orang_tua">Panggilan Orang Tua / Wali</option>
                    <option value="bimbingan_bk">Bimbingan & Konseling (BK)</option>
                    <option value="surat_peringatan_1">Surat Peringatan 1 (SP1)</option>
                    <option value="surat_peringatan_2">Surat Peringatan 2 (SP2)</option>
                    <option value="surat_peringatan_3">Surat Peringatan 3 (SP3)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tanggal Tindakan:</label>
                  <input
                    type="date"
                    required
                    value={formData.follow_up_date}
                    onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Catatan Penanganan & Hasil:</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Tuliskan catatan hasil pertemuan/tindakan..."
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>
              </DialogBody>
              <DialogFooter>
                <Button variant="ghost" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
                  Batal
                </Button>
                <Button variant="primary" size="sm" type="submit" pending={busy}>
                  Simpan Tindak Lanjut
                </Button>
              </DialogFooter>
            </form>
          </Dialog>
        </Backdrop>
      )}
    </div>
  )
}
