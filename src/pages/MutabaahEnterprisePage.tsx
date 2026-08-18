import { Component, ReactNode, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod/dist/zod.mjs'
import { z } from 'zod'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import {
  ArchiveRestore, ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, Eye,
  FileDown, GripVertical, Loader2, Pencil, Plus, Printer, Search, SlidersHorizontal,
  Trash2, Upload, X,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { motion } from 'framer-motion'
import { mutabaahService } from '../services/mutabaahService'
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
    title: 'Rincian Agenda TU', subtitle: 'Kelola agenda, jenis input, bobot, dan status untuk seluruh template.',
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
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sort, setSort] = useState('created_at')
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<string[]>([])
  const [drawer, setDrawer] = useState<{ mode: 'create' | 'edit' | 'detail' | 'items'; row?: Row } | null>(null)
  const importRef = useRef<HTMLInputElement>(null)

  useEffect(() => { const timer = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400); return () => clearTimeout(timer) }, [searchInput])
  const params = { search, status, category_id: categoryId, sort, direction, page, per_page: 15, with_trashed: 1 }
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
    { id: 'select', header: () => <input aria-label="Pilih semua" type="checkbox" checked={rows.length > 0 && rows.every((r) => selected.includes(r.id))} onChange={(e) => setSelected(e.target.checked ? rows.map((r) => r.id) : [])} />, cell: ({ row }) => <input aria-label={`Pilih ${row.original.name || row.original.id}`} type="checkbox" checked={selected.includes(row.original.id)} onChange={() => setSelected((old) => old.includes(row.original.id) ? old.filter((id) => id !== row.original.id) : [...old, row.original.id])} /> },
    { id: 'number', header: 'No', cell: ({ row }) => (meta.current_page - 1) * 15 + row.index + 1 },
    ...config.columns.map(([key, label]): ColumnDef<Row> => ({ id: key, header: () => <button className="me-sort" onClick={() => sortColumn(key)}>{label}{sort === key && (direction === 'asc' ? <ArrowUp /> : <ArrowDown />)}</button>, cell: ({ row }) => <Cell row={row.original} path={key} /> })),
    { id: 'actions', header: 'Aksi', cell: ({ row }) => <RowActions row={row.original} resource={resource} onDrawer={setDrawer} onRefresh={refresh} /> },
  ]
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel(), manualPagination: true, manualSorting: true })

  const exportData = async (format: string) => {
    try { const response = await mutabaahService.enterpriseExport(resource, format, params); const url = URL.createObjectURL(response.data); const a = document.createElement('a'); a.href = url; a.download = `mutabaah-${resource}.${format}`; a.click(); URL.revokeObjectURL(url) } catch (error) { showError(error) }
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

  return <div className="me-page">
    <header className="me-hero"><div><span>Mutaba’ah Yaumiyyah</span><h1>{config.title}</h1><p>{config.subtitle}</p><small>Dashboard › Mutaba’ah › {config.title}</small></div><div className="me-hero-actions"><button onClick={() => window.print()}><Printer /> Print</button><button onClick={() => exportData('pdf')}><FileDown /> PDF</button><button onClick={() => exportData('xlsx')}><Download /> Excel</button><button className="primary" onClick={() => setDrawer({ mode: 'create' })}><Plus /> Tambah</button></div></header>
    <section className="me-toolbar"><label><Search /><input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder={`Cari ${config.title.toLowerCase()}...`} /></label>{resource === 'agendas' && <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}><option value="">Semua Kategori</option>{optionsQuery.data?.categories?.map((x: any) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>}<select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Semua Status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select><button><SlidersHorizontal /> Filter</button><input ref={importRef} hidden type="file" accept=".xlsx,.xls,.csv" onChange={(e) => importData(e.target.files?.[0])} /><button onClick={() => importRef.current?.click()}><Upload /> Import</button>{selected.length > 0 && <button className="danger" onClick={bulkDelete}><Trash2 /> Hapus {selected.length}</button>}</section>
    <section className="me-card"><div className="me-table-wrap"><table><thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody>
      {listQuery.isLoading && Array.from({ length: 7 }).map((_, index) => <tr className="me-skeleton" key={index}><td colSpan={columns.length}><i /></td></tr>)}
      {listQuery.isError && <tr><td colSpan={columns.length}><ErrorState retry={() => listQuery.refetch()} /></td></tr>}
      {!listQuery.isLoading && !listQuery.isError && table.getRowModel().rows.map((row) => <tr key={row.id} className={row.original.trashed ? 'trashed' : ''}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}
      {!listQuery.isLoading && !listQuery.isError && !rows.length && <tr><td colSpan={columns.length}><EmptyState onCreate={() => setDrawer({ mode: 'create' })} /></td></tr>}
    </tbody></table></div><footer className="me-pagination"><span>Menampilkan {rows.length} dari {meta.total || 0} data</span><div><button disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft /></button><b>{page}</b><span>/ {meta.last_page || 1}</span><button disabled={page >= meta.last_page} onClick={() => setPage(page + 1)}><ChevronRight /></button></div></footer></section>
    {drawer && (drawer.mode === 'items' ? <TemplateItemsDrawer template={drawer.row!} options={optionsQuery.data || {}} close={() => setDrawer(null)} refresh={refresh} /> : <CrudDrawer config={config} state={drawer} options={optionsQuery.data || {}} close={() => setDrawer(null)} save={(data: any) => mutate.mutate({ id: drawer.row?.id, data })} saving={mutate.isPending} />)}
  </div>
}

class MutabaahErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <div className="me-page"><section className="me-card"><ErrorState retry={() => this.setState({ failed: false })} /></section></div>
    return this.props.children
  }
}

