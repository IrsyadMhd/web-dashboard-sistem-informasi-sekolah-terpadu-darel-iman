import { useEffect, useMemo, useState } from 'react'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppModal from '../components/app/AppModal'
import {
  AppWindow,
  CheckCircle2,
  Image,
  KeyRound,
  LayoutPanelLeft,
  Lock,
  Mail,
  Palette,
  Phone,
  RotateCcw,
  Save,
  Shield,
  ShieldCheck,
  Upload,
  UserCheck,
  Clock,
  Sliders,
  Calendar,
  Sparkles,
  Layers,
  AlertTriangle,
  Building,
  Globe,
  LifeBuoy,
  Plus,
  Pencil,
  Trash2,
  HelpCircle,
  FileText,
  ExternalLink,
  BookOpen,
  Tag,
  Download,
} from 'lucide-react'
import Swal from 'sweetalert2'
import {
  defaultPengaturan,
  usePengaturanStore,
  INITIAL_FAQS,
  INITIAL_MANUALS,
} from '../stores/pengaturanStore'
import { useAuthStore } from '../stores/authStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../components/tailgrids/core/select'
import { Checkbox } from '../components/tailgrids/core/checkbox'
import { Label } from '../components/tailgrids/core/label'
import { Button } from '../components/tailgrids/core/button'

const colorFields = [
  ['sidebar_color', 'Warna Latar Sidebar'],
  ['sidebar_accent_color', 'Warna Aksen Logo & Icon'],
  ['header_color', 'Warna Header Topbar'],
  ['body_color', 'Warna Latar Body Halaman'],
]

const presetThemes = [
  {
    name: 'Zamrud Klasik (Default)',
    sidebar_color: '#0E5C44',
    sidebar_accent_color: '#3FBF75',
    header_color: '#FFFFFF',
    header_style: 'light',
    sidebar_style: 'gradient',
  },
  {
    name: 'Ocean Blue',
    sidebar_color: '#0369A1',
    sidebar_accent_color: '#38BDF8',
    header_color: '#F0F9FF',
    header_style: 'solid',
    sidebar_style: 'gradient',
  },
  {
    name: 'Royal Violet',
    sidebar_color: '#6D28D9',
    sidebar_accent_color: '#A78BFA',
    header_color: '#F5F3FF',
    header_style: 'solid',
    sidebar_style: 'gradient',
  },
  {
    name: 'Midnight Dark',
    sidebar_color: '#1E293B',
    sidebar_accent_color: '#10B981',
    header_color: '#0F172A',
    header_style: 'solid',
    sidebar_style: 'solid',
  },
  {
    name: 'Sunset Amber',
    sidebar_color: '#78350F',
    sidebar_accent_color: '#F59E0B',
    header_color: '#FFFBEB',
    header_style: 'solid',
    sidebar_style: 'gradient',
  },
]

