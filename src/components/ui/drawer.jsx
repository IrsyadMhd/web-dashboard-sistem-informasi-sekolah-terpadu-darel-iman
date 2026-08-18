import React, { useEffect, useId, useRef } from 'react'
import PropTypes from 'prop-types'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Drawer({ isOpen, onClose, title, description, children, position = 'right', footer }) {
  const titleId = useId()
  const descriptionId = useId()
  const drawerRef = useRef(null)

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
      drawerRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    requestAnimationFrame(() => (focusable()?.[0] || drawerRef.current)?.focus())

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

  const posClasses = {
    right: 'right-0 inset-y-0 w-full max-w-md rounded-l-[20px] animate-in slide-in-from-right duration-300',
    left: 'left-0 inset-y-0 w-full max-w-md rounded-r-[20px] animate-in slide-in-from-left duration-300',
    bottom: 'bottom-0 inset-x-0 max-h-[85vh] rounded-t-[20px] animate-in slide-in-from-bottom duration-300',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          'fixed z-50 flex min-h-0 flex-col overflow-hidden border-l border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#1B2433]',
          posClasses[position] || posClasses.right
        )}
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-800 dark:bg-[#1B2433]">
          <div>
            <h3 id={titleId} className="text-base font-extrabold text-slate-900 dark:text-white">
              {title}
            </h3>
            {description && (
              <p id={descriptionId} className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup drawer"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5C44]/30 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/95 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/95">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

Drawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  description: PropTypes.node,
  children: PropTypes.node,
  position: PropTypes.oneOf(['right', 'left', 'bottom']),
  footer: PropTypes.node,
}
