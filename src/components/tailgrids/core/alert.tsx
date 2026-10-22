/**
 * TailGrids Alert Compat Layer -> Canonical HeroUI Alert System.
 * Re-exports canonical HeroUI-based Alert component for backward compatibility.
 */
import React from 'react'
import {
  Alert as UIAlert,
  AlertTitle as UIAlertTitle,
  AlertDescription as UIAlertDescription,
} from '@/components/ui/alert'

export const Alert = UIAlert
export const AlertTitle = UIAlertTitle
export const AlertDescription = UIAlertDescription

export function AlertIndicator({ icon, className, ...props }: any) {
  return icon ? <span className={className} {...props}>{icon}</span> : null
}

export function AlertContent({ children, className, ...props }: any) {
  return <div className={className} {...props}>{children}</div>
}

export function AlertCloseButton({ onClick, className, ...props }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-label="Tutup notifikasi"
      {...props}
    >
      ×
    </button>
  )
}

export default Alert
