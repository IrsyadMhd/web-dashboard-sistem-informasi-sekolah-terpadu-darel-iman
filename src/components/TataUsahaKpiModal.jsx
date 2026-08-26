import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Users,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Modal } from './ui/modal'
import { Skeleton } from './ui/skeleton'
import { EmptyState } from './ui/empty-state'
import { SquircleActionButton } from './master-data'
import { managementDashboardService } from '../services/managementDashboardService'

const MODAL_CONFIG = {
  total_siswa: {
    title: 'Total Siswa Aktif',
    subtitle: 'Daftar siswa aktif beserta perbandingan jenis kelamin',
    icon: Users,
    summaryKeys: ['total', 'laki_laki', 'perempuan'],
    summaryLabels: { total: 'Total', laki_laki: 'Laki-laki', perempuan: 'Perempuan' },
    columns: [
      { key: 'nama', label: 'Nama Siswa' },
      { key: 'nis', label: 'NIS' },
      { key: 'nisn', label: 'NISN' },
      { key: 'jenis_kelamin', label: 'Jenis Kelamin' },
      { key: 'kelas', label: 'Kelas' },
      { key: 'status', label: 'Status' },
    ],
  },
  total_pegawai: {
    title: 'Total Pegawai & Guru',
    subtitle: 'Daftar SDM beserta perbandingan jenis kelamin',
    icon: UserCheck,
    summaryKeys: ['total', 'laki_laki', 'perempuan'],
    summaryLabels: { total: 'Total', laki_laki: 'Laki-laki', perempuan: 'Perempuan' },
    columns: [
      { key: 'nama', label: 'Nama Pegawai' },
      { key: 'niy', label: 'NIY' },
      { key: 'nik', label: 'NIK' },
      { key: 'jenis_kelamin', label: 'Jenis Kelamin' },
      { key: 'jabatan', label: 'Jabatan' },
      { key: 'unit', label: 'Unit' },
    ],
  },
  absensi_hari_ini: {
    title: 'Absensi Terverifikasi Hari Ini',
    subtitle: 'Rekap presensi gerbang siswa dan pegawai',
    icon: CheckCircle2,
    tabs: [
      { id: 'siswa_hadir', label: 'Siswa Hadir' },
      { id: 'siswa_belum_absen', label: 'Siswa Belum Absen' },
      { id: 'pegawai', label: 'Pegawai' },
    ],
    summaryKeys: ['total_verified', 'siswa_hadir', 'siswa_belum_absen', 'pegawai_hadir'],
    summaryLabels: {
      total_verified: 'Total Terverifikasi',
      siswa_hadir: 'Siswa Hadir',
      siswa_belum_absen: 'Siswa Belum Absen',
      pegawai_hadir: 'Pegawai Hadir',
    },
    columnsByTab: {
      siswa_hadir: [
        { key: 'nama', label: 'Nama Siswa' },
        { key: 'nis', label: 'NIS' },
        { key: 'kelas', label: 'Kelas' },
        { key: 'status', label: 'Status' },
        { key: 'jam_masuk', label: 'Jam Masuk' },
      ],
      siswa_belum_absen: [
        { key: 'nama', label: 'Nama Siswa' },
        { key: 'nis', label: 'NIS' },
        { key: 'kelas', label: 'Kelas' },
        { key: 'jenis_kelamin', label: 'Jenis Kelamin' },
        { key: 'status', label: 'Status' },
      ],
      pegawai: [
        { key: 'nama', label: 'Nama Pegawai' },
        { key: 'niy', label: 'NIY' },
        { key: 'jabatan', label: 'Jabatan' },
        { key: 'status', label: 'Status' },
        { key: 'jam_masuk', label: 'Jam Masuk' },
      ],
    },
  },
  siswa_incomplete: {
    title: 'Siswa Belum Lengkap',
    subtitle: 'Data siswa yang masih perlu dilengkapi (NISN, Tgl Lahir, Wali Murid)',
    icon: AlertTriangle,
    summaryKeys: ['total'],
    summaryLabels: { total: 'Total Perlu Diisi' },
    columns: [
      { key: 'nama', label: 'Nama Siswa' },
      { key: 'nis', label: 'NIS' },
      { key: 'nisn', label: 'NISN' },
      { key: 'kelas', label: 'Kelas' },
      { key: 'keterangan', label: 'Data Kurang' },
    ],
  },
  pegawai_incomplete: {
    title: 'Pegawai Belum Lengkap',
    subtitle: 'Data pegawai yang NIY atau NIK belum terisi',
    icon: AlertTriangle,
    summaryKeys: ['total'],
    summaryLabels: { total: 'Total Perlu Diisi' },
    columns: [
      { key: 'nama', label: 'Nama Pegawai' },
      { key: 'niy', label: 'NIY' },
      { key: 'nik', label: 'NIK' },
      { key: 'jabatan', label: 'Jabatan' },
      { key: 'keterangan', label: 'Data Kurang' },
    ],
  },
}

