import React, { useState, useEffect, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  Award,
  Building2,
  ChevronRight,
  FileSpreadsheet,
  GraduationCap,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  UsersRound,
} from 'lucide-react'
import api from '../../services/api'
import { Modal } from '../ui/modal'
import { Button } from '../ui/button'
import { MasterBadge } from '../master-data'
import { PersonIdentityCell } from '../ui/PersonIdentityCell'
import KpiDetailDrawer from '../KpiDetailDrawer'
import { FoundationExportModal } from './FoundationExportModal'

const CONFIGS = {
  peningkatan: {
    title: 'Detail Peningkatan & Kinerja Unit Pendidikan',
    subtitle: 'Analisis pertumbuhan jumlah siswa, pegawai, dan rombel per unit',
    icon: TrendingUp,
    badgeColor: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
  pegawai_kpi: {
    title: 'Detail KPI & Kinerja Pegawai/Guru',
    subtitle: 'Rekapitulasi SDM, rasio pendidik, dan status kepegawaian seluruh unit',
    icon: UserCheck,
    badgeColor: 'bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
  },
  siswa_mobility: {
    title: 'Detail Pergerakan Siswa (Masuk vs Keluar)',
    subtitle: 'Rekapitulasi pendaftaran baru, mutasi masuk, mutasi keluar, dan kelulusan',
    icon: UsersRound,
    badgeColor: 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  },
  siswa_berprestasi: {
    title: 'Detail & Rekapitulasi Siswa Berprestasi',
    subtitle: 'Daftar capaian prestasi akademik, tahfizh, olahraga, dan seni peserta didik',
    icon: Award,
    badgeColor: 'bg-purple-50 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300',
  },
}

export function FoundationUnitKpiModal({ type, isOpen, onClose, units = [] }) {
  const config = CONFIGS[type] || CONFIGS.peningkatan
  const IconComponent = config.icon

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [dataList, setDataList] = useState([])
  const [search, setSearch] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('all')
  const [showExport, setShowExport] = useState(false)

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)
  const [selectedDetailType, setSelectedDetailType] = useState('pegawai')

  const fetchData = useCallback(async () => {
    if (!type || !isOpen) return
    setLoading(true)
    setError(false)

    try {
      let endpoint = '/foundation/units'
      let params = {
        unit_id: selectedUnit !== 'all' ? selectedUnit : undefined,
        search: search || undefined,
        per_page: 100,
      }

      if (type === 'pegawai_kpi') {
        endpoint = '/foundation/employees'
      } else if (type === 'siswa_mobility') {
        endpoint = '/foundation/student-mutations'
      } else if (type === 'siswa_berprestasi') {
        endpoint = '/foundation/laporan/prestasi'
      }

      const res = await api.get(endpoint, { params })
      const resData = res.data
      let list = []

      if (Array.isArray(resData)) {
        list = resData
      } else if (resData?.data) {
        if (Array.isArray(resData.data)) {
          list = resData.data
        } else if (resData.data.data && Array.isArray(resData.data.data)) {
          list = resData.data.data
        } else if (resData.data.report?.details) {
          list = resData.data.report.details
        }
      }

      setDataList(list)
    } catch (err) {
      console.error(`Failed to fetch KPI modal data (${type}):`, err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [type, isOpen, selectedUnit, search])

  useEffect(() => {
    if (isOpen) {
      fetchData()
    } else {
      setDataList([])
      setSearch('')
      setSelectedUnit('all')
      setError(false)
    }
  }, [isOpen, fetchData])

  const filteredItems = useMemo(() => {
    if (!search.trim()) return dataList
    const q = search.toLowerCase()
    return dataList.filter((item) => {
      const name = String(item.name || item.nama || item.nama_lengkap || item.full_name || item.siswa_nama || '').toLowerCase()
      const code = String(item.code || item.kode || item.niy || item.nis || item.nisn || item.judul_prestasi || '').toLowerCase()
      const unit = String(item.unit?.name || item.education_unit?.name || item.unit_nama || '').toLowerCase()
      return name.includes(q) || code.includes(q) || unit.includes(q)
    })
  }, [dataList, search])

  const exportRows = useMemo(() => {
    return filteredItems.map((item, idx) => {
      if (type === 'peningkatan') {
        return {
          No: idx + 1,
          Kode: item.code || item.kode || '-',
          Unit: item.name || item.nama || '-',
          Level: item.jenis_unit || item.level || '-',
          'Total Siswa': item.siswa_aktif_count || 0,
          'Siswa Baru': item.siswa_baru_count || 0,
          Guru: item.guru_count || 0,
          Pegawai: item.pegawai_count || 0,
          Rombel: item.rombel_count || 0,
          Status: item.is_active ? 'Aktif' : 'Nonaktif',
        }
      } else if (type === 'pegawai_kpi') {
        return {
          No: idx + 1,
          'NIY / NIK': item.niy || item.nik || '-',
          Nama: item.nama_lengkap || item.nama || '-',
          Jabatan: item.position?.nama_jabatan || item.jabatan || 'Staf',
          'Unit Kerja': item.unit?.name || item.unit?.code || '-',
          'Status Pegawai': item.status_pegawai || 'Tetap',
          Status: item.status || 'Aktif',
        }
      } else if (type === 'siswa_mobility') {
        return {
          No: idx + 1,
          'NIS / NISN': item.nis || item.nisn || '-',
          Nama: item.full_name || item.nama || '-',
          'Unit Pendidikan': item.education_unit?.name || item.unit?.name || '-',
          Jenis: item.metadata?.mutasi_type || item.type || 'Mutasi',
          Keterangan: item.metadata?.keterangan || item.reason || 'Pergerakan Siswa',
        }
      } else {
        return {
          No: idx + 1,
          'Nama Siswa': item.siswa_nama || item.student?.full_name || item.full_name || '-',
          Unit: item.unit_nama || item.education_unit?.name || '-',
          'Judul Prestasi': item.judul_prestasi || item.title || '-',
          Bidang: item.jenis_prestasi || item.category || 'Akademik',
          Tingkat: item.tingkat || 'Kota',
          Peringkat: item.peringkat || item.rank || 'Juara 1',
        }
      }
    })
  }, [filteredItems, type])

  if (!isOpen) return null

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="max-w-5xl"
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
          <div className="flex w-full items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Total <strong className="text-slate-800 dark:text-white">{filteredItems.length}</strong> record terdata
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowExport(true)}
                className="gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 px-3.5"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span>Export Excel</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onClose}
                className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 px-4"
              >
                Tutup
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kata kunci data..."
                className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-white dark:bg-[#1B2433] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            {units.length > 0 && (
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-white dark:bg-[#1B2433] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
              >
                <option value="all">Semua Unit Pendidikan</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.code}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={fetchData}
              title="Refresh"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Data Content Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse">Memuat data KPI...</div>
            ) : error ? (
              <div className="p-8 text-center text-xs text-rose-500 font-bold">Gagal mengambil data. Silakan muat ulang.</div>
            ) : filteredItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 italic">Belum ada data sesuai filter pencarian.</div>
            ) : (
              <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
                <thead className="bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
                  {type === 'peningkatan' && (
                    <tr>
                      <th className="px-3 py-3 text-center w-10">No</th>
                      <th className="px-4 py-3">Unit Pendidikan</th>
                      <th className="px-4 py-3">Jenjang</th>
                      <th className="px-4 py-3 text-center">Total Siswa</th>
                      <th className="px-4 py-3 text-center">Siswa Baru</th>
                      <th className="px-4 py-3 text-center">Pegawai</th>
                      <th className="px-4 py-3 text-center">Guru</th>
                      <th className="px-4 py-3 text-center">Rombel</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  )}
                  {type === 'pegawai_kpi' && (
                    <tr>
                      <th className="px-3 py-3 text-center w-10">No</th>
                      <th className="px-4 py-3">Nama SDM</th>
                      <th className="px-4 py-3">NIY / NIK</th>
                      <th className="px-4 py-3">Unit Kerja</th>
                      <th className="px-4 py-3">Jabatan</th>
                      <th className="px-4 py-3 text-center">Status Pegawai</th>
                      <th className="px-4 py-3 text-center">Keaktifan</th>
                    </tr>
                  )}
                  {type === 'siswa_mobility' && (
                    <tr>
                      <th className="px-3 py-3 text-center w-10">No</th>
                      <th className="px-4 py-3">Nama Siswa</th>
                      <th className="px-4 py-3">NIS / NISN</th>
                      <th className="px-4 py-3">Unit Pendidikan</th>
                      <th className="px-4 py-3 text-center">Tipe Pergerakan</th>
                      <th className="px-4 py-3">Keterangan</th>
                    </tr>
                  )}
                  {type === 'siswa_berprestasi' && (
                    <tr>
                      <th className="px-3 py-3 text-center w-10">No</th>
                      <th className="px-4 py-3">Nama Siswa</th>
                      <th className="px-4 py-3">Unit Pendidikan</th>
                      <th className="px-4 py-3">Judul Prestasi</th>
                      <th className="px-4 py-3 text-center">Bidang</th>
                      <th className="px-4 py-3 text-center">Tingkat</th>
                      <th className="px-4 py-3 text-center">Capaian</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredItems.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-3 text-center font-bold text-slate-400">{idx + 1}</td>

                      {type === 'peningkatan' && (
                        <>
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            {item.name || item.nama}
                            <div className="text-[10px] text-slate-400 font-normal">{item.code || item.kode}</div>
                          </td>
                          <td className="px-4 py-3 font-medium">{item.jenis_unit || item.level || '-'}</td>
                          <td className="px-4 py-3 text-center font-bold text-emerald-700 dark:text-emerald-400">
                            {(item.siswa_aktif_count || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-blue-600">
                            +{(item.siswa_baru_count || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-center font-medium">{item.pegawai_count || 0}</td>
                          <td className="px-4 py-3 text-center font-medium">{item.guru_count || 0}</td>
                          <td className="px-4 py-3 text-center font-medium">{item.rombel_count || 0}</td>
                          <td className="px-4 py-3 text-center">
                            <MasterBadge variant={item.is_active ? 'success' : 'neutral'}>
                              {item.is_active ? 'Aktif' : 'Nonaktif'}
                            </MasterBadge>
                          </td>
                        </>
                      )}

                      {type === 'pegawai_kpi' && (
                        <>
                          <td className="px-4 py-3">
                            <PersonIdentityCell
                              src={item.foto || item.photo}
                              name={item.nama_lengkap || item.nama}
                              subtitle={item.email || item.no_hp || '-'}
                            />
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{item.niy || item.nik || '-'}</td>
                          <td className="px-4 py-3 font-semibold">{item.unit?.name || item.unit?.code || '-'}</td>
                          <td className="px-4 py-3 font-medium">{item.position?.nama_jabatan || item.jabatan || 'Staf'}</td>
                          <td className="px-4 py-3 text-center font-semibold">{item.status_pegawai || 'Tetap'}</td>
                          <td className="px-4 py-3 text-center">
                            <MasterBadge variant={item.status === 'aktif' || !item.status ? 'success' : 'neutral'}>
                              {item.status || 'Aktif'}
                            </MasterBadge>
                          </td>
                        </>
                      )}

                      {type === 'siswa_mobility' && (
                        <>
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{item.full_name || item.nama || '-'}</td>
                          <td className="px-4 py-3 font-mono font-bold">{item.nis || item.nisn || '-'}</td>
                          <td className="px-4 py-3 font-medium">{item.education_unit?.name || item.unit?.name || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <MasterBadge variant={item.metadata?.mutasi_type === 'masuk' ? 'success' : 'warning'}>
                              {item.metadata?.mutasi_type === 'masuk' ? 'Siswa Masuk' : 'Siswa Keluar'}
                            </MasterBadge>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{item.metadata?.keterangan || item.reason || 'Proses Administrasi'}</td>
                        </>
                      )}

                      {type === 'siswa_berprestasi' && (
                        <>
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            {item.siswa_nama || item.student?.full_name || item.full_name || '-'}
                          </td>
                          <td className="px-4 py-3 font-medium">{item.unit_nama || item.education_unit?.name || '-'}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{item.judul_prestasi || item.title || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <MasterBadge variant="info">{item.jenis_prestasi || item.category || 'Akademik'}</MasterBadge>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-200">{item.tingkat || 'Kota'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                              {item.peringkat || item.rank || 'Juara 1'}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </Modal>

      <FoundationExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        title={config.title}
        rows={exportRows}
        filename={`KPI_${type}_Yayasan`}
      />
    </>
  )
}

FoundationUnitKpiModal.propTypes = {
  type: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  units: PropTypes.array,
}
