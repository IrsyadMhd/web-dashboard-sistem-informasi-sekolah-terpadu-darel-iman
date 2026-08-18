import React from 'react'

/**
 * PageContainer - canonical layout container.
 * Menjaga lebar konten maksimal (max-w-7xl) agar konsisten di semua halaman.
 */
export default function PageContainer({ children, className = '', maxWidth = 'max-w-7xl' }) {
  return <div className={`mx-auto w-full ${maxWidth} ${className}`}>{children}</div>
}
