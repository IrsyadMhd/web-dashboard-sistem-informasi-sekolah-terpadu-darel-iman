import React, { useEffect, useId, useRef } from 'react'
import PropTypes from 'prop-types'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Modal({ isOpen, onClose, title, description, children, maxWidth = 'max-w-xl', footer }) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef(null)

  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return undefined

    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusable = () =>
      dialogRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )

    requestAnimationFrame(() => (focusable()?.[0] || dialogRef.current)?.focus())

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current?.()
        return
      }
      if (event.key !== 'Tab') return
      const elements = Array.from(focusable() || [])
      if (!elements.length) return
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="overlay modal overlay-open:opacity-100 overlay-open:duration-300 fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className={cn('modal-dialog font-sans w-full', maxWidth)}>
        <div
          className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-slate-800 shadow-2xl dark:bg-[#1B2433] dark:border-slate-700 dark:text-slate-100"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
        >
          {/* Header */}
          {title && (
            <div className="modal-header relative flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
              <div>
                <h3 id={titleId} className="modal-title text-base font-bold leading-snug text-slate-900 dark:text-white">
                  {title}
                </h3>
                {description && (
                  <p id={descriptionId} className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup dialog"
                className="btn btn-text btn-circle btn-sm absolute end-3 top-3 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="modal-body min-h-0 flex-1 overflow-y-auto p-5 text-sm text-slate-700 dark:text-slate-200">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="modal-footer flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#1B2433]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  description: PropTypes.node,
  children: PropTypes.node,
  maxWidth: PropTypes.string,
  footer: PropTypes.node,
}
