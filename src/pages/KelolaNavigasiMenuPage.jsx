import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Layers,
  Smartphone,
  Globe,
  Plus,
  Pencil,
  Trash2,
  Save,
  RotateCcw,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Link as LinkIcon,
  Shield,
  Palette,
  Eye,
  Check,
  X,
  Sliders,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  Menu,
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppTabs from '../components/app/AppTabs'
import { Button } from '../components/tailgrids/core/button'
import { useToast } from '../components/app'
import { adminNavigationService } from '../services/adminNavigationService'
import { resolveSidebarIcon } from '../hooks/useNavigation'

// Mapping bantuan icon Lucide ke icon MaterialCommunityIcons
const LUCIDE_TO_MATERIAL_MAP = {
  LayoutDashboard: 'view-dashboard-outline',
  Database: 'database-outline',
  BookOpen: 'book-open-page-variant',
  FileText: 'file-document-outline',
  Settings: 'cog-outline',
  CalendarCheck: 'calendar-check-outline',
  CalendarClock: 'calendar-clock',
  Calendar: 'calendar-month',
  CalendarDays: 'calendar-month-outline',
  Users: 'account-group-outline',
  User: 'account-outline',
  UserCheck: 'account-check-outline',
  Building2: 'office-building',
  ShieldCheck: 'shield-check-outline',
  CreditCard: 'cash-multiple',
  Award: 'chart-box-outline',
  Sparkles: 'clipboard-check-outline',
  MessageCircle: 'chat-processing-outline',
  Megaphone: 'bullhorn-outline',
  Laptop: 'laptop',
  FileQuestion: 'file-question',
  GraduationCap: 'school',
  HeartHandshake: 'hands-pray',
  ClipboardList: 'clipboard-text-outline',
  DoorOpen: 'door-open',
  Compass: 'google-classroom',
  HelpCircle: 'help-circle-outline',
  Clock: 'clock-time-four',
  CheckSquare: 'checkbox-marked-circle-outline',
  Receipt: 'receipt-outline',
  BookMarked: 'book-marker',
  BookHeart: 'heart-box-outline',
  Activity: 'pulse',
  Target: 'target',
  FileSpreadsheet: 'file-excel-outline',
  FileCheck2: 'check-decagram-outline',
  Home: 'home-account',
}

const MATERIAL_TO_LUCIDE_MAP = Object.fromEntries(
  Object.entries(LUCIDE_TO_MATERIAL_MAP).map(([luc, mat]) => [mat, luc])
)

const POPULAR_LUCIDE_ICONS = [
  'LayoutDashboard', 'BookOpen', 'Calendar', 'CalendarCheck', 'CalendarClock',
  'CalendarDays', 'Users', 'User', 'UserCheck', 'GraduationCap', 'Award',
  'Database', 'FileText', 'Settings', 'ClipboardList', 'MessageCircle',
  'Megaphone', 'Laptop', 'FileQuestion', 'Sparkles', 'ShieldCheck',
  'CreditCard', 'Receipt', 'Building2', 'HeartHandshake', 'DoorOpen',
  'Compass', 'Clock', 'CheckSquare', 'BookMarked', 'BookHeart',
  'Activity', 'Target', 'FileSpreadsheet', 'FileCheck2', 'Home',
  'Bell', 'Search', 'Filter', 'Folder', 'FolderOpen',
  'Layers', 'Mail', 'Phone', 'MapPin', 'BarChart2',
  'PieChart', 'LineChart', 'TrendingUp', 'Printer', 'Download',
  'Upload', 'Share2', 'Edit', 'Trash2', 'Plus',
  'Check', 'AlertTriangle', 'Info', 'HelpCircle', 'Key',
  'Lock', 'Globe', 'Smartphone', 'Monitor', 'Camera',
  'Image', 'Video', 'Music', 'Star', 'Heart',
]

