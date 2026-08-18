import React, { useState } from 'react'
import { MessageSquare, Users, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import ChatGuruWorkspace from '../components/portal/ChatGuruWorkspace'

export default function EmployeeChatPage() {
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []

  const isTeacher = roles.some((r) => ['Guru', 'Wali Kelas', 'Guru Pengajar'].includes(r))
  const [activeTabMode, setActiveTabMode] = useState('employee') // 'employee' | 'teacher'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-600 p-6 text-white shadow-xl shadow-emerald-950/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-emerald-100 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Modul Komunikasi Terpadu
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Pusat Pesan & Diskusi Sekolah
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
            Layanan perpesanan internal antar pegawai, guru, staf, serta konsultasi wali kelas dan orang tua murid.
          </p>
        </div>

        {/* Tab Switcher for Teachers who also deal with Parent Messages */}
        {isTeacher && (
          <div className="flex items-center gap-1.5 rounded-2xl bg-black/20 p-1.5 backdrop-blur self-start sm:self-auto">
            <button
              onClick={() => setActiveTabMode('employee')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTabMode === 'employee'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Users className="h-4 w-4" /> Chat Pegawai
            </button>

            <button
              onClick={() => setActiveTabMode('teacher')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTabMode === 'teacher'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <HeartHandshake className="h-4 w-4" /> Pesan Orang Tua
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Workspace */}
      <ChatGuruWorkspace mode={activeTabMode} hideHeader={false} />
    </div>
  )
}
