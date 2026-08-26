/**
 * Utility to resolve site/school logo URL robustly across all card components and print services.
 */
export function getCardLogoUrl(pengaturan = {}, data = {}) {
  const rawUrl =
    pengaturan?.logo_url ||
    pengaturan?.logoUrl ||
    pengaturan?.logo ||
    pengaturan?.site_logo ||
    pengaturan?.logo_app ||
    data?.unit?.logo_url ||
    data?.unit_logo ||
    data?.raw?.unit?.logo_url ||
    ''

  if (!rawUrl) return ''

  if (typeof rawUrl === 'string') {
    if (rawUrl.startsWith('data:image')) return rawUrl
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) return rawUrl

    // Fix relative paths like /storage/site-settings/logo.png for Vite dev server
    const apiOrigin = typeof window !== 'undefined' && window.location?.origin?.includes('5173')
      ? 'http://localhost:8000'
      : (typeof window !== 'undefined' ? window.location.origin : '')

    if (rawUrl.startsWith('/')) return `${apiOrigin}${rawUrl}`
    return `${apiOrigin}/${rawUrl}`
  }

  return ''
}