export default function PengaturanPage() {
  const user = useAuthStore((state) => state.user)

  const settings = usePengaturanStore((state) => state.pengaturan)
  const saveSettings = usePengaturanStore((state) => state.simpanPengaturan)
  const loadSettings = usePengaturanStore((state) => state.muatPengaturan)
  const previewSettings = usePengaturanStore((state) => state.previewPengaturan)

  // Otorisasi & Peran Pengguna (Strict Super Admin & Admin Check)
  const userRoles = useMemo(() => {
    if (!user) return []
    if (Array.isArray(user.roles)) return user.roles.map((r) => (typeof r === 'string' ? r : r.name || ''))
    if (user.role) return [typeof user.role === 'string' ? user.role : user.role.name || '']
    return []
  }, [user])

  const isSuperAdminOrAdmin = useMemo(() => {
    const rolesLower = userRoles.map((r) => String(r).toLowerCase().replace(/[\s_-]+/g, ''))
    return rolesLower.some((r) => ['superadmin', 'admin', 'super_admin'].includes(r))
  }, [userRoles])

  // Clear Navigation Tabs for System Management (Super Admin & Admin Only)
  const tabs = useMemo(() => {
    return [
      { id: 'identitas', label: 'Identitas Sekolah & Aplikasi', icon: Image },
      { id: 'tema', label: 'Style & Tema Website', icon: Palette },
      { id: 'bantuan_faq', label: 'Kelola Bantuan & FAQ', icon: LifeBuoy },
      { id: 'operasional', label: 'Operasional & Kebijakan', icon: Sliders },
    ]
  }, [])

  const [activeTab, setActiveTab] = useState('identitas')
  const [form, setForm] = useState(settings)
  const [files, setFiles] = useState({})
  const [previews, setPreviews] = useState({})
  const [saving, setSaving] = useState(false)

  // FAQ Modal & Editing States
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState(null)
  const [faqForm, setFaqForm] = useState({
    category: 'Akademik & LMS',
    question: '',
    answer: '',
    tags: '',
    actionUrl: '',
    actionLabel: '',
  })

  // Manual Book Modal & Editing States
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [editingManual, setEditingManual] = useState(null)
  const [manualForm, setManualForm] = useState({
    title: '',
    version: 'v2.4 (2026)',
    size: '3.5 MB',
    format: 'PDF',
    target: 'Guru & Staf',
    desc: '',
    url: '#',
  })

  // Load Settings on Component Mount
  useEffect(() => {
    if (isSuperAdminOrAdmin) {
      loadSettings()
    }
  }, [isSuperAdminOrAdmin, loadSettings])

  useEffect(() => {
    if (isSuperAdminOrAdmin) {
      setForm(settings)
    }
  }, [isSuperAdminOrAdmin, settings])

  // Update Field Handler with Live Preview
  const update = (key, value) => {
    setForm((current) => {
      const next = { ...current, [key]: value }
      previewSettings(next)
      return next
    })
  }

  // Apply Preset Theme
  const applyPreset = (preset) => {
    setForm((current) => {
      const next = { ...current, ...preset }
      previewSettings(next)
      return next
    })
  }

  const previewLogo = previews.logo || form.logo_url
  const previewFavicon = previews.favicon || form.favicon_url

  const previewStyle = useMemo(
    () => ({
      '--preview-sidebar': form.sidebar_color || '#0E5C44',
      '--preview-accent': form.sidebar_accent_color || '#3FBF75',
      '--preview-header': form.header_color || '#FFFFFF',
      '--preview-body': form.body_color || '#F7F9FC',
    }),
    [form]
  )

  const chooseFile = (type, event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setFiles((current) => ({ ...current, [type]: file }))
    setPreviews((current) => ({ ...current, [type]: URL.createObjectURL(file) }))
    update(`remove_${type}`, false)
  }

  const removeAsset = (type) => {
    setFiles((current) => ({ ...current, [type]: null }))
    setPreviews((current) => ({ ...current, [type]: '' }))
    update(`${type}_url`, '')
    update(`remove_${type}`, true)
  }

  const reset = () => {
    setForm({
      ...defaultPengaturan,
      remove_logo: true,
      remove_favicon: true,
      custom_faqs: INITIAL_FAQS,
      custom_manuals: INITIAL_MANUALS,
    })
    setFiles({})
    setPreviews({})
    previewSettings(defaultPengaturan)
    Swal.fire('Reset Berhasil', 'Pengaturan tampilan & tema telah dikembalikan ke warna semula (Zamrud Klasik).', 'info')
  }

  // Submit School System Settings
  const submitSchoolSettings = async (event) => {
    if (event) event.preventDefault()
    setSaving(true)
    try {
      await saveSettings(form, files)
      setFiles({})
      setPreviews({})
      await Swal.fire({
        title: 'Berhasil Disimpan!',
        text: 'Pengaturan identitas sekolah, style & tema website, serta konten Bantuan & FAQ berhasil diperbarui.',
        icon: 'success',
        confirmButtonColor: '#0E5C44',
      })
    } catch (error) {
      const errors = error?.response?.data?.errors
      const message = errors ? Object.values(errors).flat()[0] : 'Pengaturan belum dapat disimpan.'
      await Swal.fire('Gagal Menyimpan', message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FAQ MANAGEMENT HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────
  const openAddFaqModal = () => {
    setEditingFaq(null)
    setFaqForm({
      category: 'Akademik & LMS',
      question: '',
      answer: '',
      tags: '',
      actionUrl: '',
      actionLabel: '',
    })
    setIsFaqModalOpen(true)
  }

  const openEditFaqModal = (faq) => {
    setEditingFaq(faq)
    setFaqForm({
      category: faq.category || 'Akademik & LMS',
      question: faq.question || '',
      answer: faq.answer || '',
      tags: Array.isArray(faq.tags) ? faq.tags.join(', ') : faq.tags || '',
      actionUrl: faq.actionUrl || '',
      actionLabel: faq.actionLabel || '',
    })
    setIsFaqModalOpen(true)
  }

  const handleSaveFaq = (e) => {
    e.preventDefault()
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      Swal.fire('Form Belum Lengkap', 'Mohon isi Pertanyaan dan Jawaban Detail.', 'warning')
      return
    }

    const newFaqItem = {
      id: editingFaq ? editingFaq.id : `faq-custom-${Date.now()}`,
      category: faqForm.category,
      question: faqForm.question.trim(),
      answer: faqForm.answer.trim(),
      tags: faqForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      actionUrl: faqForm.actionUrl.trim() || null,
      actionLabel: faqForm.actionLabel.trim() || null,
    }

    let updatedFaqs = []
    const currentFaqs = form.custom_faqs || INITIAL_FAQS

    if (editingFaq) {
      updatedFaqs = currentFaqs.map((item) => (item.id === editingFaq.id ? newFaqItem : item))
    } else {
      updatedFaqs = [newFaqItem, ...currentFaqs]
    }

    update('custom_faqs', updatedFaqs)
    setIsFaqModalOpen(false)
    Swal.fire('Berhasil', editingFaq ? 'Topik FAQ berhasil diperbarui.' : 'Topik FAQ baru berhasil ditambahkan.', 'success')
  }

  const handleDeleteFaq = (id) => {
    Swal.fire({
      title: 'Hapus Topik FAQ?',
      text: 'FAQ ini tidak akan tampil lagi pada halaman Bantuan & Panduan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus FAQ',
      cancelButtonText: 'Batal',
    }).then((res) => {
      if (res.isConfirmed) {
        const currentFaqs = form.custom_faqs || INITIAL_FAQS
        const updated = currentFaqs.filter((f) => f.id !== id)
        update('custom_faqs', updated)
        Swal.fire('Terhapus', 'Topik FAQ telah dihapus.', 'success')
      }
    })
  }

  const handleResetFaqs = () => {
    Swal.fire({
      title: 'Reset Semua FAQ?',
      text: 'Seluruh daftar FAQ akan dikembalikan ke data standar bawaan SIMSIT.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0E5C44',
      cancelButtonText: 'Batal',
      confirmButtonText: 'Ya, Reset FAQ',
    }).then((res) => {
      if (res.isConfirmed) {
        update('custom_faqs', INITIAL_FAQS)
        Swal.fire('Berhasil', 'Daftar FAQ dikembalikan ke versi bawaan.', 'success')
      }
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MANUAL BOOK MANAGEMENT HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────
  const openAddManualModal = () => {
    setEditingManual(null)
    setManualForm({
      title: '',
      version: 'v2.4 (2026)',
      size: '3.5 MB',
      format: 'PDF',
      target: 'Guru & Staf Sekolah',
      desc: '',
      url: '#',
    })
    setIsManualModalOpen(true)
  }

  const openEditManualModal = (item) => {
    setEditingManual(item)
    setManualForm({
      title: item.title || '',
      version: item.version || '',
      size: item.size || '3.5 MB',
      format: item.format || 'PDF',
      target: item.target || '',
      desc: item.desc || '',
      url: item.url || '#',
    })
    setIsManualModalOpen(true)
  }

  const handleSaveManual = (e) => {
    e.preventDefault()
    if (!manualForm.title.trim() || !manualForm.desc.trim()) {
      Swal.fire('Form Belum Lengkap', 'Mohon isi Judul Buku Panduan dan Deskripsi Ringkas.', 'warning')
      return
    }

    const newManualItem = {
      id: editingManual ? editingManual.id : `manual-custom-${Date.now()}`,
      title: manualForm.title.trim(),
      version: manualForm.version.trim(),
      size: manualForm.size.trim(),
      format: manualForm.format.trim(),
      target: manualForm.target.trim(),
      desc: manualForm.desc.trim(),
      url: manualForm.url.trim() || '#',
    }

    let updatedManuals = []
    const currentManuals = form.custom_manuals || INITIAL_MANUALS

    if (editingManual) {
      updatedManuals = currentManuals.map((item) => (item.id === editingManual.id ? newManualItem : item))
    } else {
      updatedManuals = [...currentManuals, newManualItem]
    }

    update('custom_manuals', updatedManuals)
    setIsManualModalOpen(false)
    Swal.fire('Berhasil', editingManual ? 'Buku Panduan diperbarui.' : 'Buku Panduan baru ditambahkan.', 'success')
  }

  const handleDeleteManual = (id) => {
    Swal.fire({
      title: 'Hapus Buku Panduan?',
      text: 'Buku panduan ini tidak akan dapat diunduh pengguna lagi.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then((res) => {
      if (res.isConfirmed) {
        const currentManuals = form.custom_manuals || INITIAL_MANUALS
        const updated = currentManuals.filter((m) => m.id !== id)
        update('custom_manuals', updated)
        Swal.fire('Terhapus', 'Buku panduan telah dihapus.', 'success')
      }
    })
  }

  // Strict 403 Forbidden Access Guard
  if (!isSuperAdminOrAdmin) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4 pt-12">
        <div className="p-8 bg-rose-50/90 border-2 border-rose-200 rounded-3xl dark:bg-rose-950/40 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 space-y-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/30">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black">Akses Ditolak (403 Forbidden)</h2>
              <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                Halaman Pengaturan Tampilan & Identitas Sistem <strong>HANYA</strong> dapat diakses oleh pengguna dengan kewenangan role <strong>Super Admin</strong> dan <strong>Admin Utama</strong>.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Peran Anda saat ini: {userRoles.join(', ') || 'Pengguna Terdaftar'}
            </span>
            <Button variant="ghost" onClick={() => (window.location.href = '/dashboard')}>
              Kembali ke Dashboard Utama
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const currentFaqs = form.custom_faqs || INITIAL_FAQS
  const currentManuals = form.custom_manuals || INITIAL_MANUALS

  return (
    <form onSubmit={submitSchoolSettings} className="space-y-6 pb-12 p-4 sm:p-6 lg:p-8">
      {/* 1. App Breadcrumb Navigation */}
      <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Pengaturan Tampilan & Identitas' }]} />

      {/* 2. TailGrids Modern Hero Card Header */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
              <AppWindow className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Pengaturan Tampilan & Identitas Sistem
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Akses Khusus Super Admin & Admin
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                Konfigurasi terpusat identitas sekolah, style & tema website, konten Bantuan & FAQ, serta preferensi operasional SIMSIT Darel Iman.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={reset}
              className="rounded-xl border border-slate-300/80 bg-white/80 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span>Reset Warna Semula</span>
            </Button>

            <Button
              type="submit"
              variant="primary"
              appearance="fill"
              size="sm"
              disabled={saving}
              pending={saving}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-black text-white shadow-md shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 transition-all border border-emerald-400/40 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Main Configuration Workspace Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
          {/* Navigation Tabs Bar */}
          <div className="border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-3 sm:p-4">
            <div className="flex items-center gap-2 overflow-x-auto rounded-2xl bg-slate-100/90 p-1.5 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 backdrop-blur-xs">
              {tabs.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-md shadow-emerald-600/25 scale-[1.01]'
                        : 'font-bold text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white'
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200/70 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-6">
            {/* TAB 1: IDENTITAS SEKOLAH & APLIKASI */}
            {activeTab === 'identitas' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-300">
                    <Building className="h-4 w-4 text-emerald-700" />
                    <span>Identitas Resmi Yayasan / Sekolah</span>
                  </div>
                  <p className="mt-1 text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                    Informasi identitas ini digunakan pada header aplikasi, cetak laporan PDF, cetak kartu siswa, dan halaman publik.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Nama Aplikasi"
                    value={form.application_name}
                    onChange={(v) => update('application_name', v)}
                    icon={Globe}
                    placeholder="Contoh: Sistem Manajemen Sekolah Terpadu"
                  />
                  <Field
                    label="Nama Sekolah / Yayasan"
                    value={form.school_name}
                    onChange={(v) => update('school_name', v)}
                    icon={Building}
                    placeholder="Contoh: YAYASAN DAR EL - IMAN"
                  />
                  <Field
                    label="Singkatan / Logo Teks (fallback)"
                    value={form.logo_text}
                    maxLength={20}
                    onChange={(v) => update('logo_text', v)}
                    placeholder="Contoh: YDE"
                  />
                  <Field
                    label="Teks Footer Halaman"
                    value={form.footer_text}
                    onChange={(v) => update('footer_text', v)}
                    placeholder="Contoh: Jl. Pendidikan No. 1, Kota Padang"
                  />
                  <AssetUpload
                    label="Logo Resmi Sekolah (PNG / SVG)"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    preview={previewLogo}
                    fallback={form.logo_text}
                    onChange={(e) => chooseFile('logo', e)}
                    onRemove={() => removeAsset('logo')}
                  />
                  <AssetUpload
                    label="Favicon Situs (ICO / PNG)"
                    accept=".ico,image/png,image/jpeg,image/webp,image/svg+xml"
                    preview={previewFavicon}
                    fallback="ICO"
                    onChange={(e) => chooseFile('favicon', e)}
                    onRemove={() => removeAsset('favicon')}
                  />
                </div>
              </div>
            )}

            {/* TAB 2: STYLE & TEMA WEBSITE (HEADER, SIDEBAR, WARNA, TEMPLATE) */}
            {activeTab === 'tema' && (
              <div className="space-y-6">
                {/* Preset Warna Instan */}
                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <span className="block text-xs font-extrabold text-emerald-900 dark:text-emerald-300 mb-2">
                    Preset Tema Warna Instan (1-Klik)
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {presetThemes.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs hover:border-emerald-500 hover:scale-[1.02] transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full shadow-xs"
                          style={{ backgroundColor: preset.sidebar_color }}
                        />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <Select
                      value={form.header_style || 'light'}
                      onChange={(v) => update('header_style', String(v))}
                    >
                      <SelectLabel>Gaya Header Topbar</SelectLabel>
                      <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="Pilih gaya header..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem id="light">Terang (White Clean)</SelectItem>
                        <SelectItem id="solid">Warna Solid</SelectItem>
                        <SelectItem id="transparent">Transparan (Glassmorphism)</SelectItem>
                      </SelectContent>
                    </Select>

                    <label className="block space-y-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <span>Warna Header Utama</span>
                      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                        <input
                          type="color"
                          value={form.header_color || '#FFFFFF'}
                          onChange={(e) => update('header_color', e.target.value.toUpperCase())}
                          className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent"
                        />
                        <input
                          value={form.header_color || '#FFFFFF'}
                          onChange={(e) => update('header_color', e.target.value)}
                          pattern="^#[0-9A-Fa-f]{6}$"
                          className="w-full bg-transparent font-mono text-xs outline-none uppercase font-bold"
                        />
                      </div>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <Select
                      value={form.sidebar_style || 'light'}
                      onChange={(v) => update('sidebar_style', String(v))}
                    >
                      <SelectLabel>Gaya Latar Sidebar</SelectLabel>
                      <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="Pilih gaya sidebar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem id="light">Terang Clean (Standard White)</SelectItem>
                        <SelectItem id="gradient">Gradasi Elegant</SelectItem>
                        <SelectItem id="solid">Warna Solid</SelectItem>
                      </SelectContent>
                    </Select>

                    <label className="block space-y-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <span>Warna Latar Sidebar</span>
                      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                        <input
                          type="color"
                          value={form.sidebar_color || '#0E5C44'}
                          onChange={(e) => update('sidebar_color', e.target.value.toUpperCase())}
                          className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent"
                        />
                        <input
                          value={form.sidebar_color || '#0E5C44'}
                          onChange={(e) => update('sidebar_color', e.target.value)}
                          pattern="^#[0-9A-Fa-f]{6}$"
                          className="w-full bg-transparent font-mono text-xs outline-none uppercase font-bold"
                        />
                      </div>
                    </label>
                  </div>

                  <label className="block space-y-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <span>Warna Aksen Logo & Icon Sidebar</span>
                    <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                      <input
                        type="color"
                        value={form.sidebar_accent_color || '#3FBF75'}
                        onChange={(e) => update('sidebar_accent_color', e.target.value.toUpperCase())}
                        className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent"
                      />
                      <input
                        value={form.sidebar_accent_color || '#3FBF75'}
                        onChange={(e) => update('sidebar_accent_color', e.target.value)}
                        pattern="^#[0-9A-Fa-f]{6}$"
                        className="w-full bg-transparent font-mono text-xs outline-none uppercase font-bold"
                      />
                    </div>
                  </label>

                  <Select
                    value={form.sidebar_position || 'left'}
                    onChange={(v) => update('sidebar_position', String(v))}
                  >
                    <SelectLabel>Posisi Sidebar Navigation</SelectLabel>
                    <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Pilih posisi sidebar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem id="left">Sisi Kiri (Standard)</SelectItem>
                      <SelectItem id="right">Sisi Kanan</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={form.template || 'modern'}
                    onChange={(v) => update('template', String(v))}
                  >
                    <SelectLabel>Kerapatan Layout & UI Scaling</SelectLabel>
                    <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Pilih kerapatan template..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem id="modern">Modern (Standar TailGrids)</SelectItem>
                      <SelectItem id="compact">Ringkas (High Data Density)</SelectItem>
                      <SelectItem id="comfortable">Lapang (Spacious Padding)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="space-y-4 pt-1 md:col-span-2">
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <Checkbox
                        id="header_sticky"
                        checked={Boolean(form.header_sticky)}
                        onChange={(e) => update('header_sticky', e.target.checked)}
                      />
                      <Label
                        htmlFor="header_sticky"
                        className="cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200"
                      >
                        Header tetap di atas saat di-scroll (Sticky Header)
                      </Label>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <Checkbox
                        id="sidebar_collapsed"
                        checked={Boolean(form.sidebar_collapsed)}
                        onChange={(e) => update('sidebar_collapsed', e.target.checked)}
                      />
                      <Label
                        htmlFor="sidebar_collapsed"
                        className="cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200"
                      >
                        Sidebar mengecil secara default (Collapsed Icon-Only)
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: KELOLA BANTUAN & FAQ */}
            {activeTab === 'bantuan_faq' && (
              <div className="space-y-8">
                {/* FAQ SECTION */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-emerald-500/20 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                        <span>Kelola Daftar Pertanyaan & Solusi (FAQ)</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Tambah, ubah, atau hapus konten panduan FAQ yang muncul di halaman <strong>/dashboard/bantuan</strong>.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetFaqs}
                        className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        Reset Standard
                      </button>
                      <button
                        type="button"
                        onClick={openAddFaqModal}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition cursor-pointer"
                      >
                        <Plus className="h-4 w-4 stroke-[2.5]" />
                        <span>Tambah FAQ Baru</span>
                      </button>
                    </div>
                  </div>

                  {/* FAQ Items List */}
                  <div className="space-y-3">
                    {currentFaqs.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60"
                      >
                        <div className="space-y-1 max-w-xl">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {item.category}
                            </span>
                            {item.actionLabel && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                                <ExternalLink className="h-3 w-3" /> {item.actionLabel}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.question}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => openEditFaqModal(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFaq(item.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300 transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MANUAL BOOKS SECTION */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-emerald-500/20 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                        <span>Kelola Buku Panduan & PDF Manual Book</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Kelola dokumen tautan panduan PDF yang dapat diunduh oleh pengguna.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={openAddManualModal}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition cursor-pointer"
                    >
                      <Plus className="h-4 w-4 stroke-[2.5]" />
                      <span>Tambah Panduan PDF</span>
                    </button>
                  </div>

                  {/* Manuals List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentManuals.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                              {item.format || 'PDF'} • {item.size || '3.5 MB'}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">{item.version}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{item.desc}</p>
                          <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 block">
                            Target: {item.target}
                          </span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditManualModal(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteManual(item.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300 transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: OPERASIONAL & KEBIJAKAN SISTEM */}
            {activeTab === 'operasional' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs dark:border-blue-900/60 dark:bg-blue-950/30">
                  <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300">
                    <Sliders className="h-4 w-4 text-blue-700" />
                    <span>Konfigurasi Operasional & Kebijakan Absensi / Tahfizh</span>
                  </div>
                  <p className="mt-1 text-[11px] text-blue-800/80 dark:text-blue-300/80">
                    Atur tahun ajaran aktif, batas jam absensi digital gerbang, serta standar target hafalan.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Select
                    value={form.tahun_ajaran_aktif || '2025/2026'}
                    onChange={(v) => update('tahun_ajaran_aktif', String(v))}
                  >
                    <SelectLabel>Tahun Ajaran Aktif (Default)</SelectLabel>
                    <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Pilih tahun ajaran..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem id="2025/2026">2025 / 2026</SelectItem>
                      <SelectItem id="2026/2027">2026 / 2027</SelectItem>
                      <SelectItem id="2027/2028">2027 / 2028</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={form.semester_aktif || 'Ganjil'}
                    onChange={(v) => update('semester_aktif', String(v))}
                  >
                    <SelectLabel>Semester Aktif (Default)</SelectLabel>
                    <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Pilih semester..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem id="Ganjil">Semester Ganjil</SelectItem>
                      <SelectItem id="Genap">Semester Genap</SelectItem>
                    </SelectContent>
                  </Select>

                  <Field
                    label="Jam Masuk Absensi Gerbang (HH:MM)"
                    type="time"
                    value={form.jam_masuk_gerbang || '07:15'}
                    onChange={(v) => update('jam_masuk_gerbang', v)}
                    icon={Clock}
                  />

                  <Field
                    label="Jam Pulang Absensi Gerbang (HH:MM)"
                    type="time"
                    value={form.jam_pulang_gerbang || '15:30'}
                    onChange={(v) => update('jam_pulang_gerbang', v)}
                    icon={Clock}
                  />

                  <Field
                    label="Toleransi Keterlambatan (Menit)"
                    type="number"
                    value={form.toleransi_keterlambatan_menit || '15'}
                    onChange={(v) => update('toleransi_keterlambatan_menit', v)}
                    placeholder="15"
                  />

                  <Field
                    label="Target Hafalan Bawaan Santri (Juz / Sem.)"
                    type="number"
                    step="0.5"
                    value={form.target_tahfizh_bawaan || '1.0'}
                    onChange={(v) => update('target_tahfizh_bawaan', v)}
                    placeholder="1.0"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Live Preview Panel Sidebar */}
        <aside className="h-fit rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Pratinjau Live Layout</span>
          </h3>
          <p className="mb-4 mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Perubahan gaya header, sidebar, dan warna akan langsung tercermin pada simulasi di bawah ini secara otomatis.
          </p>
          <div
            style={previewStyle}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--preview-body)] shadow-inner"
          >
            <div className={`flex h-56 ${form.sidebar_position === 'right' ? 'flex-row-reverse' : ''}`}>
              <div
                className="w-28 p-2.5 text-slate-800 relative overflow-hidden border-r border-slate-200 transition-colors"
                style={{
                  background:
                    form.sidebar_style === 'light'
                      ? '#FFFFFF'
                      : form.sidebar_style === 'gradient'
                      ? `linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)`
                      : form.sidebar_color,
                  color: '#334155',
                }}
              >
                <div className="mb-4 flex items-center gap-1.5">
                  {previewLogo ? (
                    <img src={previewLogo} className="h-6 w-6 rounded object-contain" alt="" />
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-[var(--preview-accent)] text-[8px] font-black text-white">
                      {form.logo_text || 'YDE'}
                    </span>
                  )}
                  <span className="truncate text-[7px] font-bold">{form.school_name || 'SIMSIT'}</span>
                </div>
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className={`mb-2 h-4 rounded-lg ${
                      item === 1 ? 'bg-[var(--preview-accent)]' : 'bg-current opacity-15'
                    }`}
                  />
                ))}
              </div>
              <div className="flex-1">
                <div
                  className="h-10 border-b border-black/5 flex items-center justify-between px-3"
                  style={{
                    backgroundColor:
                      form.header_style === 'transparent' ? 'transparent' : form.header_color,
                  }}
                >
                  <div className="h-3 w-16 rounded bg-slate-300/60 dark:bg-slate-700/60" />
                  <div className="h-5 w-5 rounded-full bg-emerald-500" />
                </div>
                <div className="p-3 space-y-2">
                  <div className="h-8 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-16 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/50" />
                    <div className="h-16 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* MODAL EDIT & TAMBAH FAQ */}
      <AppModal
        isOpen={isFaqModalOpen}
        onClose={() => setIsFaqModalOpen(false)}
        title={editingFaq ? 'Ubah Topik FAQ Bantuan' : 'Tambah Topik FAQ Bantuan Baru'}
        size="md"
      >
        <form onSubmit={handleSaveFaq} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Kategori Modul FAQ *
            </label>
            <select
              value={faqForm.category}
              onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="Akademik & LMS">Akademik & LMS</option>
              <option value="Absensi Digital">Absensi Digital & Gerbang</option>
              <option value="Tahfizh & Mutabaah">Tahfizh & Mutabaah</option>
              <option value="Kesiswaan">Kesiswaan & Murid</option>
              <option value="Kepegawaian">SDM & Kepegawaian</option>
              <option value="Keamanan & Akun">Keamanan & Akun</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Judul Pertanyaan (FAQ) *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Bagaimana cara mengunduh modul ajar LMS?"
              value={faqForm.question}
              onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Jawaban & Solusi Detail *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Tuliskan langkah-langkah penyelesaian secara jelas..."
              value={faqForm.answer}
              onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Path URL Pintasan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: /dashboard/profil-akun"
                value={faqForm.actionUrl}
                onChange={(e) => setFaqForm({ ...faqForm, actionUrl: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Label Tombol Pintasan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Buka Halaman Profil"
                value={faqForm.actionLabel}
                onChange={(e) => setFaqForm({ ...faqForm, actionLabel: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Kata Kunci Tag Pencarian (Pisah koma)
            </label>
            <input
              type="text"
              placeholder="Contoh: password, ganti, lupa, profil"
              value={faqForm.tags}
              onChange={(e) => setFaqForm({ ...faqForm, tags: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsFaqModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition cursor-pointer"
            >
              Simpan Topik FAQ
            </button>
          </div>
        </form>
      </AppModal>

      {/* MODAL EDIT & TAMBAH BUKU PANDUAN PDF */}
      <AppModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title={editingManual ? 'Ubah Buku Panduan PDF' : 'Tambah Buku Panduan PDF Baru'}
        size="md"
      >
        <form onSubmit={handleSaveManual} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Judul Buku Panduan *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Buku Panduan Guru & Wali Kelas 2026"
              value={manualForm.title}
              onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Versi Dokumen
              </label>
              <input
                type="text"
                placeholder="v2.4 (2026)"
                value={manualForm.version}
                onChange={(e) => setManualForm({ ...manualForm, version: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ukuran & Format File
              </label>
              <input
                type="text"
                placeholder="3.5 MB • PDF"
                value={manualForm.size}
                onChange={(e) => setManualForm({ ...manualForm, size: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Target Peran Pengguna
            </label>
            <input
              type="text"
              placeholder="Contoh: Guru Mata Pelajaran, Wali Kelas, Kepsek"
              value={manualForm.target}
              onChange={(e) => setManualForm({ ...manualForm, target: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi Ringkas Dokumen *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Jelaskan secara singkat isi cakupan panduan ini..."
              value={manualForm.desc}
              onChange={(e) => setManualForm({ ...manualForm, desc: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition cursor-pointer"
            >
              Simpan Buku Panduan
            </button>
          </div>
        </form>
      </AppModal>
    </form>
  )
}

function Field({ label, value = '', onChange, icon: Icon, isTextarea = false, ...props }) {
  return (
    <label className="space-y-2 text-xs font-bold text-slate-700 dark:text-slate-200">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-emerald-600" />}
        <span>{label}</span>
      </div>
      {isTextarea ? (
        <textarea
          rows={3}
          {...props}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900"
        />
      ) : (
        <input
          {...props}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900 disabled:opacity-60"
        />
      )}
    </label>
  )
}

function AssetUpload({ label, accept, preview, fallback, onChange, onRemove }) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{label}</span>
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700">
        {preview ? (
          <img src={preview} alt={label} className="h-14 w-14 rounded-xl border bg-white object-contain p-1" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-xs font-black text-emerald-700">
            {fallback}
          </div>
        )}
        <div className="space-y-1">
          <label className="flex cursor-pointer items-center gap-1.5 text-xs font-bold text-emerald-700">
            <Upload className="h-3.5 w-3.5" /> Pilih File Asset
            <input type="file" accept={accept} onChange={onChange} className="hidden" />
          </label>
          {preview && (
            <button type="button" onClick={onRemove} className="block text-[10px] font-semibold text-rose-600 cursor-pointer">
              Hapus gambar asset
            </button>
          )}
          <p className="text-[9px] text-slate-400">Ukuran maksimal 2 MB</p>
        </div>
      </div>
    </div>
  )
}
