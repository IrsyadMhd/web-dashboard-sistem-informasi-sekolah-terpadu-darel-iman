import axios from 'axios'
import { clearAuthArtifacts, checkSessionValidity } from '../stores/authStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
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

  const token = sessionStorage.getItem('school_erp_token') || localStorage.getItem('school_erp_token')

  if (token) {
    // Only check validity for protected endpoints (avoid infinite loop on login)
    if (!config.url.includes('/login') && !config.url.includes('/auth/')) {
      const validity = checkSessionValidity({ token })
      if (!validity.valid && token && !token.startsWith('dev-test-token')) {
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
      const token = sessionStorage.getItem('school_erp_token') || localStorage.getItem('school_erp_token')
      if (token && token.startsWith('dev-test-token')) {
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

