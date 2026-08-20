import { useCallback, useEffect, useMemo, useState } from 'react'
import { ReportFilters, ReportHeader, ReportState, ReportStats, ReportTable, exportCsv } from '../components/reports/ReportKit'
import { reportService } from '../services/reportService'
import { Badge } from '../components/tailgrids/core/badge'

const getStatusBadge = (row) => {
  const type = row.metadata?.mutasi_type || (row.metadata?.is_alumni ? 'alumni' : 'alumni')
  if (type === 'masuk') {
    return <Badge color="cyan" size="sm">Pemindahan Masuk</Badge>
  }
  if (type === 'keluar' || type === 'berhenti') {
    return <Badge color="warning" size="sm">Pemindahan Keluar</Badge>
  }
  return <Badge color="success" size="sm">Lulusan / Alumni</Badge>
}

const getTujuanText = (row) => {
  const tujuan = row.metadata?.tujuan_kelulusan || row.metadata?.perguruan_tinggi || row.metadata?.status_lanjutan || row.metadata?.pekerjaan || row.tujuan_kelulusan
  if (tujuan && tujuan !== '-') return tujuan
  if (row.metadata?.mutasi_type === 'masuk') return 'Pindahan Masuk (Siswa Aktif)'
  if (row.metadata?.mutasi_type === 'keluar') return 'Pindahan Keluar (Mutasi)'
  return 'Belum Diisi / Melanjutkan Studi'
}

const getTujuanBadge = (row) => {
  const text = getTujuanText(row)
  if (text.includes('Pindahan Masuk')) return <Badge color="sky" size="sm">{text}</Badge>
  if (text.includes('Pindahan Keluar')) return <Badge color="gray" size="sm">{text}</Badge>
  const lower = text.toLowerCase()
  if (lower.includes('ptn') || lower.includes('universitas') || lower.includes('kuliah') || lower.includes('tinggi')) {
    return <Badge color="purple" size="sm">{text}</Badge>
  }
  if (lower.includes('sekolah') || lower.includes('sma') || lower.includes('smk') || lower.includes('ma')) {
    return <Badge color="blue" size="sm">{text}</Badge>
  }
  if (lower.includes('kerja') || lower.includes('karir') || lower.includes('wirausaha')) {
    return <Badge color="orange" size="sm">{text}</Badge>
  }
  if (lower.includes('pesantren') || lower.includes('ponpes')) {
    return <Badge color="violet" size="sm">{text}</Badge>
  }
  return <Badge color="gray" size="sm">{text}</Badge>
}

const columns = [
  { key: 'nis', label: 'NIS / NISN', render: (row) => row.nis || row.nisn || '-' },
  { key: 'full_name', label: 'Nama Siswa / Alumni', render: (row) => row.full_name || row.nama || '-', export: (row) => row.full_name || row.nama },
  { key: 'gender', label: 'JK', render: (row) => row.gender || row.jenis_kelamin || '-' },
  { key: 'unit', label: 'Unit Pendidikan', render: (row) => row.education_unit?.name || row.unit?.name || '-', export: (row) => row.education_unit?.name || row.unit?.name },
  { key: 'jenis_status', label: 'Jenis Status', render: (row) => getStatusBadge(row), export: (row) => row.metadata?.mutasi_type === 'masuk' ? 'Pemindahan Masuk' : row.metadata?.mutasi_type === 'keluar' ? 'Pemindahan Keluar' : 'Lulusan / Alumni' },
  { key: 'tahun', label: 'Tahun (Lulus/Mutasi)', render: (row) => row.metadata?.tahun_lulus || row.metadata?.tahun_mutasi || new Date(row.updated_at || row.created_at).getFullYear(), export: (row) => row.metadata?.tahun_lulus || row.metadata?.tahun_mutasi || new Date(row.updated_at).getFullYear() },
  { key: 'tujuan_kelulusan', label: 'Data Tujuan Kelulusan Siswa', render: (row) => getTujuanBadge(row), export: (row) => getTujuanText(row) },
]

