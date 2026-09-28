import React from 'react'
import PropTypes from 'prop-types'
import {
  Alert as TailGridsAlert,
  AlertIndicator,
  AlertContent,
  AlertTitle as TailGridsAlertTitle,
  AlertDescription as TailGridsAlertDescription,
  AlertCloseButton,
} from '../tailgrids/core/alert'

const mapStatus = (variant) => {
  switch (variant) {
    case 'primary':
    case 'success':
      return 'success'
    case 'warning':
      return 'warning'
    case 'error':
    case 'danger':
    case 'destructive':
      return 'error'
    case 'info':
      return 'info'
    case 'default':
    default:
      return 'default'
  }
}

export function Alert({
  variant = 'default',
  status,
  children,
  className,
  onClose,
  showIcon = true,
  icon: CustomIcon,
  ...props
}) {
  const resolvedStatus = status || mapStatus(variant)

  return (
    <TailGridsAlert
      status={resolvedStatus}
      className={className}
      {...props}
    >
      {showIcon && <AlertIndicator icon={CustomIcon ? <CustomIcon className="h-5 w-5" /> : undefined} />}
      <AlertContent>
        {children}
      </AlertContent>
      {onClose && <AlertCloseButton onClick={onClose} />}
    </TailGridsAlert>
  )
}

Alert.propTypes = {
  variant: PropTypes.oneOf(['default', 'primary', 'info', 'success', 'warning', 'error', 'danger', 'destructive']),
  status: PropTypes.oneOf(['default', 'success', 'warning', 'error', 'info']),
  children: PropTypes.node,
  className: PropTypes.string,
  onClose: PropTypes.func,
  showIcon: PropTypes.bool,
  icon: PropTypes.elementType,
}

export function AlertTitle({ className, children, ...props }) {
  return (
    <TailGridsAlertTitle className={className} {...props}>
      {children}
    </TailGridsAlertTitle>
  )
}

export function AlertDescription({ className, children, ...props }) {
  return (
    <TailGridsAlertDescription className={className} {...props}>
      {children}
    </TailGridsAlertDescription>
  )
}

export function CRUDNotificationAlerts({ className = 'space-y-3' }) {
  return (
    <div className={className}>
      <Alert status="default">
        <span>Pemberitahuan Sistem: Harap periksa kembali kelengkapan formulir sebelum mengonfirmasi tindakan.</span>
      </Alert>
      <Alert status="success">
        <span>Perubahan Sukses! Data berhasil diperbarui dan tersimpan dengan benar di sistem.</span>
      </Alert>
      <Alert status="info">
        <span>Penghapusan Sukses! Data telah berhasil dihapus dari sistem.</span>
      </Alert>
      <Alert status="success">
        <span>Penyimpanan Sukses! Data baru berhasil ditambahkan dan tersimpan di database.</span>
      </Alert>
      <Alert status="warning">
        <span>Penghapusan Gagal! Data tidak dapat dihapus karena masih terhubung dengan catatan lain.</span>
      </Alert>
      <Alert status="error">
        <span>Penyimpanan / Perubahan Gagal! Terjadi kesalahan saat memproses data. Silakan coba lagi.</span>
      </Alert>
    </div>
  )
}

export default Alert
