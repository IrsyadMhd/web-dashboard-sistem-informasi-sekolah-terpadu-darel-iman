import { useState, useEffect } from 'react'
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertTriangle,
  FiFilter,
  FiRefreshCw,
  FiShield,
  FiUser,
} from 'react-icons/fi'
import { deleteRequestService } from '../services/deleteRequestService'

export default function DeleteApprovalPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [error, setError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [rejectionModal, setRejectionModal] = useState({ open: false, requestId: null, reason: '' })

  const fetchRequests = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await deleteRequestService.getDeleteRequests({ status: statusFilter !== 'all' ? statusFilter : undefined })
      setRequests(res?.data?.data || res?.data || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal memuat daftar permintaan penghapusan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [statusFilter])

  const handleApprove = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin MENYETUJUI penghapusan data ini? Data akan dihapus secara soft-delete dari sistem.')) return
    setActionLoadingId(id)
    try {
      await deleteRequestService.approveDeleteRequest(id)
      fetchRequests()
    } catch (err) {
      alert(err?.response?.data?.message || 'Gagal menyetujui penghapusan.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleRejectSubmit = async (e) => {
    e.preventDefault()
    if (!rejectionModal.reason.trim()) return
    setActionLoadingId(rejectionModal.requestId)
    try {
      await deleteRequestService.rejectDeleteRequest(rejectionModal.requestId, rejectionModal.reason.trim())
      setRejectionModal({ open: false, requestId: null, reason: '' })
      fetchRequests()
    } catch (err) {
      alert(err?.response?.data?.message || 'Gagal menolak permintaan penghapusan.')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs tracking-wider uppercase mb-1">
            <FiShield className="w-4 h-4" />
            <span>Panel Persetujuan Superadmin</span>
          </div>
          <h1 className="text-2xl font-black">Permintaan Penghapusan Data (Delete Requests)</h1>
          <p className="text-xs text-emerald-100 mt-1 max-w-2xl">
            Tinjau dan proses permohonan hapus data yang diajukan oleh Admin. Penghapusan eksekutif hanya dijalankan setelah disetujui Superadmin.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold flex items-center gap-2 border border-white/20 transition-all backdrop-blur"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Muat Ulang</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pl-2">
          <FiFilter className="w-4 h-4 text-emerald-600" />
          <span>Status Permintaan:</span>
        </div>
        <div className="flex gap-1.5">
          {['pending', 'approved', 'rejected', 'all'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'pending' ? 'Menunggu Review' : st === 'approved' ? 'Disetujui' : st === 'rejected' ? 'Ditolak' : 'Semua Status'}
            </button>
          ))}
        </div>
      </div>

      {/* Content Table / Cards */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
          <FiRefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
          <p className="text-xs font-semibold">Memuat daftar permintaan penghapusan...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-red-800 text-xs font-medium text-center">
          {error}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
          <FiCheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
          <p className="text-sm font-bold text-slate-700">Tidak ada permintaan penghapusan data.</p>
          <p className="text-xs text-slate-400 mt-0.5">Seluruh data aman atau tidak ada item dalam status ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="py-1 px-2.5 bg-slate-100 text-slate-700 text-[11px] font-mono font-bold rounded-lg uppercase">
                    Tabel: {req.target_table}
                  </span>
                  <span
                    className={`py-1 px-2.5 rounded-lg text-[11px] font-bold capitalize ${
                      req.status === 'pending'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : req.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {req.status === 'pending' ? 'Menunggu Approver' : req.status === 'approved' ? 'Disetujui (Soft Deleted)' : 'Ditolak'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{req.target_label || `ID Target: ${req.target_id}`}</h3>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    <span className="font-bold text-slate-700">Alasan Admin:</span> "{req.reason}"
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium pt-1">
                  <span className="flex items-center gap-1">
                    <FiUser className="w-3.5 h-3.5 text-emerald-600" />
                    Diajukan oleh: <strong className="text-slate-700">{req.requester?.name || 'Admin'}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <FiClock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(req.created_at).toLocaleString('id-ID')}
                  </span>
                </div>

                {req.rejection_reason && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded-xl border border-red-100 font-medium">
                    Catatan Penolakan: {req.rejection_reason}
                  </p>
                )}
              </div>

              {/* Action Buttons for Superadmin */}
              {req.status === 'pending' && (
                <div className="flex items-center gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    onClick={() => setRejectionModal({ open: true, requestId: req.id, reason: '' })}
                    disabled={actionLoadingId === req.id}
                    className="flex-1 md:flex-initial py-2 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <FiXCircle className="w-4 h-4" />
                    <span>Tolak</span>
                  </button>

                  <button
                    onClick={() => handleApprove(req.id)}
                    disabled={actionLoadingId === req.id}
                    className="flex-1 md:flex-initial py-2 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-800/20"
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    <span>{actionLoadingId === req.id ? 'Memproses...' : 'Setujui Hapus'}</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectionModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100">
            <h3 className="text-base font-bold text-slate-800 mb-2">Tolak Permintaan Penghapusan</h3>
            <form onSubmit={handleRejectSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Alasan Penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectionModal.reason}
                  onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                  placeholder="Tuliskan alasan penolakan..."
                  className="w-full p-3 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectionModal({ open: false, requestId: null, reason: '' })}
                  className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!rejectionModal.reason.trim()}
                  className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
                >
                  Kirim Penolakan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
