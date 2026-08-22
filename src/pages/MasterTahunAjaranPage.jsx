import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Plus,
  Printer,
  Star,
  Upload,
  X,
} from 'lucide-react'
import { tahunAjaranService } from '../services/tahunAjaranService'
import TahunAjaranTable from '../components/tahun-ajaran/TahunAjaranTable'
import TahunAjaranFormModal from '../components/tahun-ajaran/TahunAjaranFormModal'
import TahunAjaranDetailModal from '../components/tahun-ajaran/TahunAjaranDetailModal'
import TahunAjaranImportModal from '../components/tahun-ajaran/TahunAjaranImportModal'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import ConfirmDialog from '../components/app/ConfirmDialog'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import {
  MasterActionButton,
  MasterDataPage,
  MasterDataSection,
  MasterDeleteDialog,
  MasterFilterSelect,
  MasterPageHeader,
  MasterStatCard,
  MasterStatsGrid,
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'

function KpiTintedCard({ icon: Icon, label, subtext, value, tone = 'emerald' }) {
  const tones = {
    emerald: {
      card: 'border-emerald-100 bg-emerald-50/50 hover:border-emerald-200 dark:border-emerald-950/50 dark:bg-emerald-950/20',
      title: 'text-emerald-700 dark:text-emerald-400',
      icon: 'text-emerald-500',
      val: 'text-emerald-600 dark:text-emerald-300',
      sub: 'text-emerald-600/70 dark:text-emerald-400/70',
    },
    blue: {
      card: 'border-blue-100 bg-blue-50/50 hover:border-blue-200 dark:border-blue-950/50 dark:bg-blue-950/20',
      title: 'text-blue-700 dark:text-blue-400',
      icon: 'text-blue-500',
      val: 'text-blue-600 dark:text-blue-300',
      sub: 'text-blue-600/70 dark:text-blue-400/70',
    },
    amber: {
      card: 'border-amber-100 bg-amber-50/50 hover:border-amber-200 dark:border-amber-950/50 dark:bg-amber-950/20',
      title: 'text-amber-700 dark:text-amber-400',
      icon: 'text-amber-500',
      val: 'text-amber-600 dark:text-amber-300',
      sub: 'text-amber-600/70 dark:text-amber-400/70',
    },
  }
  const t = tones[tone] || tones.emerald
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`text-left rounded-2xl border ${t.card} p-5 shadow-xs transition-all hover:shadow-md cursor-default group`}
    >
      <div className="flex items-center justify-between">
        <p className={`text-xs font-semibold ${t.title}`}>{label}</p>
        <Icon className={`h-4 w-4 ${t.icon} opacity-0 group-hover:opacity-100 transition-opacity`} />
      </div>
      <p className={`mt-2 text-3xl font-extrabold ${t.val}`}>{value ?? 0}</p>
      {subtext && (
        <p className={`mt-1.5 text-[10px] font-bold ${t.sub} flex items-center gap-0.5`}>
          {subtext}
        </p>
      )}
    </motion.div>
  )
}

