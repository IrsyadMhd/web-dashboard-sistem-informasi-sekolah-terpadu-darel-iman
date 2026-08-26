import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Users, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import ChatGuruWorkspace from '../components/portal/ChatGuruWorkspace'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'

export default function EmployeeChatPage() {
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []

  const isTeacher = roles.some((r) => ['Guru', 'Wali Kelas', 'Guru Pengajar'].includes(r))
  const [activeTabMode, setActiveTabMode] = useState('employee') // 'employee' | 'teacher'

  return (
    <PageContainer className="space-y-6 pb-12">
      <AppBreadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Chat & Komunikasi Pegawai' },
        ]}
      />

      {/* MODERN HERO CARD HEADER */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <MessageSquare className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                    <Sparkles className="size-3 text-amber-300 animate-pulse" />
                    Modul Komunikasi Terpadu
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Pusat Pesan &amp; Diskusi Sekolah
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                  Layanan perpesanan internal antar pegawai, guru, staf, serta konsultasi wali kelas dan orang tua murid.
                </p>
              </div>
            </div>

            {/* Tab Switcher for Teachers who also deal with Parent Messages */}
            {isTeacher && (
              <div className="flex items-center gap-1.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 p-1.5 border border-emerald-500/20 shadow-sm backdrop-blur-md self-start sm:self-auto shrink-0">
                <button
                  onClick={() => setActiveTabMode('employee')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    activeTabMode === 'employee'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Users className="h-4 w-4" /> Chat Pegawai
                </button>

                <button
                  onClick={() => setActiveTabMode('teacher')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    activeTabMode === 'teacher'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <HeartHandshake className="h-4 w-4" /> Pesan Orang Tua
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Chat Workspace */}
      <ChatGuruWorkspace mode={activeTabMode} hideHeader={false} />
    </PageContainer>
  )
}
