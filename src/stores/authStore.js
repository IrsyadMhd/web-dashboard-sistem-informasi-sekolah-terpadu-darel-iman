import { create } from 'zustand'

export const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000 // 15 Menit

function getBrowserSessionId() {
  try {
    return sessionStorage.getItem('school_erp_browser_session')
  } catch {
    return null
  }
}

function bacaSessionTersimpan() {
  try {
    const browserSession = getBrowserSessionId()
    if (!browserSession) {
      return { token: null, user: null, loginTime: null, lastActivityTime: null }
    }
    const token = sessionStorage.getItem('school_erp_token') || localStorage.getItem('school_erp_token')
    const rawUser = sessionStorage.getItem('school_erp_user') || localStorage.getItem('school_erp_user')
    const loginTime = sessionStorage.getItem('school_erp_login_time') || localStorage.getItem('school_erp_login_time')
    const rawLastActivity = sessionStorage.getItem('school_erp_last_activity') || localStorage.getItem('school_erp_last_activity')
    const lastActivityTime = rawLastActivity ? parseInt(rawLastActivity, 10) : Date.now()

    return {
      token,
      user: rawUser ? JSON.parse(rawUser) : null,
      loginTime: loginTime || new Date().toISOString(),
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
  const browserSession = getBrowserSessionId()
  const token = state?.token || sessionStorage.getItem('school_erp_token') || localStorage.getItem('school_erp_token')

  if (!token) {
    return { valid: false, reason: 'no_token', message: 'Silakan masuk untuk melanjutkan.' }
  }

  if (!browserSession) {
    return {
      valid: false,
      reason: 'browser_mismatch',
      message: 'Status login memerlukan autentikasi baru saat berpindah browser/link. Silakan login kembali.',
    }
  }

  const lastActivity = state?.lastActivityTime || parseInt(sessionStorage.getItem('school_erp_last_activity') || '0', 10)
  if (lastActivity && Date.now() - lastActivity > INACTIVITY_TIMEOUT_MS) {
    return {
      valid: false,
      reason: 'inactivity',
      message: 'Sesi Anda telah berakhir karena tidak ada aktivitas selama 15 menit. Silakan login kembali.',
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
  browserSessionId: getBrowserSessionId(),
  setSession: ({ token, user, loginTime }) => {
    const normalizedUser = normalizeUser(user)
    const sessionId = `bs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const nowIso = loginTime || new Date().toISOString()
    const nowMs = Date.now()

    try {
      sessionStorage.setItem('school_erp_browser_session', sessionId)
      sessionStorage.setItem('school_erp_token', token)
      sessionStorage.setItem('school_erp_user', JSON.stringify(normalizedUser))
      sessionStorage.setItem('school_erp_login_time', nowIso)
      sessionStorage.setItem('school_erp_last_activity', String(nowMs))

      localStorage.setItem('school_erp_token', token)
      localStorage.setItem('school_erp_user', JSON.stringify(normalizedUser))
      localStorage.setItem('school_erp_login_time', nowIso)
      localStorage.setItem('school_erp_last_activity', String(nowMs))
    } catch {
      // Ignore storage errors
    }

    set({
      token,
      user: normalizedUser,
      browserSessionId: sessionId,
      loginTime: nowIso,
      lastActivityTime: nowMs,
    })
  },
  touchActivity: () => {
    const nowMs = Date.now()
    try {
      sessionStorage.setItem('school_erp_last_activity', String(nowMs))
      localStorage.setItem('school_erp_last_activity', String(nowMs))
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
      browserSessionId: null,
    })
  },
}))

