import React from 'react'
import { AlertDialog } from '@/components/tailgrids/core/alert-dialog'
import { Button } from '@/components/tailgrids/core/button'
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/tailgrids/core/dialog'
import { OverlayWrapper } from '@/components/tailgrids/core/overlay'
import { AlertTriangle, LoaderCircle, CheckCircle2, Info } from 'lucide-react'

const CONFIRM_QUESTIONS = {
  create: 'Apakah Anda yakin ingin menambahkan data baru ini ke dalam sistem?',
  update: 'Apakah Anda yakin ingin menyimpan perubahan pada data ini?',
  delete: 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini bersifat permanen dan data tidak dapat dikembalikan.',
  import: 'Import akan menambahkan atau memperbarui data.',
  export: 'Export data sesuai filter yang dipilih?',
  approve: 'Setujui data ini?',
  assign: 'Yakin menetapkan data ini?',
  custom: 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
}

/**
 * ConfirmDialog - canonical TailGrids UI dialog konfirmasi.
 * WAJIB muncul sebelum seluruh aksi CRUD dijalankan.
 *
 * action: create | update | delete | import | export | approve | assign | custom
 * isDanger: mengubah tombol konfirmasi menjadi merah (destructive)
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Batal',
  isLoading = false,
  isDanger = false,
  action = 'custom',
  icon: IconProps,
}) {
  if (!isOpen) return null

  const question = message ?? CONFIRM_QUESTIONS[action] ?? CONFIRM_QUESTIONS.custom
  const isDelete = action === 'delete' || isDanger

  const defaultTitle = isDelete
    ? 'Konfirmasi Hapus Data'
    : action === 'create'
    ? 'Konfirmasi Simpan Data'
    : action === 'update'
    ? 'Konfirmasi Ubah Data'
    : 'Konfirmasi Tindakan'

  const finalTitle = title || defaultTitle
  const finalConfirmLabel = confirmLabel || (isDelete ? 'Ya, Hapus Data' : action === 'create' ? 'Simpan Data' : action === 'update' ? 'Simpan Perubahan' : 'Ya, Lanjutkan')

  const IconComponent = IconProps || (isDelete ? AlertTriangle : action === 'create' ? CheckCircle2 : Info)
  const iconBg = isDelete
    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
    : action === 'create'
    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
    : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'

  const handleOpenChange = (open) => {
    if (!open && onClose) onClose()
  }

  const handleConfirmAction = async (e) => {
    e?.preventDefault()
    if (onConfirm) {
      await onConfirm()
    }
  }

  return (
    <OverlayWrapper>
      <AlertDialog isOpen={isOpen} onOpenChange={handleOpenChange}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            {isLoading ? (
              <LoaderCircle className="w-6 h-6 animate-spin" />
            ) : (
              <IconComponent className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {finalTitle}
              </DialogTitle>
              <DialogDescription className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 mt-1">
                {question}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <DialogFooter className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <DialogClose
            appearance="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </DialogClose>
          <Button
            variant={isDelete ? 'danger' : 'primary'}
            size="sm"
            onClick={handleConfirmAction}
            pending={isLoading}
            disabled={isLoading}
          >
            {finalConfirmLabel}
          </Button>
        </DialogFooter>
      </AlertDialog>
    </OverlayWrapper>
  )
}

