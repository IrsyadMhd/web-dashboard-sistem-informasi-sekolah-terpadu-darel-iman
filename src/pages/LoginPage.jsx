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
    <div className="min-h-screen bg-[#003822] text-white flex flex-col justify-center items-center p-3 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      {/* Background Image: Gedung Yayasan Dar El-Iman */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
        style={{ backgroundImage: "url('/assets/images/darel_iman_building.jpg')" }}
      />

      {/* Overlay Warna Dasar Dar El-Iman dengan Opacity */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#004B3A]/88 via-[#0E5C44]/82 to-[#022C22]/90 backdrop-blur-[1px]" />

      {/* Subtle Background Ambient Glows */}
      <div className="absolute -left-20 -top-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />

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
