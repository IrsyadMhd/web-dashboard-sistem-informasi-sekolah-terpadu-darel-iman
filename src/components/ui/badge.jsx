import * as React from 'react'
import PropTypes from 'prop-types'
import { Chip as HeroChip } from '@heroui/react'
import { cn } from '../../lib/utils'

const mapHeroColor = (variant, colorProp) => {
  const target = colorProp || variant
  switch (target) {
    case 'primary':
    case 'emerald':
    case 'teal':
    case 'green':
    case 'success':
      return 'success'
    case 'warning':
    case 'amber':
    case 'orange':
      return 'warning'
    case 'danger':
    case 'destructive':
    case 'error':
    case 'rose':
    case 'red':
      return 'danger'
    case 'info':
    case 'sky':
    case 'cyan':
    case 'blue':
      return 'accent'
    case 'purple':
    case 'violet':
    case 'indigo':
      return 'secondary'
    case 'default':
    case 'outline':
    case 'gray':
    default:
      return 'secondary'
  }
}

const renderIcon = (icon) => {
  if (!icon) return null
  if (React.isValidElement(icon)) return icon
  if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && icon.$$typeof)) {
    const IconComponent = icon
    return <IconComponent className="size-3.5" />
  }
  return icon
}

export function Badge({ className, variant = 'default', color, size = 'sm', children, prefixIcon, suffixIcon, ...props }) {
  const heroColor = mapHeroColor(variant, color)
  const heroSize = size === 'xs' || size === 'sm' || size === 'default' ? 'sm' : size === 'lg' ? 'lg' : 'md'
  const renderedPrefix = renderIcon(prefixIcon)
  const renderedSuffix = renderIcon(suffixIcon)
  return (
    <HeroChip
      color={heroColor}
      size={heroSize}
      variant="soft"
      className={cn('font-semibold rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5', className)}
      {...props}
    >
      {renderedPrefix && <span className="inline-flex shrink-0">{renderedPrefix}</span>}
      {children}
      {renderedSuffix && <span className="inline-flex shrink-0">{renderedSuffix}</span>}
    </HeroChip>
  )
}

Badge.displayName = 'Badge'

Badge.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.string,
  size: PropTypes.string,
  children: PropTypes.node,
}

export default Badge

