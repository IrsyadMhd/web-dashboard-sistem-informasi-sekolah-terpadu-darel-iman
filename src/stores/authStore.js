import { create } from 'zustand'
import { authService } from '../services/authService'

export const SESSION_MAX_LIFETIME_MS = 24 * 60 * 60 * 1000 // 24 Jam (1440 Menit)
export const PWA_INACTIVITY_MAX_MS = 3 * 24 * 60 * 60 * 1000 // 3 Hari (72 Jam)
export const INACTIVITY_TIMEOUT_MS = SESSION_MAX_LIFETIME_MS // Backward compatibility export

export function isPWAStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  )
}

function bacaSessionTersimpan() {
  try {
    const token = localStorage.getItem('school_erp_token') || sessionStorage.getItem('school_erp_token')
    const rawUser = localStorage.getItem('school_erp_user') || sessionStorage.getItem('school_erp_user')
    const loginTime = localStorage.getItem('school_erp_login_time') || sessionStorage.getItem('school_erp_login_time')
    const rawLastActivity = localStorage.getItem('school_erp_last_activity') || sessionStorage.getItem('school_erp_last_activity')
    const lastActivityTime = rawLastActivity ? parseInt(rawLastActivity, 10) : Date.now()

    return {
      token: token || null,
      user: rawUser ? JSON.parse(rawUser) : null,
      loginTime: loginTime || null,
      lastActivityTime,
    }
  } catch {
    return { token: null, user: null, loginTime: null, lastActivityTime: null }
  }
}

export function clearAuthArtifacts() {
  try {
    sessionStorage.removeItem('school_erp_browser_session')
    sessionStorage.removeItem('school_erp_token')
    sessionStorage.removeItem('school_erp_user')
    sessionStorage.removeItem('school_erp_login_time')
    sessionStorage.removeItem('school_erp_last_activity')

    localStorage.removeItem('school_erp_token')
    localStorage.removeItem('school_erp_user')
    localStorage.removeItem('school_erp_login_time')
    localStorage.removeItem('school_erp_last_activity')
    localStorage.removeItem('school_erp_superadmin_session')
  } catch {
    // Ignore storage clear errors
  }
}

function normalizeUser(user) {
  return user?.data || user || null
}

export function checkSessionValidity(state) {
  const token = state?.token || localStorage.getItem('school_erp_token') || sessionStorage.getItem('school_erp_token')

  if (!token) {
    return { valid: false, reason: 'no_token', message: 'Silakan masuk untuk melanjutkan.' }
  }

  const isPwa = isPWAStandalone()

  // In PWA installed app mode, session persists indefinitely unless app is not used for 3 consecutive days (72 hours)
  if (isPwa) {
    const rawLastActivity = state?.lastActivityTime || localStorage.getItem('school_erp_last_activity') || sessionStorage.getItem('school_erp_last_activity')
    const lastActivityTime = rawLastActivity ? parseInt(rawLastActivity, 10) : null
    if (lastActivityTime && !isNaN(lastActivityTime)) {
      if (Date.now() - lastActivityTime > PWA_INACTIVITY_MAX_MS) {
        return {
          valid: false,
          reason: 'pwa_inactivity_expired',
          message: 'Sesi aplikasi PWA telah berakhir karena tidak digunakan selama 3 hari. Silakan masuk kembali.',
        }
      }
    }
    return { valid: true }
  }

  // Normal browser tab session validation (24 hours max lifetime)
  const loginTimeRaw = state?.loginTime || localStorage.getItem('school_erp_login_time') || sessionStorage.getItem('school_erp_login_time')
  if (loginTimeRaw) {
    const loginTimeMs = new Date(loginTimeRaw).getTime()
    if (!isNaN(loginTimeMs) && Date.now() - loginTimeMs > SESSION_MAX_LIFETIME_MS) {
      return {
        valid: false,
        reason: 'expired',
        message: 'Sesi Anda telah berakhir (maksimal 24 jam). Silakan login kembali.',
      }
    }
  }

  return { valid: true }
}

