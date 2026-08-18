import React from 'react'
import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

export function Tabs({ tabs, activeTab, onChange, className }) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto no-scrollbar dark:border-slate-800',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all duration-200 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5C44]/30 rounded-t-lg',
              isActive
                ? 'border-[#0E5C44] text-[#0E5C44] dark:border-[#3FBF75] dark:text-[#3FBF75]'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            {tab.icon && <span className="text-sm shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-extrabold transition-colors',
                  isActive
                    ? 'bg-[#0E5C44]/15 text-[#0E5C44] dark:bg-[#3FBF75]/25 dark:text-[#3FBF75]'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      icon: PropTypes.node,
      badge: PropTypes.node,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
}