function SummaryPills({ summary, keys, labels }) {
  if (!summary) return null

  const colors = {
    total: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    laki_laki: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
    perempuan: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
    total_verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    siswa_hadir: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    siswa_belum_absen: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    pegawai_hadir: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
  }

  return (
    <div className="flex flex-wrap gap-2">
      {keys.map((key) => (
        <div
          key={key}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold ${colors[key] || colors.total}`}
        >
          <span className="font-medium opacity-80">{labels[key]}:</span>
          <span>{Number(summary[key] ?? 0).toLocaleString('id-ID')}</span>
        </div>
      ))}
    </div>
  )
}

export default function TataUsahaKpiModal({ type, isOpen, onClose }) {
  const config = MODAL_CONFIG[type]
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [items, setItems] = useState([])
  const [summary, setSummary] = useState(null)
  const [meta, setMeta] = useState({})
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState('siswa_hadir')

  const fetchData = useCallback(async () => {
    if (!config || !type) return
    setLoading(true)
    setError(null)
    try {
      const res = await managementDashboardService.getTataUsahaKpiDetail(type, {
        search: search || undefined,
        page,
        per_page: 50,
        ...(type === 'absensi_hari_ini' ? { tab: activeTab } : {}),
      })
      const payload = res?.data || {}
      setItems(payload.items || [])
      setSummary(payload.summary || null)
      setMeta(payload.meta || {})
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat detail KPI.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [config, type, search, page, activeTab])

  useEffect(() => {
    if (isOpen && type) {
      fetchData()
    } else {
      setItems([])
      setSummary(null)
      setMeta({})
      setSearch('')
      setPage(1)
      setActiveTab('siswa_hadir')
      setError(null)
    }
  }, [isOpen, type, fetchData])

  useEffect(() => {
    if (isOpen) setPage(1)
  }, [search, activeTab, isOpen])

  if (!isOpen || !config) return null

  const IconComponent = config.icon || Users
  const columns = type === 'absensi_hari_ini'
    ? config.columnsByTab[activeTab]
    : config.columns

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-6xl"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              {config.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium dark:text-slate-400">
              {config.subtitle}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500 font-medium">
            Menampilkan <span className="font-bold text-slate-800 dark:text-white">{items.length}</span>
            {meta.total != null && (
              <> dari <span className="font-bold text-slate-800 dark:text-white">{meta.total}</span> data</>
            )}
          </p>
          <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
            <SquircleActionButton
              variant="neutral"
              icon={X}
              label="Tutup"
              onClick={onClose}
            />
            <SquircleActionButton
              variant="restore"
              icon={RefreshCw}
              label="Segarkan"
              onClick={fetchData}
              disabled={loading}
              className={loading ? 'opacity-70' : ''}
            />
          </div>
        </div>
      }
    >
      <div className="space-y-4 p-5">
        <SummaryPills summary={summary} keys={config.summaryKeys} labels={config.summaryLabels} />

        {config.tabs && (
          <div className="flex flex-wrap items-center gap-2 rounded-[20px] border border-emerald-500/20 bg-emerald-50/50 p-2 dark:border-emerald-800/40 dark:bg-emerald-950/30">
            {config.tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-2xl px-4 py-2 text-xs font-extrabold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25'
                    : 'bg-white/80 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="relative rounded-2xl border border-emerald-500/20 bg-white p-3 shadow-xs dark:border-emerald-800/40 dark:bg-slate-900">
          <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, NIS, NIY..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <EmptyState title="Gagal memuat data" description={error} />
        ) : items.length === 0 ? (
          <EmptyState title="Tidak ada data" description="Belum ada record untuk ditampilkan." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#13221f]">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-extrabold uppercase tracking-wider text-white border-b border-emerald-700">
                <tr>
                  <th className="px-4 py-3.5 w-12 text-center text-white font-extrabold">No</th>
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3.5 text-white font-extrabold">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 transition-colors">
                    <td className="px-4 py-3 text-center text-xs font-bold text-slate-400">
                      {((meta.current_page || 1) - 1) * (meta.per_page || 50) + idx + 1}
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-200">
                        {row[col.key] ?? '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.last_page > 1 && (
          <div className="flex items-center justify-between pt-2">
            <SquircleActionButton
              variant="neutral"
              icon={ChevronLeft}
              label="Sebelumnya"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
            />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {page} / {meta.last_page}
            </span>
            <SquircleActionButton
              variant="neutral"
              icon={ChevronRight}
              label="Selanjutnya"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= meta.last_page}
            />
          </div>
        )}
      </div>
    </Modal>
  )
}

TataUsahaKpiModal.propTypes = {
  type: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}