const POPULAR_MATERIAL_ICONS = [
  { id: 'view-dashboard-outline', label: 'Dashboard Utama', lucide: 'LayoutDashboard' },
  { id: 'database-outline', label: 'Database / Data Pokok', lucide: 'Database' },
  { id: 'book-open-page-variant', label: 'Materi / Bahan Ajar', lucide: 'BookOpen' },
  { id: 'book-open-variant', label: 'Al-Qur\'an Digital', lucide: 'BookOpen' },
  { id: 'book-marker', label: 'Tahfizh Al-Qur\'an', lucide: 'BookMarked' },
  { id: 'book-multiple', label: 'Buku & Modul Ajar', lucide: 'BookOpen' },
  { id: 'notebook-edit-outline', label: 'Buku Penghubung', lucide: 'FileText' },
  { id: 'calendar-clock', label: 'Jadwal Pelajaran KBM', lucide: 'CalendarClock' },
  { id: 'clock-time-four', label: 'Waktu / Jam KBM', lucide: 'Clock' },
  { id: 'calendar-check-outline', label: 'Presensi KBM Kelas', lucide: 'CalendarCheck' },
  { id: 'account-check-outline', label: 'Presensi Siswa / Mandiri', lucide: 'UserCheck' },
  { id: 'account-check', label: 'Presensi Terverifikasi', lucide: 'UserCheck' },
  { id: 'calendar-month', label: 'Kalender', lucide: 'Calendar' },
  { id: 'calendar-month-outline', label: 'Kalender Akademik', lucide: 'CalendarDays' },
  { id: 'clipboard-text', label: 'Tugas LMS Santri', lucide: 'ClipboardList' },
  { id: 'clipboard-text-outline', label: 'Penugasan Belajar', lucide: 'ClipboardList' },
  { id: 'clipboard-check', label: 'Mutaba\'ah Yaumiyyah', lucide: 'Sparkles' },
  { id: 'clipboard-check-outline', label: 'Mutaba\'ah Amalan', lucide: 'Sparkles' },
  { id: 'chart-box', label: 'Nilai & Leger Siswa', lucide: 'Award' },
  { id: 'chart-box-outline', label: 'Penilaian & Rapor', lucide: 'Award' },
  { id: 'laptop', label: 'CBT Ujian Online', lucide: 'Laptop' },
  { id: 'file-question', label: 'Kisi-kisi Ujian', lucide: 'FileQuestion' },
  { id: 'cash-multiple', label: 'Tagihan SPP Siswa', lucide: 'CreditCard' },
  { id: 'chat-processing-outline', label: 'Chat Wali Murid / Guru', lucide: 'MessageCircle' },
  { id: 'message-text-outline', label: 'Pesan / Diskusi Guru', lucide: 'MessageCircle' },
  { id: 'bullhorn-outline', label: 'Informasi Sekolah', lucide: 'Megaphone' },
  { id: 'bullhorn', label: 'Pengumuman Resmi', lucide: 'Megaphone' },
  { id: 'door-open', label: 'Absensi Gerbang / Izin Santri', lucide: 'DoorOpen' },
  { id: 'hands-pray', label: 'Doa & Dzikir Harian', lucide: 'HeartHandshake' },
  { id: 'home-account', label: 'Asrama Boarding Ponpes', lucide: 'Home' },
  { id: 'school', label: 'Alumni & Kelulusan', lucide: 'GraduationCap' },
  { id: 'account-school-outline', label: 'Profil Santri / Alumni', lucide: 'GraduationCap' },
  { id: 'account-group', label: 'Rombongan Belajar Santri', lucide: 'Users' },
  { id: 'account-group-outline', label: 'Kelompok Siswa', lucide: 'Users' },
  { id: 'account-circle-outline', label: 'Profil Pengguna', lucide: 'User' },
  { id: 'cog-outline', label: 'Pengaturan Menu / Sistem', lucide: 'Settings' },
  { id: 'cog', label: 'Konfigurasi Aplikasi', lucide: 'Settings' },
  { id: 'file-document-edit-outline', label: 'Surat Izin Santri', lucide: 'FileText' },
  { id: 'google-classroom', label: 'Pantau Guru Mengajar', lucide: 'Compass' },
  { id: 'card-account-details-outline', label: 'Kartu Pelajar / Santri', lucide: 'CreditCard' },
  { id: 'check-decagram-outline', label: 'Mutaba\'ah & Prestasi', lucide: 'Award' },
]

function renderLucideIcon(iconName, className = 'h-5 w-5', fallback = Layers) {
  if (!iconName) return React.createElement(fallback, { className })
  const Component = LucideIcons[iconName] || LucideIcons[iconName.replace(/-/g, '')] || fallback
  return React.createElement(Component, { className })
}

function renderMaterialIconPreview(materialIconName, className = 'h-5 w-5') {
  const mappedLucide = MATERIAL_TO_LUCIDE_MAP[materialIconName] || 'HelpCircle'
  return renderLucideIcon(mappedLucide, className, Smartphone)
}

const COLOR_PRESETS = [
  { color: '#059669', bg: '#ECFDF5', label: 'Emerald' },
  { color: '#0D9488', bg: '#F0FDFA', label: 'Teal' },
  { color: '#0284C7', bg: '#F0F9FF', label: 'Sky' },
  { color: '#2563EB', bg: '#EFF6FF', label: 'Royal Blue' },
  { color: '#7C3AED', bg: '#F5F3FF', label: 'Violet' },
  { color: '#D97706', bg: '#FFFBEB', label: 'Amber' },
  { color: '#F97316', bg: '#FFF7ED', label: 'Orange' },
  { color: '#EF4444', bg: '#FEF2F2', label: 'Rose' },
  { color: '#E11D48', bg: '#FFF1F2', label: 'Crimson' },
  { color: '#64748B', bg: '#F1F5F9', label: 'Slate' },
]

