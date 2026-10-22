import React from 'react'
import PropTypes from 'prop-types'
import {
  Modal as HeroModal,
  Button as HeroButton,
} from '@heroui/react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Modal({ isOpen, onClose, title, description, children, maxWidth = 'max-w-xl', footer, className = '' }) {
  if (!isOpen) return null

  return (
    <HeroModal
      isOpen={Boolean(isOpen)}
      onOpenChange={(open) => {
        if (!open && onClose) onClose()
      }}
    >
      <HeroModal.Backdrop className="bg-slate-950/70 backdrop-blur-md fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5">
        <HeroModal.Container className="w-full flex items-center justify-center min-h-full">
          <HeroModal.Dialog className={cn('relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#1B2433] max-h-[90vh] flex flex-col', maxWidth, className)}>
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
            
            {title && (
              <HeroModal.Header className="flex items-center justify-between border-b border-emerald-500/15 p-5 pb-4 shrink-0">
                <div className="min-w-0 pr-2">
                  <h3 className="truncate text-base font-extrabold text-slate-900 dark:text-white">
                    {title}
                  </h3>
                  {description && (
                    <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                      {description}
                    </p>
                  )}
                </div>
                <HeroButton
                  isIconOnly
                  size="sm"
                  onPress={onClose}
                  aria-label="Tutup modal"
                  className="size-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  <X className="size-4" strokeWidth={2.2} />
                </HeroButton>
              </HeroModal.Header>
            )}

            <HeroModal.Body className="overflow-y-auto p-6 py-4 text-sm text-slate-700 dark:text-slate-200 flex-1">
              {children}
            </HeroModal.Body>

            {footer && (
              <HeroModal.Footer className="border-t border-slate-100 p-5 pt-3.5 dark:border-slate-800 shrink-0">
                {footer}
              </HeroModal.Footer>
            )}
          </HeroModal.Dialog>
        </HeroModal.Container>
      </HeroModal.Backdrop>
    </HeroModal>
  )
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  description: PropTypes.node,
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.string,
  footer: PropTypes.node,
  className: PropTypes.string,
}

export default Modal
