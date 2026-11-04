import * as React from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { Card as HeroCard, Chip as HeroChip } from '@heroui/react'
import { ShieldCheck, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'

const MotionHeroCard = motion.create(HeroCard)

const THEME_STYLES = {
  emerald: {
    container:
      'border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900',
    blobTop:
      'bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 dark:from-emerald-500/50 dark:via-teal-400/40',
    blobBottom:
      'bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent dark:from-emerald-600/40 dark:via-teal-500/30',
    iconBadge:
      'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600',
    roleTag:
      'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40',
    actionBadge:
      'border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200',
    actionBadgeIcon: 'text-emerald-600 dark:text-emerald-400',
  },
  blue: {
    container:
      'border-sky-500/30 bg-gradient-to-r from-sky-500/15 via-blue-500/10 to-indigo-600/15 shadow-blue-500/10 dark:border-sky-600/40 dark:bg-gradient-to-r dark:from-sky-950/70 dark:via-blue-950/50 dark:to-slate-900',
    blobTop:
      'bg-gradient-to-br from-sky-500/40 via-blue-400/30 to-indigo-600/20 dark:from-sky-500/50 dark:via-blue-400/40',
    blobBottom:
      'bg-gradient-to-tr from-blue-600/30 via-indigo-500/20 to-transparent dark:from-blue-600/40 dark:via-indigo-500/30',
    iconBadge:
      'bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-600/40 border border-sky-300/40 dark:from-sky-400 dark:via-blue-500 dark:to-indigo-600',
    roleTag:
      'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-sm shadow-blue-600/25 border border-sky-300/40',
    actionBadge:
      'border-sky-500/40 bg-gradient-to-r from-sky-100 via-blue-50 to-indigo-100 text-blue-900 dark:border-sky-700 dark:bg-gradient-to-r dark:from-sky-950 dark:to-indigo-950 dark:text-blue-200',
    actionBadgeIcon: 'text-sky-600 dark:text-sky-400',
  },
  rose: {
    container:
      'border-rose-500/30 bg-gradient-to-r from-rose-500/15 via-pink-500/10 to-rose-600/15 shadow-rose-500/10 dark:border-rose-600/40 dark:bg-gradient-to-r dark:from-rose-950/70 dark:via-pink-950/50 dark:to-slate-900',
    blobTop:
      'bg-gradient-to-br from-pink-500/30 via-rose-400/25 to-transparent dark:from-pink-500/40 dark:via-rose-400/30',
    blobBottom:
      'bg-gradient-to-tr from-rose-600/25 via-pink-500/20 to-transparent dark:from-rose-600/35 dark:via-pink-500/25',
    iconBadge:
      'bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700 text-white shadow-xl shadow-rose-600/40 border border-rose-300/40 dark:from-rose-400 dark:via-pink-500 dark:to-rose-600',
    roleTag:
      'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white shadow-sm shadow-rose-600/25 border border-rose-300/40',
    actionBadge:
      'border-rose-500/40 bg-gradient-to-r from-rose-100 via-pink-50 to-rose-100 text-rose-900 dark:border-rose-700 dark:bg-gradient-to-r dark:from-rose-950 dark:to-rose-950 dark:text-rose-200',
    actionBadgeIcon: 'text-rose-600 dark:text-rose-400',
  },
  amber: {
    container:
      'border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-600/15 shadow-amber-500/10 dark:border-amber-600/40 dark:bg-gradient-to-r dark:from-amber-950/70 dark:via-orange-950/50 dark:to-slate-900',
    blobTop:
      'bg-gradient-to-br from-amber-500/30 via-orange-400/25 to-transparent dark:from-amber-500/40 dark:via-orange-400/30',
    blobBottom:
      'bg-gradient-to-tr from-amber-600/25 via-orange-500/20 to-transparent dark:from-amber-600/35 dark:via-orange-500/25',
    iconBadge:
      'bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-white shadow-xl shadow-amber-600/40 border border-amber-300/40 dark:from-amber-400 dark:via-orange-500 dark:to-amber-600',
    roleTag:
      'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm shadow-amber-600/25 border border-amber-300/40',
    actionBadge:
      'border-amber-500/40 bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 text-amber-900 dark:border-amber-700 dark:bg-gradient-to-r dark:from-amber-950 dark:to-amber-950 dark:text-amber-200',
    actionBadgeIcon: 'text-amber-600 dark:text-amber-400',
  },
}

/**
 * Renders an icon from either a Component, an instantiated React element, or null
 */
function renderIcon(icon, className = 'size-6') {
  if (!icon) return null
  if (React.isValidElement(icon)) return icon
  if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && icon.$$typeof)) {
    const IconComponent = icon
    return <IconComponent className={className} />
  }
  return null
}

/**
 * HeroUiHeader - Official Canonical Hero Header component built on HeroUI primitives.
 * Provides the signature emerald multi-tone gradient aesthetic, ambient glow blobs,
 * 3D squircle icon badge, HeroUI Chip role badges, and versatile action slots.
 */
