import React from 'react'
import PropTypes from 'prop-types'
import {
  Drawer as HeroDrawer,
  Button as HeroButton,
} from '@heroui/react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = 'right',
  footer,
  className,
}) {
  if (!isOpen) return null

  const placementMap = {
    right: 'right',
    left: 'left',
    bottom: 'bottom',
    top: 'top',
  }

  const placement = placementMap[position] || 'right'

  return (
    <HeroDrawer
      isOpen={Boolean(isOpen)}
      onOpenChange={(open) => {
        if (!open && onClose) onClose()
      }}
    >
      <HeroDrawer.Backdrop className="bg-slate-950/60 backdrop-blur-xs fixed inset-0 z-50 transition-opacity">
        <HeroDrawer.Content
          placement={placement}
          className={cn(
            'fixed z-50 flex min-h-0 flex-col overflow-hidden border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#1B2433]',
            placement === 'right' && 'right-0 inset-y-0 w-full max-w-md rounded-l-[20px] border-l',
            placement === 'left' && 'left-0 inset-y-0 w-full max-w-md rounded-r-[20px] border-r',
            placement === 'bottom' && 'bottom-0 inset-x-0 max-h-[85vh] rounded-t-[20px] border-t',
            className
          )}
        >
          <HeroDrawer.Dialog className="flex flex-col h-full w-full outline-none">
            <HeroDrawer.Header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-800 dark:bg-[#1B2433]">
              <div className="min-w-0 pr-2">
                {title && (
                  <HeroDrawer.Heading className="text-base font-extrabold text-slate-900 dark:text-white">
                    {title}
                  </HeroDrawer.Heading>
                )}
                {description && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {description}
                  </p>
                )}
              </div>
              <HeroButton
                isIconOnly
                size="sm"
                onPress={onClose}
                aria-label="Tutup drawer"
                className="size-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 cursor-pointer transition-all active:scale-95"
              >
                <X className="size-4" strokeWidth={2.2} />
              </HeroButton>
            </HeroDrawer.Header>

            <HeroDrawer.Body className="min-h-0 flex-1 overflow-y-auto p-5 text-sm text-slate-700 dark:text-slate-200">
              {children}
            </HeroDrawer.Body>

            {footer && (
              <HeroDrawer.Footer className="sticky bottom-0 z-20 flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/95 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/95">
                {footer}
              </HeroDrawer.Footer>
            )}
          </HeroDrawer.Dialog>
        </HeroDrawer.Content>
      </HeroDrawer.Backdrop>
    </HeroDrawer>
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
  className: PropTypes.string,
}

export default Drawer

