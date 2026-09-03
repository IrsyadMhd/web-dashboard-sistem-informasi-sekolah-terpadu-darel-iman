import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Palette, RotateCcw, Save, Smartphone } from 'lucide-react'
import Swal from 'sweetalert2'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { Button } from '../components/tailgrids/core/button'
import { DEFAULT_MOBILE_API_CONFIG, mobileApiConfigService } from '../services/mobileApiConfigService'

const colorFields = [['primary_color', 'Warna utama'], ['secondary_color', 'Warna aksen'], ['background_color', 'Latar aplikasi'], ['surface_color', 'Permukaan kartu'], ['text_color', 'Teks utama'], ['muted_text_color', 'Teks sekunder']]
const sectionLabels = { announcements: 'Informasi terbaru', quick_menu: 'Menu utama', metrics: 'Ringkasan KPI', schedule: 'Agenda hari ini' }
const roleLabels = { super_admin: 'Super Admin', foundation: 'Pengurus Yayasan', principal: 'Kepala Sekolah', teacher: 'Guru / Pengajar', parent: 'Orang Tua', student: 'Siswa', staff: 'Staf / Operator' }
const gradientAngles = { vertical: '180deg', horizontal: '90deg', diagonal: '135deg' }

export default function MobileApiConfigPage() {
  const [config, setConfig] = useState(DEFAULT_MOBILE_API_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedRole, setSelectedRole] = useState('super_admin')
  useEffect(() => { mobileApiConfigService.getConfig().then(setConfig).catch(() => Swal.fire('Gagal Memuat', 'Konfigurasi Android belum dapat dimuat dari server.', 'error')).finally(() => setLoading(false)) }, [])
  const selectedLayout = config.role_home_layouts[selectedRole] || config.home_layout
  const sortedSections = useMemo(() => [...selectedLayout.sections].sort((a, b) => a.order - b.order), [selectedLayout.sections])
  const previewBackground = config.theme.background_gradient_enabled
    ? { backgroundImage: `linear-gradient(${gradientAngles[config.theme.background_gradient_direction]}, ${config.theme.background_gradient_start}, ${config.theme.background_gradient_end})` }
    : { backgroundColor: config.theme.background_color }
  const updateTheme = (key, value) => setConfig((current) => ({ ...current, theme: { ...current.theme, [key]: value } }))
  const updateBranding = (key, value) => setConfig((current) => ({ ...current, branding: { ...current.branding, [key]: value } }))
  const updateSection = (type, value) => setConfig((current) => ({ ...current, role_home_layouts: { ...current.role_home_layouts, [selectedRole]: { ...current.role_home_layouts[selectedRole], sections: current.role_home_layouts[selectedRole].sections.map((item) => item.type === type ? { ...item, ...value } : item) } } }))
  const moveSection = (type, direction) => {
    const index = sortedSections.findIndex((item) => item.type === type); const target = index + direction
    if (index < 0 || target < 0 || target >= sortedSections.length) return
    const next = [...sortedSections]; [next[index], next[target]] = [next[target], next[index]]
    setConfig((current) => ({ ...current, role_home_layouts: { ...current.role_home_layouts, [selectedRole]: { ...current.role_home_layouts[selectedRole], sections: next.map((item, order) => ({ ...item, order: order + 1 })) } } }))
  }
  const save = async () => {
    setSaving(true)
    try { const saved = await mobileApiConfigService.saveConfig(config); setConfig(saved); await Swal.fire('Berhasil', `Konfigurasi Android versi ${saved.version} telah dipublikasikan.`, 'success') }
    catch (error) { await Swal.fire('Gagal Menyimpan', error?.response?.data?.message || 'Konfigurasi gagal disimpan.', 'error') }
    finally { setSaving(false) }
  }
  const inputClass = 'mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900'
  return <div className="space-y-5 p-4 sm:p-6">
    <AppBreadcrumb pageTitle="Tampilan Aplikasi Android" />
    <section className="overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md dark:bg-[#1B2433]">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-5">
        <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-700 text-white"><Smartphone /></span><div><h1 className="text-xl font-black">Konfigurasi Android</h1><p className="text-xs text-slate-500">Versi aktif: {config.version || 1} · tersimpan terpusat di database.</p></div></div>
        <Button onClick={save} pending={saving} disabled={loading}><Save className="h-4 w-4" /> Publikasikan</Button>
      </header>
      <div className="grid gap-5 p-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="rounded-[18px] border border-slate-200 p-5 dark:border-slate-700"><h2 className="flex items-center gap-2 font-black"><Palette className="h-5 w-5 text-emerald-700" /> Warna dan gaya</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{colorFields.map(([key, label]) => <label key={key} className="text-xs font-bold text-slate-600 dark:text-slate-300">{label}<span className="mt-2 flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-2 dark:border-slate-700"><input type="color" value={config.theme[key]} onChange={(e) => updateTheme(key, e.target.value.toUpperCase())} className="h-8 w-10" /><input value={config.theme[key]} onChange={(e) => updateTheme(key, e.target.value)} className="min-w-0 flex-1 bg-transparent font-mono text-xs outline-none" /></span></label>)}</div>
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
              <label className="flex items-center justify-between gap-4 text-sm font-black"><span><span className="block">Gradient background Android</span><span className="mt-1 block text-xs font-normal text-slate-500">Dipakai pada halaman login dan beranda.</span></span><input type="checkbox" checked={config.theme.background_gradient_enabled} onChange={(e) => updateTheme('background_gradient_enabled', e.target.checked)} className="h-5 w-5 accent-emerald-700" /></label>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {[['background_gradient_start', 'Warna awal'], ['background_gradient_end', 'Warna akhir']].map(([key, label]) => <label key={key} className="text-xs font-bold">{label}<span className="mt-2 flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 dark:border-slate-700 dark:bg-slate-900"><input type="color" value={config.theme[key]} onChange={(e) => updateTheme(key, e.target.value.toUpperCase())} className="h-8 w-10" /><input value={config.theme[key]} onChange={(e) => updateTheme(key, e.target.value)} className="min-w-0 flex-1 bg-transparent font-mono text-xs outline-none" /></span></label>)}
                <label className="text-xs font-bold">Arah gradient<select className={inputClass} value={config.theme.background_gradient_direction} onChange={(e) => updateTheme('background_gradient_direction', e.target.value)}><option value="vertical">Atas ke bawah</option><option value="horizontal">Kiri ke kanan</option><option value="diagonal">Diagonal</option></select></label>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><label className="text-xs font-bold">Jenis tulisan<select className={inputClass} value={config.theme.font_family} onChange={(e) => updateTheme('font_family', e.target.value)}><option value="system">System Android</option><option value="Poppins">Poppins</option><option value="Nunito">Nunito</option></select></label><label className="text-xs font-bold">Ukuran tulisan<select className={inputClass} value={config.theme.font_scale} onChange={(e) => updateTheme('font_scale', e.target.value)}><option value="compact">Ringkas</option><option value="normal">Normal</option><option value="large">Besar</option></select></label><label className="text-xs font-bold">Radius kartu<input className={inputClass} type="number" min="0" max="32" value={config.theme.card_radius} onChange={(e) => updateTheme('card_radius', Number(e.target.value))} /></label><label className="text-xs font-bold">Radius tombol<input className={inputClass} type="number" min="0" max="30" value={config.theme.button_radius} onChange={(e) => updateTheme('button_radius', Number(e.target.value))} /></label></div>
          </div>
          <div className="rounded-[18px] border border-slate-200 p-5 dark:border-slate-700"><h2 className="font-black">Identitas aplikasi</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold">Nama aplikasi<input className={inputClass} value={config.branding.app_name} onChange={(e) => updateBranding('app_name', e.target.value)} /></label><label className="text-xs font-bold">Nama sekolah/yayasan<input className={inputClass} value={config.branding.school_name} onChange={(e) => updateBranding('school_name', e.target.value)} /></label><div className="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"><span className="font-black">Logo tersinkron otomatis.</span> Android menggunakan logo yang tersimpan pada Pengaturan Situs. Perubahan logo cukup dilakukan satu kali dari menu tersebut.</div></div></div>
          <div className="rounded-[18px] border border-slate-200 p-5 dark:border-slate-700"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-black">Susunan halaman beranda per role</h2><p className="mt-1 text-xs text-slate-500">Android memilih susunan ini otomatis dari role hasil login Laravel.</p></div><label className="text-xs font-bold">Role pengguna<select className={inputClass} value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>{Object.entries(roleLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></div><div className="mt-4 space-y-2">{sortedSections.map((item, index) => <div key={item.type} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><input type="checkbox" checked={item.enabled} onChange={(e) => updateSection(item.type, { enabled: e.target.checked })} /><span className="flex-1 text-sm font-bold">{sectionLabels[item.type]}</span><button onClick={() => moveSection(item.type, -1)} disabled={index === 0} className="rounded-lg p-2 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button><button onClick={() => moveSection(item.type, 1)} disabled={index === sortedSections.length - 1} className="rounded-lg p-2 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button></div>)}</div></div>
        </div>
        <aside className="h-fit rounded-[28px] border-[8px] border-slate-900 p-3 shadow-xl" style={previewBackground}><div className="mb-2 text-center text-[10px] font-black uppercase tracking-wider" style={{ color: config.theme.primary_color }}>Preview {roleLabels[selectedRole]}</div><div className="p-4" style={{ backgroundColor: config.theme.surface_color, borderRadius: config.theme.card_radius }}><div className="h-10 w-10 rounded-xl" style={{ backgroundColor: config.theme.primary_color }} /><h3 className="mt-3 font-black" style={{ color: config.theme.text_color }}>{config.branding.app_name}</h3><p className="text-xs" style={{ color: config.theme.muted_text_color }}>{config.branding.school_name}</p></div><div className="mt-3 grid grid-cols-2 gap-2">{sortedSections.filter((item) => item.enabled).map((item) => <div key={item.type} className="min-h-20 p-3 text-xs font-bold shadow-sm" style={{ backgroundColor: config.theme.surface_color, color: config.theme.text_color, borderRadius: config.theme.card_radius }}>{sectionLabels[item.type]}</div>)}</div></aside>
      </div>
      <footer className="flex justify-end border-t border-slate-200 p-4 dark:border-slate-700"><button type="button" onClick={() => setConfig(DEFAULT_MOBILE_API_CONFIG)} className="inline-flex items-center gap-2 text-xs font-bold text-slate-500"><RotateCcw className="h-4 w-4" /> Kembalikan formulir ke default</button></footer>
    </section>
  </div>
}