function CrudDrawer({ config, state, options, close, save, saving }: any) {
  const defaults = state.row ? Object.fromEntries(config.fields.map((f: Field) => [f.name, f.type === 'date' ? state.row[f.name]?.slice?.(0, 10) || '' : state.row[f.name] ?? (f.type === 'boolean' ? true : '')])) : blank(config)
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: zodResolver(formSchema), defaultValues: defaults })
  const selectedUnit = options.units?.find((u: any) => u.id === watch('education_unit_id'))
  const boarding = /pesantren|ma.?had/i.test(selectedUnit?.name || '')
  return <div className="me-drawer-layer" onMouseDown={(e) => e.target === e.currentTarget && close()}><motion.form initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: .2 }} className="me-drawer" onSubmit={handleSubmit(save)}><header><div><small>Mutaba’ah Yaumiyyah</small><h2>{state.mode === 'create' ? 'Tambah' : state.mode === 'detail' ? 'Detail' : 'Edit'} {config.title}</h2></div><button type="button" onClick={close}><X /></button></header><main>{config.fields.filter((field: Field) => !field.conditional || (field.conditional === 'boarding' ? boarding : !boarding)).map((field: Field) => <FormField key={field.name} field={field} register={register} error={errors[field.name]?.message} options={options} disabled={state.mode === 'detail'} />)}</main><footer><button type="button" onClick={close}>Tutup</button>{state.mode !== 'detail' && <button className="primary" disabled={saving}>{saving && <Loader2 className="spin" />} Simpan</button>}</footer></motion.form></div>
}

