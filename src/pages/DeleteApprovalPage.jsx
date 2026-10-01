import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  Filter,
  RefreshCw,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Sparkles,
  Database,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { deleteRequestService } from '../services/deleteRequestService'
import { Button } from '@/components/tailgrids/core/button'
import { Badge } from '@/components/tailgrids/core/badge'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 26 },
  },
}

const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/30',
    tag: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
  },
  blue: {
    card: 'border-sky-300/70 bg-gradient-to-br from-sky-50 via-blue-50/60 to-white hover:border-sky-400 dark:border-sky-700/50 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-slate-900',
    glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
    iconBox: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm shadow-sky-500/30',
    tag: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300',
    title: 'text-sky-700 dark:text-sky-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
  },
  rose: {
    card: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-red-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-red-950/20 dark:to-slate-900',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
    iconBox: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-sm shadow-rose-500/30',
    tag: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
    title: 'text-rose-700 dark:text-rose-400',
    val: 'text-slate-900 dark:text-white',
    sub: 'text-slate-600 dark:text-slate-400',
  },
}

function ModernKpiCard({ icon: Icon, label, subtext, value, tag, tone = 'emerald' }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald

  return (
    <article
      className={`group relative overflow-hidden rounded-[18px] border-2 p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left flex flex-col justify-between h-full cursor-default ${t.card}`}
    >
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${t.iconBox}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-wider ${t.title}`}>{label}</p>
            </div>
          </div>
          {tag && (
            <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold ${t.tag}`}>
              {tag}
            </span>
          )}
        </div>

        <p className={`text-3xl sm:text-4xl font-black tabular-nums tracking-tight ${t.val}`}>
          {value ?? '0'}
        </p>
        {subtext && (
          <p className={`mt-1 text-[11px] font-semibold ${t.sub}`}>
            {subtext}
          </p>
        )}
      </div>
    </article>
  )
}

