import * as React from 'react'
import PropTypes from 'prop-types'
import {
  Modal as HeroModal,
  Button as HeroButton,
} from '@heroui/react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Dialog({ isOpen, onClose, children, className }) {
  if (!isOpen) return null

  return (
    <HeroModal
      isOpen={Boolean(isOpen)}
      onOpenChange={(open) => {
        if (!open && onClose) onClose()
      }}
    >
      <HeroModal.Backdrop className="bg-slate-950/70 backdrop-blur-md fixed inset-0 z-50 flex items-center justify-center p-4">
        <HeroModal.Container className="w-full flex items-center justify-center min-h-full">
          <HeroModal.Dialog
            className={cn(
              'relative w-full max-w-lg overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-2xl text-slate-800 dark:border-slate-800 dark:bg-[#1B2433] dark:text-slate-100',
              className
            )}
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
            <div className="relative p-6">
              {onClose && (
                <HeroButton
                  isIconOnly
                  size="sm"
                  onPress={onClose}
                  aria-label="Tutup dialog"
                  className="absolute right-4 top-4 rounded-xl size-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 transition-all cursor-pointer active:scale-95"
                >
                  <X className="size-4" strokeWidth={2.2} />
                </HeroButton>
              )}
              {children}
            </div>
          </HeroModal.Dialog>
        </HeroModal.Container>
      </HeroModal.Backdrop>
    </HeroModal>
  )
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left mb-4', className)} {...props} />
}

export function DialogTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-extrabold leading-none tracking-tight text-slate-900 dark:text-white', className)} {...props} />
}

export function DialogDescription({ className, ...props }) {
  return <p className={cn('text-xs text-slate-500 dark:text-slate-400 mt-1', className)} {...props} />
}

export function DialogBody({ className, ...props }) {
  return <div className={cn('py-2 text-sm text-slate-700 dark:text-slate-200', className)} {...props} />
}

export function DialogFooter({ className, ...props }) {
  return <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6 border-t border-slate-100 pt-4 dark:border-slate-800', className)} {...props} />
}

Dialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
}

DialogHeader.propTypes = { className: PropTypes.string }
DialogTitle.propTypes = { className: PropTypes.string }
DialogDescription.propTypes = { className: PropTypes.string }
DialogFooter.propTypes = { className: PropTypes.string }

