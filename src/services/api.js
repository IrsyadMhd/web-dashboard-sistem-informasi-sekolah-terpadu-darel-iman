import axios from 'axios'
import { clearAuthArtifacts, checkSessionValidity } from '../stores/authStore'

export const resolveApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_BASE_URL
  if (configured && typeof configured === 'string' && configured.trim()) {
    return configured.trim()
  }

  if (typeof window !== 'undefined' && window.location) {
    // Pada mode Vite dev (:5173), hubungkan ke host yang sama di port backend :8000 (mendukung localhost dan IP LAN)
    if (window.location.port === '5173') {
      return `${window.location.protocol}//${window.location.hostname}:8000/api`
    }
    // Pada production satu domain (reverse proxy / Nginx)
    return `${window.location.origin}/api`
  }

  return 'http://localhost:8000/api'
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers['Content-Type']
      delete config.headers['content-type']
    }
  }

  const explicitAuth = config.headers?.Authorization || config.headers?.authorization
  const token = localStorage.getItem('school_erp_token') || sessionStorage.getItem('school_erp_token')
  const url = config.url || ''

  if (!explicitAuth && token && typeof token === 'string') {
    // Only check validity for protected endpoints (avoid infinite loop on login)
    if (!url.includes('/login') && !url.includes('/auth/')) {
      const validity = checkSessionValidity({ token })
      if (!validity.valid && !token.startsWith('dev-test-token')) {
        clearAuthArtifacts()
        window.dispatchEvent(new Event('auth-session-cleared'))
        if (window.location.pathname !== '/masuk') {
          const reason = validity.reason || 'expired'
          window.location.href = `/masuk?reason=${reason}`
        }
        return Promise.reject(new axios.Cancel('Sesi tidak valid atau telah berakhir.'))
      }
    }
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    if (status === 401) {
      const token = localStorage.getItem('school_erp_token') || sessionStorage.getItem('school_erp_token')
      if (token && typeof token === 'string' && token.startsWith('dev-test-token')) {
        return Promise.reject(error)
      }
      clearAuthArtifacts()
      window.dispatchEvent(new Event('auth-session-cleared'))

      if (window.location.pathname !== '/masuk') {
        window.location.href = '/masuk?reason=expired'
      }
    }

    return Promise.reject(error)
  }
)

export default api

