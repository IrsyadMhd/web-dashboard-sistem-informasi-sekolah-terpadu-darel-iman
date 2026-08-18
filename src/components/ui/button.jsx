import * as React from 'react'
import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

const buttonVariants = {
  primary: 'btn btn-primary bg-[#0E5C44] hover:bg-[#1E8E5A] text-white border-none shadow-md transition-all active:scale-[0.97]',
  default: 'btn',
  secondary: 'btn btn-secondary',
  accent: 'btn btn-accent',
  info: 'btn btn-info',
  success: 'btn btn-success',
  warning: 'btn btn-warning',
  destructive: 'btn btn-error',
  error: 'btn btn-error',
  outline: 'btn btn-outline',
  ghost: 'btn btn-text',
  icon: 'btn btn-square',
  link: 'btn btn-link',
}

const buttonSizes = {
  default: '',
  sm: 'btn-sm',
  lg: 'btn-lg',
  icon: 'btn-square btn-sm',
}

export const Button = React.forwardRef(
  ({ className, variant = 'primary', size = 'default', disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 focus:outline-none focus-visible:ring-3 focus-visible:ring-[#0E5C44]/30 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          buttonVariants[variant] || buttonVariants.primary,
          buttonSizes[size] || buttonSizes.default,
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'default', 'secondary', 'warning', 'destructive', 'outline', 'ghost', 'icon', 'link']),
  size: PropTypes.oneOf(['default', 'sm', 'lg', 'icon']),
  disabled: PropTypes.bool,
  children: PropTypes.node,
}
