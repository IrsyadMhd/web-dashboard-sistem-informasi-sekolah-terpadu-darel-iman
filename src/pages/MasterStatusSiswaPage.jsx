import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Tag,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Pencil,
  Trash2,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Palette,
  ArrowUpDown,
  FileText,
  X,
  Layers,
  Info,
} from 'lucide-react'
import { studentStatusService } from '../services/studentStatusService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { useAuthStore } from '../stores/authStore'
import { hasRoleLevel, ROLE_LEVELS } from '../auth/portalResolver'
import { useDebounce } from '../hooks/useDebounce'
import { cn } from '../lib/utils'

// Color map for badge preview and styling
const BADGE_COLOR_MAP = {
  emerald: {
    label: 'Hijau Zamrud (Emerald)',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  blue: {
    label: 'Biru (Blue)',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  amber: {
    label: 'Kuning Jingga (Amber)',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  rose: {
    label: 'Merah (Rose)',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    dot: 'bg-rose-500',
  },
  purple: {
    label: 'Ungu (Purple)',
    badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    dot: 'bg-purple-500',
  },
  cyan: {
    label: 'Sian (Cyan)',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800',
    dot: 'bg-cyan-500',
  },
  slate: {
    label: 'Abu-abu (Slate)',
    badge: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-500',
  },
}

export default function MasterStatusSiswaPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  // Validasi role level angka: Level 1 (Super Admin), Level 2 (Admin), Level 3 (Operator)
  // Menolak bila tingkat privilege > 3
  const canManage = hasRoleLevel(user, ROLE_LEVELS.OPERATOR) // level <= 3

  // Search & Filter
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)
  const [filterActive, setFilterActive] = useState('all') // 'all' | 'active' | 'inactive'

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    badge_color: 'emerald',
    order: 0,
    is_active: true,
    description: '',
  })
  const [formErrors, setFormErrors] = useState({})

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Query Data
  const { data: responseData, isLoading, refetch } = useQuery({
    queryKey: ['student-statuses'],
    queryFn: () => studentStatusService.getAll(),
  })

  const rawList = useMemo(() => {
    const d = responseData?.data || responseData || []
    return Array.isArray(d) ? d : []
  }, [responseData])

  // Filtered List
  const filteredList = useMemo(() => {
    return rawList.filter((item) => {
      const q = debouncedSearch.toLowerCase().trim()
      const matchSearch =
        !q ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.code && item.code.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))

      const matchActive =
        filterActive === 'all' ||
        (filterActive === 'active' && item.is_active) ||
        (filterActive === 'inactive' && !item.is_active)

      return matchSearch && matchActive
    })
  }, [rawList, debouncedSearch, filterActive])

  // KPIs
  const stats = useMemo(() => {
    const total = rawList.length
    const active = rawList.filter((i) => i.is_active).length
    const inactive = total - active
    return { total, active, inactive }
  }, [rawList])

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload) => studentStatusService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-statuses'] })
      queryClient.invalidateQueries({ queryKey: ['student-statuses-dropdown'] })
      setIsFormOpen(false)
      resetForm()
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Gagal menyimpan status'
      setFormErrors({ submit: msg })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => studentStatusService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-statuses'] })
      queryClient.invalidateQueries({ queryKey: ['student-statuses-dropdown'] })
      setIsFormOpen(false)
      resetForm()
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Gagal memperbarui status'
      setFormErrors({ submit: msg })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => studentStatusService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-statuses'] })
      queryClient.invalidateQueries({ queryKey: ['student-statuses-dropdown'] })
      setDeleteTarget(null)
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Gagal menghapus status'
      alert(msg)
    },
  })

  const resetForm = () => {
    setEditingItem(null)
    setFormData({
      code: '',
      name: '',
      badge_color: 'emerald',
      order: rawList.length + 1,
      is_active: true,
      description: '',
    })
    setFormErrors({})
  }

  const handleOpenAdd = () => {
    resetForm()
    setFormData((prev) => ({ ...prev, order: (rawList.length || 0) + 1 }))
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setFormData({
      code: item.code || '',
      name: item.name || '',
      badge_color: item.badge_color || 'emerald',
      order: item.order ?? 0,
      is_active: !!item.is_active,
      description: item.description || '',
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errors = {}

    if (!formData.code.trim()) {
      errors.code = 'Kode status wajib diisi'
    } else if (!/^[a-z0-9_-]+$/i.test(formData.code.trim())) {
      errors.code = 'Kode hanya boleh berupa huruf, angka, tanda strip, atau garis bawah'
    }

    if (!formData.name.trim()) {
      errors.name = 'Nama status wajib diisi'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const payload = {
      code: formData.code.trim().toLowerCase(),
      name: formData.name.trim(),
      badge_color: formData.badge_color,
      order: Number(formData.order) || 0,
      is_active: !!formData.is_active,
      description: formData.description?.trim() || null,
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <PageContainer>
      {/* Breadcrumb Navigation */}
      <AppBreadcrumb
        items={[
          { label: 'Master Data', href: '/dashboard' },
          { label: 'Status Siswa', active: true },
        ]}
      />

      {/* Modern Hero Header Banner */}
      <div className="relative mt-3 overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 shadow-md shadow-emerald-500/10 sm:p-6 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-400/20 via-teal-400/20 to-transparent blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-500/30">
              <Tag className="h-7 w-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/15 px-3 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                <Sparkles className="h-3 w-3" />
                <span>Single Source of Truth Database</span>
              </div>
              <h1 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl dark:text-white">
                Master Status Siswa
              </h1>
              <p className="text-xs font-medium text-slate-600 sm:text-sm dark:text-slate-300">
                Konfigurasi dinamis status peserta didik untuk integrasi penerimaan, mutasi, kelulusan, dan rapor.
              </p>
            </div>
          </div>

          {canManage && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition-all hover:from-emerald-700 hover:to-teal-700 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Status Siswa</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Status */}
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-300/70 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white p-5 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Total Status
            </span>
            <div className="rounded-xl bg-emerald-500/15 p-2 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.total}
            </span>
            <span className="text-xs text-slate-500">opsi status</span>
          </div>
        </div>

        {/* Status Aktif */}
        <div className="group relative overflow-hidden rounded-2xl border border-teal-300/70 bg-gradient-to-br from-teal-50/80 via-emerald-50/40 to-white p-5 shadow-sm dark:border-teal-800/60 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Status Aktif
            </span>
            <div className="rounded-xl bg-teal-500/15 p-2 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-teal-700 dark:text-teal-300">
              {stats.active}
            </span>
            <span className="text-xs text-slate-500">aktif digunakan</span>
          </div>
        </div>

        {/* Status Non-Aktif */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-300/70 bg-gradient-to-br from-slate-50/80 via-gray-50/40 to-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
              Status Nonaktif
            </span>
            <div className="rounded-xl bg-slate-500/15 p-2 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-700 dark:text-slate-300">
              {stats.inactive}
            </span>
            <span className="text-xs text-slate-500">dinonaktifkan</span>
          </div>
        </div>
      </div>

      {/* Datatable Emerald Container */}
      <div className="mt-6 relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433]">
        {/* Toolbar Header */}
        <div className="border-b border-emerald-200/90 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 sm:p-5 dark:border-emerald-800/60">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Daftar Status Siswa Terdaftar
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Menampilkan seluruh status siswa aktif & arsip dari database
              </p>
            </div>

            {/* Actions & Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative min-w-[220px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kode atau nama..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full rounded-xl border border-emerald-300/80 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/80 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center rounded-xl border border-emerald-300/80 bg-white p-0.5 shadow-sm dark:border-emerald-800/80 dark:bg-slate-900">
                <button
                  onClick={() => setFilterActive('all')}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
                    filterActive === 'all'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  )}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilterActive('active')}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
                    filterActive === 'active'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  )}
                >
                  Aktif
                </button>
                <button
                  onClick={() => setFilterActive('inactive')}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
                    filterActive === 'inactive'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  )}
                >
                  Nonaktif
                </button>
              </div>

              {/* Reload Button */}
              <button
                onClick={() => refetch()}
                className="rounded-xl border border-emerald-300/80 bg-white p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800/80 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                title="Muat ulang data"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b-2 border-emerald-200/90 bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 dark:border-emerald-800/60 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                <th className="py-3.5 pl-5 pr-3 font-bold text-emerald-950 dark:text-emerald-200">
                  Urutan
                </th>
                <th className="py-3.5 px-3 font-bold text-emerald-950 dark:text-emerald-200">
                  Kode
                </th>
                <th className="py-3.5 px-3 font-bold text-emerald-950 dark:text-emerald-200">
                  Nama Status
                </th>
                <th className="py-3.5 px-3 font-bold text-emerald-950 dark:text-emerald-200">
                  Pratinjau Badge
                </th>
                <th className="py-3.5 px-3 font-bold text-emerald-950 dark:text-emerald-200">
                  Keterangan
                </th>
                <th className="py-3.5 px-3 font-bold text-emerald-950 dark:text-emerald-200">
                  Status Sistem
                </th>
                {canManage && (
                  <th className="py-3.5 pl-3 pr-5 text-right font-bold text-emerald-950 dark:text-emerald-200">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                      <span className="text-xs font-medium">Memuat master status siswa...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Info className="h-8 w-8 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Tidak ada data status siswa
                      </span>
                      <span className="text-xs text-slate-400">
                        {debouncedSearch
                          ? 'Coba gunakan kata kunci pencarian yang berbeda'
                          : 'Klik tombol Tambah untuk membuat status baru'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const colorConfig = BADGE_COLOR_MAP[item.badge_color] || BADGE_COLOR_MAP.emerald
                  return (
                    <tr
                      key={item.id}
                      className="group transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20"
                    >
                      {/* Urutan */}
                      <td className="py-3.5 pl-5 pr-3 font-bold text-slate-700 dark:text-slate-300">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 font-mono text-xs font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                          {item.order ?? 0}
                        </span>
                      </td>

                      {/* Kode */}
                      <td className="py-3.5 px-3">
                        <code className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {item.code}
                        </code>
                      </td>

                      {/* Nama Status */}
                      <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white">
                        {item.name}
                      </td>

                      {/* Pratinjau Badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-xs',
                            colorConfig.badge
                          )}
                        >
                          <span className={cn('h-1.5 w-1.5 rounded-full', colorConfig.dot)} />
                          {item.name}
                        </span>
                      </td>

                      {/* Keterangan */}
                      <td className="py-3.5 px-3 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {item.description || '—'}
                      </td>

                      {/* Status Sistem */}
                      <td className="py-3.5 px-3">
                        {item.is_active ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            <XCircle className="h-3 w-3" />
                            Nonaktif
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      {canManage && (
                        <td className="py-3.5 pl-3 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="rounded-lg border border-amber-200 bg-amber-50 p-1.5 text-amber-700 hover:bg-amber-100 transition-colors dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-300"
                              title="Ubah Status"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100 transition-colors dark:border-rose-800/80 dark:bg-rose-950/40 dark:text-rose-300"
                              title="Hapus Status"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL TAMBAH / UBAH STATUS ================= */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-emerald-300/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-emerald-800/80 dark:bg-slate-900"
            >
              {/* Garis Aksen Gradasi Emerald */}
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

              {/* Header Modal */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {editingItem ? 'Ubah Status Siswa' : 'Tambah Status Siswa Baru'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Konfigurasi opsi status operasional peserta didik
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit}>
                <div className="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-4">
                  {formErrors.submit && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                      {formErrors.submit}
                    </div>
                  )}

                  {/* Kode Status */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Kode Status (System Identifier) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="contoh: aktif, lulus, mutasi_keluar"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          code: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                        }))
                      }
                      className={cn(
                        'mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2 font-mono text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-white',
                        formErrors.code
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                          : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-slate-700'
                      )}
                    />
                    {formErrors.code && (
                      <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                        {formErrors.code}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-slate-400">
                      Kode unik yang disimpan pada record tabel siswa di database.
                    </p>
                  </div>

                  {/* Nama Status */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Nama / Label Status <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="contoh: Aktif, Lulus, Mutasi Keluar"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className={cn(
                        'mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-white',
                        formErrors.name
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                          : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-slate-700'
                      )}
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Warna Badge & Pratinjau */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Warna Badge Tampilan
                    </label>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {Object.entries(BADGE_COLOR_MAP).map(([key, item]) => {
                        const isSelected = formData.badge_color === key
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, badge_color: key }))
                            }
                            className={cn(
                              'flex items-center gap-2 rounded-xl border p-2 text-left text-xs font-medium transition-all',
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/40'
                                : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800'
                            )}
                          >
                            <span className={cn('h-3.5 w-3.5 shrink-0 rounded-full', item.dot)} />
                            <span className="truncate text-slate-800 dark:text-slate-200 capitalize">
                              {key}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Pratinjau Badge Terpilih */}
                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40">
                      <span className="text-xs text-slate-500">Pratinjau:</span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
                          (BADGE_COLOR_MAP[formData.badge_color] || BADGE_COLOR_MAP.emerald).badge
                        )}
                      >
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            (BADGE_COLOR_MAP[formData.badge_color] || BADGE_COLOR_MAP.emerald).dot
                          )}
                        />
                        {formData.name || 'Contoh Status'}
                      </span>
                    </div>
                  </div>

                  {/* Urutan & Status Aktif */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Urutan Tampilan
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.order}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            order: parseInt(e.target.value, 10) || 0,
                          }))
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Status Sistem
                      </label>
                      <label className="mt-2.5 flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                          }
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Aktifkan Status Ini
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Keterangan */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Keterangan / Deskripsi
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Keterangan opsional mengenai alur status ini..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Footer Modal */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/25 transition-all hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50"
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    )}
                    <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Status'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL KONFIRMASI HAPUS ================= */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-300/80 bg-white shadow-2xl shadow-rose-950/20 dark:border-rose-800/80 dark:bg-slate-900"
            >
              <div className="h-1.5 bg-gradient-to-r from-rose-500 via-rose-600 to-red-700" />
              <div className="p-6">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                    <Trash2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Hapus Status Siswa?
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tindakan ini akan menghapus opsi status dari daftar pilihan.
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
                  <p className="font-semibold">Perhatian:</p>
                  <p className="mt-0.5">
                    Status <strong>"{deleteTarget.name}"</strong> (kode:{' '}
                    <code>{deleteTarget.code}</code>) tidak akan lagi tersedia pada formulir pendaftaran dan filter siswa.
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(deleteTarget.id)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-rose-600/25 transition-all hover:from-rose-700 hover:to-red-700 disabled:opacity-50"
                  >
                    {deleteMutation.isPending && (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    )}
                    <span>Ya, Hapus Status</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  )
}