function FormField({ field, register, error, options, disabled }: any) {
  if (field.type === 'boolean') return <label className="me-switch"><input disabled={disabled} type="checkbox" {...register(field.name)} /><span>{field.label}</span></label>
  if (field.type === 'textarea') return <label><span>{field.label}</span><textarea disabled={disabled} {...register(field.name)} />{error && <em>{error}</em>}</label>
  const maps: Record<string, [string, string][]> = {
    categories: options.categories?.map((x: any) => [x.id, `${x.code} — ${x.name}`]) || [],
    units: options.units?.map((x: any) => [x.id, x.name]) || [], templates: options.templates?.map((x: any) => [x.id, `${x.code} — ${x.name}`]) || [],
    employees: options.employees?.map((x: any) => [x.id, x.nama_lengkap]) || [], classes: options.classes?.map((x: any) => [x.id, x.nama_kelas]) || [],
    students: options.students?.map((x: any) => [x.id, x.full_name]) || [], semesters: options.semesters?.map((x: any) => [x.id, x.name]) || [],
    academic_years: options.academic_years?.map((x: any) => [x.id, x.name]) || [],
    status: [['active', 'Aktif'], ['inactive', 'Nonaktif']],
    input_type: [['status', 'Status'], ['yes_no', 'Ya / Tidak'], ['checklist', 'Checklist'], ['number', 'Angka'], ['duration', 'Durasi'], ['pages', 'Halaman'], ['verses', 'Ayat'], ['text', 'Teks']],
    supervisor_type: [['pembimbing', 'Pembimbing'], ['wali_kelas', 'Wali Kelas'], ['guru_pai', 'Guru PAI'], ['guru_tahfizh', 'Guru Tahfizh'], ['musyrif', 'Musyrif'], ['musyrifah', 'Musyrifah']],
  }
  if (maps[field.type]) return <label><span>{field.label}{field.required && ' *'}</span><select disabled={disabled} {...register(field.name)}><option value="">Pilih {field.label}</option>{maps[field.type].map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>{error && <em>{error}</em>}</label>
  return <label><span>{field.label}{field.required && ' *'}</span><input disabled={disabled} type={field.type} step={field.type === 'number' ? '0.01' : undefined} {...register(field.name, { valueAsNumber: field.type === 'number' })} />{error && <em>{error}</em>}</label>
}

function RowActions({ row, resource, onDrawer, onRefresh }: any) {
  const remove = async () => { if (!(await confirmDelete(1)).isConfirmed) return; try { await mutabaahService.enterpriseDelete(resource, row.id); onRefresh(); toast('success', 'Data dipindahkan ke sampah.') } catch (error) { showError(error) } }
  const restore = async () => { try { await mutabaahService.enterpriseRestore(resource, row.id); onRefresh(); toast('success', 'Data berhasil dipulihkan.') } catch (error) { showError(error) } }
  return <div className="me-actions"><button title="Detail" onClick={() => onDrawer({ mode: 'detail', row })}><Eye /></button>{resource === 'templates' && !row.trashed && <button title="Susun Agenda" onClick={() => onDrawer({ mode: 'items', row })}><GripVertical /></button>}{row.trashed ? <button title="Pulihkan" onClick={restore}><ArchiveRestore /></button> : <><button title="Edit" onClick={() => onDrawer({ mode: 'edit', row })}><Pencil /></button><button className="danger" title="Hapus" onClick={remove}><Trash2 /></button></>}</div>
}

function TemplateItemsDrawer({ template, options, close, refresh }: any) {
  const [items, setItems] = useState(template.items || [])
  const [agendaId, setAgendaId] = useState('')
  const update = async (item: any, changes: any) => { try { await mutabaahService.templateItemUpdate(item.id, changes); setItems((old: any[]) => old.map((x) => x.id === item.id ? { ...x, ...changes } : x)); toast('success', 'Item diperbarui.') } catch (error) { showError(error) } }
  const move = async (index: number, offset: number) => { const target = index + offset; if (target < 0 || target >= items.length) return; const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; setItems(next); await mutabaahService.templateReorder(template.id, next.map((item, i) => ({ id: item.id, sort_order: i + 1 }))) }
  const add = async () => { if (!agendaId) return; try { const result = await mutabaahService.templateItemCreate(template.id, { agenda_item_id: agendaId, sort_order: items.length + 1, weight: 1, is_required: true, requires_parent_signature: false, is_active: true }); setItems([...items, result.data]); setAgendaId(''); toast('success', result.message) } catch (error) { showError(error) } }
  return <div className="me-drawer-layer"><aside className="me-drawer me-items-drawer"><header><div><small>Detail Template</small><h2>{template.name}</h2></div><button onClick={close}><X /></button></header><main><div className="me-add-item"><select value={agendaId} onChange={(e) => setAgendaId(e.target.value)}><option value="">Pilih agenda...</option>{options.agendas?.filter((a: any) => !items.some((i: any) => i.agenda_item_id === a.id)).map((a: any) => <option value={a.id} key={a.id}>{a.code} — {a.name}</option>)}</select><button onClick={add}><Plus /> Tambah</button></div>{items.map((item: any, index: number) => <article className="me-template-item" key={item.id}><div className="me-drag"><GripVertical /><span>{index + 1}</span></div><div className="me-item-name"><b>{item.agenda_item?.name || item.agendaItem?.name || '-'}</b><small>{item.agenda_item?.category?.name || 'Agenda template'}</small></div><label>Bobot<input type="number" defaultValue={item.weight} onBlur={(e) => update(item, { weight: Number(e.target.value) })} /></label><label>Target<input type="number" defaultValue={item.target_value || ''} onBlur={(e) => update(item, { target_value: e.target.value || null })} /></label><label className="compact"><input type="checkbox" checked={item.is_required} onChange={(e) => update(item, { is_required: e.target.checked })} /> Wajib</label><label className="compact"><input type="checkbox" checked={item.requires_parent_signature} onChange={(e) => update(item, { requires_parent_signature: e.target.checked })} /> Paraf Ortu</label><label className="compact"><input type="checkbox" checked={item.is_active} onChange={(e) => update(item, { is_active: e.target.checked })} /> Aktif</label><div className="me-reorder"><button disabled={!index} onClick={() => move(index, -1)}><ArrowUp /></button><button disabled={index === items.length - 1} onClick={() => move(index, 1)}><ArrowDown /></button><button className="danger" onClick={async () => { await mutabaahService.templateItemDelete(item.id); setItems(items.filter((x: any) => x.id !== item.id)) }}><Trash2 /></button></div></article>)}{!items.length && <EmptyState onCreate={() => null} compact />}</main><footer><button onClick={() => { refresh(); close() }}>Selesai</button></footer></aside></div>
}

function Cell({ row, path }: { row: Row; path: string }) {
  if (path === 'period') return period(row)
  if (path === 'scope') return row.kelas?.name || row.rombel?.nama_kelas || row.mentoring_group || 'Semua scope'
  if (path === 'boarding') return [row.dormitory_id, row.room_id].filter(Boolean).join(' / ') || '-'
  const value = read(row, path)
  if (path === 'is_active' || path === 'status') { const active = path === 'is_active' ? Boolean(value) : value === 'active'; return <span className={`me-status ${active ? 'active' : ''}`}>{active ? 'Aktif' : 'Nonaktif'}</span> }
  return <>{value?.value || value || '-'}</>
}
function EmptyState({ onCreate, compact = false }: any) { return <div className={`me-empty-state ${compact ? 'compact' : ''}`}><Search /><h3>Belum ada data</h3><p>Data belum tersedia atau tidak cocok dengan filter aktif.</p>{!compact && <button onClick={onCreate}><Plus /> Tambah Data</button>}</div> }
function ErrorState({ retry }: any) { return <div className="me-empty-state error"><X /><h3>Data gagal dimuat</h3><p>Periksa koneksi atau permission, kemudian coba kembali.</p><button onClick={retry}>Coba Lagi</button></div> }
const confirmDelete = (count: number) => Swal.fire({ icon: 'warning', title: `Hapus ${count} data?`, text: 'Data akan dipindahkan ke sampah dan dapat dipulihkan.', showCancelButton: true, confirmButtonText: 'Hapus', cancelButtonText: 'Batal', confirmButtonColor: '#dc2626' })
const toast = (icon: any, text: string) => Swal.fire({ toast: true, position: 'top-end', icon, title: text, timer: 1800, showConfirmButton: false })
function showError(error: any) { Swal.fire({ icon: 'error', title: 'Tidak dapat memproses', text: error?.response?.data?.message || 'Terjadi kesalahan saat menghubungi server.', confirmButtonColor: '#0E5C44' }) }
