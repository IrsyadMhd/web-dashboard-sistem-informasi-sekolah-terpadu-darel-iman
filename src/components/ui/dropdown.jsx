import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

export function Dropdown({ trigger, items, align = 'right', className }) {
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, right: 0, bottom: 0 })
  const triggerRef = useRef(null)

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom,
        bottom: rect.top,
        left: rect.left,
        right: rect.right,
      })
    }
  }

  useEffect(() => {
    if (isOpen) {
      updateCoords()
      const handleScrollOrResize = () => {
        setIsOpen(false)
      }
      window.addEventListener('scroll', handleScrollOrResize, true)
      window.addEventListener('resize', handleScrollOrResize)
      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true)
        window.removeEventListener('resize', handleScrollOrResize)
      }
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target) &&
        !event.target.closest('.app-dropdown-portal')
      ) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const toggleDropdown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isOpen) {
      updateCoords()
    }
    setIsOpen((prev) => !prev)
  }

  const getPanelStyle = () => {
    const offset = 6
    let top = coords.top + offset
    const right = Math.max(8, window.innerWidth - coords.right)
    const left = Math.max(8, coords.left)

    if (top + 220 > window.innerHeight) {
      top = Math.max(8, coords.bottom - 220 - offset)
    }

    return {
      position: 'fixed',
      top: `${top}px`,
      right: align === 'left' ? 'auto' : `${right}px`,
      left: align === 'left' ? `${left}px` : 'auto',
      zIndex: 99999,
    }
  }

  const alignClasses = {
    right: 'right-0',
    left: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
  }

  const portalContent = isOpen && (
    <div
      role="menu"
      aria-orientation="vertical"
      onClick={(e) => e.stopPropagation()}
      style={getPanelStyle()}
      className={cn(
        'app-dropdown-portal min-w-[180px] rounded-2xl bg-white dark:bg-[#1B2433] p-1.5 shadow-2xl border border-slate-200/90 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 opacity-100 pointer-events-auto isolation-auto animate-in fade-in zoom-in-95 duration-150',
        className
      )}
    >
      {items.map((item, idx) => {
        if (item.divider) {
          return <div key={idx} className="my-1 border-t border-slate-100 dark:border-slate-700/60" />
        }
        return (
          <button
            key={idx}
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation()
              if (item.onClick) item.onClick()
              setIsOpen(false)
            }}
            disabled={item.disabled}
            className={cn(
              'group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors text-left cursor-pointer focus:outline-none focus-visible:ring-2',
              item.danger
                ? 'text-rose-600 hover:bg-rose-50/90 hover:text-rose-700 focus-visible:ring-rose-600/30 focus-visible:bg-rose-50 focus-visible:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 dark:focus-visible:bg-rose-950/60 dark:focus-visible:text-rose-300'
                : 'text-slate-700 hover:bg-emerald-50/90 hover:text-emerald-900 focus-visible:ring-emerald-600/30 focus-visible:bg-emerald-50 focus-visible:text-emerald-900 dark:text-slate-200 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-200 dark:focus-visible:bg-emerald-950/50 dark:focus-visible:text-emerald-200',
              item.disabled && 'opacity-50 pointer-events-none'
            )}
          >
            {item.icon && (
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center text-sm transition-colors',
                  item.danger
                    ? 'text-rose-500 group-hover:text-rose-700 dark:text-rose-400 dark:group-hover:text-rose-300 [&>svg]:transition-colors [&>svg]:group-hover:text-rose-700 dark:[&>svg]:group-hover:text-rose-300'
                    : 'text-slate-500 group-hover:text-emerald-700 dark:text-slate-400 dark:group-hover:text-emerald-300 [&>svg]:transition-colors [&>svg]:group-hover:text-emerald-700 dark:[&>svg]:group-hover:text-emerald-300'
                )}
              >
                {item.icon}
              </span>
            )}
            <span className="truncate">{item.label}</span>
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="relative inline-block text-left" ref={triggerRef}>
      <div
        onClick={toggleDropdown}
        className="inline-flex cursor-pointer items-center justify-center focus:outline-none"
      >
        {trigger}
      </div>
      {typeof document !== 'undefined' && createPortal(portalContent, document.body)}
    </div>
  )
}

Dropdown.propTypes = {
  trigger: PropTypes.node.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node,
      icon: PropTypes.node,
      onClick: PropTypes.func,
      danger: PropTypes.bool,
      disabled: PropTypes.bool,
      divider: PropTypes.bool,
    })
  ).isRequired,
  align: PropTypes.oneOf(['right', 'left', 'center']),
  className: PropTypes.string,
}
