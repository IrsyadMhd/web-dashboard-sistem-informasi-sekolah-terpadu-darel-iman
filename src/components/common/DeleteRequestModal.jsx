import { useState } from 'react'
import { FiAlertTriangle, FiFileText, FiX, FiSend } from 'react-icons/fi'
import { deleteRequestService } from '../../services/deleteRequestService'

export default function DeleteRequestModal({
  isOpen,
  onClose,
  targetTable,
  targetId,
  targetLabel,
  educationUnitId,
  onSuccess,
}) {
  const [reason, setReason] = useState('')
  const [attachmentPath, setAttachmentPath] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason.trim()) return
    setLoading(true)
    setError('')

    try {
      await deleteRequestService.submitDeleteRequest({
        target_table: targetTable,
        target_id: targetId,
        target_label: targetLabel || `${targetTable} #${targetId}`,
        reason: reason.trim(),
        attachment_path: attachmentPath.trim() || null,
        education_unit_id: educationUnitId || null,
      })

      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Gagal mengajukan permintaan penghapusan.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-amber-100 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5 text-amber-700 font-bold text-base">
            <FiAlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <span>Ajukan Permintaan Penghapusan</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 leading-relaxed">
            <p className="font-bold mb-1">Ketentuan Penghapusan Data (Role Admin):</p>
            <p>
              Sebagai Admin, Anda tidak dapat menghapus data secara langsung. Form ini akan mengirimkan permintaan persetujuan kepada <span className="font-semibold text-amber-950">Superadmin</span>. Data target tetap aktif hingga disetujui.
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs">
            <span className="text-slate-500 block font-medium">Data Target yang Akan Dihapus:</span>
            <span className="font-bold text-slate-800 text-sm">{targetLabel || `${targetTable} #${targetId}`}</span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alasan Penghapusan <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Tuliskan alasan lengkap mengapa data ini perlu dihapus..."
              className="w-full p-3 bg-white text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              URL Dokumen Pendukung (Opsional)
            </label>
            <input
              type="text"
              value={attachmentPath}
              onChange={(e) => setAttachmentPath(e.target.value)}
              placeholder="https://... / path dokumen bukti"
              className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20"
            >
              <FiSend className="w-3.5 h-3.5" />
              <span>{loading ? 'Mengirim...' : 'Kirim Permintaan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
