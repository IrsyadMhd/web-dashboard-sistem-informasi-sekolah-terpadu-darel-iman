import * as React from 'react'
import PropTypes from 'prop-types'
import { Modal as HeroModal } from '@heroui/react'
import { cn } from '../../lib/utils'

export function AlertDialog({
  children,
  isOpen,
  defaultOpen,
  onOpenChange,
  className,
  isDismissable = true,
  ...props
}) {
  return (
    <HeroModal
      isOpen={isOpen !== undefined ? Boolean(isOpen) : defaultOpen}
      onOpenChange={(open) => {
        if (onOpenChange) onOpenChange(open)
      }}
      {...props}
    >
      <HeroModal.Backdrop className="bg-slate-950/70 backdrop-blur-md fixed inset-0 z-50 flex items-center justify-center p-4">
        <HeroModal.Container className="w-full flex items-center justify-center min-h-full">
          <HeroModal.Dialog
            className={cn(
              'relative w-full max-w-lg overflow-hidden rounded-[22px] border border-slate-200 bg-white p-6 shadow-2xl text-slate-800 dark:border-slate-800 dark:bg-[#1B2433] dark:text-slate-100',
              className
            )}
          >
            {children}
          </HeroModal.Dialog>
        </HeroModal.Container>
      </HeroModal.Backdrop>
    </HeroModal>
  )
}

AlertDialog.propTypes = {
  children: PropTypes.node,
  isOpen: PropTypes.bool,
  defaultOpen: PropTypes.bool,
  onOpenChange: PropTypes.func,
  className: PropTypes.string,
  isDismissable: PropTypes.bool,
}

export default AlertDialog
