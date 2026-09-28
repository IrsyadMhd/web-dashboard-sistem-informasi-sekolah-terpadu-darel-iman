import { Component, ReactNode, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod/dist/zod.mjs'
import { z } from 'zod'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import {
  ArchiveRestore, ArrowDown, ArrowUp, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Eye,
  GripVertical, Layers, Loader2, Pencil, Plus, Printer, RotateCcw, Search, SlidersHorizontal,
  Sparkles, Trash2, X, Zap,
} from 'lucide-react'
import Swal from '@/components/tailgrids/compat/swal-tailgrids'
import { motion } from 'framer-motion'
import { Download1, Upload1 } from '@tailgrids/icons'
import { mutabaahService } from '../services/mutabaahService'
import MutabaahSubNav from '../components/mutabaah/MutabaahSubNav'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  MasterStatsGrid,
  MasterStatCard,
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'
import { Pagination } from '@/components/tailgrids/core/pagination'
import { Button } from '@/components/tailgrids/core/button'
import { downloadPdfTable, printCleanTable } from '../utils/printHelper'
import './MutabaahEnterprisePage.css'
import './MutabaahEnterpriseEnhancements.css'

type Resource = 'categories' | 'agendas' | 'templates' | 'template-assignments' | 'supervisor-assignments'
type FieldType = 'text' | 'number' | 'date' | 'textarea' | 'boolean' | 'status' | 'input_type' | 'supervisor_type' | 'categories' | 'units' | 'templates' | 'employees' | 'classes' | 'students' | 'semesters' | 'academic_years'
type Field = { name: string; label: string; type: FieldType; required?: boolean; conditional?: 'school' | 'boarding' }
type Config = { title: string; subtitle: string; columns: [string, string][]; fields: Field[] }
type Row = Record<string, any> & { id: string; trashed?: boolean }

const configs: Record<Resource, Config> = {
  categories: {
    title: 'Kategori Agenda', subtitle: 'Kelola kelompok agenda Mutaba’ah Yaumiyyah.',
    columns: [['code', 'Kode'], ['name', 'Nama Kategori'], ['sort_order', 'Urutan'], ['is_active', 'Status']],
    fields: [{ name: 'code', label: 'Kode', type: 'text', required: true }, { name: 'name', label: 'Nama Kategori', type: 'text', required: true }, { name: 'icon', label: 'Ikon Lucide', type: 'text' }, { name: 'color', label: 'Warna', type: 'text' }, { name: 'sort_order', label: 'Urutan', type: 'number' }, { name: 'is_active', label: 'Status Aktif', type: 'boolean' }, { name: 'description', label: 'Deskripsi', type: 'textarea' }],
  },
  agendas: {
    title: 'Rincian Agenda Mutabaah', subtitle: 'Kelola agenda, jenis input, bobot, dan status untuk seluruh template.',
    columns: [['category.name', 'Kategori'], ['code', 'Kode'], ['name', 'Nama Agenda'], ['input_type', 'Jenis Input'], ['weight', 'Bobot'], ['is_active', 'Status']],
    fields: [{ name: 'category_id', label: 'Kategori', type: 'categories', required: true }, { name: 'code', label: 'Kode Agenda', type: 'text', required: true }, { name: 'name', label: 'Nama Agenda', type: 'text', required: true }, { name: 'input_type', label: 'Jenis Input', type: 'input_type', required: true }, { name: 'weight', label: 'Bobot', type: 'number', required: true }, { name: 'icon', label: 'Ikon Lucide', type: 'text' }, { name: 'color', label: 'Warna', type: 'text' }, { name: 'is_active', label: 'Status Aktif', type: 'boolean' }, { name: 'description', label: 'Deskripsi', type: 'textarea' }],
  },
  templates: {
    title: 'Template Agenda', subtitle: 'Susun paket agenda per unit, jenjang, tahun ajaran, semester, dan periode.',
    columns: [['code', 'Kode'], ['name', 'Nama'], ['education_unit.name', 'Unit'], ['education_level', 'Jenjang'], ['academic_year.name', 'Tahun Ajaran'], ['semester.name', 'Semester'], ['period', 'Periode'], ['status', 'Status']],
    fields: [{ name: 'code', label: 'Kode Template', type: 'text', required: true }, { name: 'name', label: 'Nama Template', type: 'text', required: true }, { name: 'education_unit_id', label: 'Unit', type: 'units' }, { name: 'education_level', label: 'Jenjang', type: 'text', required: true }, { name: 'academic_year_id', label: 'Tahun Ajaran', type: 'academic_years', required: true }, { name: 'semester_id', label: 'Semester', type: 'semesters', required: true }, { name: 'start_date', label: 'Mulai', type: 'date', required: true }, { name: 'end_date', label: 'Selesai', type: 'date' }, { name: 'status', label: 'Status', type: 'status', required: true }, { name: 'description', label: 'Deskripsi', type: 'textarea' }],
  },
  'template-assignments': {
    title: 'Assign Template', subtitle: 'Terapkan template berdasarkan unit, kelas, rombel, siswa khusus, dan periode.',
    columns: [['template.name', 'Template'], ['education_unit.name', 'Unit'], ['education_level', 'Jenjang'], ['kelas.name', 'Kelas'], ['rombel.nama_kelas', 'Rombel'], ['student.full_name', 'Siswa Khusus'], ['period', 'Periode'], ['priority', 'Prioritas'], ['status', 'Status']],
    fields: [{ name: 'template_id', label: 'Template', type: 'templates', required: true }, { name: 'education_unit_id', label: 'Unit', type: 'units', required: true }, { name: 'education_level', label: 'Jenjang', type: 'text' }, { name: 'kelas_id', label: 'Kelas', type: 'classes' }, { name: 'rombel_id', label: 'Rombel', type: 'classes' }, { name: 'student_id', label: 'Siswa Khusus', type: 'students' }, { name: 'academic_year_id', label: 'Tahun Ajaran', type: 'academic_years', required: true }, { name: 'semester_id', label: 'Semester', type: 'semesters', required: true }, { name: 'start_date', label: 'Mulai', type: 'date', required: true }, { name: 'end_date', label: 'Selesai', type: 'date' }, { name: 'priority', label: 'Prioritas', type: 'number' }, { name: 'status', label: 'Status', type: 'status', required: true }],
  },
  'supervisor-assignments': {
    title: 'Assign Pembimbing', subtitle: 'Atur Pembimbing, Wali Kelas, Guru PAI/Tahfizh, Musyrif, dan Musyrifah.',
    columns: [['employee.nama_lengkap', 'Nama Pegawai'], ['supervisor_type', 'Jenis Pembimbing'], ['education_unit.name', 'Unit'], ['scope', 'Kelas / Rombel'], ['boarding', 'Asrama / Kamar'], ['template.name', 'Template'], ['period', 'Periode'], ['status', 'Status']],
    fields: [{ name: 'employee_id', label: 'Nama Pegawai', type: 'employees', required: true }, { name: 'supervisor_type', label: 'Jenis Pembimbing', type: 'supervisor_type', required: true }, { name: 'education_unit_id', label: 'Unit', type: 'units', required: true }, { name: 'kelas_id', label: 'Kelas', type: 'classes', conditional: 'school' }, { name: 'rombel_id', label: 'Rombel', type: 'classes', conditional: 'school' }, { name: 'dormitory_id', label: 'Asrama (UUID)', type: 'text', conditional: 'boarding' }, { name: 'room_id', label: 'Kamar (UUID)', type: 'text', conditional: 'boarding' }, { name: 'mentoring_group', label: 'Kelompok Binaan', type: 'text', conditional: 'boarding' }, { name: 'template_id', label: 'Template', type: 'templates' }, { name: 'academic_year_id', label: 'Tahun Ajaran', type: 'academic_years', required: true }, { name: 'semester_id', label: 'Semester', type: 'semesters', required: true }, { name: 'start_date', label: 'Mulai', type: 'date', required: true }, { name: 'end_date', label: 'Selesai', type: 'date' }, { name: 'is_primary', label: 'Pembimbing Utama', type: 'boolean' }, { name: 'can_input', label: 'Dapat Input', type: 'boolean' }, { name: 'can_edit', label: 'Dapat Edit', type: 'boolean' }, { name: 'can_finalize', label: 'Dapat Finalisasi', type: 'boolean' }, { name: 'can_view_report', label: 'Dapat Melihat Laporan', type: 'boolean' }, { name: 'status', label: 'Status', type: 'status', required: true }],
  },
}

const formSchema = z.record(z.string(), z.any()).superRefine((values, ctx) => {
  if (values.start_date && values.end_date && values.end_date < values.start_date) ctx.addIssue({ code: 'custom', path: ['end_date'], message: 'Tanggal selesai tidak boleh sebelum tanggal mulai.' })
})
const read = (row: Row, path: string) => path.split('.').reduce((value, key) => value?.[key], row)
const period = (row: Row) => `${dateText(row.start_date)} – ${row.end_date ? dateText(row.end_date) : 'seterusnya'}`
const dateText = (value?: string) => value ? new Date(value).toLocaleDateString('id-ID') : '-'
const blank = (config: Config) => Object.fromEntries(config.fields.map((field) => [field.name, field.type === 'boolean' ? true : field.type === 'number' ? 0 : field.type === 'status' ? 'active' : '']))

export default function MutabaahEnterprisePage({ resource }: { resource: Resource }) {
  return <MutabaahErrorBoundary><EnterpriseWorkspace resource={resource} /></MutabaahErrorBoundary>
}

function EnterpriseWorkspace({ resource }: { resource: Resource }) {
  const config = configs[resource] || configs.categories
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sort, setSort] = useState('created_at')
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<string[]>([])
  const [drawer, setDrawer] = useState<{ mode: 'create' | 'edit' | 'detail' | 'items'; row?: Row } | null>(null)
  const [printOptionModalOpen, setPrintOptionModalOpen] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  useEffect(() => { const timer = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400); return () => clearTimeout(timer) }, [searchInput])
  const params = { search, status, category_id: categoryId, sort, direction, page, per_page: perPage, with_trashed: 1 }
  const listQuery = useQuery({ queryKey: ['mutabaah', resource, params], queryFn: () => mutabaahService.enterpriseList(resource, params), placeholderData: keepPreviousData })
  const optionsQuery = useQuery({ queryKey: ['mutabaah-options'], queryFn: mutabaahService.enterpriseOptions, staleTime: 300_000 })
  const rows: Row[] = listQuery.data?.data || []
  const meta = listQuery.data?.meta || { current_page: 1, last_page: 1, total: 0 }
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['mutabaah', resource] })
  const mutate = useMutation({ mutationFn: ({ id, data }: any) => id ? mutabaahService.enterpriseUpdate(resource, id, data) : mutabaahService.enterpriseCreate(resource, data), onSuccess: (result) => { setDrawer(null); refresh(); toast('success', result.message) }, onError: showError })

  const sortColumn = (key: string) => {
    const sortable = ['name', 'code', 'start_date', 'created_at']
    if (!sortable.includes(key)) return
    if (sort === key) setDirection((old) => old === 'asc' ? 'desc' : 'asc'); else { setSort(key); setDirection('asc') }
  }
  const columns: ColumnDef<Row>[] = [
    { id: 'select', header: () => <input aria-label="Pilih semua" type="checkbox" className="rounded border-slate-300" checked={rows.length > 0 && rows.every((r) => selected.includes(r.id))} onChange={(e) => setSelected(e.target.checked ? rows.map((r) => r.id) : [])} />, cell: ({ row }) => <input aria-label={`Pilih ${row.original.name || row.original.id}`} type="checkbox" className="rounded border-slate-300" checked={selected.includes(row.original.id)} onChange={() => setSelected((old) => old.includes(row.original.id) ? old.filter((id) => id !== row.original.id) : [...old, row.original.id])} /> },
    { id: 'number', header: 'No', cell: ({ row }) => (meta.current_page - 1) * perPage + row.index + 1 },
    ...config.columns.map(([key, label]): ColumnDef<Row> => ({ id: key, header: () => <button className="me-sort flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200" onClick={() => sortColumn(key)}>{label}{sort === key && (direction === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />)}</button>, cell: ({ row }) => <Cell row={row.original} path={key} /> })),
    { id: 'actions', header: 'Aksi', cell: ({ row }) => <RowActions row={row.original} resource={resource} onDrawer={setDrawer} onRefresh={refresh} /> },
  ]
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel(), manualPagination: true, manualSorting: true })

  const exportData = async (format: string) => {
    try { const response = await mutabaahService.enterpriseExport(resource, format, params); const url = URL.createObjectURL(response.data); const a = document.createElement('a'); a.href = url; a.download = `mutabaah-${resource}.${format}`; a.click(); URL.revokeObjectURL(url) } catch (error) { showError(error) }
  }

  const handlePrintClean = () => {
    setPrintOptionModalOpen(false)
    printCleanTable({
      title: `Laporan ${config.title}`,
      subtitle: `Total Data: ${meta.total || rows.length}`,
      headers: config.columns.map((c) => c[1]),
      rows: rows.map((r) => config.columns.map(([key]) => String(read(r, key) || '-'))),
    })
  }

  const handleDownloadPdfTable = () => {
    setPrintOptionModalOpen(false)
    downloadPdfTable({
      title: `Laporan ${config.title}`,
      subtitle: `Total Data: ${meta.total || rows.length}`,
      headers: config.columns.map((c) => c[1]),
      rows: rows.map((r) => config.columns.map(([key]) => String(read(r, key) || '-'))),
    })
  }

  const importData = async (file?: File) => {
    if (!file) return
    try { const result = await mutabaahService.enterpriseImport(resource, file); refresh(); toast(result.data?.errors?.length ? 'warning' : 'success', result.message) } catch (error) { showError(error) }
    finally { if (importRef.current) importRef.current.value = '' }
  }
  const bulkDelete = async () => {
    if (!selected.length || !(await confirmDelete(selected.length)).isConfirmed) return
    try { await mutabaahService.enterpriseBulkDelete(resource, selected); setSelected([]); refresh(); toast('success', 'Data dipindahkan ke sampah.') } catch (error) { showError(error) }
  }

  const resetFilters = () => {
    setSearchInput('')
    setSearch('')
    setStatus('')
    setCategoryId('')
    setPage(1)
    setPerPage(15)
  }

  return (
    <PageContainer maxW="7xl" className="space-y-6 pb-12">
      {/* 🧭 AppBreadcrumb Navigation */}
      <AppBreadcrumb
        className="print:hidden"
        items={[
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/dashboard/mutabaah', label: 'Mutaba’ah Yaumiyyah' },
          { label: config.title },
        ]}
      />

      {/* ── 1. MODERN VIVID EMERALD HERO HEADER CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden"
      >
        {/* Dual Multi-Tone Ambient Glow Blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
              <BookOpen className="size-6 sm:size-7 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                  <Sparkles className="size-3 text-amber-300 animate-pulse" />
                  Konfigurasi Mutaba’ah Terpadu
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                  Resource: {resource}
                </span>
              </div>
              <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {config.title}
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                {config.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <Button
              type="button"
              variant="primary"
              appearance="fill"
              size="sm"
              onClick={() => setDrawer({ mode: 'create' })}
              prefixIcon={<Plus className="h-4 w-4" />}
              className="!bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white font-bold shadow-md shadow-emerald-600/25 cursor-pointer"
            >
              Tambah {config.title}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── 2. KPI CARDS GRID (MASTER STATS GRID) ── */}
      <MasterStatsGrid>
        <MasterStatCard
          icon={BookOpen}
          label={`Total ${config.title}`}
          value={meta.total || rows.length}
          description="Data tersimpan di sistem"
          variant="success"
        />
        <MasterStatCard
          icon={CheckCircle2}
          label="Status Aktif"
          value={rows.filter((r) => r.is_active || r.status === 'active').length}
          description="Siap digunakan santri"
          variant="info"
        />
        <MasterStatCard
          icon={Layers}
          label="Kategori Master"
          value={optionsQuery.data?.categories?.length || 0}
          description="Kategori terintegrasi"
          variant="indigo"
        />
        <MasterStatCard
          icon={Zap}
          label="Template Terintegrasi"
          value={optionsQuery.data?.templates?.length || 0}
          description="Template mutabaah aktif"
          variant="warning"
        />
      </MasterStatsGrid>

      {/* 🧭 CARD MUTABA'AH YAUMIYYAH SUB-NAV */}
      <MutabaahSubNav />

      {/* ── 3. EMERALD DATATABLE CONTAINER ── */}
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
        {/* Header Baris 1: Title & Soft Pastel Squircle Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/90 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-5 py-4 dark:border-emerald-800/60 dark:from-emerald-950/50 dark:via-teal-950/30">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              {config.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {config.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-nowrap shrink-0 overflow-visible py-1">
            <input ref={importRef} hidden type="file" accept=".xlsx,.xls,.csv" onChange={(e) => importData(e.target.files?.[0])} />

            <SquircleActionButton
              variant="import"
              label="Import Data (Excel/CSV)"
              onClick={() => importRef.current?.click()}
            />

            <SquircleActionButton
              variant="export"
              label="Export Data (Excel/CSV)"
              onClick={() => exportData('xlsx')}
            />

            <SquircleActionButton
              variant="view"
              icon={Printer}
              label="Cetak Data"
              onClick={() => setPrintOptionModalOpen(true)}
            />

            <SquircleActionButton
              variant="primary"
              label={`Tambah ${config.title}`}
              onClick={() => setDrawer({ mode: 'create' })}
            />

            {selected.length > 0 && (
              <SquircleActionButton
                variant="delete"
                label={`Hapus ${selected.length} Terpilih`}
                onClick={bulkDelete}
              />
            )}
          </div>
        </div>

        {/* Filter Baris 2: Filter Toolbar */}
        <div className="px-5 py-3.5 border-b border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:border-emerald-800/60 dark:from-emerald-950/30 dark:via-teal-950/20">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pencarian</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Cari ${config.title.toLowerCase()}...`}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {resource === 'agendas' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kategori Agenda</label>
                <select
                  value={categoryId}
                  onChange={(e) => { setCategoryId(e.target.value); setPage(1) }}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Semua Kategori</option>
                  {optionsQuery.data?.categories?.map((x: any) => (
                    <option key={x.id} value={x.id}>{x.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1) }}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tampilkan</label>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1) }}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value={5}>5 per hal</option>
                <option value={10}>10 per hal</option>
                <option value={15}>15 per hal</option>
                <option value={25}>25 per hal</option>
                <option value={50}>50 per hal</option>
                <option value={100}>100 per hal</option>
              </select>
            </div>

            <div>
              <button
                type="button"
                onClick={resetFilters}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-emerald-200/90 bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 text-[11px] font-extrabold uppercase tracking-wider text-emerald-950 dark:border-emerald-800/80 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:text-emerald-200">
                {table.getHeaderGroups().map((group) => (
                  group.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3.5 font-extrabold">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
              {listQuery.isLoading && (
                Array.from({ length: 7 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td colSpan={columns.length} className="px-4 py-3">
                      <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800" />
                    </td>
                  </tr>
                ))
              )}

              {listQuery.isError && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center">
                    <ErrorState retry={() => listQuery.refetch()} />
                  </td>
                </tr>
              )}

              {!listQuery.isLoading && !listQuery.isError && table.getRowModel().rows.map((row) => (
                <tr key={row.id} className={`hover:bg-emerald-50/30 dark:hover:bg-slate-800/30 transition ${row.original.trashed ? 'opacity-60 bg-rose-50/30' : ''}`}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}

              {!listQuery.isLoading && !listQuery.isError && !rows.length && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center">
                    <EmptyState onCreate={() => setDrawer({ mode: 'create' })} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="w-full border-t border-emerald-200/80 px-4 py-3.5 sm:px-6 md:px-8 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Menampilkan <span className="font-bold text-slate-700 dark:text-slate-200">{rows.length > 0 ? (page - 1) * perPage + 1 : 0}</span> s.d. <span className="font-bold text-slate-700 dark:text-slate-200">{Math.min(page * perPage, meta.total || rows.length)}</span> dari <span className="font-bold text-slate-700 dark:text-slate-200">{meta.total || rows.length}</span> data
          </div>
          {(meta.last_page || 1) > 1 && (
            <div className="w-full sm:w-auto">
              <Pagination
                currentPage={page}
                totalPages={meta.last_page || 1}
                onPageChange={(p) => setPage(p)}
                sideLayout="full"
              />
            </div>
          )}
        </div>
      </section>

      {/* Drawers / Modals */}
      {drawer && (
        drawer.mode === 'items' ? (
          <TemplateItemsDrawer template={drawer.row!} options={optionsQuery.data || {}} close={() => setDrawer(null)} refresh={refresh} />
        ) : (
          <CrudDrawer config={config} state={drawer} options={optionsQuery.data || {}} close={() => setDrawer(null)} save={(data: any) => mutate.mutate({ id: drawer.row?.id, data })} saving={mutate.isPending} />
        )
      )}

      {/* Modal Cetak Data */}
      <PrintOptionModal
        isOpen={printOptionModalOpen}
        onClose={() => setPrintOptionModalOpen(false)}
        onPrint={handlePrintClean}
        onDownloadPdf={handleDownloadPdfTable}
        title={config.title}
      />
    </PageContainer>
  )
}

class MutabaahErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <div className="p-6"><section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#1B2433]"><ErrorState retry={() => this.setState({ failed: false })} /></section></div>
    return this.props.children
  }
}

function CrudDrawer({ config, state, options, close, save, saving }: any) {
  const defaults = state.row ? Object.fromEntries(config.fields.map((f: Field) => [f.name, f.type === 'date' ? state.row[f.name]?.slice?.(0, 10) || '' : state.row[f.name] ?? (f.type === 'boolean' ? true : '')])) : blank(config)
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: zodResolver(formSchema), defaultValues: defaults })
  const selectedUnit = options.units?.find((u: any) => u.id === watch('education_unit_id'))
  const boarding = /pesantren|ma.?had/i.test(selectedUnit?.name || '')
  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-slate-950/70 backdrop-blur-md" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <motion.form initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: .2 }} className="w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto flex flex-col dark:bg-[#1B2433] relative" onSubmit={handleSubmit(save)}>
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
        <header className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              {state.mode === 'create' ? <Plus className="size-5" /> : state.mode === 'detail' ? <Eye className="size-5" /> : <Pencil className="size-5" />}
            </div>
            <div>
              <small className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Mutaba’ah Yaumiyyah</small>
              <h2 className="text-base font-black text-slate-900 dark:text-white">{state.mode === 'create' ? 'Tambah' : state.mode === 'detail' ? 'Detail' : 'Edit'} {config.title}</h2>
            </div>
          </div>
          <button type="button" onClick={close} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"><X className="size-5" /></button>
        </header>
        <main className="p-5 space-y-4 flex-1">
          {config.fields.filter((field: Field) => !field.conditional || (field.conditional === 'boarding' ? boarding : !boarding)).map((field: Field) => (
            <FormField key={field.name} field={field} register={register} error={errors[field.name]?.message} options={options} disabled={state.mode === 'detail'} />
          ))}
        </main>
        <footer className="flex justify-end gap-2 border-t border-slate-100 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40">
          <Button appearance="outline" size="sm" type="button" onClick={close} className="cursor-pointer">Tutup</Button>
          {state.mode !== 'detail' && (
            <Button variant="primary" size="sm" type="submit" disabled={saving} className="cursor-pointer">
              {saving && <Loader2 className="size-4 animate-spin mr-1" />} Simpan
            </Button>
          )}
        </footer>
      </motion.form>
    </div>
  )
}

function FormField({ field, register, error, options, disabled }: any) {
  if (field.type === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
        <input disabled={disabled} type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" {...register(field.name)} />
        <span>{field.label}</span>
      </label>
    )
  }

  if (field.type === 'textarea') {
    return (
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{field.label}</label>
        <textarea disabled={disabled} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white" {...register(field.name)} />
        {error && <em className="text-[11px] text-rose-500 mt-1 block">{error}</em>}
      </div>
    )
  }

  const maps: Record<string, [string, string][]> = {
    categories: options.categories?.map((x: any) => [x.id, `${x.code} — ${x.name}`]) || [],
    units: options.units?.map((x: any) => [x.id, x.name]) || [],
    templates: options.templates?.map((x: any) => [x.id, `${x.code} — ${x.name}`]) || [],
    employees: options.employees?.map((x: any) => [x.id, x.nama_lengkap]) || [],
    classes: options.classes?.map((x: any) => [x.id, x.nama_kelas]) || [],
    students: options.students?.map((x: any) => [x.id, x.full_name]) || [],
    semesters: options.semesters?.map((x: any) => [x.id, x.name]) || [],
    academic_years: options.academic_years?.map((x: any) => [x.id, x.name]) || [],
    status: [['active', 'Aktif'], ['inactive', 'Nonaktif']],
    input_type: [['status', 'Status'], ['yes_no', 'Ya / Tidak'], ['checklist', 'Checklist'], ['number', 'Angka'], ['duration', 'Durasi'], ['pages', 'Halaman'], ['verses', 'Ayat'], ['text', 'Teks']],
    supervisor_type: [['pembimbing', 'Pembimbing'], ['wali_kelas', 'Wali Kelas'], ['guru_pai', 'Guru PAI'], ['guru_tahfizh', 'Guru Tahfizh'], ['musyrif', 'Musyrif'], ['musyrifah', 'Musyrifah']],
  }

  if (maps[field.type]) {
    return (
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{field.label}{field.required && ' *'}</label>
        <select disabled={disabled} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white" {...register(field.name)}>
          <option value="">Pilih {field.label}</option>
          {maps[field.type].map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
        {error && <em className="text-[11px] text-rose-500 mt-1 block">{error}</em>}
      </div>
    )
  }

  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{field.label}{field.required && ' *'}</label>
      <input disabled={disabled} type={field.type} step={field.type === 'number' ? '0.01' : undefined} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white" {...register(field.name, { valueAsNumber: field.type === 'number' })} />
      {error && <em className="text-[11px] text-rose-500 mt-1 block">{error}</em>}
    </div>
  )
}

function RowActions({ row, resource, onDrawer, onRefresh }: any) {
  const remove = async () => { if (!(await confirmDelete(1)).isConfirmed) return; try { await mutabaahService.enterpriseDelete(resource, row.id); onRefresh(); toast('success', 'Data dipindahkan ke sampah.') } catch (error) { showError(error) } }
  const restore = async () => { try { await mutabaahService.enterpriseRestore(resource, row.id); onRefresh(); toast('success', 'Data berhasil dipulihkan.') } catch (error) { showError(error) } }
  return (
    <div className="flex items-center justify-center gap-1.5">
      <button title="Detail" onClick={() => onDrawer({ mode: 'detail', row })} className="rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer">
        <Eye className="size-3.5" />
      </button>
      {resource === 'templates' && !row.trashed && (
        <button title="Susun Agenda" onClick={() => onDrawer({ mode: 'items', row })} className="rounded-lg border border-indigo-200 bg-indigo-50 p-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300 cursor-pointer">
          <GripVertical className="size-3.5" />
        </button>
      )}
      {row.trashed ? (
        <button title="Pulihkan" onClick={restore} className="rounded-lg border border-emerald-200 bg-emerald-50 p-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 cursor-pointer">
          <ArchiveRestore className="size-3.5" />
        </button>
      ) : (
        <>
          <button title="Edit" onClick={() => onDrawer({ mode: 'edit', row })} className="rounded-lg border border-amber-200 bg-amber-50 p-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300 cursor-pointer">
            <Pencil className="size-3.5" />
          </button>
          <button title="Hapus" onClick={remove} className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 cursor-pointer">
            <Trash2 className="size-3.5" />
          </button>
        </>
      )}
    </div>
  )
}

function TemplateItemsDrawer({ template, options, close, refresh }: any) {
  const [items, setItems] = useState(template.items || [])
  const [agendaId, setAgendaId] = useState('')
  const update = async (item: any, changes: any) => { try { await mutabaahService.templateItemUpdate(item.id, changes); setItems((old: any[]) => old.map((x) => x.id === item.id ? { ...x, ...changes } : x)); toast('success', 'Item diperbarui.') } catch (error) { showError(error) } }
  const move = async (index: number, offset: number) => { const target = index + offset; if (target < 0 || target >= items.length) return; const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; setItems(next); await mutabaahService.templateReorder(template.id, next.map((item, i) => ({ id: item.id, sort_order: i + 1 }))) }
  const add = async () => { if (!agendaId) return; try { const result = await mutabaahService.templateItemCreate(template.id, { agenda_item_id: agendaId, sort_order: items.length + 1, weight: 1, is_required: true, requires_parent_signature: false, is_active: true }); setItems([...items, result.data]); setAgendaId(''); toast('success', result.message) } catch (error) { showError(error) } }
  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-slate-950/70 backdrop-blur-md">
      <aside className="w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col dark:bg-[#1B2433] relative">
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-400 to-emerald-500 shrink-0" />
        <header className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
              <GripVertical className="size-5" />
            </div>
            <div>
              <small className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Detail Template</small>
              <h2 className="text-base font-black text-slate-900 dark:text-white">{template.name}</h2>
            </div>
          </div>
          <button onClick={close} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"><X className="size-5" /></button>
        </header>
        <main className="p-5 space-y-3 flex-1">
          <div className="flex gap-2 mb-4">
            <select value={agendaId} onChange={(e) => setAgendaId(e.target.value)} className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <option value="">Pilih agenda...</option>
              {options.agendas?.filter((a: any) => !items.some((i: any) => i.agenda_item_id === a.id)).map((a: any) => <option value={a.id} key={a.id}>{a.code} — {a.name}</option>)}
            </select>
            <Button variant="primary" size="sm" onClick={add} className="cursor-pointer"><Plus className="size-4 mr-1" /> Tambah</Button>
          </div>

          {items.map((item: any, index: number) => (
            <article className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 text-xs" key={item.id}>
              <div className="flex items-center gap-1.5 font-bold text-slate-400">
                <GripVertical className="size-4" />
                <span>{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <b className="block font-bold text-slate-800 dark:text-slate-200 truncate">{item.agenda_item?.name || item.agendaItem?.name || '-'}</b>
                <small className="text-[10px] text-slate-400">{item.agenda_item?.category?.name || 'Agenda template'}</small>
              </div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Bobot
                <input type="number" defaultValue={item.weight} onBlur={(e) => update(item, { weight: Number(e.target.value) })} className="w-14 ml-1 rounded border border-slate-200 p-1 text-center font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </label>
              <div className="flex items-center gap-1">
                <button disabled={!index} onClick={() => move(index, -1)} className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"><ArrowUp className="size-3" /></button>
                <button disabled={index === items.length - 1} onClick={() => move(index, 1)} className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"><ArrowDown className="size-3" /></button>
                <button onClick={async () => { await mutabaahService.templateItemDelete(item.id); setItems(items.filter((x: any) => x.id !== item.id)) }} className="p-1 rounded border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 cursor-pointer"><Trash2 className="size-3" /></button>
              </div>
            </article>
          ))}

          {!items.length && <EmptyState onCreate={() => null} compact />}
        </main>
        <footer className="flex justify-end p-4 border-t border-slate-100 dark:border-slate-800">
          <Button appearance="outline" size="sm" onClick={() => { refresh(); close() }} className="cursor-pointer">Selesai</Button>
        </footer>
      </aside>
    </div>
  )
}

function Cell({ row, path }: { row: Row; path: string }) {
  if (path === 'period') return period(row)
  if (path === 'scope') return row.kelas?.name || row.rombel?.nama_kelas || row.mentoring_group || 'Semua scope'
  if (path === 'boarding') return [row.dormitory_id, row.room_id].filter(Boolean).join(' / ') || '-'
  const value = read(row, path)
  if (path === 'is_active' || path === 'status') {
    const active = path === 'is_active' ? Boolean(value) : value === 'active'
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
        active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
      }`}>
        {active ? 'Aktif' : 'Nonaktif'}
      </span>
    )
  }
  return <span className="font-semibold text-slate-800 dark:text-slate-200">{value?.value || value || '-'}</span>
}