export default function MasterTahunAjaranPage({ embedded = false, hidePageHeader = false, hideBreadcrumb = false }) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
  const [denganSampahFilter, setDenganSampahFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedForEdit, setSelectedForEdit] = useState(null)
  const [selectedForDetail, setSelectedForDetail] = useState(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [pendingSavePayload, setPendingSavePayload] = useState(null)
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false)
  const [notifications, setNotifications] = useState([])
  const perPage = 15

  const query = useQuery({
    queryKey: ['tahun-ajaran-list', page, perPage, search, selectedStatusFilter, denganSampahFilter],
    queryFn: () => tahunAjaranService.getDaftar({
      page,
      per_page: perPage,
      search,
      status: selectedStatusFilter,
      dengan_sampah: denganSampahFilter,
      order_by: 'start_date',
      order_dir: 'desc',
    }),
  })
  const listData = Array.isArray(query.data) ? query.data : (query.data?.data || [])
  const meta = query.data?.meta || {}
  const stats = query.data?.statistik || {}

  const notify = (title, message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setNotifications((items) => [...items, { id, title, message, tone }])
    window.setTimeout(() => setNotifications((items) => items.filter((item) => item.id !== id)), 5500)
  }
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tahun-ajaran-list'] })
  const apiError = (err, fallback) => notify('Terjadi Kesalahan', err?.response?.data?.message || fallback, 'danger')

  const simpanMutation = useMutation({
    mutationFn: tahunAjaranService.tambah,
    onSuccess: (res) => {
      invalidate()
      setIsFormModalOpen(false)
      notify('Berhasil Disimpan', res?.message || 'Tahun ajaran baru berhasil ditambahkan.')
    },
    onError: (err) => apiError(err, 'Gagal menyimpan data tahun ajaran.'),
  })
  const ubahMutation = useMutation({
    mutationFn: tahunAjaranService.ubah,
    onSuccess: (res) => {
      invalidate()
      setIsFormModalOpen(false)
      setSelectedForEdit(null)
      notify('Berhasil Diubah', res?.message || 'Perubahan tahun ajaran berhasil disimpan.')
    },
    onError: (err) => apiError(err, 'Gagal memperbarui data tahun ajaran.'),
  })
  const setAktifMutation = useMutation({
    mutationFn: tahunAjaranService.setAktif,
    onSuccess: (res) => {
      invalidate()
      notify('Periode Aktif Diperbarui', res?.message || 'Tahun ajaran berhasil dijadikan periode aktif.')
    },
    onError: (err) => apiError(err, 'Gagal mengaktifkan tahun ajaran.'),
  })
  const hapusMutation = useMutation({
    mutationFn: tahunAjaranService.hapus,
    onSuccess: (res) => {
      invalidate()
      setDeleteTarget(null)
      notify('Berhasil Dihapus', res?.message || 'Tahun ajaran berhasil dihapus.', 'danger')
    },
    onError: (err) => apiError(err, 'Gagal menghapus data tahun ajaran.'),
  })
  const pulihkanMutation = useMutation({
    mutationFn: tahunAjaranService.pulihkan,
    onSuccess: (res) => {
      invalidate()
      notify('Berhasil Dipulihkan', res?.message || 'Tahun ajaran berhasil dipulihkan.')
    },
    onError: (err) => apiError(err, 'Gagal memulihkan data tahun ajaran.'),
  })
  const importMutation = useMutation({
    mutationFn: tahunAjaranService.prosesImport,
    onSuccess: (res, rows) => {
      invalidate()
      setIsImportModalOpen(false)
      notify('Impor Selesai', res?.message || `${rows.length} baris tahun ajaran berhasil diproses.`)
    },
    onError: (err) => apiError(err, 'Gagal memproses impor data.'),
  })

  const activeCount = stats.aktif ?? 0
  const inactiveCount = stats.tidak_aktif ?? 0
  const total = stats.total ?? 0
  const statsValue = (value) => (query.isError ? '—' : value)
  const tableIsLoading = query.isLoading || query.isFetching
  const filtersAreClear = !search && !selectedStatusFilter && !denganSampahFilter

  const openAdd = () => {
    setSelectedForEdit(null)
    setIsFormModalOpen(true)
  }
  const resetFilters = () => {
    setSearch('')
    setSelectedStatusFilter('')
    setDenganSampahFilter('')
    setPage(1)
  }
  const exportCsv = async () => {
    try {
      const rows = await tahunAjaranService.ekspor({ search, status: selectedStatusFilter })
      if (!rows?.length) {
        notify('Tidak Ada Data', 'Tidak ada data sesuai filter yang dapat diekspor.', 'warning')
        return
      }
      const headers = ['NO', 'NAMA TAHUN AJARAN', 'TANGGAL MULAI', 'TANGGAL SELESAI', 'STATUS AKTIF', 'KETERANGAN', 'TANGGAL DIBUAT']
      const csv = [headers, ...rows.map((row) => [
        row.no, row.nama, row.start_date, row.end_date, row.is_active, row.keterangan || '', row.created_at,
      ])].map((line) => line.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `tahun_ajaran_${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(url)
      setShowExportModal(false)
      notify('Ekspor Berhasil', `${rows.length} data tahun ajaran berhasil diunduh sebagai CSV.`)
    } catch (err) {
      apiError(err, 'Gagal menyiapkan berkas ekspor.')
    }
  }

  const pageActions = (
    <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
      <SquircleActionButton variant="import" label="Import Data" onClick={() => setIsImportModalOpen(true)} />
      <SquircleActionButton variant="export" label="Export Data" onClick={() => setShowExportModal(true)} />
      <SquircleActionButton variant="view" icon={Printer} label="Cetak Data" onClick={() => setIsPrintModalOpen(true)} />
      <SquircleActionButton variant="primary" label="Tambah Tahun Ajaran" onClick={openAdd} />
    </div>
  )

  const shouldHideBreadcrumb = embedded || hideBreadcrumb
  const shouldHideHeader = embedded || hidePageHeader

  return (
    <PageContainer maxW="7xl">
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Tahun Ajaran"
        onPrint={() => {
          const rowsToPrint = Array.isArray(listData) ? listData : []
          printCleanTable({
            title: 'Laporan Data Tahun Ajaran',
            subtitle: 'Daftar Tahun Ajaran Sekolah Islam Terpadu',
            headers: ['NO', 'NAMA TAHUN AJARAN', 'KODE', 'RENTANG TANGGAL', 'KETERANGAN', 'STATUS'],
            rows: rowsToPrint.map((row, i) => [
              i + 1,
              row.name || row.nama || '-',
              row.code || row.kode || '-',
              `${row.start_date || row.tanggal_mulai || '-'} s/d ${row.end_date || row.tanggal_selesai || '-'}`,
              row.keterangan || row.description || '-',
              row.deleted_at ? 'Terhapus' : row.is_active ? 'Aktif Utama' : 'Nonaktif',
            ]),
          })
        }}
        onDownload={() => {
          const rowsToPrint = Array.isArray(listData) ? listData : []
          downloadPdfTable({
            title: 'Laporan Data Tahun Ajaran',
            subtitle: 'Daftar Tahun Ajaran Sekolah Islam Terpadu',
            headers: ['NO', 'NAMA TAHUN AJARAN', 'KODE', 'RENTANG TANGGAL', 'KETERANGAN', 'STATUS'],
            rows: rowsToPrint.map((row, i) => [
              i + 1,
              row.name || row.nama || '-',
              row.code || row.kode || '-',
              `${row.start_date || row.tanggal_mulai || '-'} s/d ${row.end_date || row.tanggal_selesai || '-'}`,
              row.keterangan || row.description || '-',
              row.deleted_at ? 'Terhapus' : row.is_active ? 'Aktif Utama' : 'Nonaktif',
            ]),
            filename: 'laporan_tahun_ajaran.pdf',
          })
        }}
      />
      {!shouldHideBreadcrumb && <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Tahun Ajaran' }]} />}
      <MasterDataPage className="education-unit-page academic-year-page" hideBreadcrumb>
      {!shouldHideHeader && (
        <MasterPageHeader
          tone="brand"
          title="Master Tahun Ajaran"
          description="Kelola periode akademik, rentang tanggal, dan tahun ajaran aktif sekolah."
          icon={CalendarDays}
          actions={pageActions}
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-2">
        <KpiTintedCard icon={CalendarDays} label="Total Periode" value={statsValue(total)} subtext="Tersimpan di sistem" tone="emerald" />
        <KpiTintedCard icon={Star} label="Periode Aktif" value={statsValue(activeCount)} subtext="Ditandai sebagai periode utama" tone="blue" />
        <KpiTintedCard icon={Archive} label="Tidak Aktif" value={statsValue(inactiveCount)} subtext="Periode lampau atau mendatang" tone="amber" />
      </div>

      <MasterDataSection
        title="Daftar Tahun Ajaran"
        description="Periode akademik sesuai filter aktif."
        countLabel={`${Number(meta.total ?? listData.length).toLocaleString('id-ID')} periode`}
        actions={pageActions}
        search={{
          value: search,
          onValueChange: (value) => { setSearch(value); setPage(1) },
          placeholder: 'Cari nama tahun ajaran...',
          'aria-label': 'Cari tahun ajaran',
        }}
        filters={(
          <>
            <MasterFilterSelect aria-label="Filter status periode" value={selectedStatusFilter} onChange={(event) => { setSelectedStatusFilter(event.target.value); setPage(1) }}>
              <option value="">Semua Status</option>
              <option value="true">Aktif Utama</option>
              <option value="false">Tidak Aktif</option>
            </MasterFilterSelect>
            <MasterFilterSelect aria-label="Filter cakupan data tahun ajaran" value={denganSampahFilter} onChange={(event) => { setDenganSampahFilter(event.target.value); setPage(1) }}>
              <option value="">Data Aktif</option>
              <option value="true">Termasuk Terhapus</option>
            </MasterFilterSelect>
          </>
        )}
        onReset={resetFilters}
        resetDisabled={filtersAreClear}
        isLoading={tableIsLoading}
        isError={query.isError}
        errorTitle="Data tahun ajaran gagal dimuat"
        errorMessage="Periksa koneksi atau coba muat ulang data."
        onRetry={query.refetch}
        isEmpty={!tableIsLoading && !query.isError && listData.length === 0}
        emptyTitle="Tahun ajaran tidak ditemukan"
        emptyDescription="Ubah pencarian atau filter, lalu coba kembali."
        pagination={{
          meta: {
            total: meta.total ?? listData.length,
            from: meta.from ?? (listData.length ? (page - 1) * perPage + 1 : 0),
            to: meta.to ?? ((page - 1) * perPage + listData.length),
            last_page: meta.last_page ?? 1,
            current_page: meta.current_page ?? page,
            per_page: meta.per_page ?? perPage,
          },
          page,
          onPageChange: setPage,
        }}
      >
        <TahunAjaranTable
          data={listData}
          page={page}
          perPage={perPage}
          onDetail={setSelectedForDetail}
          onEdit={(item) => { setSelectedForEdit(item); setIsFormModalOpen(true) }}
          onSetAktif={(item) => setAktifMutation.mutate(item.id)}
          onDelete={setDeleteTarget}
          onRestore={(item) => pulihkanMutation.mutate(item.id)}
        />
      </MasterDataSection>

      {showExportModal && <SimpleModal title="Export Tahun Ajaran" description="Format yang didukung oleh modul saat ini adalah CSV." onClose={() => setShowExportModal(false)} icon={FileText}><div className="p-5"><button type="button" className="flex w-full items-center gap-3 rounded-xl border-2 border-emerald-600 bg-emerald-50 p-4 text-left dark:bg-emerald-950/30" onClick={exportCsv}><FileSpreadsheet className="h-6 w-6 text-emerald-700" /><span><b className="block text-sm dark:text-white">CSV (.csv)</b><small className="text-slate-500">Data mengikuti pencarian dan filter status aktif.</small></span></button></div><footer className="flex justify-end gap-2 border-t border-slate-100 p-4 dark:border-slate-700"><button onClick={() => setShowExportModal(false)} className="h-11 rounded-xl border border-slate-200 px-4 text-xs font-semibold dark:border-slate-700 dark:text-white">Batal</button><button onClick={exportCsv} className="h-11 rounded-xl bg-emerald-800 px-5 text-xs font-semibold text-white">Export CSV</button></footer></SimpleModal>}

      <MasterDeleteDialog isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={() => hapusMutation.mutate(deleteTarget.id)} isLoading={hapusMutation.isPending} title={`Hapus tahun ajaran ${deleteTarget?.name || ''}?`} description="Data akan dipindahkan ke arsip dan dapat dipulihkan kembali." />
      <TahunAjaranFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSubmit={(payload) => { setPendingSavePayload(payload); setShowSaveConfirmModal(true) }} initialData={selectedForEdit} isSubmitting={simpanMutation.isPending || ubahMutation.isPending} />
      <TahunAjaranDetailModal isOpen={Boolean(selectedForDetail)} onClose={() => setSelectedForDetail(null)} data={selectedForDetail} />
      <TahunAjaranImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={(rows) => importMutation.mutate(rows)} isSubmitting={importMutation.isPending} />

      <ConfirmDialog
        isOpen={showSaveConfirmModal}
        onClose={() => setShowSaveConfirmModal(false)}
        onConfirm={() => {
          if (!pendingSavePayload) return
          if (selectedForEdit) ubahMutation.mutate({ id: selectedForEdit.id, payload: pendingSavePayload })
          else simpanMutation.mutate(pendingSavePayload)
          setShowSaveConfirmModal(false)
        }}
        isLoading={simpanMutation.isPending || ubahMutation.isPending}
        action={selectedForEdit ? 'update' : 'create'}
        title={selectedForEdit ? 'Konfirmasi Ubah Tahun Ajaran' : 'Konfirmasi Simpan Tahun Ajaran'}
        message={selectedForEdit ? `Apakah Anda yakin ingin menyimpan perubahan tahun ajaran ${pendingSavePayload?.name}?` : `Apakah Anda yakin ingin menambahkan tahun ajaran baru ${pendingSavePayload?.name}?`}
      />

      <div className="fixed bottom-5 right-4 z-60 grid w-[min(24rem,calc(100vw-2rem))] gap-2" aria-live="polite">
        {notifications.map((item) => <div key={item.id} className={`flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl dark:bg-[#1B2433] ${item.tone === 'danger' ? 'border-rose-200' : item.tone === 'warning' ? 'border-amber-200' : 'border-emerald-200'}`}><CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${item.tone === 'danger' ? 'text-rose-600' : item.tone === 'warning' ? 'text-amber-600' : 'text-emerald-600'}`} /><div className="min-w-0 flex-1"><b className="text-sm text-slate-900 dark:text-white">{item.title}</b><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-300">{item.message}</p></div><button onClick={() => setNotifications((items) => items.filter((n) => n.id !== item.id))} aria-label="Tutup notifikasi"><X className="h-4 w-4 text-slate-400" /></button></div>)}
      </div>
    </MasterDataPage>
    </PageContainer>
  )
}

function SimpleModal({ title, description, icon: Icon, onClose, children }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}><section className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]"><header className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-700"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50"><Icon className="h-5 w-5" /></span><div><h2 className="font-bold text-slate-900 dark:text-white">{title}</h2><p className="text-xs text-slate-500">{description}</p></div></div><button onClick={onClose} aria-label={`Tutup ${title}`} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button></header>{children}</section></div>
}