export default function KelolaNavigasiMenuPage() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [activePlatformTab, setActivePlatformTab] = useState('web')
  const [selectedMobileRole, setSelectedMobileRole] = useState('student')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null) // null = create, object = edit
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null)
  const [syncConfirmOpen, setSyncConfirmOpen] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [iconPickerModal, setIconPickerModal] = useState(null) // 'web' | 'mobile' | null
  const [iconSearchQuery, setIconSearchQuery] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    module_id: 'dashboard',
    name: '',
    name_mobile: '',
    sync_names: true,
    path: '',
    icon: 'LayoutDashboard',
    icon_mobile: 'view-dashboard-outline',
    platform: 'web',
    target_roles: ['student', 'parent', 'teacher'],
    required_permissions: [],
    metadata: {
      color: '#059669',
      bg: '#ECFDF5',
      badge: '',
      tab: '',
    },
    is_active: true,
  })

  // Fetch Navigation Data
  const { data: navData, isLoading, refetch } = useQuery({
    queryKey: ['admin-navigation-data'],
    queryFn: () => adminNavigationService.getNavigationData(),
  })

  const modules = navData?.modules || []
  const canonicalRoles = navData?.registries?.canonical_roles || [
    { id: 'student', label: 'Siswa / Santri' },
    { id: 'parent', label: 'Orang Tua / Wali Murid' },
    { id: 'teacher', label: 'Guru / Pengajar' },
    { id: 'principal', label: 'Kepala Sekolah' },
    { id: 'tu', 'label': 'Tata Usaha / Operator' },
    { id: 'foundation', label: 'Pengurus Yayasan / Pimpinan' },
    { id: 'musyrif', label: 'Musyrif / Pembimbing Asrama' },
    { id: 'alumni', label: 'Alumni' },
  ]
  const availablePermissions = navData?.permissions || []
  const mobileScreens = navData?.registries?.mobile_screens || []
  const webRoutes = navData?.registries?.web_routes || []
  const allLucideIcons = useMemo(() => {
    const fromApi = navData?.registries?.lucide_icons || []
    return Array.from(new Set([...fromApi, ...POPULAR_LUCIDE_ICONS]))
  }, [navData?.registries?.lucide_icons])

  const allMaterialIcons = useMemo(() => {
    const fromApi = navData?.registries?.material_icons || []
    const mappedApi = fromApi.map((id) => ({
      id,
      label: id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      lucide: MATERIAL_TO_LUCIDE_MAP[id] || 'Circle',
    }))
    const existingIds = new Set(mappedApi.map((x) => x.id))
    const extra = POPULAR_MATERIAL_ICONS.filter((x) => !existingIds.has(x.id))
    return [...mappedApi, ...extra]
  }, [navData?.registries?.material_icons])

  const filteredLucideIcons = useMemo(() => {
    if (!iconSearchQuery.trim()) return allLucideIcons
    const q = iconSearchQuery.toLowerCase()
    return allLucideIcons.filter((ic) => ic.toLowerCase().includes(q))
  }, [allLucideIcons, iconSearchQuery])

  const filteredMaterialIcons = useMemo(() => {
    if (!iconSearchQuery.trim()) return allMaterialIcons
    const q = iconSearchQuery.toLowerCase()
    return allMaterialIcons.filter(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        (item.lucide && item.lucide.toLowerCase().includes(q))
    )
  }, [allMaterialIcons, iconSearchQuery])

  // Flattened Menus for Current Platform
  const currentMenus = useMemo(() => {
    const list = []
    modules.forEach((mod) => {
      ;(mod.menus || []).forEach((menu) => {
        if (activePlatformTab === 'web') {
          if (menu.platform === 'web' || menu.platform === 'both') {
            list.push({ ...menu, module_name: mod.name })
          }
        } else {
          if (menu.platform === 'mobile' || menu.platform === 'both') {
            const roles = menu.target_roles || []
            const matchesRole = roles.length === 0 || roles.includes(selectedMobileRole)
            if (matchesRole) {
              list.push({ ...menu, module_name: mod.name })
            }
          }
        }
      })
    })

    if (!searchQuery.trim()) return list
    const q = searchQuery.toLowerCase()
    return list.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.name_mobile?.toLowerCase().includes(q) ||
        m.path?.toLowerCase().includes(q) ||
        m.id?.toLowerCase().includes(q)
    )
  }, [modules, activePlatformTab, selectedMobileRole, searchQuery])

  // Open Form Modal
  const handleOpenCreate = () => {
    const defaultModule = modules[0]?.id || 'dashboard'
    setEditingItem(null)
    setFormData({
      id: `menu-${Date.now().toString().slice(-6)}`,
      module_id: defaultModule,
      name: '',
      name_mobile: '',
      sync_names: true,
      path: activePlatformTab === 'web' ? '/dashboard' : 'Jadwal',
      icon: 'LayoutDashboard',
      icon_mobile: 'view-dashboard-outline',
      platform: activePlatformTab === 'web' ? 'web' : 'mobile',
      target_roles: activePlatformTab === 'mobile' ? [selectedMobileRole] : [],
      required_permissions: [],
      metadata: {
        color: '#059669',
        bg: '#ECFDF5',
        badge: '',
        tab: '',
      },
      is_active: true,
    })
    setIsFormModalOpen(true)
  }

  const handleOpenEdit = (menu) => {
    setEditingItem(menu)
    const isSameName = (menu.name_mobile || menu.name) === menu.name
    setFormData({
      id: menu.id,
      module_id: menu.module_id,
      name: menu.name || '',
      name_mobile: menu.name_mobile || menu.name || '',
      sync_names: isSameName,
      path: menu.path || '',
      icon: menu.icon || 'LayoutDashboard',
      icon_mobile: menu.icon_mobile || LUCIDE_TO_MATERIAL_MAP[menu.icon] || 'circle-outline',
      platform: menu.platform || 'both',
      target_roles: Array.isArray(menu.target_roles) ? menu.target_roles : [],
      required_permissions: Array.isArray(menu.required_permissions) ? menu.required_permissions : [],
      metadata: {
        color: menu.metadata?.color || '#059669',
        bg: menu.metadata?.bg || '#ECFDF5',
        badge: menu.metadata?.badge || '',
        tab: menu.metadata?.tab || '',
      },
      is_active: menu.is_active !== false,
    })
    setIsFormModalOpen(true)
  }

  // Auto-Match Icon Handler
  const handleAutoMatchIcon = () => {
    const matched = LUCIDE_TO_MATERIAL_MAP[formData.icon]
    if (matched) {
      setFormData((prev) => ({ ...prev, icon_mobile: matched }))
      addToast({
        title: 'Ikon Disesuaikan',
        message: `Ikon mobile otomatis diselaraskan ke "${matched}".`,
        type: 'success',
      })
    } else {
      addToast({
        title: 'Ikon Khusus',
        message: 'Tidak ditemukan padanan langsung, silakan pilih ikon mobile secara manual.',
        type: 'info',
      })
    }
  }

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingItem) {
        return await adminNavigationService.updateMenu(editingItem.id, payload)
      }
      return await adminNavigationService.createMenu(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-navigation-data'])
      setIsFormModalOpen(false)
      addToast({
        title: 'Berhasil Disimpan',
        message: `Menu navigasi berhasil ${editingItem ? 'diperbarui' : 'ditambahkan'}.`,
        type: 'success',
      })
    },
    onError: (err) => {
      addToast({
        title: 'Gagal Menyimpan',
        message: err.response?.data?.message || err.message,
        type: 'error',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await adminNavigationService.deleteMenu(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-navigation-data'])
      setDeleteConfirmTarget(null)
      addToast({
        title: 'Menu Dihapus',
        message: 'Menu navigasi berhasil dihapus dari sistem.',
        type: 'success',
      })
    },
    onError: (err) => {
      addToast({
        title: 'Gagal Menghapus',
        message: err.response?.data?.message || err.message,
        type: 'error',
      })
    },
  })

  const syncMutation = useMutation({
    mutationFn: async () => {
      return await adminNavigationService.syncMobileConfig()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-navigation-data'])
      setSyncConfirmOpen(false)
      addToast({
        title: 'Sinkronisasi Berhasil',
        message: 'Seluruh susunan menu mobile berhasil dipublikasikan ke perangkat Android.',
        type: 'success',
      })
    },
    onError: (err) => {
      addToast({
        title: 'Gagal Sinkronisasi',
        message: err.response?.data?.message || err.message,
        type: 'error',
      })
    },
  })

  const resetMutation = useMutation({
    mutationFn: async () => {
      return await adminNavigationService.resetDefaults()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-navigation-data'])
      setResetConfirmOpen(false)
      addToast({
        title: 'Menu Default Dipulihkan',
        message: 'Menu bawaan Web dan Mobile berhasil dikembalikan ke standar awal.',
        type: 'success',
      })
    },
    onError: (err) => {
      addToast({
        title: 'Gagal Mereset',
        message: err.response?.data?.message || err.message,
        type: 'error',
      })
    },
  })

  const handleToggleActive = async (menu) => {
    try {
      await adminNavigationService.updateMenu(menu.id, { is_active: !menu.is_active })
      queryClient.invalidateQueries(['admin-navigation-data'])
      addToast({
        title: menu.is_active ? 'Menu Dinonaktifkan' : 'Menu Diaktifkan',
        message: `Status menu "${menu.name}" berhasil diubah.`,
        type: 'success',
      })
    } catch (e) {
      addToast({ title: 'Gagal Mengubah Status', message: e.message, type: 'error' })
    }
  }

  const handleMoveOrder = async (menu, direction) => {
    const list = [...currentMenus]
    const idx = list.findIndex((m) => m.id === menu.id)
    if (idx < 0) return
    const targetIdx = idx + direction
    if (targetIdx < 0 || targetIdx >= list.length) return

    const currentItem = list[idx]
    const targetItem = list[targetIdx]

    const newCurrentOrder = targetItem.sort_order
    const newTargetOrder = currentItem.sort_order

    try {
      await adminNavigationService.reorder('menus', [
        { id: currentItem.id, sort_order: newCurrentOrder },
        { id: targetItem.id, sort_order: newTargetOrder },
      ])
      queryClient.invalidateQueries(['admin-navigation-data'])
    } catch (e) {
      addToast({ title: 'Gagal Mengubah Urutan', message: e.message, type: 'error' })
    }
  }

  const handleSubmitForm = (e) => {
    e.preventDefault()
    const payload = {
      ...formData,
      name_mobile: formData.sync_names ? formData.name : formData.name_mobile,
    }
    saveMutation.mutate(payload)
  }

  const platformTabs = [
    { id: 'web', label: '1. Menu Web Dashboard', icon: Globe },
    { id: 'mobile', label: '2. Menu Mobile App (Android)', icon: Smartphone },
  ]

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <AppBreadcrumb pageTitle="Manajemen Menu & Navigasi" />

      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20">
              <Menu className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Pusat Manajemen Navigasi & Menu Terpadu
                </h1>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  Web & Mobile
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                Atur label, ikon Lucide/Material, urutan tampil, dan pembatasan role akses untuk Web-Dashboard dan Mobile-App secara real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              onClick={() => setResetConfirmOpen(true)}
              className="rounded-xl border border-slate-300 bg-white/80 dark:border-slate-700 dark:bg-slate-800"
            >
              <RotateCcw className="h-4 w-4 text-slate-600 dark:text-slate-300 mr-1.5" /> Pulihkan Default
            </Button>
            {activePlatformTab === 'mobile' && (
              <Button
                variant="primary"
                onClick={() => setSyncConfirmOpen(true)}
                className="rounded-xl"
              >
                <RefreshCw className="h-4 w-4 mr-1.5" /> Publikasikan ke Mobile
              </Button>
            )}
            <Button variant="primary" onClick={handleOpenCreate} className="rounded-xl">
              <Plus className="h-4 w-4 mr-1.5" /> Tambah Menu Baru
            </Button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md dark:border-emerald-600/35 dark:bg-[#1B2433]">
        {/* Navigation Tabs (Web vs Mobile) */}
        <nav className="flex overflow-x-auto no-scrollbar border-b border-emerald-200/80 bg-emerald-50/40 p-3 dark:border-emerald-800/60 dark:bg-[#13221f]/50">
          <AppTabs
            tabs={platformTabs}
            activeTab={activePlatformTab}
            onChange={setActivePlatformTab}
            ariaLabel="Navigasi Platform Menu"
          />
        </nav>

        {/* Filter & Toolbar Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-[#15212d]">
          {/* Mobile Role Switcher (Only visible in mobile tab) */}
          {activePlatformTab === 'mobile' ? (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-xs font-bold text-slate-500 mr-1 whitespace-nowrap">Target Peran:</span>
              {canonicalRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedMobileRole(role.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                    selectedMobileRole === role.id
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Total {currentMenus.length} Menu Sidebar Web
              </span>
            </div>
          )}

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama menu / rute..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Datatable / Grid of Menus */}
        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-xs font-bold">Memuat daftar menu navigasi...</p>
            </div>
          ) : currentMenus.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
              <Menu className="h-10 w-10 text-slate-300 mb-2" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Tidak ada menu yang sesuai</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Silakan ubah kata kunci pencarian atau klik tombol "Tambah Menu Baru" di atas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-emerald-100 dark:border-slate-800">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 text-slate-700 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:text-slate-200 border-b-2 border-emerald-200/90">
                    <th className="py-3 px-4 font-black">Urutan</th>
                    <th className="py-3 px-4 font-black">Ikon & Label Web</th>
                    <th className="py-3 px-4 font-black">Ikon & Label Mobile</th>
                    <th className="py-3 px-4 font-black">Tujuan Rute / Screen</th>
                    <th className="py-3 px-4 font-black">Hak Akses / Role</th>
                    <th className="py-3 px-4 font-black text-center">Status</th>
                    <th className="py-3 px-4 font-black text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/80 dark:divide-slate-800 bg-white dark:bg-[#1B2433]">
                  {currentMenus.map((menu, index) => {
                    const LucideIconComp = resolveSidebarIcon(menu.icon)
                    return (
                      <tr
                        key={menu.id}
                        className={`transition hover:bg-emerald-50/30 dark:hover:bg-slate-800/40 ${
                          !menu.is_active ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/30' : ''
                        }`}
                      >
                        {/* Sort Controls */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="font-extrabold text-slate-500 w-5 text-center">
                              #{menu.sort_order}
                            </span>
                            <div className="flex flex-col">
                              <button
                                onClick={() => handleMoveOrder(menu, -1)}
                                disabled={index === 0}
                                className="p-0.5 text-slate-400 hover:text-emerald-600 disabled:opacity-20"
                                title="Naikkan urutan"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleMoveOrder(menu, 1)}
                                disabled={index === currentMenus.length - 1}
                                className="p-0.5 text-slate-400 hover:text-emerald-600 disabled:opacity-20"
                                title="Turunkan urutan"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Web Label & Icon */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                              {renderLucideIcon(menu.icon, 'h-4 w-4 text-emerald-600 dark:text-emerald-400')}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {menu.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                icon: {menu.icon}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Mobile Label & Icon */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="grid h-8 w-8 place-items-center rounded-xl text-white font-bold text-xs shadow-xs"
                              style={{
                                backgroundColor: menu.metadata?.color || '#059669',
                              }}
                            >
                              {renderMaterialIconPreview(menu.icon_mobile, 'h-4 w-4 text-white')}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {menu.name_mobile || menu.name}
                                </span>
                                {(menu.name_mobile || menu.name) === menu.name && (
                                  <span className="rounded bg-slate-100 px-1 py-0.2 text-[9px] font-semibold text-slate-500 dark:bg-slate-800">
                                    Sama
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                                {menu.icon_mobile || 'auto'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Path / Route */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {menu.path}
                          </span>
                        </td>

                        {/* Permissions & Roles */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {menu.target_roles && menu.target_roles.length > 0 ? (
                              menu.target_roles.slice(0, 3).map((r) => (
                                <span
                                  key={r}
                                  className="rounded bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 px-1.5 py-0.5 text-[10px] font-semibold"
                                >
                                  {r}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-400">Semua Role</span>
                            )}
                            {menu.target_roles && menu.target_roles.length > 3 && (
                              <span className="text-[10px] text-slate-400 font-bold">
                                +{menu.target_roles.length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Active Toggle */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(menu)}
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold transition ${
                              menu.is_active
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                            }`}
                          >
                            {menu.is_active ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(menu)}
                              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                              title="Ubah Menu"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmTarget(menu)}
                              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-rose-950/40"
                              title="Hapus Menu"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          MODAL FORM TAMBAH / UBAH MENU (Terpadu Web & Mobile)
      ======================================================== */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#1B2433] max-h-[90vh] flex flex-col"
            >
              {/* Header Accent Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

              <div className="p-6 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-700/20">
                      <Menu className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {editingItem ? 'Ubah Menu Navigasi' : 'Tambah Menu Navigasi Baru'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Sesuaikan label, ikon web/mobile, dan batasan hak akses role.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFormModalOpen(false)}
                    className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitForm} className="space-y-4 pt-1">
                  {/* Platform Picker */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
                      Platform Target Menu:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'web', label: 'Web Saja', icon: Globe },
                        { id: 'mobile', label: 'Mobile Saja', icon: Smartphone },
                        { id: 'both', label: 'Keduanya (Both)', icon: Layers },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, platform: p.id })}
                          className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition ${
                            formData.platform === p.id
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                          }`}
                        >
                          <p.icon className="h-4 w-4" /> {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Module Parent */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                      Modul Induk (Parent Module):
                    </label>
                    <select
                      value={formData.module_id}
                      onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none transition focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                      {modules.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.platform})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Name Sync Box */}
                  <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sliders className="h-4 w-4 text-emerald-600" />
                        Label / Nama Menu
                      </span>
                      <label className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.sync_names}
                          onChange={(e) => {
                            const checked = e.target.checked
                            setFormData((prev) => ({
                              ...prev,
                              sync_names: checked,
                              name_mobile: checked ? prev.name : prev.name_mobile,
                            }))
                          }}
                          className="h-4 w-4 accent-emerald-600 cursor-pointer"
                        />
                        Samakan Nama untuk Web & Mobile
                      </label>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                          Nama di Web Dashboard:
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => {
                            const val = e.target.value
                            setFormData((prev) => ({
                              ...prev,
                              name: val,
                              name_mobile: prev.sync_names ? val : prev.name_mobile,
                            }))
                          }}
                          placeholder="Contoh: Jadwal Pelajaran"
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none transition focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                          Nama di Mobile App:
                        </label>
                        <input
                          type="text"
                          required
                          disabled={formData.sync_names}
                          value={formData.sync_names ? formData.name : formData.name_mobile}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, name_mobile: e.target.value }))
                          }
                          placeholder="Contoh: Jadwal KBM"
                          className={`h-10 w-full rounded-xl border px-3 text-xs text-slate-800 outline-none transition ${
                            formData.sync_names
                              ? 'bg-slate-100 opacity-70 border-slate-200 dark:bg-slate-800'
                              : 'bg-white border-slate-200 focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Visual Icon Selection Box */}
                  <div className="rounded-2xl border border-slate-200 p-3.5 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Palette className="h-4 w-4 text-emerald-600" />
                        Pilihan Gambar Ikon (Web Lucide & Mobile Material)
                      </span>
                      <button
                        type="button"
                        onClick={handleAutoMatchIcon}
                        className="inline-flex items-center gap-1 rounded-xl bg-teal-100 px-2.5 py-1 text-[11px] font-bold text-teal-800 hover:bg-teal-200 dark:bg-teal-950/80 dark:text-teal-300 transition shadow-xs cursor-pointer"
                        title="Cocokkan Ikon Mobile otomatis dari Ikon Web"
                      >
                        <Sparkles className="h-3 w-3" /> Cocokkan Otomatis
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {/* Web Icon Visual Card */}
                      <div
                        onClick={() => {
                          setIconSearchQuery('')
                          setIconPickerModal('web')
                        }}
                        className="group relative flex items-center gap-3.5 rounded-2xl border-2 border-emerald-200 bg-white p-3 transition-all hover:border-emerald-500 hover:shadow-md cursor-pointer dark:border-emerald-800/80 dark:bg-[#1B2433]"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
                          {renderLucideIcon(formData.icon, 'h-6 w-6 text-white')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Ikon Web (Lucide)
                          </span>
                          <div className="truncate text-xs font-black text-slate-900 dark:text-white">
                            {formData.icon || 'Belum dipilih'}
                          </div>
                          <span className="inline-block text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 underline underline-offset-2">
                            Pilih / Ganti Gambar Ikon ➜
                          </span>
                        </div>
                      </div>

                      {/* Mobile Icon Visual Card */}
                      <div
                        onClick={() => {
                          setIconSearchQuery('')
                          setIconPickerModal('mobile')
                        }}
                        className="group relative flex items-center gap-3.5 rounded-2xl border-2 border-violet-200 bg-white p-3 transition-all hover:border-violet-500 hover:shadow-md cursor-pointer dark:border-violet-800/80 dark:bg-[#1B2433]"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/20 group-hover:scale-105 transition">
                          {renderMaterialIconPreview(formData.icon_mobile, 'h-6 w-6 text-white')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                            Ikon Mobile (Material)
                          </span>
                          <div className="truncate text-xs font-black text-slate-900 dark:text-white font-mono">
                            {formData.icon_mobile || 'Belum dipilih'}
                          </div>
                          <span className="inline-block text-[10px] font-semibold text-violet-700 dark:text-violet-300 underline underline-offset-2">
                            Pilih / Ganti Gambar Ikon ➜
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Route / Screen Target */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                        Rute Web / Layar Mobile:
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.path}
                        onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                        placeholder="Contoh: /dashboard/master/siswa atau Jadwal"
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none transition focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                        Preset Warna Mobile:
                      </label>
                      <div className="flex items-center gap-1.5 pt-1.5 overflow-x-auto no-scrollbar">
                        {COLOR_PRESETS.map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                metadata: { ...formData.metadata, color: p.color, bg: p.bg },
                              })
                            }
                            style={{ backgroundColor: p.color }}
                            className={`h-7 w-7 rounded-full shrink-0 transition ${
                              formData.metadata?.color === p.color
                                ? 'ring-2 ring-emerald-600 ring-offset-2'
                                : ''
                            }`}
                            title={p.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Target Roles (Multi-select Checkboxes) */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
                      Target Role Pengguna (Akses Mobile & Web):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {canonicalRoles.map((r) => {
                        const checked = formData.target_roles.includes(r.id)
                        return (
                          <label
                            key={r.id}
                            className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-semibold cursor-pointer transition ${
                              checked
                                ? 'border-emerald-300 bg-emerald-50/60 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                                : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    target_roles: [...formData.target_roles, r.id],
                                  })
                                } else {
                                  setFormData({
                                    ...formData,
                                    target_roles: formData.target_roles.filter((x) => x !== r.id),
                                  })
                                }
                              }}
                              className="h-3.5 w-3.5 accent-emerald-600 rounded"
                            />
                            <span className="truncate">{r.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Footer Submit Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsFormModalOpen(false)}
                      className="rounded-xl"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      pending={saveMutation.isPending}
                      className="rounded-xl"
                    >
                      <Save className="h-4 w-4 mr-1.5" /> Simpan Menu
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          HARMONIZED DELETE CONFIRMATION MODAL
      ======================================================== */}
      <AnimatePresence>
        {deleteConfirmTarget && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-rose-950/20 dark:border-slate-800 dark:bg-[#1B2433]"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-700" />
              <div className="p-6">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white shadow-md shadow-rose-500/30">
                    <Trash2 className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="inline-block rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                      Hapus Menu
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      Hapus "{deleteConfirmTarget.name}"?
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Menu ini akan dihapus dari navigasi sistem ({deleteConfirmTarget.platform}). Tindakan ini dapat dipulihkan dengan mereset ke menu default.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setDeleteConfirmTarget(null)}
                    className="rounded-xl"
                  >
                    Batal
                  </Button>
                  <Button
                    variant="danger"
                    pending={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(deleteConfirmTarget.id)}
                    className="rounded-xl"
                  >
                    Ya, Hapus Menu
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          HARMONIZED SYNC TO MOBILE CONFIRMATION MODAL
      ======================================================== */}
      <AnimatePresence>
        {syncConfirmOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#1B2433]"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
              <div className="p-6">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/30">
                    <RefreshCw className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Sinkronisasi Mobile
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      Publikasikan ke Aplikasi Mobile?
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Seluruh perubahan susunan menu mobile akan langsung disinkronkan ke server konfigurasi Android tanpa perlu rilis APK baru di Play Store.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" onClick={() => setSyncConfirmOpen(false)} className="rounded-xl">
                    Batal
                  </Button>
                  <Button
                    variant="primary"
                    pending={syncMutation.isPending}
                    onClick={() => syncMutation.mutate()}
                    className="rounded-xl"
                  >
                    Ya, Publikasikan Sekarang
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          HARMONIZED RESET DEFAULTS CONFIRMATION MODAL
      ======================================================== */}
      <AnimatePresence>
        {resetConfirmOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-amber-950/20 dark:border-slate-800 dark:bg-[#1B2433]"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600" />
              <div className="p-6">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-white shadow-md shadow-amber-500/30">
                    <RotateCcw className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      Reset Default
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      Pulihkan Susunan Menu Bawaan?
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Tindakan ini akan mengembalikan seluruh susunan menu Web Dashboard dan Mobile App (Siswa, Orang Tua, Guru, TU, dll) ke konfigurasi standar awal sistem.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" onClick={() => setResetConfirmOpen(false)} className="rounded-xl">
                    Batal
                  </Button>
                  <Button
                    variant="primary"
                    pending={resetMutation.isPending}
                    onClick={() => resetMutation.mutate()}
                    className="rounded-xl bg-amber-600 hover:bg-amber-700"
                  >
                    Ya, Pulihkan Default
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Modal Visual Icon Gallery Picker */}
      <AnimatePresence>
        {iconPickerModal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIconPickerModal(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#1B2433] dark:border dark:border-slate-800 flex flex-col"
            >
              {/* Top Accent Gradient */}
              <div
                className={`h-1.5 w-full bg-gradient-to-r ${
                  iconPickerModal === 'web'
                    ? 'from-emerald-500 via-teal-400 to-emerald-600'
                    : 'from-violet-500 via-purple-400 to-violet-600'
                }`}
              />

              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-md ${
                      iconPickerModal === 'web'
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-emerald-500/20'
                        : 'bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-violet-500/20'
                    }`}
                  >
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {iconPickerModal === 'web'
                        ? 'Pilih Gambar Ikon Web (Lucide)'
                        : 'Pilih Gambar Ikon Mobile (Material)'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Klik langsung pada gambar ikon di bawah ini untuk memilihnya.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIconPickerModal(null)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search Bar & Stats */}
              <div className="border-b border-slate-100 p-3 sm:p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={
                      iconPickerModal === 'web'
                        ? 'Cari nama ikon Lucide (misal: book, calendar, user, settings)...'
                        : 'Cari nama ikon Mobile (misal: dashboard, account, clock, cbt)...'
                    }
                    value={iconSearchQuery}
                    onChange={(e) => setIconSearchQuery(e.target.value)}
                    autoFocus
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-xs text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  {iconSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setIconSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <span className="shrink-0 rounded-xl bg-slate-200/70 px-2.5 py-2 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {iconPickerModal === 'web'
                    ? `${filteredLucideIcons.length} Ikon`
                    : `${filteredMaterialIcons.length} Ikon`}
                </span>
              </div>

              {/* Scrollable Grid of Visual Icons */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 max-h-[50vh]">
                {(iconPickerModal === 'web' ? filteredLucideIcons : filteredMaterialIcons).length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
                    <Search className="h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-xs font-bold">Tidak ada ikon yang sesuai pencarian</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Coba cari dengan kata kunci bahasa Inggris umum seperti: user, book, star, card.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {iconPickerModal === 'web'
                      ? filteredLucideIcons.map((ic) => {
                          const isSelected = formData.icon === ic
                          return (
                            <button
                              key={ic}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, icon: ic }))
                                setIconPickerModal(null)
                              }}
                              className={`group relative flex flex-col items-center justify-center gap-2 rounded-2xl border p-3.5 transition-all text-center cursor-pointer ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-50/80 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/30 dark:border-emerald-500 dark:bg-emerald-950/50'
                                  : 'border-slate-200/90 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 hover:scale-[1.02] dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-emerald-700/60'
                              }`}
                            >
                              <div
                                className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-700 group-hover:scale-110 group-hover:bg-emerald-100 group-hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-emerald-950 dark:group-hover:text-emerald-300'
                                }`}
                              >
                                {renderLucideIcon(ic, 'h-6 w-6')}
                              </div>
                              <span
                                className="w-full truncate text-[11px] font-bold text-slate-800 dark:text-slate-200"
                                title={ic}
                              >
                                {ic}
                              </span>
                              {isSelected && (
                                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white">
                                  <Check className="h-2.5 w-2.5" />
                                </span>
                              )}
                            </button>
                          )
                        })
                      : filteredMaterialIcons.map((item) => {
                          const isSelected = formData.icon_mobile === item.id
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, icon_mobile: item.id }))
                                setIconPickerModal(null)
                              }}
                              className={`group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 transition-all text-center cursor-pointer ${
                                isSelected
                                  ? 'border-violet-500 bg-violet-50/80 shadow-md shadow-violet-500/10 ring-2 ring-violet-500/30 dark:border-violet-500 dark:bg-violet-950/50'
                                  : 'border-slate-200/90 bg-white hover:border-violet-300 hover:bg-violet-50/30 hover:scale-[1.02] dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-violet-700/60'
                              }`}
                            >
                              <div
                                className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                                  isSelected
                                    ? 'bg-violet-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-700 group-hover:scale-110 group-hover:bg-violet-100 group-hover:text-violet-700 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-violet-950 dark:group-hover:text-violet-300'
                                }`}
                              >
                                {renderMaterialIconPreview(item.id, 'h-6 w-6')}
                              </div>
                              <span
                                className="w-full truncate text-[11px] font-bold text-slate-800 dark:text-slate-200"
                                title={item.label}
                              >
                                {item.label}
                              </span>
                              <span
                                className="w-full truncate text-[9px] font-mono text-slate-400 dark:text-slate-500"
                                title={item.id}
                              >
                                {item.id}
                              </span>
                              {isSelected && (
                                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-white">
                                  <Check className="h-2.5 w-2.5" />
                                </span>
                              )}
                            </button>
                          )
                        })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-xs text-slate-500">
                  Ikon aktif:{' '}
                  <strong className="text-slate-800 dark:text-white font-mono">
                    {iconPickerModal === 'web' ? formData.icon : formData.icon_mobile}
                  </strong>
                </span>
                <Button
                  variant="ghost"
                  onClick={() => setIconPickerModal(null)}
                  className="rounded-xl"
                >
                  Tutup
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
