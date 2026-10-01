import * as React from 'react'
import PropTypes from 'prop-types'
import { Button as TailGridsButton } from '../tailgrids/core/button'

const mapVariant = (variant) => {
  switch (variant) {
    case 'primary':
      return { variant: 'primary', appearance: 'fill' }
    case 'destructive':
    case 'danger':
    case 'error':
      return { variant: 'danger', appearance: 'fill' }
    case 'success':
      return { variant: 'success', appearance: 'fill' }
    case 'ghost':
    case 'link':
      return { variant: 'ghost', appearance: 'outline' }
    case 'outline':
    case 'secondary':
    case 'default':
    default:
      return { variant: 'primary', appearance: 'outline' }
  }
}

const mapSize = (size) => {
  switch (size) {
    case 'xs':
      return { size: 'xs', iconOnly: false }
    case 'sm':
      return { size: 'sm', iconOnly: false }
    case 'lg':
      return { size: 'lg', iconOnly: false }
    case 'icon':
      return { size: 'sm', iconOnly: true }
    default:
      return { size: 'sm', iconOnly: false }
  }
}

export const Button = React.forwardRef(
  ({ className, variant = 'primary', size = 'default', disabled, iconOnly, ...props }, ref) => {
    const v = mapVariant(variant)
    const s = mapSize(size)
    return (
      <TailGridsButton
        ref={ref}
        variant={v.variant}
        appearance={v.appearance}
        size={s.size}
        iconOnly={iconOnly || s.iconOnly}
        disabled={disabled}
        className={className}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'default', 'secondary', 'warning', 'destructive', 'danger', 'error', 'outline', 'ghost', 'icon', 'link', 'success']),
  size: PropTypes.oneOf(['default', 'xs', 'sm', 'lg', 'icon', 'md']),
  disabled: PropTypes.bool,
  children: PropTypes.node,
}

export default Button
