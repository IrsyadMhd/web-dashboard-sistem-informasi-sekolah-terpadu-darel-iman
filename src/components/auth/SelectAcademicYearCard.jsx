import { useState, useEffect } from 'react'
import { FiCalendar, FiCheckCircle } from 'react-icons/fi'
import { tahunAjaranService } from '../../services/tahunAjaranService'
import { Button } from '@/components/tailgrids/core/button'
import { Badge } from '@/components/tailgrids/core/badge'
import { Card } from '@/components/tailgrids/core/card'
import Swal from 'sweetalert2'

const DEFAULT_ACADEMIC_YEARS = [
  { id: '1', nama: '2024/2025', tahun_ajaran: '2024/2025' },
  { id: '2', nama: '2025/2026', tahun_ajaran: '2025/2026' },
  { id: '3', nama: '2023/2024', tahun_ajaran: '2023/2024' },
  { id: '4', nama: '2022/2023', tahun_ajaran: '2022/2023' },
  { id: '5', nama: '2021/2022', tahun_ajaran: '2021/2022' },
]

export default function SelectAcademicYearCard({ onNavigate, disabled = false }) {
  const [year, setYear] = useState('2024/2025')
  const [semester, setSemester] = useState('Genap')
  const [academicYears, setAcademicYears] = useState(DEFAULT_ACADEMIC_YEARS)

  useEffect(() => {
    tahunAjaranService
      .getDaftar()
      .then((res) => {
        const data = res?.data?.data || res?.data || []
        if (Array.isArray(data) && data.length > 0) {
          setAcademicYears(data)
          setYear(data[0].nama || data[0].tahun_ajaran || '2024/2025')
        }
      })
      .catch((err) => {
        console.error('Gagal memuat tahun ajaran:', err)
      })
  }, [])

  const handleContinue = () => {
    if (disabled) return
    Swal.fire({
      icon: 'success',
      title: 'Tahun Ajaran Disimpan',
      html: `Tahun Ajaran Aktif: <b>${year}</b> (${semester})`,
      timer: 1800,
      showConfirmButton: false,
    })
    if (onNavigate) onNavigate(8)
  }

  return (
    <Card
      className={`w-full rounded-[22px] border-2 border-emerald-500/25 bg-white p-6 lg:p-8 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433] space-y-6 ${
        disabled ? 'opacity-70 pointer-events-none' : ''
      }`}
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
          <span>Pilih Tahun Ajaran</span>
          {disabled && (
            <Badge color="warning" size="sm">
              🔒 Terkunci (Non-Aktif)
            </Badge>
          )}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {disabled
            ? 'Tahun ajaran aktif terikat pada sistem dan tidak dapat diubah.'
            : 'Tentukan tahun ajaran dan semester aktif yang digunakan untuk rekapitulasi data.'}
        </p>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Tahun Ajaran
          </label>
          <select
            value={year}
            disabled={disabled}
            onChange={(e) => setYear(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500"
          >
            {academicYears.map((ay) => (
              <option key={ay.id || ay.nama} value={ay.nama || ay.tahun_ajaran}>
                {ay.nama || ay.tahun_ajaran}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Semester
          </label>
          <select
            value={semester}
            disabled={disabled}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500"
          >
            <option value="Genap">Genap</option>
            <option value="Ganjil">Ganjil</option>
          </select>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-5 border border-emerald-100/90 dark:border-emerald-900/40 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <FiCalendar className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>Informasi Tahun Ajaran Aktif</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-100/60 dark:border-slate-800 shadow-xs">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Tahun Ajaran</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{year}</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Semester</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{semester}</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Periode</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {semester === 'Genap' ? 'Januari 2025 - Juni 2025' : 'Juli 2024 - Desember 2024'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block font-medium mb-0.5">Status</span>
            <Badge color="success" size="sm" prefixIcon={FiCheckCircle}>
              Aktif
            </Badge>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button type="button" variant="primary" size="md" disabled={disabled} onClick={handleContinue}>
          Simpan &amp; Lanjutkan
        </Button>
      </div>
    </Card>
  )
}
