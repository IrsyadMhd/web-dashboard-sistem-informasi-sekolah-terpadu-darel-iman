import { useState } from 'react'
import { FiAlertTriangle, FiFileText, FiX, FiSend } from 'react-icons/fi'
import { deleteRequestService } from '../../services/deleteRequestService'
import { Input } from '@/components/ui/input'
import { TextArea } from '@/components/ui/text-area'
import { Button } from '@/components/ui/button'

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
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ajukan Permintaan Penghapusan"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="relative overflow-hidden bg-white dark:bg-[#1B2433] rounded-3xl max-w-lg w-full shadow-2xl shadow-rose-950/20 border border-amber-200/80 dark:border-amber-800/60 animate-in zoom-in-95">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600" />
        <div className="p-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-300 font-bold text-base">
            <FiAlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <span>Ajukan Permintaan Penghapusan</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Alasan Penghapusan <span className="text-red-500">*</span>
            </label>
            <TextArea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Tuliskan alasan lengkap mengapa data ini perlu dihapus..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              URL Dokumen Pendukung (Opsional)
            </label>
            <Input
              type="text"
              size="sm"
              value={attachmentPath}
              onChange={(e) => setAttachmentPath(e.target.value)}
              placeholder="https://... / path dokumen bukti"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onPress={onClose}
              className="flex-1 rounded-xl"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isDisabled={loading || !reason.trim()}
              className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20"
            >
              <FiSend className="w-3.5 h-3.5" />
              <span>{loading ? 'Mengirim...' : 'Kirim Permintaan'}</span>
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
