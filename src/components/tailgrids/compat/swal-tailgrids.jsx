import React from 'react'
import { createRoot } from 'react-dom/client'
import { toast } from 'sonner'
import { Button } from '@/components/tailgrids/core/button'
import {
  AlertDialog,
} from '@/components/tailgrids/core/alert-dialog'
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/tailgrids/core/dialog'
import { Backdrop } from '@/components/tailgrids/core/overlay'

/**
 * TailGrids Canonical SweetAlert2 Compatibility Bridge
 * Provides full SweetAlert2 interface compatibility with canonical TailGrids UI.
 * Restores blocking async semantics for modals, preserves toast mode when requested,
 * and implements utility methods (showLoading, hideLoading, isVisible, DismissReason, etc.).
 */

let validationMessageSetter = null
let loadingStateSetter = null
let activeLoadingState = false
let activeRoot = null

export const Swal = {
  DismissReason: {
    cancel: 'cancel',
    backdrop: 'backdrop',
    close: 'close',
    esc: 'esc',
    timer: 'timer',
  },

  isVisible: () => {
    return Boolean(document.getElementById('tailgrids-swal-container'))
  },

  isLoading: () => {
    return activeLoadingState
  },

  showLoading: () => {
    activeLoadingState = true
    if (loadingStateSetter) {
      loadingStateSetter(true)
    }
  },

  hideLoading: () => {
    activeLoadingState = false
    if (loadingStateSetter) {
      loadingStateSetter(false)
    }
  },

  showValidationMessage: (msg) => {
    if (validationMessageSetter) {
      validationMessageSetter(msg)
    }
  },

  resetValidationMessage: () => {
    if (validationMessageSetter) {
      validationMessageSetter('')
    }
  },

  getConfirmButton: () => {
    return document.querySelector('#tailgrids-swal-container button[data-action="confirm"]')
  },

  getCancelButton: () => {
    return document.querySelector('#tailgrids-swal-container button[data-action="cancel"]')
  },

  close: () => {
    if (activeRoot) {
      try {
        activeRoot.unmount()
      } catch {
        // Ignore
      }
      activeRoot = null
    }
    const container = document.getElementById('tailgrids-swal-container')
    if (container) {
      container.remove()
    }
    validationMessageSetter = null
    loadingStateSetter = null
    activeLoadingState = false
  },

  fire: (...args) => {
    let options = {}

    if (args.length === 1 && typeof args[0] === 'object') {
      options = args[0] || {}
    } else if (args.length >= 1) {
      options = {
        title: args[0] || '',
        text: args[1] || '',
        icon: args[2] || 'info',
      }
    }

    const {
      title = '',
      text = '',
      html = null,
      icon = 'info',
      toast: isToast = false,
      showCancelButton = false,
      confirmButtonText = showCancelButton ? 'Ya, Lanjutkan' : 'OK',
      cancelButtonText = 'Batal',
      confirmButtonColor,
      isDestructive = false,
      input = null,
      inputPlaceholder = '',
      preConfirm = null,
      didOpen = null,
      allowOutsideClick = true,
    } = options

    // Case 1: Explicit Toast Mode -> Sonner Toast (Non-blocking by design)
    if (isToast) {
      const displayTitle = title ? String(title) : ''
      const displayText = text ? String(text) : (html ? String(html).replace(/<[^>]*>?/gm, '') : '')

      if (icon === 'success') {
        toast.success(displayTitle || 'Berhasil', { description: displayText || undefined })
      } else if (icon === 'error') {
        toast.error(displayTitle || 'Terjadi Kesalahan', { description: displayText || undefined })
      } else if (icon === 'warning') {
        toast.warning(displayTitle || 'Peringatan', { description: displayText || undefined })
      } else {
        toast.info(displayTitle || 'Informasi', { description: displayText || undefined })
      }

      return Promise.resolve({
        isConfirmed: true,
        isDenied: false,
        isDismissed: false,
        value: true,
      })
    }

    // Case 2: Modal Alert or Confirmation Dialog (Blocking Promise until user action)
    return new Promise((resolve) => {
      let hostEl = document.getElementById('tailgrids-swal-container')
      if (!hostEl) {
        hostEl = document.createElement('div')
        hostEl.id = 'tailgrids-swal-container'
        document.body.appendChild(hostEl)
      }

      const root = createRoot(hostEl)
      activeRoot = root

      const cleanup = () => {
        try {
          root.unmount()
        } catch {
          // Ignore
        }
        if (hostEl && hostEl.parentNode) {
          hostEl.parentNode.removeChild(hostEl)
        }
        activeRoot = null
        validationMessageSetter = null
        loadingStateSetter = null
        activeLoadingState = false
      }

      function DialogWrapper() {
        const [inputValue, setInputValue] = React.useState('')
        const [validationMsg, setValidationMsg] = React.useState('')
        const [isSubmitting, setIsSubmitting] = React.useState(activeLoadingState)

        React.useEffect(() => {
          validationMessageSetter = setValidationMsg
          loadingStateSetter = setIsSubmitting
          if (typeof didOpen === 'function') {
            try {
              didOpen(hostEl)
            } catch (err) {
              console.warn('[Swal.didOpen error]', err)
            }
          }
          return () => {
            validationMessageSetter = null
            loadingStateSetter = null
          }
        }, [])

        const handleConfirm = async () => {
          setIsSubmitting(true)
          setValidationMsg('')

          try {
            let resultVal = input ? inputValue : true
            if (preConfirm) {
              const res = await preConfirm(resultVal)
              if (res === false) {
                setIsSubmitting(false)
                return
              }
              if (res !== undefined) {
                resultVal = res
              }
            }

            cleanup()
            resolve({
              isConfirmed: true,
              isDenied: false,
              isDismissed: false,
              value: resultVal,
            })
          } catch (err) {
            setValidationMsg(err?.message || 'Validasi gagal.')
            setIsSubmitting(false)
          }
        }

        const handleCancel = () => {
          cleanup()
          resolve({
            isConfirmed: false,
            isDenied: false,
            isDismissed: true,
            dismiss: Swal.DismissReason.cancel,
          })
        }

        const handleBackdropClose = () => {
          if (!allowOutsideClick) return
          cleanup()
          resolve({
            isConfirmed: false,
            isDenied: false,
            isDismissed: true,
            dismiss: Swal.DismissReason.backdrop,
          })
        }

        const isDanger = isDestructive || (confirmButtonText && /hapus|delete|keluar|reset/i.test(confirmButtonText))

        return (
          <Backdrop isOpen={true} isDismissable={allowOutsideClick} onOpenChange={(open) => !open && handleBackdropClose()}>
            <AlertDialog className="w-full max-w-md p-6 bg-white dark:bg-[#1B2433] rounded-[22px] border-2 border-emerald-500/25 shadow-2xl space-y-4">
              <DialogHeader>
                <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                  {title || (showCancelButton ? 'Konfirmasi Tindakan' : 'Informasi')}
                </DialogTitle>
                {(text || html) && (
                  <DialogDescription className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {text || (html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null)}
                  </DialogDescription>
                )}
              </DialogHeader>

              {input === 'password' && (
                <div className="space-y-2">
                  <input
                    type="password"
                    autoFocus
                    value={inputValue}
                    placeholder={inputPlaceholder}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              )}

              {input === 'text' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    autoFocus
                    value={inputValue}
                    placeholder={inputPlaceholder}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              )}

              {validationMsg && (
                <p className="text-xs font-semibold text-rose-500">{validationMsg}</p>
              )}

              <DialogFooter className="flex items-center justify-end gap-2 pt-2">
                {showCancelButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    data-action="cancel"
                    disabled={isSubmitting}
                    onClick={handleCancel}
                  >
                    {cancelButtonText}
                  </Button>
                )}
                <Button
                  variant={isDanger ? 'danger' : 'primary'}
                  size="sm"
                  data-action="confirm"
                  pending={isSubmitting}
                  onClick={handleConfirm}
                >
                  {confirmButtonText}
                </Button>
              </DialogFooter>
            </AlertDialog>
          </Backdrop>
        )
      }

      root.render(<DialogWrapper />)
    })
  },
}

export default Swal