export default function LaporanAlumniPage() {
  const [search, setSearch] = useState('')
  const [tahunLulus, setTahunLulus] = useState('semua')
  const [mutasiType, setMutasiType] = useState('semua')
  const [tujuanKelulusan, setTujuanKelulusan] = useState('semua')

  const [rows, setRows] = useState([])
  const [dashboard, setDashboard] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const params = {}
      if (search) params.search = search
      if (tahunLulus !== 'semua') params.tahun_lulus = tahunLulus
      if (mutasiType !== 'semua') params.mutasi_type = mutasiType
      if (tujuanKelulusan !== 'semua') params.tujuan_kelulusan = tujuanKelulusan

      const [list, stats] = await Promise.all([
        reportService.alumni(params),
        reportService.alumniStats(),
      ])
      setRows(list.data || list || [])
      setDashboard(stats.data || stats || {})
    } catch (err) {
      setError(err?.response?.data?.message || 'Laporan kelulusan, mutasi & alumni gagal dimuat.')
    } finally {
      setLoading(false)
    }
  }, [search, tahunLulus, mutasiType, tujuanKelulusan])

  useEffect(() => { load() }, [load])

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchSearch = !search || `${row.full_name || ''} ${row.nis || ''} ${row.nisn || ''} ${getTujuanText(row)}`.toLowerCase().includes(search.toLowerCase())
      
      const rowTahun = String(row.metadata?.tahun_lulus || row.metadata?.tahun_mutasi || new Date(row.updated_at || row.created_at).getFullYear())
      const matchTahun = tahunLulus === 'semua' || rowTahun === String(tahunLulus)

      const type = row.metadata?.mutasi_type || 'alumni'
      const matchMutasi = mutasiType === 'semua'
        || (mutasiType === 'alumni' && (type === 'alumni' || !row.metadata?.mutasi_type))
        || (mutasiType === 'masuk' && type === 'masuk')
        || (mutasiType === 'keluar' && (type === 'keluar' || type === 'berhenti'))

      const tujuanText = getTujuanText(row).toLowerCase()
      const matchTujuan = tujuanKelulusan === 'semua'
        || (tujuanKelulusan === 'ptn' && (tujuanText.includes('ptn') || tujuanText.includes('universitas') || tujuanText.includes('kuliah')))
        || (tujuanKelulusan === 'sekolah' && (tujuanText.includes('sekolah') || tujuanText.includes('sma') || tujuanText.includes('smk') || tujuanText.includes('ma')))
        || (tujuanKelulusan === 'kerja' && (tujuanText.includes('kerja') || tujuanText.includes('karir') || tujuanText.includes('wirausaha')))
        || (tujuanKelulusan === 'pesantren' && (tujuanText.includes('pesantren') || tujuanText.includes('ponpes')))
        || (tujuanKelulusan === 'lainnya' && (!tujuanText || tujuanText.includes('belum')))

      return matchSearch && matchTahun && matchMutasi && matchTujuan
    })
  }, [rows, search, tahunLulus, mutasiType, tujuanKelulusan])

  const stats = useMemo(() => [
    { label: 'Total Alumni / Lulusan', value: dashboard.total_alumni || filteredRows.filter(r => !r.metadata?.mutasi_type).length, note: 'Siswa tamat / lulus' },
    { label: 'Pemindahan Masuk', value: dashboard.pindah_masuk || filteredRows.filter(r => r.metadata?.mutasi_type === 'masuk').length, note: 'Mutasi siswa masuk' },
    { label: 'Pemindahan Keluar', value: dashboard.pindah_keluar || filteredRows.filter(r => r.metadata?.mutasi_type === 'keluar' || r.metadata?.mutasi_type === 'berhenti').length, note: 'Mutasi siswa keluar' },
    { label: 'Lanjut Studi / Karir', value: dashboard.lanjut_studi || filteredRows.filter(r => getTujuanText(r) !== 'Belum Diisi / Melanjutkan Studi').length, note: 'Tujuan kelulusan tercatat' },
    { label: 'Total Prestasi', value: dashboard.total_prestasi || 0, note: 'Tercatat di sistem' },
  ], [dashboard, filteredRows])

  const yearsOptions = ['semua', '2026', '2025', '2024', '2023', '2022', '2021']

  return (
    <section className="laporan-page">
      <article className="laporan-produksi">
        <ReportHeader
          eyebrow="Rekap Data & Kesiswaan"
          title="Rekap Kelulusan, Pemindahan, & Alumni"
          description="Rekapitulasi kelulusan siswa, pemindahan masuk & keluar per tahun, serta penelusuran data tujuan kelulusan siswa dari backend."
          onRefresh={load}
          onExport={() => exportCsv('rekap-kelulusan-alumni-mutasi.csv', columns, filteredRows)}
        />
        <ReportFilters>
          <label>
            Cari Siswa / Alumni / Tujuan
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nama, NIS, NISN, atau Tujuan Kelulusan..."
            />
          </label>
          <label>
            Filter Tahun Lulus / Mutasi
            <select value={tahunLulus} onChange={(e) => setTahunLulus(e.target.value)}>
              <option value="semua">Semua Tahun</option>
              {yearsOptions.filter(y => y !== 'semua').map(y => (
                <option key={y} value={y}>Tahun {y}</option>
              ))}
            </select>
          </label>
          <label>
            Filter Jenis Status / Mutasi
            <select value={mutasiType} onChange={(e) => setMutasiType(e.target.value)}>
              <option value="semua">Semua Status & Mutasi</option>
              <option value="alumni">Lulusan / Alumni</option>
              <option value="masuk">Pemindahan Masuk (Mutasi Masuk)</option>
              <option value="keluar">Pemindahan Keluar (Mutasi Keluar)</option>
            </select>
          </label>
          <label>
            Filter Tujuan Kelulusan
            <select value={tujuanKelulusan} onChange={(e) => setTujuanKelulusan(e.target.value)}>
              <option value="semua">Semua Tujuan Kelulusan</option>
              <option value="ptn">Perguruan Tinggi (PTN / PTS)</option>
              <option value="sekolah">Sekolah Lanjutan (SMA/SMK/MA)</option>
              <option value="kerja">Bekerja / Karir / Wirausaha</option>
              <option value="pesantren">Pondok Pesantren</option>
              <option value="lainnya">Belum Diisi / Lainnya</option>
            </select>
          </label>
        </ReportFilters>
        <ReportState loading={loading} error={error}>
          <ReportStats items={stats} />
          <ReportTable title="Daftar Data Kelulusan, Pemindahan, & Alumni" columns={columns} rows={filteredRows} />
        </ReportState>
      </article>
    </section>
  )
}