const initialSession = bacaSessionTersimpan()

export const useAuthStore = create((set, get) => ({
  token: initialSession.token,
  user: initialSession.user,
  loginTime: initialSession.loginTime,
  lastActivityTime: initialSession.lastActivityTime,
  isInitializing: true,
  isAuthenticated: !!(initialSession.token && initialSession.user),

  initializeAuth: async () => {
    const token = localStorage.getItem('school_erp_token') || sessionStorage.getItem('school_erp_token')
    if (!token) {
      set({
        token: null,
        user: null,
        isInitializing: false,
        isAuthenticated: false,
      })
      return
    }

    const validity = checkSessionValidity({ token })
    if (!validity.valid) {
      clearAuthArtifacts()
      set({
        token: null,
        user: null,
        isInitializing: false,
        isAuthenticated: false,
      })
      return
    }

    try {
      const response = await authService.profile()
      const normalizedUser = normalizeUser(response)

      try {
        localStorage.setItem('school_erp_user', JSON.stringify(normalizedUser))
        sessionStorage.setItem('school_erp_user', JSON.stringify(normalizedUser))
      } catch {
        // Ignore
      }

      set({
        token,
        user: normalizedUser,
        isInitializing: false,
        isAuthenticated: true,
      })
    } catch (err) {
      if (err?.response?.status === 401) {
        clearAuthArtifacts()
        set({
          token: null,
          user: null,
          isInitializing: false,
          isAuthenticated: false,
        })
      } else {
        const cachedUser = initialSession.user
        set({
          token,
          user: cachedUser,
          isInitializing: false,
          isAuthenticated: !!cachedUser,
        })
      }
    }
  },

  setSession: ({ token, user, loginTime }) => {
    const normalizedUser = normalizeUser(user)
    const nowIso = loginTime || new Date().toISOString()
    const nowMs = Date.now()

    try {
      localStorage.setItem('school_erp_token', token)
      localStorage.setItem('school_erp_user', JSON.stringify(normalizedUser))
      localStorage.setItem('school_erp_login_time', nowIso)
      localStorage.setItem('school_erp_last_activity', String(nowMs))

      sessionStorage.setItem('school_erp_token', token)
      sessionStorage.setItem('school_erp_user', JSON.stringify(normalizedUser))
      sessionStorage.setItem('school_erp_login_time', nowIso)
      sessionStorage.setItem('school_erp_last_activity', String(nowMs))
    } catch {
      // Ignore storage errors
    }

    set({
      token,
      user: normalizedUser,
      loginTime: nowIso,
      lastActivityTime: nowMs,
      isInitializing: false,
      isAuthenticated: true,
    })
  },

  touchActivity: () => {
    const nowMs = Date.now()
    try {
      localStorage.setItem('school_erp_last_activity', String(nowMs))
      sessionStorage.setItem('school_erp_last_activity', String(nowMs))
    } catch {
      // Ignore storage errors
    }
    set({ lastActivityTime: nowMs })
  },

  isSessionValid: () => {
    return checkSessionValidity(get())
  },

  clearSession: () => {
    clearAuthArtifacts()
    set({
      token: null,
      user: null,
      loginTime: null,
      lastActivityTime: null,
      isInitializing: false,
      isAuthenticated: false,
    })
  },
}))

// Cross-tab logout and session sync listener
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'school_erp_token') {
      if (!event.newValue) {
        useAuthStore.getState().clearSession()
      } else {
        const saved = bacaSessionTersimpan()
        useAuthStore.setState({
          token: saved.token,
          user: saved.user,
          loginTime: saved.loginTime,
          lastActivityTime: saved.lastActivityTime,
          isAuthenticated: !!(saved.token && saved.user),
        })
      }
    }
  })
}

