import React from 'react'
import AppButton from './AppButton'

/**
 * IconButton - canonical icon-only button.
 * label menjadi tooltip + aria-label (aksesibilitas).
 *
 * variant mengikuti AppButton (ghost/outline/primary/destructive, dst).
 */
export default function IconButton({
  label,
  icon: Icon,
  variant = 'ghost',
  size = 'icon',
  onClick,
  disabled,
  loading,
  className = '',
  ...props
}) {
  return (
    <AppButton
      type="button"
      variant={variant}
      size={size}
      icon={Icon}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      tooltip={label}
      aria-label={label}
      className={className}
      {...props}
    />
  )
}
