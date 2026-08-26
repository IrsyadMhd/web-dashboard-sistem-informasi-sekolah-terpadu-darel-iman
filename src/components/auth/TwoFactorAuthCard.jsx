import { useState, useRef } from 'react'
import { FiSmartphone, FiInfo, FiExternalLink, FiLock, FiCheck } from 'react-icons/fi'
import { BsShieldCheck } from 'react-icons/bs'
import { Button } from '@/components/tailgrids/core/button'
import { Alert, AlertContent, AlertDescription, AlertIndicator } from '@/components/tailgrids/core/alert'
import { Card } from '@/components/tailgrids/core/card'

export default function TwoFactorAuthCard() {
  const [activeTab, setActiveTab] = useState('Ringkasan')
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6'])
  const [verified, setVerified] = useState(false)
  const inputRefs = useRef([])

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = () => {
    setVerified(true)
    setTimeout(() => setVerified(false), 2500)
  }

  const tabs = ['Ringkasan', 'Setup Authenticator', 'Recovery Code', 'Trusted Device', 'Pengaturan']

  return (
    <Card className="w-full rounded-[18px] border border-slate-200/80 bg-white p-6 lg:p-8 shadow-xs dark:border-slate-800 dark:bg-[#1B2433] space-y-6">
      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 gap-1 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-emerald-50 text-emerald-800 border-b-2 border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-500'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3 Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Card 1: Status 2FA */}
        <div className="lg:col-span-3 bg-slate-50/80 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-between text-center">
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Status 2FA
            </span>
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-inner border border-emerald-200 dark:border-emerald-800">
              <BsShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-emerald-800 dark:text-emerald-400">2FA Aktif</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[180px] mx-auto">
                Akun Anda dilindungi dengan Two Factor Authentication.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="danger"
            appearance="outline"
            size="sm"
            className="w-full mt-6"
          >
            Nonaktifkan 2FA
          </Button>
        </div>

        {/* Card 2: Metode 2FA & Verifikasi */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Metode 2FA
              </span>
              <div className="flex items-center gap-2 mt-1">
                <FiSmartphone className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Authenticator App (Google Authenticator)
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Dibuat Pada: 15 Mei 2024 09:15
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Verifikasi 2FA</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Masukkan kode 6 digit dari aplikasi authenticator Anda.
              </p>
            </div>

            {verified && (
              <Alert status="success" className="rounded-xl">
                <AlertIndicator>
                  <FiCheck className="w-4 h-4" />
                </AlertIndicator>
                <AlertContent>
                  <AlertDescription>Kode 2FA berhasil diverifikasi!</AlertDescription>
                </AlertContent>
              </Alert>
            )}

            {/* OTP Input Boxes */}
            <div className="flex justify-between gap-2 my-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-12 text-center text-lg font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs"
                />
              ))}
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleVerify}
            className="w-full"
          >
            Verifikasi
          </Button>
        </div>

        {/* Card 3: Informasi */}
        <div className="lg:col-span-4 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 rounded-2xl border border-emerald-100/80 dark:border-emerald-900/40 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <FiInfo className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Informasi</span>
            </h4>

            <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <FiLock className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>2FA menambahkan lapisan keamanan ekstra untuk akun Anda.</span>
              </li>

              <li className="flex items-start gap-2.5">
                <BsShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Anda akan diminta kode verifikasi saat login dari perangkat baru.
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <FiInfo className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Simpan recovery code di tempat aman.</span>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-emerald-200/60 dark:border-emerald-900/40">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 transition-colors"
            >
              <span>Pelajari Lebih Lanjut</span>
              <FiExternalLink className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}