export function HeroUiHeader({
  title,
  subtitle,
  description,
  icon,
  roleBadge,
  tag,
  actionBadge,
  badge,
  actions,
  chips = [],
  theme = 'emerald',
  variants,
  className = '',
  printHidden = true,
  children,
  ...props
}) {
  const currentTheme = THEME_STYLES[theme] || THEME_STYLES.emerald
  const subtext = subtitle || description
  const primaryBadge = roleBadge || tag
  const secondaryBadge = actionBadge || badge

  const CardComponent = variants ? MotionHeroCard : HeroCard
  const cardMotionProps = variants ? { variants } : {}

  return (
    <CardComponent
      className={cn(
        'relative overflow-hidden rounded-[22px] border-2 p-5 sm:p-6 shadow-md',
        currentTheme.container,
        printHidden && 'print:hidden',
        className
      )}
      {...cardMotionProps}
      {...props}
    >
      {/* Dual Multi-Tone Ambient Glow Blobs */}
      <div
        className={cn(
          'pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full blur-3xl',
          currentTheme.blobTop
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full blur-3xl',
          currentTheme.blobBottom
        )}
      />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Icon Badge & Title Information */}
        <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
          {icon && (
            <div
              className={cn(
                'flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl',
                currentTheme.iconBadge
              )}
            >
              {renderIcon(icon, 'size-6 sm:size-7 text-white')}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              {title && (
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  {title}
                </h1>
              )}

              {/* Primary Role/Category Badge */}
              {primaryBadge && (
                typeof primaryBadge === 'string' ? (
                  <HeroChip
                    color="success"
                    size="sm"
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold',
                      currentTheme.roleTag
                    )}
                    startContent={<ShieldCheck className="size-3.5" />}
                  >
                    {primaryBadge}
                  </HeroChip>
                ) : React.isValidElement(primaryBadge) ? (
                  primaryBadge
                ) : typeof primaryBadge === 'object' && primaryBadge.text ? (
                  <HeroChip
                    color="success"
                    size="sm"
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold',
                      currentTheme.roleTag
                    )}
                    startContent={renderIcon(primaryBadge.icon, 'size-3.5') || <ShieldCheck className="size-3.5" />}
                  >
                    {primaryBadge.text}
                  </HeroChip>
                ) : null
              )}

              {/* Optional Extra Chips */}
              {Array.isArray(chips) &&
                chips.map((chipItem, index) => {
                  if (typeof chipItem === 'string') {
                    return (
                      <HeroChip
                        key={index}
                        size="sm"
                        color="default"
                        className="rounded-full border border-emerald-300/40 bg-white/70 text-xs font-bold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200"
                      >
                        {chipItem}
                      </HeroChip>
                    )
                  }
                  if (React.isValidElement(chipItem)) {
                    return <React.Fragment key={index}>{chipItem}</React.Fragment>
                  }
                  if (chipItem && typeof chipItem === 'object') {
                    return (
                      <HeroChip
                        key={index}
                        size="sm"
                        color={chipItem.color || 'success'}
                        className="rounded-full text-xs font-bold"
                        startContent={renderIcon(chipItem.icon, 'size-3')}
                      >
                        {chipItem.label || chipItem.text}
                      </HeroChip>
                    )
                  }
                  return null
                })}
            </div>

            {subtext && (
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                {subtext}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions or Secondary Highlight Badge */}
        {(actions || secondaryBadge) && (
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            {secondaryBadge && (
              typeof secondaryBadge === 'string' ? (
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-black shadow-2xs',
                    currentTheme.actionBadge
                  )}
                >
                  <Sparkles className={cn('size-3.5', currentTheme.actionBadgeIcon)} />
                  <span>{secondaryBadge}</span>
                </div>
              ) : React.isValidElement(secondaryBadge) ? (
                secondaryBadge
              ) : typeof secondaryBadge === 'object' && secondaryBadge.text ? (
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-black shadow-2xs',
                    currentTheme.actionBadge
                  )}
                >
                  {renderIcon(secondaryBadge.icon, cn('size-3.5', currentTheme.actionBadgeIcon)) || (
                    <Sparkles className={cn('size-3.5', currentTheme.actionBadgeIcon)} />
                  )}
                  <span>{secondaryBadge.text}</span>
                </div>
              ) : null
            )}

            {actions}
          </div>
        )}
      </div>

      {children}
    </CardComponent>
  )
}

HeroUiHeader.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  description: PropTypes.node,
  icon: PropTypes.oneOfType([PropTypes.elementType, PropTypes.element]),
  roleBadge: PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.object]),
  tag: PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.object]),
  actionBadge: PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.object]),
  badge: PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.object]),
  actions: PropTypes.node,
  chips: PropTypes.array,
  theme: PropTypes.oneOf(['emerald', 'blue', 'rose', 'amber']),
  variants: PropTypes.object,
  className: PropTypes.string,
  printHidden: PropTypes.bool,
  children: PropTypes.node,
}

export default HeroUiHeader
