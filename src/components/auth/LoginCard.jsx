import { useState, useRef, useEffect } from 'react'
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiX,
  FiUser,
  FiCameraOff,
} from 'react-icons/fi'
import { FaMosque } from 'react-icons/fa6'
import { BsQrCode } from 'react-icons/bs'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../stores/authStore'
import { usePengaturanStore } from '../../stores/pengaturanStore'

export default function LoginCard({ onNavigate, onLoginSuccess }) {
  const setSession = useAuthStore((state) => state.setSession)
  const pengaturan = usePengaturanStore((state) => state.pengaturan)

  // Single Unified Form inputs
  const [form, setForm] = useState({
    identifier: '',
    password: '',
    rememberMe: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sessionNotice, setSessionNotice] = useState('')
  const [workspaceOptions, setWorkspaceOptions] = useState([])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const reason = params.get('reason')
    if (reason === 'inactivity') {
      setSessionNotice('Sesi Anda telah berakhir karena tidak ada aktivitas selama 15 menit. Silakan masuk kembali.')
    } else if (reason === 'browser_mismatch') {
      setSessionNotice('Status login memerlukan autentikasi baru saat berpindah browser/link. Silakan masuk kembali.')
    } else if (reason === 'expired') {
      setSessionNotice('Sesi login Anda telah kedaluwarsa. Silakan masuk kembali.')
    }
  }, [])

  // QR Modal scanner state
  const [showQrModal, setShowQrModal] = useState(false)
  const [qrTokenInput, setQrTokenInput] = useState('')
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState('')

  // Camera stream state
  const videoRef = useRef(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState('')

  // Real Camera WebRTC Stream Lifecycle
  useEffect(() => {
    let stream = null
    let animationFrameId = null
    let barcodeDetector = null

    if (showQrModal) {
      setCameraError('')
      setCameraActive(false)

      if ('BarcodeDetector' in window) {
        try {
          barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] })
        } catch {
          barcodeDetector = null
        }
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'environment' } })
          .then((mediaStream) => {
            stream = mediaStream
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream
              videoRef.current
                .play()
                .then(() => setCameraActive(true))
                .catch(() => setCameraActive(true))

              // Scan frame loop using native BarcodeDetector if available
              if (barcodeDetector) {
                const scanFrame = async () => {
                  if (videoRef.current && videoRef.current.readyState === 4) {
                    try {
                      const barcodes = await barcodeDetector.detect(videoRef.current)
                      if (barcodes && barcodes.length > 0) {
                        const code = barcodes[0].rawValue
                        if (code) {
                          setQrTokenInput(code)
                        }
                      }
                    } catch {
                      // ignore frame detect error
                    }
                  }
                  animationFrameId = requestAnimationFrame(scanFrame)
                }
                animationFrameId = requestAnimationFrame(scanFrame)
              }
            }
          })
          .catch((err) => {
            setCameraActive(false)
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              setCameraError('Izin kamera ditolak. Silakan berikan izin akses kamera pada browser Anda.')
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
              setCameraError('Kamera tidak ditemukan pada perangkat Anda.')
            } else {
              setCameraError('Tidak dapat mengaktifkan kamera. Anda dapat memasukkan/menempelkan token QR secara manual.')
            }
          })
      } else {
        setCameraError('Browser Anda tidak mendukung akses kamera WebRTC.')
      }
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      setCameraActive(false)
    }
  }, [showQrModal])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setWorkspaceOptions([])

    try {
      const result = await authService.login({
        identifier: form.identifier,
        password: form.password,
        device_name: 'web-dashboard',
      })

      if (!result.token || !result.user) throw new Error('Respons autentikasi tidak valid.')
      setSession({ token: result.token, user: result.user, loginTime: new Date().toISOString() })
      if (onLoginSuccess) onLoginSuccess(result)
      else if (onNavigate) onNavigate(6)
    } catch (err) {
      if (err?.response?.status === 409 && err.response.data?.workspace_chooser) {
        setWorkspaceOptions(err.response.data.workspaces || [])
        return
      }
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.identifier?.[0] ||
        'Username, NIP, NIS, NIK, atau password tidak valid.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleWorkspaceLogin = async (portalType) => {
    setLoading(true)
    setError('')

    try {
      const result = await authService.loginParentStudent({
        portal_type: portalType,
        identifier: form.identifier,
        password: form.password,
        device_name: 'web-dashboard',
      })

      if (!result.token || !result.user) throw new Error('Respons autentikasi tidak valid.')
      setSession({ token: result.token, user: result.user, loginTime: new Date().toISOString() })
      setWorkspaceOptions([])
      if (onLoginSuccess) onLoginSuccess(result)
      else if (onNavigate) onNavigate(6)
    } catch (err) {
      setError(err?.response?.data?.message || 'Kredensial atau workspace tidak valid.')
    } finally {
      setLoading(false)
    }
  }

  const handleQrSubmit = async (e) => {
    e.preventDefault()
    if (!qrTokenInput.trim()) return
    setQrLoading(true)
    setQrError('')

    try {
      const result = await authService.loginEmployeeQr({
        qr_token: qrTokenInput.trim(),
        device_name: 'web-dashboard',
      })

      if (!result.token || !result.user) throw new Error('Respons autentikasi tidak valid.')
      setSession({
        token: result.token,
        user: result.user,
        loginTime: new Date().toISOString(),
      })

      setShowQrModal(false)
       if (onLoginSuccess) onLoginSuccess(result)
      else if (onNavigate) onNavigate(6)
    } catch (err) {
      const msg = err?.response?.data?.message || 'QR Code tidak valid, kedaluwarsa, atau telah dicabut.'
      setQrError(msg)
    } finally {
      setQrLoading(false)
    }
  }

  const logoUrl = pengaturan?.logo_url || pengaturan?.logoUrl || ''
  const namaSekolah = pengaturan?.school_name || pengaturan?.namaSekolah || 'YAYASAN DAR EL - IMAN'
  const namaAplikasi = pengaturan?.application_name || 'Sistem Manajemen Sekolah Terpadu'

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100/80 transition-all duration-300">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 px-8 pt-8 pb-7 text-white text-center relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo Sekolah"
              className="w-16 h-16 object-contain mx-auto mb-3 rounded-2xl bg-white p-1 shadow-md border border-white/20"
            />
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 shadow-lg shadow-black/20 mb-3 border border-amber-300 mx-auto">
              <FaMosque className="w-9 h-9" />
            </div>
          )}
          <h2 className="text-2xl font-black tracking-tight text-amber-300 drop-shadow-sm">
            {namaSekolah}
          </h2>
          <p className="text-xs font-medium text-emerald-100 uppercase tracking-widest mt-1">
            {namaAplikasi}
          </p>
        </div>
      </div>

      {/* Main Form Body */}
      <div className="p-6 lg:p-8 flex flex-col gap-5">
        {/* Form Title */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">
            Masuk ke Sistem Terpadu
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem otomatis mengenali akses Superadmin, Admin, Pegawai, Guru, Siswa, dan Orang Tua
          </p>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Session Notice Banner */}
          {sessionNotice && (
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs font-medium animate-fade-in">
              <FiAlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{sessionNotice}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-xs font-medium animate-fade-in">
              <FiAlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {workspaceOptions.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
              <p className="font-bold">Identitas cocok dengan lebih dari satu workspace.</p>
              <p className="mt-1">Pilih workspace setelah password berhasil diverifikasi.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {workspaceOptions.map((workspace) => (
                  <button
                    key={workspace.portal_type}
                    type="button"
                    onClick={() => handleWorkspaceLogin(workspace.portal_type)}
                    disabled={loading}
                    className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-left font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-60"
                  >
                    Masuk sebagai {workspace.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Identifier Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Username, Email, NIY, NIS, NIK, atau No. HP
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiUser className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={form.identifier}
                onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                placeholder="Username / NIY / NIS / NIK / No. HP"
                className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-sm"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password / PIN
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiLock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Masukkan Password / PIN"
                className="w-full pl-10 pr-10 py-2.5 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center cursor-pointer text-slate-600 font-medium">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 accent-emerald-700"
              />
              <span className="ml-2">Ingat saya</span>
            </label>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate(2)}
              className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Lupa password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-800/20 hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Memproses Autentikasi...
              </>
            ) : (
              'Masuk ke Sistem'
            )}
          </button>
        </form>

        {/* Alternative QR Code Button */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-[11px] font-medium text-slate-400 mb-2.5 uppercase tracking-wider">
            atau gunakan autentikasi cepat
          </p>
          <button
            type="button"
            onClick={() => {
              setQrError('')
              setQrTokenInput('')
              setShowQrModal(true)
            }}
            className="w-full py-2 px-4 bg-slate-50 hover:bg-emerald-50 text-emerald-900 border border-emerald-200/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <BsQrCode className="w-4 h-4 text-emerald-600" />
            <span>Scan QR ID Card Pegawai / Kartu Siswa</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 border-t border-slate-100 pt-3">
          © {new Date().getFullYear()} {namaSekolah}. Hak Cipta Dilindungi.{' '}
          <span className="font-mono text-emerald-700 font-semibold">Ver 2.1.0</span>
        </div>
      </div>

      {/* QR Scanner Modal with Real WebRTC Camera Stream */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <BsQrCode className="w-5 h-5 text-emerald-600" />
                <span>Scan QR Code ID Card Pegawai / Kartu Siswa</span>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQrSubmit} className="space-y-4">
              {qrError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-center gap-2">
                  <FiAlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{qrError}</span>
                </div>
              )}

              {/* Real Video Camera Viewport */}
              <div className="relative aspect-square bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center border-2 border-emerald-500/40 text-white shadow-inner">
                {/* HTML5 Video Stream Element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    cameraActive ? 'opacity-100' : 'opacity-0 absolute'
                  }`}
                />

                {/* Animated Target Viewfinder Overlay */}
                {cameraActive && (
                  <div className="absolute inset-10 border-2 border-dashed border-amber-400/90 rounded-2xl pointer-events-none animate-pulse flex items-center justify-center">
                    <span className="bg-emerald-950/80 backdrop-blur text-amber-300 font-mono text-[10px] px-2.5 py-1 rounded-full border border-amber-400/30">
                      Kamera Aktif — Pindai QR Code
                    </span>
                  </div>
                )}

                {/* Connecting / Camera Error Fallback UI */}
                {!cameraActive && (
                  <div className="p-6 text-center flex flex-col items-center justify-center">
                    {cameraError ? (
                      <>
                        <FiCameraOff className="w-12 h-12 text-amber-400 mb-2" />
                        <p className="text-xs text-slate-300 font-medium mb-1">
                          {cameraError}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Anda dapat mengetikkan/menempelkan token QR secara manual pada kolom di bawah.
                        </p>
                      </>
                    ) : (
                      <>
                        <svg className="animate-spin h-8 w-8 text-emerald-400 mb-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <p className="text-xs font-semibold text-emerald-300">
                          Mengaktifkan Kamera Perangkat...
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1">
                          Mohon izinkan akses kamera jika diminta browser
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Alternative Token Input for Hardware Scanner */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Atau tempelkan token/input barcode scanner:
                </label>
                <input
                  type="text"
                  value={qrTokenInput}
                  onChange={(e) => setQrTokenInput(e.target.value)}
                  placeholder="Paste token QR di sini..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={qrLoading || !qrTokenInput.trim()}
                  className="flex-1 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  {qrLoading ? 'Memvalidasi...' : 'Verifikasi QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