function EmptyState({ onCreate, compact = false }: any) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
      <Search className="size-8 mb-2 text-slate-300 dark:text-slate-600" />
      <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum ada data</h3>
      <p className="text-[11px] text-slate-400 mt-0.5">Data belum tersedia atau tidak cocok dengan filter aktif.</p>
      {!compact && (
        <Button variant="primary" size="sm" className="mt-3 cursor-pointer" onClick={onCreate}>
          <Plus className="size-4 mr-1" /> Tambah Data
        </Button>
      )}
    </div>
  )
}

function ErrorState({ retry }: any) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-rose-500">
      <X className="size-8 mb-2 text-rose-400" />
      <h3 className="text-xs font-bold">Data gagal dimuat</h3>
      <p className="text-[11px] text-slate-400 mt-0.5">Periksa koneksi atau permission, kemudian coba kembali.</p>
      <Button appearance="outline" size="sm" className="mt-3 cursor-pointer" onClick={retry}>Coba Lagi</Button>
    </div>
  )
}

const confirmDelete = (count: number) => Swal.fire({ icon: 'warning', title: `Hapus ${count} data?`, text: 'Data akan dipindahkan ke sampah dan dapat dipulihkan.', showCancelButton: true, confirmButtonText: 'Hapus', cancelButtonText: 'Batal', confirmButtonColor: '#dc2626' })
const toast = (icon: any, text: string) => Swal.fire({ toast: true, position: 'top-end', icon, title: text, timer: 1800, showConfirmButton: false })
function showError(error: any) { Swal.fire({ icon: 'error', title: 'Tidak dapat memproses', text: error?.response?.data?.message || 'Terjadi kesalahan saat menghubungi server.', confirmButtonColor: '#0E5C44' }) }
