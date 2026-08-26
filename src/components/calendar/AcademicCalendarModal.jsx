import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Calendar as CalendarIcon,
  BookOpen,
  Palmtree,
  GraduationCap,
  Sparkles,
  Info,
  CheckCircle2,
  X,
  Filter,
  RefreshCw,
  Clock,
  ExternalLink,
  FileText,
  Award,
  BookHeart,
  MousePointer,
  CheckSquare,
  Loader2,
  CalendarX,
  Printer,
  UserCheck,
  Building,
  Tag,
  Palette,
  Send,
  UserPlus,
  FileCheck,
  CalendarRange,
  ArrowRight
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { academicCalendarService } from '../../services/academicCalendarService'
import { printCleanTable } from '../../utils/printHelper'

// Category Configuration & Presets (PPDB, Daftar Ulang, Ujian, Terima Rapor, KBM, Libur, Custom)
export const PRESET_CATEGORIES = {
  ppdb_buka: {
    label: 'Pembukaan Pendaftaran PPDB',
    defaultColor: 'sky',
    icon: UserPlus,
    defaultModule: '/dashboard/berita-informasi'
  },
  ppdb_ulang: {
    label: 'Daftar Ulang PPDB',
    defaultColor: 'teal',
    icon: FileCheck,
    defaultModule: '/dashboard/berita-informasi'
  },
  mulai_kbm: {
    label: 'Awal KBM / Semester Baru',
    defaultColor: 'emerald',
    icon: BookOpen,
    defaultModule: '/dashboard/master-kurikulum'
  },
  ujian: {
    label: 'Pelaksanaan Ujian / Asesmen (PTS/PAS/PAT)',
    defaultColor: 'purple',
    icon: GraduationCap,
    defaultModule: '/dashboard/lms/ujian'
  },
  terima_rapor: {
    label: 'Penerimaan Rapor & Laporan Belajar',
    defaultColor: 'indigo',
    icon: Award,
    defaultModule: '/dashboard/lms/rapor'
  },
  libur_sekolah: {
    label: 'Libur Sekolah & Tanggal Merah',
    defaultColor: 'rose',
    icon: Palmtree,
    defaultModule: ''
  },
  libur_semester: {
    label: 'Libur Semester & Kenaikan Kelas',
    defaultColor: 'amber',
    icon: CalendarIcon,
    defaultModule: '/dashboard/master-tahun-ajaran'
  },
  kegiatan: {
    label: 'Kegiatan & Acara Sekolah',
    defaultColor: 'cyan',
    icon: Sparkles,
    defaultModule: '/dashboard/berita-informasi'
  },
  custom: {
    label: '+ Kategori Custom (Kategori Bebas)',
    defaultColor: 'slate',
    icon: Tag,
    defaultModule: ''
  }
}

// Color Palette Map (Badge, Dot, Border CSS Classes)
export const COLOR_PALETTE = {
  emerald: {
    label: 'Hijau Zamrud',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700',
    dotBg: 'bg-emerald-500',
    border: 'border-emerald-500',
    hex: '#10B981'
  },
  rose: {
    label: 'Merah Rose',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700',
    dotBg: 'bg-rose-500',
    border: 'border-rose-500',
    hex: '#F43F5E'
  },
  amber: {
    label: 'Oranye Amber',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700',
    dotBg: 'bg-amber-500',
    border: 'border-amber-500',
    hex: '#F59E0B'
  },
  purple: {
    label: 'Ungu Violet',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-700',
    dotBg: 'bg-purple-500',
    border: 'border-purple-500',
    hex: '#A855F7'
  },
  sky: {
    label: 'Biru Langit',
    badgeBg: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-700',
    dotBg: 'bg-sky-500',
    border: 'border-sky-500',
    hex: '#0EA5E9'
  },
  teal: {
    label: 'Hijau Laut (Teal)',
    badgeBg: 'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-700',
    dotBg: 'bg-teal-500',
    border: 'border-teal-500',
    hex: '#14B8A6'
  },
  indigo: {
    label: 'Nila Indigo',
    badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-700',
    dotBg: 'bg-indigo-500',
    border: 'border-indigo-500',
    hex: '#6366F1'
  },
  pink: {
    label: 'Merah Muda (Pink)',
    badgeBg: 'bg-pink-100 text-pink-900 border-pink-300 dark:bg-pink-950/80 dark:text-pink-300 dark:border-pink-700',
    dotBg: 'bg-pink-500',
    border: 'border-pink-500',
    hex: '#EC4899'
  },
  cyan: {
    label: 'Sian Cyan',
    badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-700',
    dotBg: 'bg-cyan-500',
    border: 'border-cyan-500',
    hex: '#06B6D4'
  },
  slate: {
    label: 'Abu Slate',
    badgeBg: 'bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    dotBg: 'bg-slate-500',
    border: 'border-slate-500',
    hex: '#64748B'
  }
}

// Module shortcut options for LMS & Academic integration
export const MODULE_LINK_OPTIONS = [
  { value: '', label: 'Tanpa Tautan Modul' },
  { value: '/dashboard/master-tahun-ajaran', label: 'Master Tahun Ajaran' },
  { value: '/dashboard/master-kurikulum', label: 'Master Kurikulum Akademik' },
  { value: '/dashboard/lms/ujian', label: 'Modul LMS Ujian & CBT' },
  { value: '/dashboard/lms/penugasan', label: 'Modul LMS Pengumpulan Tugas' },
  { value: '/dashboard/lms/materi', label: 'Modul LMS Materi & Modul Ajar' },
  { value: '/dashboard/lms/rapor', label: 'Modul Rapor Akademik' },
  { value: '/dashboard/tahfizh', label: 'Modul Tahfizh & Mutabaah' },
  { value: '/dashboard/berita-informasi', label: 'Portal Berita & Pengumuman' }
]

// Target audience options
export const AUDIENCE_OPTIONS = [
  { value: 'Semua Civitas', label: 'Semua Civitas (Siswa, Orang Tua, Guru & Staf)' },
  { value: 'Siswa & Orang Tua', label: 'Khusus Siswa & Orang Tua' },
  { value: 'Guru & Tenaga Pendidik', label: 'Khusus Guru & Tenaga Pendidik' },
  { value: 'Staf & Operasional', label: 'Khusus Staf & Operasional' }
]

