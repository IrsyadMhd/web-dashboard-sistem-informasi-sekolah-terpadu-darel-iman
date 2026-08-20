import React, { useMemo } from 'react'
import { NavLink, useLocation, useSearchParams } from 'react-router-dom'
import AppBreadcrumb from '../app/AppBreadcrumb'

export default function AcademicModuleContainer({ title, description, tabs, hideHeader = false, tabsBelowKpi = false, breadcrumbItems = [], children }) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab')

  const tabLinks = useMemo(() => tabs.map((tab) => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', tab.key)
    return { ...tab, to: `${location.pathname}?${params.toString()}` }
  }), [location.pathname, searchParams, tabs])

  const renderNav = () => (
    <nav aria-label={`Tab ${title}`} className="rounded-[18px] border border-slate-200/80 bg-white p-2 shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        {tabLinks.map((tab) => {
          const Icon = tab.icon
          const isSelected = activeTab === tab.key
          return (
            <NavLink
              key={tab.key}
              to={tab.to}
              className={`group relative flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2 transition-colors duration-150 ${
                isSelected
                  ? 'border-emerald-600/40 bg-emerald-50/80 shadow-xs dark:border-emerald-500/40 dark:bg-emerald-950/40'
                  : 'border-slate-200/70 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#111827] dark:hover:bg-slate-800/80'
              }`}
            >
              {Icon && (
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-xs ${tab.squircleStyle || 'bg-emerald-100 text-emerald-600'}`}>
                  <Icon className="h-4 w-4" />
                </div>
              )}
              <div className="flex flex-col pr-0.5">
                <span className={`text-xs font-extrabold tracking-tight transition-colors ${
                  isSelected ? 'text-emerald-950 dark:text-emerald-200' : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900'
                }`}>
                  {tab.label}
                </span>
                {tab.description && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">
                    {tab.description}
                  </span>
                )}
              </div>
              {isSelected && (
                <span className="absolute -bottom-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )

  const tabNavElement = renderNav()

  return (
    <section className="space-y-6">
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <AppBreadcrumb items={breadcrumbItems} />
      )}
      {!hideHeader && (
        <header className="overflow-hidden rounded-[22px] bg-gradient-to-br from-[#0E5C44] via-[#167856] to-[#1E8E5A] p-6 text-white shadow-xl md:p-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-400/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.22em] text-emerald-100 backdrop-blur-md border border-emerald-400/30">
              Akademik &amp; LMS
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-black md:text-3xl tracking-tight text-white">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-emerald-50/90">{description}</p>
        </header>
      )}

      {!tabsBelowKpi && tabNavElement}

      <div className="academic-module-content">
        {tabsBelowKpi && React.isValidElement(children)
          ? React.cloneElement(children, { tabNav: tabNavElement })
          : children}
      </div>
    </section>
  )
}
