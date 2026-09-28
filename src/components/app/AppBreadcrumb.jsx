import React from 'react'
import { Breadcrumbs } from '../tailgrids/core/breadcrumbs'

/**
 * AppBreadcrumb - Canonical Breadcrumb Navigation Component for SIMSIT.
 *
 * Mengimplementasikan TailGrids Breadcrumbs Component standar emas:
 * - Ikon Beranda di awal navigasi (Home icon)
 * - Pemisah halus (Chevron / Slash / Dot) terintegrasi Pengaturan Sistem
 * - Hyperlink SPA dengan efek hover hijau khas SIMSIT
 * - Highlight tebal untuk item halaman aktif
 * - Safe truncation & print-safe
 *
 * Props:
 *  - items: array of [{ label, href, to, path, icon }] atau array of string
 *  - pageTitle: string (opsional jika hanya butuh 1 crumb halaman)
 *  - dividerType: 'chevron' | 'slash' | 'dot' (default mengikuti Pengaturan / chevron)
 *  - homeTo: string | null | boolean (default: '/dashboard')
 *  - className: string (opsional utility classes)
 */
export default function AppBreadcrumb(props) {
  return <Breadcrumbs {...props} />
}

export { Breadcrumbs }
