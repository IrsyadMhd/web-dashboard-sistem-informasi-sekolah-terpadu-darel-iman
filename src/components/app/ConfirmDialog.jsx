import React from 'react'
import { AlertTriangle, LoaderCircle } from 'lucide-react'
import { Modal } from '../ui/modal'
import AppButton from './AppButton'

const CONFIRM_QUESTIONS = {
  create: 'Apakah Anda yakin ingin menambahkan data ini?',
  update: 'Apakah Anda yakin ingin menyimpan perubahan?',
  delete: 'Data yang dihapus tidak dapat dikembalikan.',
  import: 'Import akan menambahkan atau memperbarui data.',
  export: 'Export data sesuai filter yang dipilih?',
  approve: 'Setujui data ini?',
  assign: 'Yakin menetapkan data ini?',
  custom: '',
}

/**
 * ConfirmDialog - canonical dialog konfirmasi.
 * WAJIB muncul sebelum seluruh aksi CRUD dijalankan.
 *
 * action: create | update | delete | import | export | approve | assign | custom
 * isDanger: mengubah tombol konfirmasi menjadi merah
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  isLoading = false,
  isDanger = false,
  action = 'custom',
  icon: Icon = AlertTriangle,
}) {
  const question = message ?? CONFIRM_QUESTIONS[action] ?? ''

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Konfirmasi Tindakan'}
      maxWidth="max-w-md"
      footer={
        <div className="flex w-full items-center justify-end gap-2.5">
          <AppButton variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </AppButton>
          <AppButton
            variant={isDanger ? 'destructive' : 'primary'}
            size="sm"
            onClick={onConfirm}
            loading={isLoading}
            loadingText={confirmLabel}
            disabled={isLoading}
          >
            {confirmLabel}
          </AppButton>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${isDanger ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-[#0E5C44]/10 text-[#0E5C44] dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]'}`}>
          {isLoading ? <LoaderCircle className="h-7 w-7 animate-spin" /> : <Icon className="h-7 w-7" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{question || 'Lanjutkan tindakan ini?'}</p>
          {isDanger && <p className="mt-1 text-xs text-rose-500">Tindakan ini tidak dapat dibatalkan.</p>}
        </div>
      </div>
    </Modal>
  )
}