export default function AcademicCalendarModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  // Extract all possible role strings from user object
  // Allowed to input & edit agenda: superadmin, admin, pengurus yayasan, kepala sekolah, divisi pendidikan, & TU
  const canManage = useMemo(() => {
    if (!user) return true
    const roleStr = [
      user?.role,
      user?.role?.name,
      user?.role_name,
      ...(Array.isArray(user?.roles) ? user.roles.map((r) => (typeof r === 'string' ? r : r?.name)) : [])
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const isAllowedRole =
      roleStr.includes('superadmin') ||
      roleStr.includes('super_admin') ||
      roleStr.includes('admin') ||
      roleStr.includes('yayasan') ||
      roleStr.includes('pengurus') ||
      roleStr.includes('kepala_sekolah') ||
      roleStr.includes('kepsek') ||
      roleStr.includes('divisi_pendidikan') ||
      roleStr.includes('divisi') ||
      roleStr.includes('waka') ||
      roleStr.includes('tu') ||
      roleStr.includes('tata_usaha') ||
      roleStr.includes('tatausaha') ||
      roleStr.includes('pegawai') ||
      roleStr.includes('staf')

    return isAllowedRole
  }, [user])

  // Extract Dynamic User Unit (Zero Hardcode)
  const userUnit = useMemo(() => {
    if (!user) return ''
    const unitVal =
      user?.unit?.name ||
      user?.unit?.code ||
      user?.unit ||
      user?.unit_name ||
      user?.education_unit ||
      user?.education_unit_name ||
      user?.school_unit ||
      user?.unit_code ||
      ''
    return String(unitVal).trim()
  }, [user])

  // Determine Role Access Level (Zero Hardcode):
  // Superadmin, Admin, & Pengurus Yayasan -> Full Access (Can view/print all units)
  // Kepala Sekolah, Waka/Divisi Pendidikan, Pegawai/Staf, Guru, Student, Parent -> Unit Restricted
  const isFullAccessUser = useMemo(() => {
    if (!user) return true
    const roleStr = [
      user?.role,
      user?.role?.name,
      user?.role_name,
      ...(Array.isArray(user?.roles) ? user.roles.map((r) => (typeof r === 'string' ? r : r?.name)) : [])
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return (
      roleStr.includes('superadmin') ||
      roleStr.includes('super_admin') ||
      roleStr.includes('admin') ||
      roleStr.includes('yayasan') ||
      roleStr.includes('pengurus')
    )
  }, [user])

  const [activeTab, setActiveTab] = useState('view') // 'view' | 'manage'
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date())
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('Semua Unit')

  // Dynamic Education Units State (Pulled Live from Backend API Database)
  const [unitOptions, setUnitOptions] = useState([
    { value: 'Semua Unit', label: 'Semua Unit (Yayasan Dar El-Iman)' },
    { value: 'TK', label: 'TK / PAUD IT' },
    { value: 'SD', label: 'SD IT' },
    { value: 'SMP', label: 'SMP IT' },
    { value: 'SMA', label: 'SMA IT' }
  ])

  // Automatically enforce Unit Filter for Unit-Restricted Roles
  useEffect(() => {
    if (isOpen && !isFullAccessUser && userUnit) {
      const matched = unitOptions.find((u) => {
        const val = String(u.value).toLowerCase()
        const lbl = String(u.label || '').toLowerCase()
        const target = userUnit.toLowerCase()
        return val === target || target.includes(val) || val.includes(target) || lbl.includes(target)
      })

      if (matched) {
        setSelectedUnitFilter(matched.value)
      } else {
        setSelectedUnitFilter(userUnit)
      }
    }
  }, [isOpen, isFullAccessUser, userUnit, unitOptions])

  // Date Range Selection State (Supports Drag, 2-Click Selection & Manual Input Fields)
  const [rangeStart, setRangeStart] = useState(null)
  const [rangeEnd, setRangeEnd] = useState(null)
  const [clickStep, setClickStep] = useState(0) // 0: reset/idle, 1: start selected waiting for end
  const [hoverDate, setHoverDate] = useState(null)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [dragAnchorDate, setDragAnchorDate] = useState(null)

  // Dynamic Academic Calendar Events State from API Service
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch Live Education Units & Events from Backend Database
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [fetchedEvents, fetchedUnits] = await Promise.all([
        academicCalendarService.getEvents(),
        academicCalendarService.getEducationUnits()
      ])
      setEvents(fetchedEvents)
      if (Array.isArray(fetchedUnits) && fetchedUnits.length > 0) {
        setUnitOptions(fetchedUnits)
      }
    } catch {
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, loadData])

  // Form State for Adding / Editing Events (Supports Custom Category, Color, & Live Unit)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    category: 'ppdb_buka',
    customCategoryLabel: '',
    color: 'sky',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    unit: 'Semua Unit',
    targetModule: '/dashboard/berita-informasi',
    audience: 'Semua Civitas',
    isPublished: true,
    notes: ''
  })

  // Computed Effective Range Normalization (Supports Drag, 2-Click Hover, and Field Inputs)
  const effectiveRange = useMemo(() => {
    let st = rangeStart
    let en = clickStep === 1 && hoverDate ? hoverDate : rangeEnd

    if (!st && !en) return { start: null, end: null }
    if (st && !en) return { start: st, end: st }
    if (!st && en) return { start: en, end: en }

    return st <= en ? { start: st, end: en } : { start: en, end: st }
  }, [rangeStart, rangeEnd, clickStep, hoverDate])

  const resetForm = (overrideStart = null, overrideEnd = null, overrideUnit = null) => {
    setEditingId(null)
    const st = overrideStart || effectiveRange.start || new Date().toISOString().split('T')[0]
    const en = overrideEnd || effectiveRange.end || st
    const un = overrideUnit || selectedUnitFilter || 'Semua Unit'

    setFormData({
      title: '',
      category: 'ppdb_buka',
      customCategoryLabel: '',
      color: 'sky',
      startDate: st,
      endDate: en,
      unit: un,
      targetModule: '/dashboard/berita-informasi',
      audience: 'Semua Civitas',
      isPublished: true,
      notes: ''
    })
  }

  // Handle 2-Click Selection & Mouse Dragging on Calendar Cells
  const handleDayClick = (dateStr) => {
    if (clickStep === 0 || (rangeStart && rangeEnd && clickStep !== 1)) {
      // Klik Pertama: Tentukan Tanggal Mulai
      setRangeStart(dateStr)
      setRangeEnd(dateStr)
      setClickStep(1)
      setHoverDate(dateStr)
    } else if (clickStep === 1) {
      // Klik Kedua: Tentukan Tanggal Akhir
      if (dateStr < rangeStart) {
        setRangeEnd(rangeStart)
        setRangeStart(dateStr)
      } else {
        setRangeEnd(dateStr)
      }
      setClickStep(0)
      setHoverDate(null)
    }
  }

  const handleDayMouseDown = (dateStr) => {
    setIsMouseDown(true)
    setDragAnchorDate(dateStr)
    setRangeStart(dateStr)
    setRangeEnd(dateStr)
    setClickStep(0)
  }

  const handleDayMouseEnter = (dateStr) => {
    if (isMouseDown && dragAnchorDate) {
      setRangeEnd(dateStr)
    } else if (clickStep === 1) {
      setHoverDate(dateStr)
    }
  }

  const handleDayMouseUp = () => {
    setIsMouseDown(false)
  }

  // Global mouseup event listener to complete dragging outside grid
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isMouseDown) {
        setIsMouseDown(false)
      }
    }
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [isMouseDown])

  // Open Form with Pre-filled Selected Date/Range & Unit
  const handleOpenFormWithRange = (st = null, en = null) => {
    const startDateVal = st || effectiveRange.start || rangeStart || new Date().toISOString().split('T')[0]
    const endDateVal = en || effectiveRange.end || rangeEnd || startDateVal
    resetForm(startDateVal, endDateVal, selectedUnitFilter)
    setActiveTab('manage')
  }

  const handleCategorySelectChange = (catKey) => {
    const preset = PRESET_CATEGORIES[catKey]
    const defaultColor = preset?.defaultColor || 'slate'
    const defaultMod = preset?.defaultModule || ''

    setFormData((prev) => ({
      ...prev,
      category: catKey,
      color: defaultColor,
      targetModule: defaultMod
    }))
  }

  const handleSaveEvent = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.startDate) return

    const payload = editingId ? { ...formData, id: editingId } : formData
    const updated = await academicCalendarService.simpanEvent(payload)
    setEvents(updated)
    resetForm()
    setActiveTab('view')
  }

  const handleEditClick = (evt) => {
    setEditingId(evt.id)
    setFormData({
      title: evt.title || '',
      category: evt.category || 'kegiatan',
      customCategoryLabel: evt.customCategoryLabel || '',
      color: evt.color || 'sky',
      startDate: evt.startDate || '',
      endDate: evt.endDate || evt.startDate || '',
      unit: evt.unit || 'Semua Unit',
      targetModule: evt.targetModule || '',
      audience: evt.audience || 'Semua Civitas',
      isPublished: evt.isPublished !== false,
      notes: evt.notes || ''
    })
    setRangeStart(evt.startDate)
    setRangeEnd(evt.endDate || evt.startDate)
    setClickStep(0)
    setActiveTab('manage')
  }

  const handleDeleteClick = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus agenda kalender ini?')) {
      const updated = await academicCalendarService.hapusEvent(id)
      setEvents(updated)
    }
  }

  const handleClearAllUserEvents = async () => {
    if (window.confirm('Bersihkan seluruh agenda buatan lokal dan muat data terbaru murni dari API backend?')) {
      const updated = await academicCalendarService.clearUserEvents()
      setEvents(updated)
    }
  }

  const handleNavigateToModule = (url) => {
    if (!url) return
    onClose()
    navigate(url)
  }

  // Trigger Clean Print Utility (Matching EducationUnitsPage / printHelper.js)
  const handlePrintCalendar = () => {
    const periodeLabel = effectiveRange.start
      ? effectiveRange.start === effectiveRange.end
        ? `Tanggal ${effectiveRange.start}`
        : `Rentang ${effectiveRange.start} s/d ${effectiveRange.end}`
      : `Bulan ${monthNames[month]} ${year}`

    const accessTitle = isFullAccessUser
      ? 'Yayasan / Admin (Seluruh Unit)'
      : `Terbatas Unit (${activeTargetUnit})`

    printCleanTable({
      title: 'Laporan Kalender Akademik & Agenda Kegiatan Sekolah',
      subtitle: `Unit Pendidikan: ${activeTargetUnit} | Periode: ${periodeLabel} | Hak Akses: ${accessTitle}`,
      headers: ['No', 'Tanggal / Rentang', 'Nama Agenda Kegiatan', 'Kategori', 'Unit Pendidikan', 'Catatan / Keterangan'],
      rows: eventsForPrint.map((evt, idx) => [
        idx + 1,
        evt.startDate === evt.endDate ? evt.startDate : `${evt.startDate} s/d ${evt.endDate}`,
        evt.title,
        getCategoryLabel(evt),
        evt.unit || 'Semua Unit',
        evt.notes || '—'
      ])
    })
  }

  // Calendar Math Helpers
  const year = currentMonthDate.getFullYear()
  const month = currentMonthDate.getMonth()

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  // Days matrix for grid
  const daysGrid = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []
    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate()
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        monthOffset: -1,
        dateStr: new Date(year, month - 1, prevMonthDays - i + 1).toISOString().split('T')[0]
      })
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const monthFormatted = String(month + 1).padStart(2, '0')
      const dayFormatted = String(i).padStart(2, '0')
      const dateStr = `${year}-${monthFormatted}-${dayFormatted}`
      days.push({
        day: i,
        monthOffset: 0,
        dateStr
      })
    }
    // Next month padding to fill grid 42 cells
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        monthOffset: 1,
        dateStr: new Date(year, month + 1, i + 1).toISOString().split('T')[0]
      })
    }
    return days
  }, [year, month])

  // Active Unit filter evaluation (Full Access Users can switch to any unit; Unit-Restricted roles strictly see their user unit)
  const activeTargetUnit = useMemo(() => {
    if (isFullAccessUser) return selectedUnitFilter
    return userUnit || selectedUnitFilter
  }, [isFullAccessUser, selectedUnitFilter, userUnit])

  // Get events active on a specific date string (Filtered by Unit)
  const getEventsForDate = (dateStr) => {
    if (!dateStr) return []
    return events.filter((evt) => {
      const start = evt.startDate
      const end = evt.endDate || evt.startDate
      const matchesDate = dateStr >= start && dateStr <= end
      const matchesUnit =
        activeTargetUnit === 'Semua Unit' ||
        evt.unit === 'Semua Unit' ||
        evt.unit === activeTargetUnit
      return matchesDate && matchesUnit
    })
  }

  // Filtered event list (by category & unit)
  const filteredEventsList = useMemo(() => {
    return events
      .filter((evt) => {
        const matchesCat = categoryFilter === 'all' ? true : evt.category === categoryFilter
        const matchesUnit =
          activeTargetUnit === 'Semua Unit' ||
          evt.unit === 'Semua Unit' ||
          evt.unit === activeTargetUnit
        return matchesCat && matchesUnit
      })
      .sort((a, b) => (a.startDate > b.startDate ? 1 : -1))
  }, [events, categoryFilter, activeTargetUnit])

  // Events on selected date range
  const eventsOnSelectedRange = useMemo(() => {
    if (!effectiveRange.start) return []
    return events.filter((evt) => {
      const start = evt.startDate
      const end = evt.endDate || evt.startDate
      const matchesRange =
        (start >= effectiveRange.start && start <= effectiveRange.end) ||
        (end >= effectiveRange.start && end <= effectiveRange.end) ||
        (start <= effectiveRange.start && end >= effectiveRange.end)
      const matchesUnit =
        activeTargetUnit === 'Semua Unit' ||
        evt.unit === 'Semua Unit' ||
        evt.unit === activeTargetUnit
      return matchesRange && matchesUnit
    })
  }, [effectiveRange, events, activeTargetUnit])

  // Events specifically formatted for Official Printout (Filtered by selected Unit & Date/Range)
  const eventsForPrint = useMemo(() => {
    if (effectiveRange.start) {
      return eventsOnSelectedRange
    }
    return filteredEventsList
  }, [effectiveRange.start, eventsOnSelectedRange, filteredEventsList])

  // Get Badge / Color styling for an event
  const getEventBadgeStyle = (evt) => {
    const colorKey = evt.color || PRESET_CATEGORIES[evt.category]?.defaultColor || 'slate'
    return COLOR_PALETTE[colorKey] || COLOR_PALETTE.slate
  }

  // Get Display Label for Category
  const getCategoryLabel = (evt) => {
    if (evt.category === 'custom' && evt.customCategoryLabel) {
      return evt.customCategoryLabel
    }
    return PRESET_CATEGORIES[evt.category]?.label || 'Agenda'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] print:static print:inset-auto print:z-auto print:bg-white print:p-0 print:m-0 print:block print:w-full print:overflow-visible">
      <div
        className="relative w-full max-w-5xl overflow-hidden rounded-[26px] border-2 border-emerald-500/30 bg-white shadow-2xl transition-all dark:border-emerald-600/40 dark:bg-[#111827] print:w-full print:max-w-none print:shadow-none print:border-none print:rounded-none print:bg-white print:p-0 print:m-0 print:overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HERO HEADER MODAL */}
        <div className="relative overflow-hidden border-b border-emerald-500/20 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 sm:p-6 text-white shadow-md print:hidden">
          {/* Ambient Multi-tone Glow Effect */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-300/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 left-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-2xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md shadow-inner">
                <CalendarDays className="h-6 w-6 text-white stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-100">
                    Kalender Akademik Kegiatan
                  </span>
                </div>
                <h2 className="mt-0.5 text-xl font-black sm:text-2xl">Kalender Akademik Kegiatan</h2>
                <p className="text-xs font-medium text-emerald-100/90 flex items-center gap-1.5">
                  <MousePointer className="h-3.5 w-3.5 text-teal-200" />
                  <span>Klik 1 Tanggal Mulai, Klik 2 Tanggal Akhir, atau pilih manual dari field tanggal.</span>
                </p>
              </div>
            </div>

            {/* Action Bar: Cetak Button & Close Button (TailGrids Soft Pastel Squircle Buttons) */}
            <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-center">
              {/* Tombol Cetak / PDF Kalender */}
              <button
                type="button"
                onClick={handlePrintCalendar}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-white/20 px-4 py-2 text-xs font-black text-white hover:bg-white/30 dark:bg-white/15 dark:hover:bg-white/25 transition-colors duration-200 shadow-sm border border-white/20 active:scale-[0.98] cursor-pointer"
                title="Cetak atau Simpan Kalender Akademik ke PDF"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak / PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/20 text-white hover:bg-white/30 border border-white/20 transition-colors duration-200 active:scale-[0.98] cursor-pointer"
                aria-label="Tutup Modal"
                title="Tutup Modal Kalender"
              >
                <X className="h-5 w-5 stroke-[2.2]" />
              </button>
            </div>
          </div>
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto select-none print:max-h-none print:overflow-visible print:p-0">
          {/* CONTAINER INTERAKTIF SCREEN ONLY (TERSEMBUNYI SAAT CETAK / PDF) */}
          <div className="print:hidden space-y-5">
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-3 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memuat data agenda & unit pendidikan murni dari database API backend...</span>
              </div>
            )}

            {/* UNIT SELECTION & KELOLA AGENDA TOOLBAR (TAILGRIDS SQUIRCLE STYLE TEPAT DI ATAS CARD KALENDER) */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 rounded-2xl border-2 border-emerald-500/25 bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-emerald-50/90 p-3.5 dark:border-emerald-700/50 dark:bg-slate-900/80 shadow-xs">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 shrink-0">
                <Building className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                <label htmlFor="unit-select-filter" className="text-xs font-black text-slate-800 dark:text-white cursor-pointer">
                  Unit Pendidikan:
                </label>
              </div>

              <div className="w-full md:w-64">
                <select
                  id="unit-select-filter"
                  value={activeTargetUnit}
                  onChange={(e) => isFullAccessUser && setSelectedUnitFilter(e.target.value)}
                  disabled={!isFullAccessUser}
                  title={!isFullAccessUser ? `Terkunci khusus unit ${activeTargetUnit}` : 'Pilih Unit Pendidikan'}
                  className={`w-full rounded-xl border px-3.5 py-2 text-xs font-extrabold shadow-2xs transition-colors ${
                    !isFullAccessUser
                      ? 'bg-slate-100/90 border-slate-300 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 cursor-not-allowed'
                      : 'bg-white border-emerald-300/90 text-slate-900 focus:border-emerald-600 dark:border-emerald-700 dark:bg-slate-900 dark:text-white cursor-pointer'
                  }`}
                >
                  {isFullAccessUser ? (
                    unitOptions.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label || u.value}
                      </option>
                    ))
                  ) : (
                    <option value={activeTargetUnit}>
                      {activeTargetUnit} (Terkunci Sesuai Unit Anda)
                    </option>
                  )}
                </select>
              </div>
            </div>

            {/* Navigasi Tab & Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <div className="flex rounded-2xl bg-slate-200/90 p-1 dark:bg-slate-800/90 shrink-0 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('view')}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-black transition-all duration-200 cursor-pointer ${
                    activeTab === 'view'
                      ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-700 hover:bg-white/60 dark:text-slate-300'
                  }`}
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>Tampilan Kalender</span>
                </button>

                {canManage && (
                  <button
                    type="button"
                    onClick={() => handleOpenFormWithRange()}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-black transition-all duration-200 cursor-pointer ${
                      activeTab === 'manage'
                        ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-white/80 text-emerald-900 hover:bg-white dark:bg-slate-900 dark:text-emerald-300'
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Kelola Agenda</span>
                  </button>
                )}
              </div>

              {canManage && (
                <div className="group relative inline-flex shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm(new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[0], selectedUnitFilter)
                      setActiveTab('manage')
                    }}
                    title={`Tambah Agenda Baru (${selectedUnitFilter})`}
                    aria-label={`Tambah Agenda Baru (${selectedUnitFilter})`}
                    className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-800 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/70 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white border border-emerald-300/80 dark:border-emerald-700 transition-colors duration-200 hover:shadow-md hover:shadow-emerald-600/30 cursor-pointer shadow-2xs"
                  >
                    <Plus className="h-4.5 w-4.5 stroke-[2.5] transition-colors" />
                  </button>

                  {/* Floating Hover Tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                    Tambah Agenda Baru ({selectedUnitFilter})
                  </div>
                </div>
              )}
            </div>
          </div>

          {activeTab === 'view' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: INTERACTIVE MONTHLY CALENDAR GRID WITH DRAG & 2-CLICK SELECTION (7 Cols) */}
              <div className="lg:col-span-7 space-y-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1B2433] print:col-span-12">
                {/* Month Navigator Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {monthNames[month]} {year}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date()
                        setCurrentMonthDate(now)
                        const todayStr = now.toISOString().split('T')[0]
                        setRangeStart(todayStr)
                        setRangeEnd(todayStr)
                        setClickStep(0)
                      }}
                      className="inline-flex items-center rounded-xl bg-emerald-100/90 text-emerald-800 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white border border-emerald-300/80 dark:border-emerald-700 px-3 py-1 text-xs font-extrabold transition-colors duration-200 shadow-2xs cursor-pointer"
                    >
                      Hari Ini
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 print:hidden">
                    <button
                      type="button"
                      onClick={() => setCurrentMonthDate(new Date(year, month - 1, 1))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100/90 text-slate-700 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-600 dark:hover:text-white border border-slate-200/80 dark:border-slate-700 transition-colors duration-200 shadow-2xs cursor-pointer"
                      title="Bulan Sebelumnya"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentMonthDate(new Date(year, month + 1, 1))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100/90 text-slate-700 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-600 dark:hover:text-white border border-slate-200/80 dark:border-slate-700 transition-colors duration-200 shadow-2xs cursor-pointer"
                      title="Bulan Berikutnya"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* PEMILIHAN RENTANG TANGGAL MANUAL VIA FIELD INPUT & INFOBAR TANGGAL (BIDIRECTIONAL SINKRON) */}
                <div className="rounded-2xl border border-emerald-300/90 bg-emerald-50/90 p-3.5 dark:border-emerald-700/80 dark:bg-emerald-950/70 space-y-2.5 print:hidden">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CalendarRange className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-xs font-black text-emerald-950 dark:text-emerald-200">
                        Pilih Rentang Tanggal Manual / Klik Kalender:
                      </span>
                    </div>
                    {clickStep === 1 && (
                      <span className="animate-pulse rounded-lg bg-amber-200/90 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                        Klik 2: Pilih Tanggal Akhir
                      </span>
                    )}
                  </div>

                  {/* Field Input Manual Tanggal Mulai & Tanggal Akhir */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-900 dark:text-emerald-300 mb-0.5">
                        Tanggal Mulai
                      </label>
                      <input
                        type="date"
                        value={rangeStart || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          setRangeStart(val)
                          if (!rangeEnd || rangeEnd < val) setRangeEnd(val)
                          setClickStep(0)
                        }}
                        className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 dark:border-emerald-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-emerald-900 dark:text-emerald-300 mb-0.5">
                        Tanggal Akhir
                      </label>
                      <input
                        type="date"
                        value={rangeEnd || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          setRangeEnd(val)
                          if (!rangeStart || rangeStart > val) setRangeStart(val)
                          setClickStep(0)
                        }}
                        className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 dark:border-emerald-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Tombol Action Modal Pengisian Agenda dengan Warna (TailGrids Soft Pastel Squircle Style) */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-emerald-200/80 dark:border-emerald-800/80">
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950 dark:text-emerald-100">
                      <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        {effectiveRange.start
                          ? effectiveRange.start === effectiveRange.end
                            ? `Tanggal Terpilih: ${effectiveRange.start}`
                            : `Rentang Terpilih: ${effectiveRange.start} s/d ${effectiveRange.end}`
                          : 'Pilih tanggal pada kalender atau input field di atas'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {effectiveRange.start && (
                        <button
                          type="button"
                          onClick={() => {
                            setRangeStart(null)
                            setRangeEnd(null)
                            setClickStep(0)
                            setHoverDate(null)
                          }}
                          className="inline-flex items-center rounded-xl bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 px-3 py-1.5 text-xs font-bold transition-colors duration-200 shadow-2xs cursor-pointer"
                        >
                          Reset Pilihan
                        </button>
                      )}

                      {canManage && (
                        <div className="group relative inline-flex shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenFormWithRange()}
                            title={`Buat Agenda pada Rentang Ini (${selectedUnitFilter})`}
                            aria-label={`Buat Agenda pada Rentang Ini (${selectedUnitFilter})`}
                            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-800 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/70 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white border border-emerald-300/80 dark:border-emerald-700 transition-colors duration-200 hover:shadow-md hover:shadow-emerald-600/30 cursor-pointer shadow-2xs"
                          >
                            <Plus className="h-5 w-5 stroke-[2.5] transition-colors" />
                          </button>

                          {/* Floating Hover Tooltip */}
                          <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                            <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                            Buat Agenda pada Rentang Ini ({selectedUnitFilter})
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Calendar Days Header */}
                <div className="grid grid-cols-7 text-center text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  {dayNames.map((d, idx) => (
                    <div key={d} className={`py-1 ${idx === 0 ? 'text-rose-500' : ''}`}>
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar Date Cells (Supports 2-Click & Drag Range Selection) */}
                <div className="grid grid-cols-7 gap-1">
                  {daysGrid.map((item, idx) => {
                    const isOutside = item.monthOffset !== 0
                    const isToday =
                      item.dateStr === new Date().toISOString().split('T')[0]
                    const isInRange =
                      effectiveRange.start &&
                      effectiveRange.end &&
                      item.dateStr >= effectiveRange.start &&
                      item.dateStr <= effectiveRange.end
                    const isStart = item.dateStr === effectiveRange.start
                    const isEnd = item.dateStr === effectiveRange.end

                    const dateEvts = getEventsForDate(item.dateStr)

                    return (
                      <div
                        key={idx}
                        onClick={() => handleDayClick(item.dateStr)}
                        onMouseDown={() => handleDayMouseDown(item.dateStr)}
                        onMouseEnter={() => handleDayMouseEnter(item.dateStr)}
                        onMouseUp={handleDayMouseUp}
                        className={`relative flex flex-col items-center justify-between min-h-[54px] rounded-xl p-1 text-xs transition-all cursor-pointer border select-none ${
                          isStart || isEnd
                            ? 'border-emerald-600 bg-[#0E5C44] text-white font-black shadow-md dark:bg-[#3FBF75] dark:text-slate-950'
                            : isInRange
                            ? 'border-emerald-300 bg-emerald-100 text-emerald-950 font-bold dark:border-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-200'
                            : isToday
                            ? 'border-teal-400 bg-teal-50/60 font-bold text-teal-900 dark:border-teal-600 dark:bg-teal-950/40 dark:text-teal-200'
                            : isOutside
                            ? 'border-transparent text-slate-300 dark:text-slate-700 opacity-50'
                            : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100 text-slate-800 dark:border-slate-800/80 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-[11px] font-semibold self-end pr-1 pt-0.5">
                          {item.day}
                        </span>

                        {/* Event Indicator Dots */}
                        <div className="flex flex-wrap justify-center gap-0.5 w-full pb-1">
                          {dateEvts.slice(0, 3).map((evt) => {
                            const style = getEventBadgeStyle(evt)
                            return (
                              <span
                                key={evt.id}
                                title={`${evt.title} (${getCategoryLabel(evt)})`}
                                className={`h-2 w-2 rounded-full ${
                                  isStart || isEnd ? 'bg-white' : style.dotBg
                                }`}
                              />
                            )
                          })}
                          {dateEvts.length > 3 && (
                            <span className="text-[8px] font-bold text-slate-400">+</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Legend Kategori Agenda LMS & Akademik */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                  {Object.entries(PRESET_CATEGORIES).map(([key, cat]) => {
                    const colorStyle = COLOR_PALETTE[cat.defaultColor] || COLOR_PALETTE.slate
                    return (
                      <div key={key} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        <span className={`h-2.5 w-2.5 rounded-full ${colorStyle.dotBg}`} />
                        <span>{cat.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* RIGHT COLUMN: AGENDA DETAILS FOR SELECTED RANGE & FILTERED AGENDA LIST (5 Cols) */}
              <div className="lg:col-span-5 space-y-4 print:col-span-12">
                {/* Detail Agenda Tanggal / Rentang Terpilih */}
                {effectiveRange.start && (
                  <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/40 p-4 shadow-sm dark:border-emerald-700/50 dark:bg-emerald-950/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>
                          Agenda Rentang ({selectedUnitFilter}): {effectiveRange.start}{' '}
                          {effectiveRange.start !== effectiveRange.end ? `s/d ${effectiveRange.end}` : ''}
                        </span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setRangeStart(null)
                          setRangeEnd(null)
                          setClickStep(0)
                        }}
                        className="inline-flex items-center rounded-lg bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white px-2 py-0.5 text-[10px] font-bold transition-colors duration-200 print:hidden"
                      >
                        Reset Pilihan
                      </button>
                    </div>

                    {eventsOnSelectedRange.length > 0 ? (
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {eventsOnSelectedRange.map((evt) => {
                          const style = getEventBadgeStyle(evt)
                          return (
                            <div
                              key={evt.id}
                              className={`rounded-xl border p-3 bg-white dark:bg-slate-900 ${style.badgeBg}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="font-extrabold text-xs block">{evt.title}</span>
                                  <span className="text-[10px] font-semibold opacity-80">{getCategoryLabel(evt)}</span>
                                </div>
                                {canManage && (
                                  <div className="flex items-center gap-1.5 shrink-0 print:hidden">
                                    <button
                                      type="button"
                                      onClick={() => handleEditClick(evt)}
                                      className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-emerald-600 hover:text-white transition-colors duration-200 cursor-pointer"
                                      title="Edit Agenda"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteClick(evt.id)}
                                      className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-rose-600 hover:text-white transition-colors duration-200 cursor-pointer"
                                      title="Hapus Agenda"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              {evt.notes && (
                                <p className="mt-1 text-[11px] font-medium opacity-90">{evt.notes}</p>
                              )}
                              <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                                <span className="text-[10px] font-bold opacity-75">
                                  Unit: {evt.unit || 'Semua Unit'}
                                </span>
                                {evt.targetModule && (
                                  <button
                                    type="button"
                                    onClick={() => handleNavigateToModule(evt.targetModule)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-100/90 text-emerald-800 hover:bg-emerald-600 hover:text-white px-2.5 py-1 text-[10px] font-extrabold transition-colors duration-200 print:hidden cursor-pointer"
                                  >
                                    <span>Buka Modul</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="py-2 space-y-2">
                        <p className="text-xs font-medium text-slate-500 italic">
                          Tidak ada agenda khusus untuk unit {selectedUnitFilter} pada rentang tanggal terpilih ini.
                        </p>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleOpenFormWithRange()}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-100/90 text-emerald-800 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/70 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white border border-emerald-300/80 dark:border-emerald-700 px-4 py-2 text-xs font-black transition-colors duration-200 hover:shadow-md hover:shadow-emerald-600/30 print:hidden cursor-pointer shadow-2xs"
                          >
                            <Plus className="h-4 w-4 stroke-[2.5] transition-colors" />
                            <span>Buat Agenda Baru pada Rentang Ini</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Filter Kategori & List Agenda Mendatang */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1B2433] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Filter className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Daftar Agenda ({selectedUnitFilter})</span>
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400">
                      Total: {filteredEventsList.length} Agenda
                    </span>
                  </div>

                  {/* Filter Dropdown */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white print:hidden"
                  >
                    <option value="all">Semua Kategori Agenda</option>
                    {Object.entries(PRESET_CATEGORIES).map(([key, cat]) => (
                      <option key={key} value={key}>
                        {cat.label}
                      </option>
                    ))}
                  </select>

                  {/* Event Scroll List / Empty State */}
                  {filteredEventsList.length > 0 ? (
                    <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                      {filteredEventsList.map((evt) => {
                        const style = getEventBadgeStyle(evt)
                        return (
                          <div
                            key={evt.id}
                            className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100/70 transition-all dark:border-slate-800 dark:bg-slate-900/60"
                          >
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.badgeBg}`}>
                              <Tag className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1">
                                <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {evt.title}
                                </h5>
                                <span className="shrink-0 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400">
                                  {evt.startDate === evt.endDate
                                    ? evt.startDate
                                    : `${evt.startDate} s/d ${evt.endDate}`}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {getCategoryLabel(evt)} • {evt.notes || 'Agenda resmi sekolah'}
                              </p>
                              {evt.targetModule && (
                                <button
                                  type="button"
                                  onClick={() => handleNavigateToModule(evt.targetModule)}
                                  className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-emerald-100/90 text-emerald-800 hover:bg-emerald-600 hover:text-white px-2.5 py-1 text-[10px] font-extrabold transition-colors duration-200 print:hidden cursor-pointer"
                                >
                                  <span>Akses Modul LMS / Akademik</span>
                                  <ExternalLink className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-800 space-y-2">
                      <CalendarX className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Belum ada agenda kalender akademik untuk unit {selectedUnitFilter}.
                      </p>
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => handleOpenFormWithRange()}
                          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-100/90 text-emerald-800 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/70 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white border border-emerald-300/80 dark:border-emerald-700 px-4 py-2 text-xs font-black transition-colors duration-200 hover:shadow-md hover:shadow-emerald-600/30 print:hidden cursor-pointer shadow-2xs"
                        >
                          <Plus className="h-4 w-4 stroke-[2.5] transition-colors" />
                          <span>Tambah Agenda Pertama</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: PENGATURAN & TAMBAH AGENDA AKADEMIK/PPDB/UJIAN (ADMIN / SUPER ADMIN / GURU) */
            <div className="space-y-6">
              {/* Form Input Agenda */}
              <form
                onSubmit={handleSaveEvent}
                className="space-y-4 rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/20 p-4 sm:p-5 dark:border-emerald-800 dark:bg-emerald-950/20"
              >
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3 dark:border-emerald-800/60">
                  <h3 className="text-sm font-black text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                    <Plus className="h-4.5 w-4.5 text-emerald-600 stroke-[2.5]" />
                    <span>{editingId ? 'Edit Agenda Akademik' : 'Tambah Agenda Kalender Akademik Baru'}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleClearAllUserEvents}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 px-3 py-1.5 text-xs font-bold transition-colors duration-200 shadow-2xs cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Muat Ulang Dari API Backend</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pemilihan Unit Pendidikan (Dua Arah Sebelum Agenda Dibuat - Dynamic API Database) */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Pilih Unit Pendidikan Sekolah (Database API Backend) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      {unitOptions.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label || u.value}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Judul Agenda */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Nama / Judul Agenda <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Contoh: Pembukaan PPDB Baru / Daftar Ulang / Ujian PAS / Terima Rapor"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Kategori Agenda */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Kategori Agenda <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleCategorySelectChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      {Object.entries(PRESET_CATEGORIES).map(([key, cat]) => (
                        <option key={key} value={key}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Inputan Kategori Custom jika memilih category === 'custom' */}
                  {formData.category === 'custom' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Nama Kategori Custom <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.customCategoryLabel}
                        onChange={(e) => setFormData({ ...formData, customCategoryLabel: e.target.value })}
                        placeholder="Contoh: Workshop KKG / Rapat Organisasi"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  )}

                  {/* Pemilihan Warna Agenda (Color Picker) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                      <Palette className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Warna Penanda Agenda</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {Object.entries(COLOR_PALETTE).map(([cKey, cVal]) => (
                        <button
                          key={cKey}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: cKey })}
                          className={`h-7 w-7 rounded-lg border-2 transition-all flex items-center justify-center cursor-pointer ${
                            formData.color === cKey
                              ? 'border-slate-900 scale-110 shadow-md dark:border-white'
                              : 'border-transparent opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: cVal.hex }}
                          title={cVal.label}
                        >
                          {formData.color === cKey && (
                            <CheckCircle2 className="h-4 w-4 text-white drop-shadow-sm" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Integrasi Tautan Modul */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Integrasi Tautan Modul LMS / Akademik
                    </label>
                    <select
                      value={formData.targetModule}
                      onChange={(e) => setFormData({ ...formData, targetModule: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      {MODULE_LINK_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Target Civitas / Audience */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Sasaran Civitas / Target User
                    </label>
                    <select
                      value={formData.audience}
                      onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      {AUDIENCE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Field Tanggal Mulai */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Tanggal Mulai <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => {
                        const val = e.target.value
                        setFormData({ ...formData, startDate: val })
                        setRangeStart(val)
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Field Tanggal Selesai */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Tanggal Selesai (Rentang)
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => {
                        const val = e.target.value
                        setFormData({ ...formData, endDate: val })
                        setRangeEnd(val)
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Catatan / Keterangan */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Catatan / Petunjuk Khusus
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Penjelasan ringkas jadwal pendaftaran, persyaratan, atau petunjuk pelaksanaan..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-emerald-200/50 dark:border-emerald-800/50">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 accent-[#0E5C44] focus:ring-[#0E5C44]"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Publikasikan ke Portal Siswa & Orang Tua
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    {editingId && (
                      <button
                        type="button"
                        onClick={() => resetForm()}
                        className="inline-flex items-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-bold transition-colors duration-200 cursor-pointer"
                      >
                        Batal Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black px-5 py-2.5 shadow-md shadow-emerald-600/30 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{editingId ? 'Simpan Perubahan Agenda' : 'Tambahkan Ke Kalender'}</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Tabel Pengelolaan Agenda */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Daftar Pengaturan Kalender Akademik ({events.length})
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1B2433]">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-50 text-[11px] font-black uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Nama Agenda & Catatan</th>
                        <th className="px-4 py-3">Unit</th>
                        <th className="px-4 py-3">Kategori</th>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {events.map((evt) => {
                        const style = getEventBadgeStyle(evt)
                        return (
                          <tr key={evt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                              {evt.title}
                              {evt.notes && (
                                <p className="text-[11px] font-normal text-slate-400 line-clamp-1">{evt.notes}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 font-extrabold text-emerald-800 dark:text-emerald-300">
                              {evt.unit || 'Semua Unit'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold border ${style.badgeBg}`}>
                                {getCategoryLabel(evt)}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                              {evt.startDate === evt.endDate
                                ? evt.startDate
                                : `${evt.startDate} s/d ${evt.endDate}`}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleEditClick(evt)}
                                  className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-emerald-600 hover:text-white transition-colors duration-200 cursor-pointer"
                                  title="Edit Agenda"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteClick(evt.id)}
                                  className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-rose-600 hover:text-white transition-colors duration-200 cursor-pointer"
                                  title="Hapus Agenda"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                      {events.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-xs font-semibold text-slate-400">
                            Belum ada data agenda kalender yang tersimpan di database backend atau lokal.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

          {/* TEMPLATE PRINT-ONLY OFFIAL CETAK KALENDER (MEMBACA UNIT & RENTANG TANGGAL TERPILIH) */}
          <div className="hidden print:block space-y-5 pt-2 text-slate-900">
            {/* Kop Resmi Sekolah */}
            <div className="text-center border-b-2 border-slate-900 pb-3">
              <h1 className="text-xl font-black uppercase tracking-wider">YAYASAN DAR EL - IMAN</h1>
              <h2 className="text-base font-bold uppercase">SISTEM INFORMASI MANAJEMEN SEKOLAH TERPADU</h2>
              <p className="text-xs font-medium text-slate-600 mt-1">
                Laporan & Jadwal Agenda Kegiatan Kalender Akademik
              </p>
            </div>

            {/* Filter Metadata Header Cetak Menurut Unit & Tanggal / Rentang */}
            <div className="flex items-end justify-between border-b border-slate-300 pb-2 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-slate-800">
                  Unit Pendidikan: <span className="font-black text-emerald-800">{selectedUnitFilter}</span>
                </p>
                <p className="font-bold text-slate-800">
                  Periode / Tanggal: {' '}
                  <span className="font-black text-slate-900">
                    {effectiveRange.start
                      ? effectiveRange.start === effectiveRange.end
                        ? effectiveRange.start
                        : `Rentang ${effectiveRange.start} s/d ${effectiveRange.end}`
                      : `Bulan ${monthNames[month]} ${year}`}
                  </span>
                </p>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>

            {/* TAMPILAN GRID KALENDER BULANAN CETAK */}
            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Visual Grid Kalender Akademik ({monthNames[month]} {year})
              </h3>
              <div className="border border-slate-400 rounded-xl p-2 bg-white">
                <div className="grid grid-cols-7 text-center text-[10px] font-black uppercase border-b border-slate-300 pb-1 mb-1">
                  {dayNames.map((d, idx) => (
                    <div key={d} className={idx === 0 ? 'text-rose-600' : 'text-slate-800'}>
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {daysGrid.map((item, idx) => {
                    const isOutside = item.monthOffset !== 0
                    const dateEvts = getEventsForDate(item.dateStr)
                    const isInRange =
                      effectiveRange.start &&
                      effectiveRange.end &&
                      item.dateStr >= effectiveRange.start &&
                      item.dateStr <= effectiveRange.end

                    return (
                      <div
                        key={idx}
                        className={`min-h-[44px] border rounded p-1 text-[9px] flex flex-col justify-between ${
                          isInRange
                            ? 'bg-slate-200 border-slate-500 font-bold'
                            : isOutside
                            ? 'border-slate-100 text-slate-300 opacity-40'
                            : 'border-slate-200 text-slate-800'
                        }`}
                      >
                        <span className="self-end font-bold text-[10px]">{item.day}</span>
                        <div className="space-y-0.5">
                          {dateEvts.slice(0, 2).map((e) => (
                            <div
                              key={e.id}
                              className="truncate rounded bg-slate-900 px-1 py-0.5 text-[7.5px] font-bold text-white"
                            >
                              {e.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* TABEL DAFTAR AGENDA KEGIATAN CETAK */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Daftar Agenda Kegiatan Sekolah ({eventsForPrint.length} Agenda)
              </h3>
              <table className="w-full text-left text-xs border border-slate-400 divide-y divide-slate-400">
                <thead className="bg-slate-100 text-[11px] font-bold uppercase">
                  <tr>
                    <th className="border border-slate-400 px-3 py-2 text-center w-10">No</th>
                    <th className="border border-slate-400 px-3 py-2 w-36">Tanggal / Rentang</th>
                    <th className="border border-slate-400 px-3 py-2">Nama Agenda Kegiatan</th>
                    <th className="border border-slate-400 px-3 py-2 w-32">Kategori</th>
                    <th className="border border-slate-400 px-3 py-2 w-28">Unit</th>
                    <th className="border border-slate-400 px-3 py-2">Catatan / Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {eventsForPrint.map((evt, index) => (
                    <tr key={evt.id}>
                      <td className="border border-slate-400 px-3 py-2 text-center font-bold">{index + 1}</td>
                      <td className="border border-slate-400 px-3 py-2 font-bold">
                        {evt.startDate === evt.endDate ? evt.startDate : `${evt.startDate} s/d ${evt.endDate}`}
                      </td>
                      <td className="border border-slate-400 px-3 py-2 font-bold">{evt.title}</td>
                      <td className="border border-slate-400 px-3 py-2">{getCategoryLabel(evt)}</td>
                      <td className="border border-slate-400 px-3 py-2">{evt.unit || 'Semua Unit'}</td>
                      <td className="border border-slate-400 px-3 py-2">{evt.notes || '—'}</td>
                    </tr>
                  ))}
                  {eventsForPrint.length === 0 && (
                    <tr>
                      <td colSpan={6} className="border border-slate-400 px-3 py-4 text-center text-slate-500 italic">
                        Tidak ada agenda kegiatan khusus untuk unit {selectedUnitFilter} pada tanggal / rentang terpilih ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Blok Tanda Tangan Pengesahan */}
            <div className="pt-6 grid grid-cols-2 text-center text-xs">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">Kepala Divisi Pendidikan</p>
                <div className="h-14" />
                <p className="font-bold underline">( Ust. Syahrul Gunawan, M.Pd )</p>
              </div>
              <div>
                <p>Padang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold">Ketua Pengurus Yayasan</p>
                <div className="h-14" />
                <p className="font-bold underline">( Ust. Buya Dar El-Iman )</p>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER (TAILGRIDS SOFT PASTEL SQUIRCLE STYLE) */}
        <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900 print:hidden">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Info className="h-4 w-4 text-emerald-600" />
            <span>Mendukung pemilihan rentang 2-klik, drag mouse, input field tanggal, & penanda warna agenda.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrintCalendar}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100/90 text-emerald-800 hover:bg-emerald-600 hover:text-white border border-emerald-300/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700 px-4 py-2 text-xs font-black transition-colors duration-200 shadow-2xs cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Kalender</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 px-5 py-2 text-xs font-bold transition-colors duration-200 shadow-2xs cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
