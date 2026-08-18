import React from 'react'
import { LoaderCircle } from 'lucide-react'
import { Button } from '../ui/button'

const VARIANTS = ['primary', 'secondary', 'ghost', 'outline', 'destructive', 'danger', 'warning', 'success', 'icon', 'link', 'default']

/**
 * AppButton - canonical enterprise button.
 * Satu-satunya tombol yang boleh dipakai di seluruh aplikasi.
 *
 * variant: primary | secondary | ghost | outline | destructive | success | icon | link
 * loading: menampilkan spinner dan menonaktifkan tombol
 * tooltip: native tooltip (title)
 */
export default function AppButton({
  variant = 'primary',
  size,
  loading = false,
  loadingText,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  children,
  disabled,
  tooltip,
  ...props
}) {
  const isDestructive = variant === 'destructive' || variant === 'danger'
  const isSuccess = variant === 'success'
  const resolvedVariant = isDestructive ? 'destructive' : isSuccess ? 'primary' : variant

  const content = (
    <>
      {loading ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="h-4 w-4" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="h-4 w-4" />}
        </>
      )}
    </>
  )

  return (
    <Button
      variant={resolvedVariant}
      size={size}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      title={tooltip}
      className={className}
      {...props}
    >
      {content}
    </Button>
  )
}

AppButton.VARIANTS = VARIANTS
