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

    // Resolusi origin dinamis: prioritaskan VITE_API_BASE_URL / VITE_BACKEND_URL
    const envApiBase = import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_BACKEND_URL || ''
    let apiOrigin = ''
    if (envApiBase) {
      apiOrigin = envApiBase.replace(/\/api\/?$/, '')
    } else if (typeof window !== 'undefined' && window.location) {
      // Jika di Vite dev server (:5173), arahkan ke host yang sama di port :8000 (bekerja di localhost maupun IP LAN)
      if (window.location.port === '5173') {
        apiOrigin = `${window.location.protocol}//${window.location.hostname}:8000`
      } else {
        apiOrigin = window.location.origin
      }
    }

    if (rawUrl.startsWith('/')) return `${apiOrigin}${rawUrl}`
    return `${apiOrigin}/${rawUrl}`
  }

  return ''
}
