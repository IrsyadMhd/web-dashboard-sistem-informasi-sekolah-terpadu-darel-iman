import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePengaturanStore } from '../stores/pengaturanStore'
import LoginCard from '../components/auth/LoginCard'
import { resolveDefaultPortal } from '../auth/portalResolver'
import AuthToast from '../components/ui/AuthToast'
import AuthPopup from '../components/ui/AuthPopup'
import PwaInstallBanner from '../components/app/PwaInstallBanner'

export default function LoginPage() {
  const navigate = useNavigate()
  const muatPengaturan = usePengaturanStore((state) => state.muatPengaturan)

  useEffect(() => {
    muatPengaturan()
  }, [muatPengaturan])

  const handleLoginSuccess = (result) => {
    navigate(resolveDefaultPortal(result), { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white flex flex-col justify-center items-center p-3 sm:p-6 lg:p-8 font-sans relative overflow-x-hidden">
      {/* Subtle Background Ambient Glows */}
      <div className="absolute -left-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Single Column Container */}
      <div className="w-full max-w-md my-auto relative z-10 py-2 sm:py-6 animate-fade-in">
        <LoginCard onLoginSuccess={handleLoginSuccess} />
      </div>

      {/* PWA Install Banner */}
      <PwaInstallBanner />

      {/* Global Auth Popup & Toast */}
      <AuthPopup />
      <AuthToast />
    </div>
  )
}
