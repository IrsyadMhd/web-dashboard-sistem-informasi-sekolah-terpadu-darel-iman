import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileEdit,
  Filter,
  Search,
  XCircle,
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

export default function AttendanceCorrectionPage() {
  const [loading, setLoading] = useState(true)
  const [corrections, setCorrections] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('submitted')
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 10

  const [selectedItem, setSelectedItem] = useState(null)
  const [reviewAction, setReviewAction] = useState('approved')
  const [reviewNote, setReviewNote] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const loadCorrections = async () => {
    setLoading(true)
    try {
      const response = await lmsPresensiService.getCorrections({ status: statusFilter === 'all' ? undefined : statusFilter })
      const raw = response.data?.data || response.data || []
      setCorrections(Array.isArray(raw) ? raw : [])
    } catch (err) {
      console.error('Failed to load correction requests:', err)
      setCorrections([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCorrections()
  }, [statusFilter])

  const filteredCorrections = useMemo(() => {
    return corrections.filter((item) => {
      const term = search.toLowerCase()
      const studentName = (item.student?.full_name || item.student_name || item.siswa_nama || '').toLowerCase()
      const subject = (item.subject || item.nama_matpel || '').toLowerCase()
      return !term || studentName.includes(term) || subject.includes(term)
    })
  }, [corrections, search])

  const totalPages = Math.ceil(filteredCorrections.length / perPage) || 1
  const paginatedCorrections = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filteredCorrections.slice(start, start + perPage)
  }, [filteredCorrections, currentPage])

  const handleOpenReviewModal = (item, action) => {
    setSelectedItem(item)
    setReviewAction(action)
    setReviewNote('')
    setModalOpen(true)
  }

  const handleConfirmReview = async () => {
    if (!selectedItem) return
    setBusy(true)
    try {
      await lmsPresensiService.reviewCorrection(selectedItem.id, {
        status: reviewAction,
        review_note: reviewNote,
      })

      Swal.fire({
        icon: 'success',
        title: reviewAction === 'approved' ? 'Koreksi Disetujui' : 'Koreksi Ditolak',
        text: `Pengajuan koreksi presensi berhasil di-${reviewAction === 'approved' ? 'setujui' : 'tolak'}.`,
        timer: 2000,
        showConfirmButton: false,
      })

      setModalOpen(false)
      loadCorrections()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal memproses koreksi',
        text: err.response?.data?.message || 'Terjadi kesalahan saat memproses permohonan koreksi.',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div>
        <AppBreadcrumb items={[{ label: 'Absensi', href: '/absensi' }, { label: 'Koreksi Presensi' }]} />
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Koreksi Presensi Siswa & Kelas
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              Persetujuan perubahan/perbaikan status presensi siswa yang salah diinput sebelumnya.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Cari siswa atau mata pelajaran..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Status Koreksi:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="submitted">Menunggu Persetujuan</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
            <option value="all">Semua Status</option>
          </select>
        </div>
      </div>

      {/* Corrections Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-[#1B2433]">
        {loading ? (
          <div className="p-6">
            <AppSkeleton rows={5} />
          </div>
        ) : paginatedCorrections.length === 0 ? (
          <div className="p-8">
            <AppEmptyState title="Tidak ada pengajuan koreksi" description="Belum ada permohonan koreksi presensi yang cocok dengan kriteria ini." />
          </div>
        ) : (
          <>
            <TableRoot fullBleed={false}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Siswa & Tanggal</TableHead>
                  <TableHead>Mata Pelajaran & Sesi</TableHead>
                  <TableHead>Perubahan Status</TableHead>
                  <TableHead>Alasan Perubahan</TableHead>
                  <TableHead>Status Koreksi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCorrections.map((item, index) => {
                  const studentName = item.student?.full_name || item.student_name || item.siswa_nama || 'Siswa'
                  const status = item.status || 'submitted'

                  return (
                    <TableRow key={item.id || index} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50">
                      <TableCell className="font-semibold text-slate-500">
                        {(currentPage - 1) * perPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-slate-900 dark:text-white">{studentName}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{item.attendance_date || item.tanggal || '-'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-emerald-700 dark:text-emerald-400">
                          {item.subject || item.nama_matpel || 'Mata Pelajaran'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">Sesi #{item.session_id || 1}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <span className="rounded bg-rose-50 px-2 py-0.5 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                            {item.original_status || 'Alpa'}
                          </span>
                          <ArrowRight size={13} className="text-slate-400" />
                          <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {item.corrected_status || 'Hadir'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-slate-700 dark:text-slate-300 max-w-xs line-clamp-2">
                          {item.reason || item.alasan || '-'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <AppBadge variant={status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning'}>
                          {status === 'approved' ? 'Disetujui' : status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                        </AppBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        {status === 'submitted' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="primary"
                              appearance="fill"
                              size="xs"
                              onClick={() => handleOpenReviewModal(item, 'approved')}
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Setujui
                            </Button>
                            <Button
                              variant="danger"
                              appearance="outline"
                              size="xs"
                              onClick={() => handleOpenReviewModal(item, 'rejected')}
                            >
                              <XCircle className="mr-1 h-3.5 w-3.5" /> Tolak
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">Selesai</span>
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

      {/* Review Dialog Modal */}
      {modalOpen && (
        <Backdrop isOpen={modalOpen} onOpenChange={setModalOpen}>
          <Dialog className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {reviewAction === 'approved' ? 'Setujui Koreksi Presensi' : 'Tolak Koreksi Presensi'}
              </DialogTitle>
              <DialogDescription>
                Siswa: <span className="font-semibold">{selectedItem?.student?.full_name || selectedItem?.student_name}</span>
              </DialogDescription>
            </DialogHeader>
            <DialogBody className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Catatan Alasan Koreksi (Opsional):
                </label>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Masukkan catatan pertimbangan koreksi..."
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button
                variant={reviewAction === 'approved' ? 'primary' : 'danger'}
                size="sm"
                pending={busy}
                onClick={handleConfirmReview}
              >
                {reviewAction === 'approved' ? 'Setujui Koreksi' : 'Tolak Koreksi'}
              </Button>
            </DialogFooter>
          </Dialog>
        </Backdrop>
      )}
    </div>
  )
}
