import {
  BarChart3,
  Download,
  FileText,
  Printer,
  RefreshCw,
  SearchX,
  TrendingUp,
} from 'lucide-react'
import { MasterStatCard, MasterStatsGrid } from '../master-data'

const angka = (nilai) => new Intl.NumberFormat('id-ID').format(Number(nilai || 0))

export function ReportHeader({ title, description, onRefresh, onExport, eyebrow = 'Pusat Laporan' }) {
  return (
    <header className="laporan-header">
      <div className="laporan-heading-copy">
        <div className="laporan-eyebrow"><FileText size={14} /> {eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="panel-aksi-laporan">
        <button type="button" className="laporan-button" onClick={onRefresh}><RefreshCw size={16} /> Muat Ulang</button>
        {onExport && <button type="button" className="laporan-button" onClick={onExport}><Download size={16} /> Export Excel</button>}
        <button type="button" className="laporan-button laporan-button--primary" onClick={() => window.print()}><Printer size={16} /> Cetak / PDF</button>
      </div>
      <div className="laporan-hero-art" aria-hidden="true"><BarChart3 /></div>
    </header>
  )
}

export function ReportFilters({ children }) {
  return (
    <section className="laporan-filter-card">
      <div className="laporan-section-heading"><div><span>FILTER</span><h2>Filter Laporan</h2></div><small>Sesuaikan data yang ingin ditampilkan</small></div>
      <div className="laporan-filter">{children}</div>
    </section>
  )
}

export function ReportStats({ items }) {
  const defaultIcons = [BarChart3, TrendingUp, FileText, RefreshCw]
  const variants = ['success', 'info', 'warning', 'neutral']
  return (
    <MasterStatsGrid className={`laporan-kpis ${items.length === 5 ? 'laporan-kpis--five' : ''}`}>
      {items.map((item, index) => (
        <MasterStatCard
          key={item.label}
          icon={item.icon || defaultIcons[index % defaultIcons.length]}
          label={item.label}
          value={typeof item.value === 'string' ? item.value : angka(item.value)}
          description={item.note}
          variant={item.variant || variants[index % variants.length]}
          delay={40 + (index * 40)}
        />
      ))}
    </MasterStatsGrid>
  )
}

export function ReportTable({ columns, rows, empty = 'Belum ada data pada filter ini.', title = 'Rincian Data' }) {
  return (
    <section className="laporan-table-card">
      <div className="laporan-table-heading"><div><span>DATA LAPORAN</span><h2>{title}</h2></div><strong>{angka(rows.length)} data</strong></div>
      <div className="laporan-table-wrap">
        <table className="laporan-table">
          <thead><tr><th>No</th>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead>
          <tbody>
            {rows.length ? rows.map((row, index) => (
              <tr key={row.id || index}>
                <td className="laporan-row-number">{index + 1}</td>
                {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : (row[column.key] ?? '-')}</td>)}
              </tr>
            )) : (
              <tr><td colSpan={columns.length + 1} className="laporan-empty"><SearchX size={28} /><strong>Data tidak ditemukan</strong><span>{empty}</span></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function ReportState({ loading, error, children }) {
  if (loading) return <div className="laporan-state"><RefreshCw className="laporan-spin" size={24} /><strong>Memuat laporan</strong><span>Menyiapkan data terbaru...</span></div>
  if (error) return <div className="laporan-state laporan-state--error"><FileText size={24} /><strong>Laporan gagal dimuat</strong><span>{error}</span></div>
  return children
}

export function exportCsv(filename, columns, rows) {
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
  const header = columns.map((column) => escape(column.label)).join(',')
  const body = rows.map((row) => columns.map((column) => (
    escape(column.export ? column.export(row) : row[column.key])
  )).join(','))
  const blob = new Blob([`\uFEFF${[header, ...body].join('\n')}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
