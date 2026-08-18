import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { FaMosque } from 'react-icons/fa6'
import { usePengaturanStore } from '../stores/pengaturanStore'
import LoginCard from '../components/auth/LoginCard'
import { resolveDefaultPortal } from '../auth/portalResolver'

export default function LoginPage() {
  const navigate = useNavigate()
  const pengaturan = usePengaturanStore((state) => state.pengaturan)
  const muatPengaturan = usePengaturanStore((state) => state.muatPengaturan)

  useEffect(() => {
    muatPengaturan()
  }, [muatPengaturan])

  const logoUrl = pengaturan?.logo_url || pengaturan?.logoUrl || ''
  const faviconUrl = pengaturan?.favicon_url || pengaturan?.faviconUrl || ''
  const namaSekolah = pengaturan?.school_name || pengaturan?.namaSekolah || 'YAYASAN DAR EL - IMAN'
  const namaAplikasi = pengaturan?.application_name || 'Sistem Manajemen Sekolah Terpadu'

  // Dynamic Favicon Update
  useEffect(() => {
    if (faviconUrl) {
      let link = document.querySelector("link[rel*='icon']")
      if (!link) {
        link = document.createElement('link')
        link.rel = 'shortcut icon'
        document.getElementsByTagName('head')[0].appendChild(link)
      }
      link.href = faviconUrl
    }
  }, [faviconUrl])

  const handleLoginSuccess = (result) => {
    Swal.fire({
      title: 'Login Berhasil!',
      text: `Selamat datang di ${namaSekolah}.`,
      icon: 'success',
      confirmButtonColor: '#065f46',
      timer: 1800,
      showConfirmButton: false,
    }).then(() => {
      navigate(resolveDefaultPortal(result), { replace: true })
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/30 to-slate-100 flex flex-col font-sans relative">
      {/* Background pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 15% 10%, rgba(16,185,129,0.10) 0%, transparent 40%), radial-gradient(circle at 85% 90%, rgba(208,139,47,0.10) 0%, transparent 40%)`,
        }}
      />

      {/* Top Info Bar */}
      <div className="relative z-10 border-b border-emerald-200/60 bg-white/80 backdrop-blur-sm shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo Sekolah"
              className="w-7 h-7 rounded object-contain p-0.5 bg-white border border-emerald-100 shadow-xs"
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center shadow-xs">
              <FaMosque className="w-4 h-4" />
            </div>
          )}
          <span className="text-xs font-bold text-emerald-900 tracking-tight">
            {namaSekolah}
          </span>
          <span className="hidden sm:block text-xs text-slate-400">•</span>
          <span className="hidden sm:block text-xs text-slate-500 font-medium">
            {namaAplikasi}
          </span>
        </div>
      </div>

      {/* Main Login Area */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <LoginCard onLoginSuccess={handleLoginSuccess} />
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-4 text-[11px] text-slate-400 border-t border-slate-200/60 bg-white/60">
        © {new Date().getFullYear()} {namaSekolah} — {namaAplikasi}. All rights reserved.{' '}
        <span className="font-mono text-emerald-700 font-medium ml-1">Ver 2.1.0</span>
      </div>
    </div>
  )
}
