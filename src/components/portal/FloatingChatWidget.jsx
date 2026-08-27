import React, { useState, useEffect, useCallback } from 'react'
import {
  MessageCircle,
  MessageSquare,
  X,
  Minus,
  Maximize2,
  ChevronDown,
  Sparkles,
  Users,
  HeartHandshake
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { familyPortalService } from '../../services/familyPortalService'
import ChatGuruWorkspace from './ChatGuruWorkspace'
import { hasAnyRole, isParentRole, isStudentRole } from '../../auth/portalResolver'

export default function FloatingChatWidget() {
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []
  const permissions = user?.permissions || []

  const isStudent = isStudentRole(roles)
  const isParent = isParentRole(roles)
  const isTeacher = roles.some((r) => ['Guru', 'Wali Kelas', 'Guru Pengajar'].includes(r))
  const canEmployeeChat = hasAnyRole(roles, ['Super Admin']) || permissions.includes('chat.conversation.view')
  const isEmployee = roles.some((r) =>
    ['Super Admin', 'Admin', 'Guru', 'Wali Kelas', 'Guru Pengajar', 'Pegawai', 'Staf', 'Yayasan', 'Kepala Sekolah', 'Bendahara', 'HRD'].includes(r)
  ) && !isStudent && canEmployeeChat

  const shouldRender = !isStudent && (isParent || isTeacher || isEmployee)

  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [children, setChildren] = useState([])
  const [childId, setChildId] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  // Widget Mode: 'employee' | 'parent' | 'teacher'
  const defaultMode = isParent ? 'parent' : isEmployee ? 'employee' : 'teacher'
  const [widgetMode, setWidgetMode] = useState(defaultMode)

  // Fetch children list for Parent Mode
  const loadChildren = useCallback(async () => {
    if (!isParent) return
    try {
      const res = await familyPortalService.children().catch(() => ({ data: [] }))
      const list = res?.data || []
      const validList = Array.isArray(list) ? list : []
      setChildren(validList)
      if (validList.length > 0 && !childId) {
        setChildId(validList[0].id)
      }
    } catch {
      setChildren([])
    }
  }, [isParent, childId])

  // Periodically check total unread messages across parent, teacher, and employee chats
  const checkUnread = useCallback(async () => {
    if (!shouldRender) return
    let total = 0
    try {
      if (isParent && childId) {
        const res = await familyPortalService.chatContacts(childId).catch(() => ({ data: [] }))
        const contacts = res.data || []
        total += contacts.reduce((sum, c) => sum + (c.unread_count || 0), 0)
      }
      if (isTeacher) {
        const res = await familyPortalService.teacherConversations().catch(() => ({ data: [] }))
        const conversations = res.data || []
        total += conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)
      }
      if (isEmployee) {
        const res = await familyPortalService.employeeConversations().catch(() => ({ data: [] }))
        const empConvs = res.data || []
        total += empConvs.reduce((sum, c) => sum + (c.unread_count || 0), 0)
      }
      setUnreadCount(total)
    } catch {
      // Ignore background check error
    }
  }, [isParent, isTeacher, isEmployee, shouldRender, childId])

  useEffect(() => {
    if (isParent) {
      loadChildren()
    }
  }, [isParent, loadChildren])

  useEffect(() => {
    checkUnread()
    const timer = setInterval(checkUnread, 15000)
    return () => clearInterval(timer)
  }, [checkUnread])

  if (!shouldRender) return null

  const toggleOpen = () => {
    setIsOpen((prev) => !prev)
    setIsMinimized(false)
  }

  const activeChild = children.find((c) => c.id === childId)

  return (
    <>
      {/* Pop-Up Window */}
      {isOpen && (
        <div
          className={`fixed bottom-20 right-3 sm:right-6 z-50 w-[94vw] sm:w-[460px] md:w-[480px] ${
            isMinimized ? 'h-14' : 'h-[580px] max-h-[calc(100vh-6.5rem)]'
          } rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col transition-all duration-300 transform origin-bottom-right animate-in fade-in slide-in-from-bottom-4`}
        >
          {/* Header Pop-Up */}
          <div className="flex flex-col bg-gradient-to-r from-[#0E5C44] via-[#187154] to-[#3FBF75] text-white shadow-md select-none shrink-0">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <MessageSquare className="h-4 w-4 text-emerald-100" />
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#0E5C44] animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-xs font-black tracking-wide text-white">
                    {widgetMode === 'employee'
                      ? 'Chat Antar Pegawai'
                      : isTeacher
                      ? 'Komunikasi Orang Tua'
                      : 'Chat Guru & Wali Kelas'}
                  </h3>
                  <p className="truncate text-[10px] text-emerald-100/80 font-medium">
                    {isParent
                      ? activeChild
                        ? `Anak: ${activeChild.full_name}`
                        : 'Portal Orang Tua'
                      : 'Ruang Diskusi Sekolah'}
                  </p>
                </div>
              </div>

              {/* Actions: Child Switcher & Control Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {isParent && children.length > 1 && widgetMode === 'parent' && (
                  <div className="relative">
                    <select
                      value={childId}
                      onChange={(e) => setChildId(e.target.value)}
                      className="h-7 appearance-none rounded-lg border border-white/20 bg-white/10 pl-2 pr-6 text-[10px] font-bold text-white outline-none backdrop-blur hover:bg-white/20 [&>option]:text-slate-900"
                    >
                      {children.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.full_name.split(' ')[0]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-1.5 top-2 h-3 w-3 text-white/80" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsMinimized((prev) => !prev)}
                  className="rounded-lg p-1 text-white/80 hover:bg-white/20 hover:text-white transition"
                  title={isMinimized ? 'Perbesar' : 'Kecilkan'}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1 text-white/80 hover:bg-white/20 hover:text-white transition"
                  title="Tutup Chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mode Switcher Tabs inside Header for dual roles / employees */}
            {!isMinimized && (isEmployee || isTeacher) && isParent && (
              <div className="flex border-t border-white/10 bg-black/10 px-2 py-1 text-[11px] font-bold">
                <button
                  onClick={() => setWidgetMode('employee')}
                  className={`flex-1 py-1 text-center rounded-md transition ${
                    widgetMode === 'employee'
                      ? 'bg-white/20 text-white shadow-xs font-black'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Chat Pegawai
                </button>
                <button
                  onClick={() => setWidgetMode(isTeacher ? 'teacher' : 'parent')}
                  className={`flex-1 py-1 text-center rounded-md transition ${
                    widgetMode !== 'employee'
                      ? 'bg-white/20 text-white shadow-xs font-black'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {isTeacher ? 'Chat Orang Tua' : 'Chat Guru'}
                </button>
              </div>
            )}
          </div>

          {/* Body Content Chat Workspace */}
          {!isMinimized && (
            <div className="flex-1 min-h-0 overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
              <ChatGuruWorkspace
                mode={widgetMode}
                childId={childId}
                childrenList={children}
                onSelectChild={setChildId}
                hideHeader={true}
                isPopup={true}
              />
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button (FAB) Bottom Right */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-50">
        <button
          type="button"
          onClick={toggleOpen}
          className={`group relative flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#0E5C44] via-[#187154] to-[#3FBF75] text-white shadow-xl shadow-emerald-950/25 hover:shadow-2xl hover:shadow-emerald-700/40 hover:scale-105 active:scale-95 transition-all duration-300 ${
            isOpen ? 'p-3.5' : 'px-4 py-3 sm:px-5 sm:py-3.5'
          }`}
          title={isOpen ? 'Tutup Chat' : 'Buka Chat Modul Perpesanan'}
        >
          {/* Animated Glow Halo */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 opacity-30 blur group-hover:opacity-60 transition duration-300" />

          <div className="relative flex items-center gap-2.5">
            {isOpen ? (
              <X className="h-6 w-6 transition-transform duration-300 rotate-90 group-hover:rotate-0" />
            ) : (
              <div className="relative">
                <MessageCircle className="h-6 w-6 animate-pulse" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-900 animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </div>
            )}

            {!isOpen && (
              <span className="hidden sm:inline text-xs font-black tracking-wide text-white">
                {isEmployee ? 'Chat Pegawai & Guru' : isTeacher ? 'Chat Orang Tua' : 'Chat Guru'}
              </span>
            )}
          </div>
        </button>
      </div>
    </>
  )
}
