import { api } from './api'

function normalizeAssets(settings) {
  const apiOrigin = new URL(api.defaults.baseURL, window.location.origin).origin
  const assetUrl = (value) => {
    if (!value || typeof value !== 'string') return ''

    // Path relatif dari backend selalu memakai origin API, bukan origin Vite.
    if (value.startsWith('/')) return `${apiOrigin}${value}`

    try {
      // Koreksi URL lama yang dibuat dari APP_URL tanpa port API.
      const parsed = new URL(value, apiOrigin)
      if (parsed.pathname && parsed.pathname.startsWith('/storage/')) {
        return `${apiOrigin}${parsed.pathname}${parsed.search}`
      }
      return parsed.href
    } catch {
      return value
    }
  }

  return {
    ...settings,
    logo_url: assetUrl(settings.logo_url),
    favicon_url: assetUrl(settings.favicon_url),
  }
}

export const siteSettingService = {
  async get() {
    const response = await api.get('/site-settings')
    return normalizeAssets(response.data.data)
  },

  async update(values, files = {}) {
    const payload = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        payload.append(key, value ? '1' : '0')
      } else if (value !== null && typeof value === 'object' && !(value instanceof File) && !(value instanceof Blob)) {
        payload.append(key, JSON.stringify(value))
      } else {
        payload.append(key, value ?? '')
      }
    })
    if (files.logo) payload.append('logo', files.logo)
    if (files.favicon) payload.append('favicon', files.favicon)

    const response = await api.post('/site-settings', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return normalizeAssets(response.data.data)
  },
}
