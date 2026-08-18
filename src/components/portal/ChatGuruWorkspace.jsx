import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  MessageSquare,
  Search,
  Send,
  UserCheck,
  BookOpen,
  Filter,
  CheckCheck,
  Clock,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  Paperclip,
  Smile,
  ShieldCheck,
  Tag,
  Archive,
  Inbox,
  Users,
  UserPlus,
  Briefcase,
  Building2
} from 'lucide-react'
import { familyPortalService } from '../../services/familyPortalService'

const CATEGORIES = [
  'Akademik',
  'Jadwal',
  'Materi',
  'Tugas',
  'Nilai',
  'Kehadiran',
  'Izin/Sakit',
  'Tahfizh',
  'Mutabaah',
  'Perilaku',
  'Lainnya'
]

export default function ChatGuruWorkspace({
  mode = 'parent', // 'parent' | 'teacher' | 'employee'
  childId = '',
  childrenList = [],
  onSelectChild = null,
  hideHeader = false,
  isPopup = false
}) {
  const [tab, setTab] = useState('all') // 'all' | 'homeroom' | 'subject' | 'unread' | 'directory'
  const [search, setSearch] = useState('')
  const [selectedContact, setSelectedContact] = useState(null)
  const [contacts, setContacts] = useState([])
  const [directoryContacts, setDirectoryContacts] = useState([])
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load Contacts or Teacher/Employee Conversations
  const fetchContacts = async () => {
    setLoading(true)
    setError('')
    try {
      if (mode === 'parent') {
        if (!childId) return
        const res = await familyPortalService.chatContacts(childId)
        const list = res.data || []
        setContacts(list)
        if (list.length > 0 && !selectedContact) {
          setSelectedContact(list[0])
        }
      } else if (mode === 'employee') {
        const [convRes, dirRes] = await Promise.all([
          familyPortalService.employeeConversations().catch(() => ({ data: [] })),
          familyPortalService.employeeContacts().catch(() => ({ data: [] }))
        ])
        const convList = convRes.data || []
        const dirList = dirRes.data || []
        setContacts(convList)
        setDirectoryContacts(dirList)
        if (convList.length > 0 && !selectedContact) {
          setSelectedContact(convList[0])
        } else if (dirList.length > 0 && !selectedContact) {
          setSelectedContact(dirList[0])
        }
      } else {
        const res = await familyPortalService.teacherConversations()
        const list = res.data || []
        setContacts(list)
        if (list.length > 0 && !selectedContact) {
          setSelectedContact(list[0])
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat daftar percakapan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setSelectedContact(null)
    fetchContacts()
  }, [mode, childId])

  // Load Messages for selected contact
  const fetchMessages = async () => {
    if (!selectedContact) return
    setMessagesLoading(true)
    try {
      if (mode === 'parent') {
        const targetUserId = selectedContact.user_id || selectedContact.id
        const res = await familyPortalService.chatMessages(targetUserId, childId)
        setMessages(res.data || [])
      } else if (mode === 'employee') {
        const targetUserId = selectedContact.user_id || selectedContact.id
        const res = await familyPortalService.employeeMessages(targetUserId)
        setMessages(res.data || [])
      } else {
        const parentUserId = selectedContact.parent_user_id
        const studentId = selectedContact.student_id
        const res = await familyPortalService.teacherMessages(parentUserId, studentId)
        setMessages(res.data || [])
      }
    } catch (err) {
      setError('Gagal memuat pesan percakapan.')
    } finally {
      setMessagesLoading(false)
      setTimeout(scrollToBottom, 100)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [selectedContact, childId])

  // Filter contacts by Tab & Search
  const filteredContacts = useMemo(() => {
    const activeSource = (mode === 'employee' && tab === 'directory') ? directoryContacts : contacts

    return activeSource.filter((item) => {
      const nameMatch =
        (item.name || item.parent_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.subject || item.class_name || item.position_name || item.unit_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.student_name || item.nip_niy || '').toLowerCase().includes(search.toLowerCase())

      if (!nameMatch) return false

      if (tab === 'homeroom') {
        return item.teacher_type === 'wali_kelas' || item.role === 'Wali Kelas'
      }
      if (tab === 'subject') {
        return item.teacher_type === 'guru_mapel' || item.role === 'Guru Mapel'
      }
      if (tab === 'unread') {
        return (item.unread_count || 0) > 0
      }
      return true
    })
  }, [contacts, directoryContacts, search, tab, mode])

  // Handle Send Message
  const handleSend = async (e) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedContact || sending) return

    setSending(true)
    let fullText = messageText.trim()
    if (selectedCategory) {
      fullText = `[Kategori: ${selectedCategory}]\n${fullText}`
    }

    try {
      if (mode === 'parent') {
        const targetUserId = selectedContact.user_id || selectedContact.id
        await familyPortalService.sendMessage(targetUserId, childId, fullText)
      } else if (mode === 'employee') {
        const targetUserId = selectedContact.user_id || selectedContact.id
        await familyPortalService.sendEmployeeMessage(targetUserId, fullText)
      } else {
        const parentUserId = selectedContact.parent_user_id
        const studentId = selectedContact.student_id
        await familyPortalService.sendTeacherMessage(parentUserId, studentId, fullText)
      }
      setMessageText('')
      setSelectedCategory('')
      fetchMessages()
      fetchContacts()
    } catch (err) {
      setError('Gagal mengirim pesan.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className={`flex flex-col overflow-hidden ${
        isPopup
          ? 'h-full w-full bg-white dark:bg-slate-900'
          : 'rounded-[20px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 min-h-[580px] lg:h-[680px]'
      }`}
    >
      {/* Container Header */}
      {!hideHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {mode === 'parent'
                  ? 'Chat Guru'
                  : mode === 'employee'
                  ? 'Chat Antar Pegawai & Staf'
                  : 'Komunikasi Orang Tua'}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === 'parent'
                  ? 'Komunikasi langsung dengan Wali Kelas & Guru Mapel anak'
                  : mode === 'employee'
                  ? 'Diskusi internal terpadu antar Guru, Staf, dan Pimpinan Sekolah'
                  : 'Pesan masuk dan diskusi dengan Orang Tua / Wali Murid'}
              </p>
            </div>
          </div>

          {/* Multi-Child Selector for Parent Mode */}
          {mode === 'parent' && childrenList.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">Anak:</span>
              <select
                value={childId}
                onChange={(e) => onSelectChild && onSelectChild(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {childrenList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.kelas?.nama_kelas || 'Kelas'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Main Workspace Layout */}
      <div
        className={`grid flex-1 overflow-hidden ${
          isPopup ? 'grid-cols-1 h-full' : 'grid-cols-1 lg:grid-cols-[320px_1fr]'
        }`}
      >
        {/* Left Sidebar: Navigation & Contact List */}
        <aside
          className={`flex flex-col border-r border-slate-100 dark:border-slate-800 ${
            mobileDetailOpen ? 'hidden' : 'flex'
          } ${!isPopup ? 'lg:flex' : ''}`}
        >
          {/* Tabs Nav */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100/80 p-1 dark:bg-slate-800/80">
              <button
                onClick={() => setTab('all')}
                className={`flex flex-1 items-center justify-center rounded-lg py-1.5 text-[11px] font-bold transition ${
                  tab === 'all'
                    ? 'bg-white text-emerald-700 shadow dark:bg-slate-900 dark:text-emerald-400'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {mode === 'employee' ? 'Percakapan' : 'Semua'}
              </button>

              {mode === 'employee' ? (
                <button
                  onClick={() => setTab('directory')}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-bold transition ${
                    tab === 'directory'
                      ? 'bg-white text-emerald-700 shadow dark:bg-slate-900 dark:text-emerald-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Users className="h-3 w-3" /> Pegawai
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setTab('homeroom')}
                    className={`flex flex-1 items-center justify-center rounded-lg py-1.5 text-[11px] font-bold transition ${
                      tab === 'homeroom'
                        ? 'bg-white text-emerald-700 shadow dark:bg-slate-900 dark:text-emerald-400'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Wali Kelas
                  </button>
                  <button
                    onClick={() => setTab('subject')}
                    className={`flex flex-1 items-center justify-center rounded-lg py-1.5 text-[11px] font-bold transition ${
                      tab === 'subject'
                        ? 'bg-white text-emerald-700 shadow dark:bg-slate-900 dark:text-emerald-400'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Guru Mapel
                  </button>
                </>
              )}

              <button
                onClick={() => setTab('unread')}
                className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition ${
                  tab === 'unread'
                    ? 'bg-white text-emerald-700 shadow dark:bg-slate-900 dark:text-emerald-400'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Belum Dibaca
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  mode === 'employee'
                    ? 'Cari nama, NIP, unit, atau jabatan...'
                    : 'Cari guru, orang tua, atau mata pelajaran...'
                }
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
              />
            </div>
          </div>

          {/* Contact Cards List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <AlertCircle className="mx-auto mb-2 h-6 w-6 text-rose-500" />
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>
                <button
                  onClick={fetchContacts}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Coba Lagi
                </button>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <Inbox className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
                <p className="font-bold">Belum ada percakapan</p>
                <p className="mt-1 text-[11px]">
                  {mode === 'parent'
                    ? 'Kontak guru untuk kelas anak akan tampil di sini.'
                    : mode === 'employee'
                    ? 'Klik tab "Pegawai" untuk memilih rekan kerja & memulai pesan.'
                    : 'Pesan dari orang tua siswa akan muncul di sini.'}
                </p>
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const contactId = contact.user_id || contact.id || contact.parent_user_id
                const isSelected =
                  selectedContact &&
                  (selectedContact.user_id === contactId ||
                    selectedContact.id === contactId ||
                    selectedContact.parent_user_id === contact.parent_user_id)

                const isHomeroom =
                  contact.teacher_type === 'wali_kelas' || contact.role === 'Wali Kelas'

                const avatarName = contact.name || contact.parent_name || 'U'

                return (
                  <button
                    key={contactId + '_' + (contact.student_id || '')}
                    onClick={() => {
                      setSelectedContact(contact)
                      setMobileDetailOpen(true)
                    }}
                    className={`group relative flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-xs font-black text-white shadow-sm">
                        {avatarName[0]}
                      </div>
                      {contact.unread_count > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white shadow">
                          {contact.unread_count}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="truncate text-xs font-bold text-slate-900 dark:text-white">
                          {contact.name || contact.parent_name}
                        </h4>
                        {contact.last_message_at && (
                          <span className="shrink-0 text-[10px] text-slate-400">
                            {new Date(contact.last_message_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>

                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span
                          className={`inline-block rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase ${
                            mode === 'employee'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : isHomeroom
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                          }`}
                        >
                          {contact.position_name || contact.role || (isHomeroom ? 'Wali Kelas' : 'Guru Mapel')}
                        </span>
                        <span className="truncate text-[11px] font-medium text-slate-500">
                          {contact.unit_name || contact.subject || contact.class_name || '-'}
                        </span>
                      </div>

                      {mode === 'teacher' && contact.student_name && (
                        <p className="mt-0.5 truncate text-[10px] text-slate-400">
                          Siswa: <strong className="text-slate-600 dark:text-slate-300">{contact.student_name}</strong>
                        </p>
                      )}

                      {contact.last_message && (
                        <p className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {contact.last_message}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* Right Area: Message Chat Detail */}
        <main
          className={`flex flex-col bg-slate-50/40 dark:bg-slate-900/40 ${
            mobileDetailOpen ? 'flex' : 'hidden'
          } ${!isPopup ? 'lg:flex' : ''}`}
        >
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileDetailOpen(false)}
                    className={`rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      isPopup ? 'flex' : 'lg:hidden'
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white">
                    {(selectedContact.name || selectedContact.parent_name || 'U')[0]}
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white">
                      {selectedContact.name || selectedContact.parent_name}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {selectedContact.position_name || selectedContact.subject || selectedContact.role || 'Pegawai'}{' '}
                      {selectedContact.unit_name && `• Unit: ${selectedContact.unit_name}`}{' '}
                      {selectedContact.student_name && `• Siswa: ${selectedContact.student_name}`}{' '}
                      {selectedContact.class_name && `• ${selectedContact.class_name}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <ShieldCheck className="h-3 w-3" />{' '}
                    {mode === 'employee' ? 'Chat Internal Pegawai' : 'Percakapan Resmi'}
                  </span>
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messagesLoading ? (
                  <div className="flex min-h-[200px] items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="my-12 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Mulai percakapan santun & produktif
                    </h4>
                    <p className="mx-auto mt-1 max-w-sm text-[11px] text-slate-400">
                      {mode === 'employee'
                        ? 'Tulis pesan internal untuk koordinasi pekerjaan, informasi unit, atau diskusi tim.'
                        : 'Tulis pesan di bawah untuk berkonsultasi mengenai perkembangan akademik, tahfizh, atau mutabaah anak.'}
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn =
                      msg.sender_user_id !==
                      (selectedContact.user_id || selectedContact.parent_user_id || selectedContact.id)

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 text-xs shadow-sm ${
                            isOwn
                              ? 'bg-gradient-to-r from-emerald-700 to-teal-700 text-white rounded-br-none'
                              : 'bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-700'
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                          <div className="mt-1 flex items-center justify-end gap-1 text-[9px] opacity-70">
                            <span>
                              {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {isOwn && (
                              <CheckCheck
                                className={`h-3 w-3 ${
                                  msg.read_at ? 'text-cyan-200' : 'text-white/60'
                                }`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <div className="border-t border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 space-y-2">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">Kategori:</span>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setSelectedCategory((prev) => (prev === cat ? '' : cat))
                      }
                      className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold transition ${
                        selectedCategory === cat
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Input Form */}
                <form onSubmit={handleSend} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Ketik pesan Anda..."
                    className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim() || sending}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-700 disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Pilih Percakapan
              </h3>
              <p className="mt-1 max-w-xs text-xs text-slate-400">
                {mode === 'employee'
                  ? 'Pilih pegawai atau staf di sebelah kiri untuk membuka pesan.'
                  : 'Pilih guru atau orang tua di sebelah kiri untuk membuka pesan.'}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