export default function DeleteApprovalPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [error, setError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)

  // Harmonized Modals State
  const [approveConfirmModal, setApproveConfirmModal] = useState({ open: false, item: null })
  const [rejectionModal, setRejectionModal] = useState({ open: false, requestId: null, reason: '', item: null })

  const fetchRequests = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await deleteRequestService.getDeleteRequests({ status: statusFilter !== 'all' ? statusFilter : undefined })
      setRequests(res?.data?.data || res?.data || [])
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Gagal memuat daftar permintaan penghapusan.'
      setError(errMsg)
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [statusFilter])

  // KPI Metrics calculation
  const metrics = useMemo(() => {
    const total = requests.length
    const pending = requests.filter((r) => r.status === 'pending').length
    const approved = requests.filter((r) => r.status === 'approved').length
    const rejected = requests.filter((r) => r.status === 'rejected').length
    return { total, pending, approved, rejected }
  }, [requests])

  const handleOpenApprove = (item) => {
    setApproveConfirmModal({ open: true, item })
  }

  const handleConfirmApprove = async () => {
    const id = approveConfirmModal.item?.id
    if (!id) return
    setActionLoadingId(id)
    try {
      await deleteRequestService.approveDeleteRequest(id)
      toast.success('Permintaan penghapusan berhasil disetujui (soft deleted).')
      setApproveConfirmModal({ open: false, item: null })
      fetchRequests()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal menyetujui penghapusan.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleOpenReject = (item) => {
    setRejectionModal({ open: true, requestId: item.id, reason: '', item })
  }

  const handleRejectSubmit = async (e) => {
    e.preventDefault()
    if (!rejectionModal.reason.trim()) {
      toast.error('Alasan penolakan wajib diisi.')
      return
    }
    setActionLoadingId(rejectionModal.requestId)
    try {
      await deleteRequestService.rejectDeleteRequest(rejectionModal.requestId, rejectionModal.reason.trim())
      toast.success('Permintaan penghapusan berhasil ditolak.')
      setRejectionModal({ open: false, requestId: null, reason: '', item: null })
      fetchRequests()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal menolak permintaan penghapusan.')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <PageContainer maxW="7xl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 pb-12"
      >
        {/* ── Breadcrumb ── */}
        <motion.div variants={itemVariants}>
          <AppBreadcrumb
            items={[
              { label: 'Pengaturan', href: '/dashboard/pengaturan' },
              { label: 'Persetujuan Penghapusan' },
            ]}
          />
        </motion.div>

        {/* ── Modern Hero Card ── */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900"
        >
          {/* Ambient Glow Blobs */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Persetujuan Penghapusan Data
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Superadmin Panel
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Tinjau dan verifikasi permohonan hapus data entitas penting dari seluruh unit. Penghapusan dieksekusi secara soft-delete teratur setelah disetujui Superadmin.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={fetchRequests}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-2 text-xs font-black text-emerald-900 hover:from-emerald-200 hover:to-teal-200 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs transition-all cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
                <span>Segarkan Data</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── KPI Summary Cards ── */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ModernKpiCard
              icon={Database}
              label="Total Permohonan"
              subtext="Permohonan hapus terdata"
              value={metrics.total}
              tag={`${metrics.total} Item`}
              tone="blue"
            />
            <ModernKpiCard
              icon={Clock}
              label="Menunggu Review"
              subtext="Butuh tindakan persetujuan"
              value={metrics.pending}
              tag={`${metrics.pending} Menunggu`}
              tone="amber"
            />
            <ModernKpiCard
              icon={CheckCircle2}
              label="Telah Disetujui"
              subtext="Data berhasil di soft-delete"
              value={metrics.approved}
              tag={`${metrics.approved} Selesai`}
              tone="emerald"
            />
            <ModernKpiCard
              icon={XCircle}
              label="Permohonan Ditolak"
              subtext="Permohonan dibatalkan"
              value={metrics.rejected}
              tag={`${metrics.rejected} Ditolak`}
              tone="rose"
            />
          </div>
        </motion.div>

        {/* ── TailGrids Emerald Datatable Container ── */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]"
        >
          {/* Toolbar Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/30">
                <FileText className="size-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Daftar Permohonan Penghapusan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Menampilkan {requests.length} permohonan sesuai filter aktif
                </p>
              </div>
            </div>

            {/* Filter Status Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60">
              {[
                { id: 'pending', label: 'Menunggu' },
                { id: 'approved', label: 'Disetujui' },
                { id: 'rejected', label: 'Ditolak' },
                { id: 'all', label: 'Semua' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`py-1 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === st.id
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* List Content */}
          <div className="p-4 sm:p-5">
            {loading ? (
              <div className="py-16 text-center text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
                <p className="text-xs font-semibold">Memuat daftar permintaan penghapusan...</p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/70 p-6 text-center text-xs font-medium text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                {error}
              </div>
            ) : requests.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Tidak ada permintaan penghapusan data.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Seluruh data aman atau tidak ada item dalam status ini.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="relative overflow-hidden rounded-2xl border-2 border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 transition hover:border-emerald-300 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-emerald-700 dark:hover:bg-[#1B2433] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="py-0.5 px-2.5 bg-slate-200/80 text-slate-800 text-[10px] font-mono font-bold rounded-lg uppercase dark:bg-slate-800 dark:text-slate-200">
                          Tabel: {req.target_table}
                        </span>
                        <span
                          className={`py-0.5 px-2.5 rounded-lg text-[10px] font-extrabold capitalize ${
                            req.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                              : req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                          }`}
                        >
                          {req.status === 'pending'
                            ? 'Menunggu Review'
                            : req.status === 'approved'
                            ? 'Disetujui (Soft Deleted)'
                            : 'Ditolak'}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white">
                          {req.target_label || `ID Target: ${req.target_id}`}
                        </h4>
                        <div className="mt-1.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-2.5 text-xs text-slate-700 dark:text-slate-300">
                          <span className="font-bold text-slate-900 dark:text-white">Alasan Pemohon:</span> "{req.reason}"
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400 font-medium pt-1 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-emerald-600" />
                          Diajukan oleh: <strong className="text-slate-700 dark:text-slate-200">{req.requester?.name || 'Admin'}</strong>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(req.created_at).toLocaleString('id-ID')}
                        </span>
                      </div>

                      {req.rejection_reason && (
                        <div className="text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200/80 dark:border-rose-900/60 font-medium">
                          <strong>Catatan Penolakan Superadmin:</strong> {req.rejection_reason}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons for Superadmin */}
                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleOpenReject(req)}
                          disabled={actionLoadingId === req.id}
                          className="flex-1 md:flex-initial py-2 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Tolak</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenApprove(req)}
                          disabled={actionLoadingId === req.id}
                          className="flex-1 md:flex-initial py-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/30 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{actionLoadingId === req.id ? 'Memproses...' : 'Setujui Hapus'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* ── Harmonized Approve Confirmation Modal ── */}
      <AnimatePresence>
        {approveConfirmModal.open && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setApproveConfirmModal({ open: false, item: null })}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-emerald-300 bg-white p-6 shadow-2xl shadow-emerald-950/20 dark:border-emerald-700 dark:bg-[#1B2433] z-10"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
              <div className="flex items-center gap-3.5 mb-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30">
                  <CheckCircle2 className="size-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Konfirmasi Persetujuan Hapus
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Otorisasi Penghapusan Data Superadmin
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-3.5 text-xs text-emerald-900 dark:text-emerald-200 mb-5 leading-relaxed">
                Apakah Anda yakin ingin <strong>MENYETUJUI</strong> penghapusan data ini?
                <div className="mt-2 font-bold text-slate-900 dark:text-white">
                  Target: {approveConfirmModal.item?.target_label || `ID #${approveConfirmModal.item?.target_id}`}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  Tabel: {approveConfirmModal.item?.target_table}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setApproveConfirmModal({ open: false, item: null })}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApprove}
                  disabled={Boolean(actionLoadingId)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/30 transition cursor-pointer"
                >
                  {actionLoadingId ? 'Memproses...' : 'Ya, Setujui Hapus'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Harmonized Rejection Modal ── */}
      <AnimatePresence>
        {rejectionModal.open && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectionModal({ open: false, requestId: null, reason: '', item: null })}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-rose-300 bg-white p-6 shadow-2xl shadow-rose-950/20 dark:border-rose-700 dark:bg-[#1B2433] z-10"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-rose-600 to-red-700" />
              <div className="flex items-center gap-3.5 mb-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/30">
                  <XCircle className="size-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Tolak Permintaan Hapus
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Beri alasan resmi penolakan untuk admin pemohon
                  </p>
                </div>
              </div>

              <form onSubmit={handleRejectSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Alasan Penolakan <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionModal.reason}
                    onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                    placeholder="Tuliskan catatan alasan penolakan secara jelas..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setRejectionModal({ open: false, requestId: null, reason: '', item: null })}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!rejectionModal.reason.trim() || Boolean(actionLoadingId)}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-md shadow-rose-600/30 disabled:opacity-50 transition cursor-pointer"
                  >
                    {actionLoadingId ? 'Mengirim...' : 'Kirim Penolakan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  )
}
