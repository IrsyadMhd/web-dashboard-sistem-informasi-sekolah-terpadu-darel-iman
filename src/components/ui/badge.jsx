import * as React from 'react'
import PropTypes from 'prop-types'
import { Badge as TailGridsBadge } from '../tailgrids/core/badge'

const mapColor = (variant) => {
  switch (variant) {
    case 'primary':
      return 'primary'
    case 'success':
      return 'success'
    case 'warning':
      return 'warning'
    case 'danger':
    case 'destructive':
    case 'error':
      return 'error'
    case 'info':
      return 'sky'
    case 'default':
    case 'outline':
    default:
      return 'gray'
  }
}

export function Badge({ className, variant = 'default', size = 'sm', children, prefixIcon, suffixIcon, ...props }) {
  const color = mapColor(variant)
  return (
    <TailGridsBadge
      color={color}
      size={size === 'default' ? 'sm' : size}
      prefixIcon={prefixIcon}
      suffixIcon={suffixIcon}
      className={className}
      {...props}
    >
      {children}
    </TailGridsBadge>
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
