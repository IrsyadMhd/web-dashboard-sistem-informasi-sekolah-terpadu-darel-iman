import React from 'react'
import { Modal } from '../ui/modal'

/**
 * AppModal - canonical modal dialog.
 * Semua form/detail popup harus memakai AppModal (atau AppDrawer).
 */
export default function AppModal({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  children,
  footer,
  maxWidth = 'max-w-xl',
}) {
  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2.5">
          {Icon && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0E5C44]/10 text-[#0E5C44] dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]">
              <Icon className="h-4 w-4" />
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate">{title}</span>
          </span>
        </span>
      }
      description={description}
      footer={footer}
      maxWidth={maxWidth}
    >
      {children}
    </Modal>
  )
}
