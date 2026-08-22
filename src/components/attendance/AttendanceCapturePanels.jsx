import { useEffect, useRef, useState } from 'react'
import { Camera, CameraOff, CheckCircle2, ListChecks, QrCode, RefreshCw, X, XCircle } from 'lucide-react'
import Swal from 'sweetalert2'
import { lmsPresensiService } from '../../services/lmsPresensiService'

const methods = [
  ['manual', 'Pemanggilan Nama Siswa (Roll Call)', ListChecks],
  ['qr', 'QR Code Kartu Siswa', QrCode],
]

export function AttendanceMethodSelector({ value, onChange }) {
  return (
    <div className="grid gap-3.5 sm:grid-cols-2">
      {methods.map(([id, label, Icon]) => {
        const isActive = value === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex items-center justify-start gap-3.5 rounded-2xl border p-4 text-left text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer ${
              isActive
                ? 'border-emerald-600 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50/30 text-emerald-950 dark:border-emerald-500 dark:from-emerald-950/80 dark:via-emerald-900/40 dark:to-emerald-950/30 dark:text-emerald-200 ring-2 ring-emerald-500/40 shadow-md scale-[1.01]'
                : 'border-slate-200/90 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/30 hover:text-emerald-900 dark:border-slate-800 dark:bg-[#1B2433] dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200 shadow-2xs hover:shadow-xs'
            }`}
          >
            <div className={`flex size-10 items-center justify-center rounded-xl transition-colors shrink-0 ${
              isActive
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              <Icon size={20} />
            </div>
            <span className="truncate">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function AttendanceCapturePanel({ method, session, onRecorded, captureActive = false, disabled = false }) {
  const [identifier, setIdentifier] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)

  // Camera Pop-up State
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [modalInput, setModalInput] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const detectorRef = useRef(null)
  const scanTimerRef = useRef(null)
  const busyRef = useRef(false)

  const stopCamera = () => {
    if (scanTimerRef.current) {
      window.clearInterval(scanTimerRef.current)
      scanTimerRef.current = null
    }
    detectorRef.current = null
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  if (method === 'manual') {
    return (
      <div className="flex items-start gap-3.5 rounded-2xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50/20 p-4.5 shadow-2xs dark:border-emerald-800/60 dark:from-emerald-950/50 dark:via-emerald-900/30 dark:to-emerald-950/20">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs mt-0.5">
          <ListChecks size={20} />
        </div>
        <div>
          <h4 className="text-xs font-extrabold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
            Checklist Presensi Manual (Roll Call)
          </h4>
          <p className="mt-1 text-xs font-semibold text-emerald-900/90 dark:text-emerald-300/90 leading-relaxed">
            Gunakan tombol opsi status di bawah untuk checklist kehadiran siswa satu per satu (
            <span className="font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded-md">Hadir</span>,{' '}
            <span className="font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-900/60 px-1.5 py-0.5 rounded-md">Terlambat</span>,{' '}
            <span className="font-extrabold text-sky-700 dark:text-sky-300 bg-sky-100/90 dark:bg-sky-900/60 px-1.5 py-0.5 rounded-md">Izin</span>,{' '}
            <span className="font-extrabold text-violet-700 dark:text-violet-300 bg-violet-100/90 dark:bg-violet-900/60 px-1.5 py-0.5 rounded-md">Sakit</span>,{' '}
            <span className="font-extrabold text-rose-700 dark:text-rose-300 bg-rose-100/90 dark:bg-rose-900/60 px-1.5 py-0.5 rounded-md">Alpha</span>).
          </p>
        </div>
      </div>
    )
  }

  const startCamera = async () => {
    setCameraLoading(true)
    setCameraError('')
    stopCamera()

    try {
      let mediaStream = null
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        })
      } catch (e) {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      }

      streamRef.current = mediaStream

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }
      setCameraActive(true)

      if (!('BarcodeDetector' in window)) {
        setCameraError('Pemindaian otomatis belum tersedia di browser ini. Gunakan scanner USB atau input opaque token di bawah.')
        return
      }

      try {
        detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] })
        scanTimerRef.current = window.setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2 || busyRef.current || !detectorRef.current) return
          try {
            const codes = await detectorRef.current.detect(videoRef.current)
            const value = codes[0]?.rawValue
            if (value) {
              stopCamera()
              await processScanCode(value)
            }
          } catch {
            // Frame tanpa QR valid diabaikan sampai pemindaian berikutnya.
          }
        }, 500)
      } catch {
        setCameraError('Browser tidak dapat membuat pemindai QR otomatis. Gunakan scanner USB atau input manual.')
      }
    } catch (err) {
      console.error('Camera Access Error:', err)
      setCameraError('Kamera tidak dapat diakses. Pastikan izin kamera telah diberikan di browser.')
      setCameraActive(false)
    } finally {
      setCameraLoading(false)
    }
  }

  const openCameraModal = () => {
    setShowCameraModal(true)
    setTimeout(() => {
      startCamera()
    }, 200)
  }

  const closeCameraModal = () => {
    stopCamera()
    setShowCameraModal(false)
  }

  const processScanCode = async (codeToScan) => {
    const rawCode = String(codeToScan || '').trim()
    if (!rawCode || disabled || !captureActive || busyRef.current) return

    if (!session?.id) {
      setResult({ scan_status: 'rejected', message: 'Mulai sesi presensi mengajar terlebih dahulu.' })
      return
    }

    busyRef.current = true
    setBusy(true)
    try {
      const response = await lmsPresensiService.scanAttendance(session.id, 'qr', { identifier: codeToScan })
      const payload = response?.data || {}
      setResult(payload)
      if (payload.scan_status === 'success') {
        onRecorded?.(payload)
        Swal.fire({
          icon: 'success',
          title: 'Presensi Berhasil',
          text: payload.message,
          timer: 2000,
          showConfirmButton: false,
        })
      } else if (payload.scan_status === 'duplicate_scan') {
        Swal.fire({ icon: 'info', title: 'Sudah Tercatat', text: payload.message })
      } else {
        Swal.fire({ icon: 'error', title: 'Pemindaian Ditolak', text: payload.message })
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Siswa tidak ditemukan dalam roster kelas ini.'
      setResult({ scan_status: 'rejected', message: msg })
      Swal.fire({ icon: 'error', title: 'Pemindaian Ditolak', text: msg })
    } finally {
      setIdentifier('')
      setModalInput('')
      setBusy(false)
      busyRef.current = false
    }
  }

  const handleScanSubmit = (e) => {
    e?.preventDefault()
    if (!identifier.trim() || disabled || !captureActive) return
    processScanCode(identifier)
  }

  const handleModalSubmit = (e) => {
    e?.preventDefault()
    if (!modalInput.trim() || disabled || !captureActive) return
    processScanCode(modalInput)
  }

  return (
    <div className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#1B2433]">
      {!captureActive && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">Capture QR belum aktif. Simpan roster lalu klik <b>Mulai Capture</b>; server akan memeriksa status sesi sebelum menerima scan.</div>}
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-emerald-50/60 p-4 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900">
        <div>
          <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
            <Camera className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Pemindai Kamera Live QR Code
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Gunakan kamera laptop/HP atau scanner USB kartu siswa.
          </p>
        </div>
        <button
          type="button"
          onClick={openCameraModal}
          disabled={disabled || !captureActive || cameraLoading}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#0E5C44] px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-800 whitespace-nowrap"
        >
          <Camera className="h-4 w-4" /> Buka Kamera Pemindai Live
        </button>
      </div>

      {/* Manual Input Scanner USB Form */}
      <form onSubmit={handleScanSubmit} className="space-y-2">
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
          Input / Hardware Scanner USB Kartu
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            autoFocus
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={disabled || !captureActive || busy}
            placeholder="Scan opaque QR kartu siswa via scanner USB..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={disabled || !captureActive || busy}
            className="rounded-xl bg-[#0E5C44] px-5 py-3 text-xs font-bold text-white shadow transition hover:bg-emerald-800 disabled:opacity-50 whitespace-nowrap"
          >
            Proses QR
          </button>
        </div>
      </form>

      {/* Result feedback */}
      {result && (
        <div
          className={`flex items-center gap-3 rounded-xl p-3.5 text-xs font-semibold ${
            result.scan_status === 'success'
              ? 'bg-emerald-100/70 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
              : 'bg-rose-100/70 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200'
          }`}
        >
          {result.scan_status === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <div>
            <b className="text-sm">{result.student?.full_name || result.student?.nama_lengkap || 'Pemberitahuan'}</b>
            <p className="mt-0.5">{result.message}</p>
          </div>
        </div>
      )}

      {/* Live Camera Pop-up Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Pemindai Live QR Code Kartu Siswa</h3>
                  <p className="text-xs text-slate-500">Presensi Mata Pelajaran</p>
                </div>
              </div>
              <button
                onClick={closeCameraModal}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-inner dark:border-slate-800">
                <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />

                {cameraLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 text-white gap-2">
                    <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
                    <p className="text-xs font-semibold">Menghubungkan ke kamera...</p>
                  </div>
                )}

                {cameraActive && (
                  <div className="absolute inset-0 border-2 border-dashed border-emerald-400/80 pointer-events-none rounded-2xl m-6 flex flex-col items-center justify-between p-4">
                    <span className="bg-black/60 backdrop-blur-sm px-3 py-1 text-[11px] font-bold text-emerald-300 rounded-full">
                      🔴 LIVE — Dekatkan QR Code Kartu Siswa
                    </span>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                  {cameraError}
                </div>
              )}

              <form onSubmit={handleModalSubmit} className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase">Input Kode / NISN Kartu</label>
                <div className="flex gap-2">
                 <input
                    type="text"
                    autoFocus
                   value={modalInput}
                   onChange={(e) => setModalInput(e.target.value)}
                   disabled={disabled || !captureActive || busy}
                    placeholder="Hasil scan QR / Ketik NISN..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                   type="submit"
                    disabled={disabled || !captureActive || busy}
                    className="rounded-xl bg-[#0E5C44] px-5 py-3 text-xs font-bold text-white shadow hover:bg-emerald-800 whitespace-nowrap"
                  >
                    Proses Scan
                  </button>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <button
                type="button"
                onClick={cameraActive ? stopCamera : startCamera}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {cameraActive ? (
                  <>
                    <CameraOff className="h-3.5 w-3.5 text-rose-500" /> Matikan Kamera
                  </>
                ) : (
                  <>
                    <Camera className="h-3.5 w-3.5 text-emerald-500" /> Nyalakan Ulang Kamera
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={closeCameraModal}
                className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
              >
                Tutup Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
