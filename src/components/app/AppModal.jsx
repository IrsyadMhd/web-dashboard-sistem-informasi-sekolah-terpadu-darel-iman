import React from 'react'
import {
  Modal as HeroModal,
  Button as HeroButton,
} from '@heroui/react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * AppModal - canonical modal dialog based on HeroUI Modal.
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
  hideCloseButton = false,
}) {
  if (!isOpen) return null
  const modalDescription = description || subtitle

  return (
    <HeroModal
      isOpen={Boolean(isOpen)}
      onOpenChange={(open) => {
        if (!open && onClose) onClose()
      }}
    >
      <HeroModal.Backdrop className="bg-slate-950/70 backdrop-blur-md fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <HeroModal.Container className="w-full flex items-center justify-center min-h-full my-auto">
          <HeroModal.Dialog className={cn('relative w-full overflow-hidden rounded-[24px] border-2 border-emerald-500/20 bg-white shadow-2xl dark:border-emerald-600/30 dark:bg-[#1B2433] max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col', maxWidth, className)}>
            {/* Top accent gradient line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

            {/* Close Button X (Pojok Kanan Atas) */}
            {!hideCloseButton && onClose && (
              <HeroButton
                isIconOnly
                size="sm"
                onPress={onClose}
                aria-label="Tutup modal"
                className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 size-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 cursor-pointer transition-all active:scale-95 z-20 shadow-xs"
              >
                <X className="size-4" strokeWidth={2.2} />
              </HeroButton>
            )}

            {title && (
              <HeroModal.Header className="flex items-center justify-between border-b border-emerald-500/15 p-4 sm:p-5 pr-14 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  {Icon && (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm">
                      {React.isValidElement(Icon) ? Icon : <Icon className="h-4.5 w-4.5" />}
                    </span>
                  )}
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-extrabold text-slate-900 dark:text-white">
                      {title}
                    </h3>
                    {modalDescription && (
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        {modalDescription}
                      </p>
                    )}
                  </div>
                </div>
              </HeroModal.Header>
            )}

            <HeroModal.Body className="overflow-y-auto p-4 sm:p-6 text-sm text-slate-700 dark:text-slate-200 flex-1">
              {children}
            </HeroModal.Body>

            {footer && (
              <HeroModal.Footer className="border-t border-slate-100 p-4 sm:p-5 dark:border-slate-800/80 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
                {footer}
              </HeroModal.Footer>
            )}
          </HeroModal.Dialog>
        </HeroModal.Container>
      </HeroModal.Backdrop>
    </HeroModal>
  )
}

