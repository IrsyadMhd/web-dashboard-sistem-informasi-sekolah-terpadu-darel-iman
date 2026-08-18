import React from 'react'
import PropTypes from 'prop-types'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * FlyonUI Alert Component
 * Direct integration of FlyonUI Tailwind CSS alert component for react.
 * Supports variants: default, primary, info, success, warning, error
 */
const alertVariants = {
  default: 'alert',
  primary: 'alert alert-primary',
  info: 'alert alert-info',
  success: 'alert alert-success',
  warning: 'alert alert-warning',
  error: 'alert alert-error',
}

const defaultIcons = {
  default: Info,
  primary: CheckCircle2,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
}

export function Alert({
  variant = 'default',
  children,
  className,
  onClose,
  showIcon = true,
  icon: CustomIcon,
  ...props
}) {
  const Icon = CustomIcon || defaultIcons[variant] || Info

  return (
    <div
      className={cn(alertVariants[variant] || alertVariants.default, className)}
      role="alert"
      {...props}
    >
      {showIcon && Icon && <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />}
      <div className="flex-1 text-sm font-medium">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost"
          aria-label="Tutup notifikasi"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

Alert.propTypes = {
  variant: PropTypes.oneOf(['default', 'primary', 'info', 'success', 'warning', 'error']),
  children: PropTypes.node,
  className: PropTypes.string,
  onClose: PropTypes.func,
  showIcon: PropTypes.bool,
  icon: PropTypes.elementType,
}

/**
 * Pre-configured FlyonUI CRUD Notification Alert Blocks
 * Formatted for:
 * 1. Default Info / System Alert
 * 2. Perubahan Data Sukses (Primary Alert)
 * 3. Penghapusan Data Sukses (Info Alert)
 * 4. Penyimpanan Data Baru Sukses (Success Alert)
 * 5. Penghapusan Data Gagal (Warning Alert)
 * 6. Penyimpanan / Perubahan Data Gagal (Error Alert)
 */
export function CRUDNotificationAlerts({ className = 'space-y-3' }) {
  return (
    <div className={className}>
      {/* Default Alert - Informasi Sistem */}
      <div className="alert" role="alert">
        <Info className="h-5 w-5 shrink-0" />
        <span>Pemberitahuan Sistem: Harap periksa kembali kelengkapan formulir sebelum mengonfirmasi tindakan.</span>
      </div>

      {/* Primary Alert - Perubahan Sukses */}
      <div className="alert alert-primary" role="alert">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <span>Perubahan Sukses! Data berhasil diperbarui dan tersimpan dengan benar di sistem.</span>
      </div>

      {/* Info Alert - Penghapusan Sukses */}
      <div className="alert alert-info" role="alert">
        <Info className="h-5 w-5 shrink-0" />
        <span>Penghapusan Sukses! Data telah berhasil dihapus dari sistem.</span>
      </div>

      {/* Success Alert - Penyimpanan Sukses */}
      <div className="alert alert-success" role="alert">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <span>Penyimpanan Sukses! Data baru berhasil ditambahkan dan tersimpan di database.</span>
      </div>

      {/* Warning Alert - Penghapusan Gagal */}
      <div className="alert alert-warning" role="alert">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <span>Penghapusan Gagal! Data tidak dapat dihapus karena masih terhubung dengan catatan lain.</span>
      </div>

      {/* Error Alert - Penyimpanan / Perubahan Gagal */}
      <div className="alert alert-error" role="alert">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>Penyimpanan / Perubahan Gagal! Terjadi kesalahan saat memproses data. Silakan coba lagi.</span>
      </div>
    </div>
  )
}

export default Alert
