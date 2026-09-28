import React from 'react'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/tailgrids/core/dialog'
import { cn } from '../../lib/utils'

/**
 * AppModal - canonical modal dialog based on TailGrids Dialog.
 * Standardized across all modules with emerald styling and accessibility.
 */
export default function AppModal({
  isOpen,
  onClose,
  title,
  description,
  subtitle,
  icon: Icon,
  children,
  footer,
  maxWidth = 'max-w-xl',
  className = '',
}) {
  if (!isOpen) return null
  const modalDescription = description || subtitle

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && onClose) onClose()
      }}
      className={cn('rounded-[22px] border-2 border-emerald-500/20 bg-white shadow-2xl dark:border-emerald-600/30 dark:bg-[#1B2433]', maxWidth, className)}
    >
      {title && (
        <DialogHeader className="border-b border-emerald-500/15 pb-4">
          <DialogTitle className="flex items-center gap-2.5 text-base font-extrabold text-slate-900 dark:text-white">
            {Icon && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                {React.isValidElement(Icon) ? Icon : <Icon className="h-4 w-4" />}
              </span>
            )}
            <span className="min-w-0 truncate">{title}</span>
          </DialogTitle>
          {modalDescription && (
            <DialogDescription className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {modalDescription}
            </DialogDescription>
          )}
        </DialogHeader>
      )}

      <DialogBody className="min-h-0 py-4 text-sm text-slate-700 dark:text-slate-200">
        {children}
      </DialogBody>

      {footer && (
        <DialogFooter className="border-t border-slate-100 pt-3.5 dark:border-slate-800">
          {footer}
        </DialogFooter>
      )}
    </Dialog>
  )
}
