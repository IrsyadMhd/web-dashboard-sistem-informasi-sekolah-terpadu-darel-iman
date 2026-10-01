import React from 'react'
import PropTypes from 'prop-types'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/tailgrids/core/dialog'
import { cn } from '../../lib/utils'

export function Modal({ isOpen, onClose, title, description, children, maxWidth = 'max-w-xl', footer }) {
  if (!isOpen) return null

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && onClose) onClose()
      }}
      modalClassName="z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
      className={cn('rounded-3xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 bg-white shadow-2xl dark:bg-[#1B2433]', maxWidth)}
    >
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
      <div className="p-6">
        {title && (
          <DialogHeader className="border-b border-emerald-500/15 pb-4">
            <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {description}
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
      </div>
    </Dialog>
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
}

export default Modal
