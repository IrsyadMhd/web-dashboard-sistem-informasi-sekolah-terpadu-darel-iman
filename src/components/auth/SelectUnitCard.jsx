import { useState, useEffect } from 'react'
import { FiSearch, FiCheck } from 'react-icons/fi'
import { FaGraduationCap, FaSchool, FaBookQuran, FaBuildingColumns } from 'react-icons/fa6'
import { Button } from '@/components/tailgrids/core/button'
import { Badge } from '@/components/tailgrids/core/badge'
import { Card } from '@/components/tailgrids/core/card'
import { educationUnitService } from '../../services/educationUnitService'
import Swal from 'sweetalert2'

const DEFAULT_UNITS = [
  { id: 'tkit', name: 'TKIT', fullName: 'TKIT Dar El-Iman', subtext: 'Unit Pendidikan Anak Dini', icon: FaSchool },
  { id: 'sdit', name: 'SDIT', fullName: 'SDIT Dar El-Iman', subtext: 'Unit Pendidikan Dasar', icon: FaGraduationCap },
  { id: 'smpit', name: 'SMPIT', fullName: 'SMPIT Dar El-Iman', subtext: 'Unit Pendidikan Menengah Pertama', icon: FaBuildingColumns },
  { id: 'smait', name: 'SMAIT', fullName: 'SMAIT Dar El-Iman', subtext: 'Unit Pendidikan Menengah Atas', icon: FaBuildingColumns },
  { id: 'ponpes', name: 'Pondok Pesantren', fullName: 'Pondok Pesantren Dar El-Iman', subtext: 'Unit Pesantren & Asrama', icon: FaBookQuran },
  { id: 'mahad', name: 'Ma\'had Aly', fullName: 'Ma\'had Aly Dar El-Iman', subtext: 'Unit Pendidikan Tinggi Islam', icon: FaBuildingColumns },
]

export default function SelectUnitCard({ onNavigate, disabled = false }) {
  const [selectedUnit, setSelectedUnit] = useState('sdit')
  const [search, setSearch] = useState('')
  const [units, setUnits] = useState(DEFAULT_UNITS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    educationUnitService
      .getDaftar()
      .then((res) => {
        const raw = res?.data?.data || res?.data || []
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map((item) => ({
            id: String(item.id || item.code || item.name),
            name: item.name || item.nama_unit || item.code,
            fullName: item.full_name || item.nama_panjang || item.name || 'Unit Pendidikan',
            subtext: item.level ? `Jenjang: ${item.level}` : 'Yayasan Dar El-Iman',
            icon: item.name?.toLowerCase().includes('tk')
              ? FaSchool
              : item.name?.toLowerCase().includes('sd')
              ? FaGraduationCap
              : item.name?.toLowerCase().includes('ponpes') || item.name?.toLowerCase().includes('pesantren')
              ? FaBookQuran
              : FaBuildingColumns,
          }))
          setUnits(mapped)
          setSelectedUnit(mapped[0].id)
        }
      })
      .catch((err) => {
        console.error('Gagal memuat unit pendidikan:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const filtered = units.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.fullName.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = () => {
    if (disabled) return
    const activeObj = units.find((u) => u.id === selectedUnit) || units[0]
    Swal.fire({
      icon: 'success',
      title: 'Unit Pendidikan Dipilih',
      html: `Unit aktif berhasil disetel ke <b>${activeObj.fullName || activeObj.name}</b>`,
      timer: 1800,
      showConfirmButton: false,
    })
    if (onNavigate) onNavigate(7)
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
          <span>Pilih Unit Pendidikan</span>
          {disabled ? (
            <Badge color="warning" size="sm">
              🔒 Terkunci (Non-Aktif)
            </Badge>
          ) : (
            <Badge color="success" size="sm">
              {units.length} Unit Pendidikan Aktif
            </Badge>
          )}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {disabled
            ? 'Pemilihan unit pendidikan tidak aktif untuk role akun ini.'
            : 'Pilih unit pendidikan yang akan Anda kelola.'}
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <FiSearch className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          disabled={disabled}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari unit pendidikan..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800"
        />
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((unit) => {
          const isSelected = selectedUnit === unit.id
          const IconComp = unit.icon

          return (
            <div
              key={unit.id}
              onClick={() => !disabled && setSelectedUnit(unit.id)}
              className={`relative p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${
                disabled ? 'cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40' : 'cursor-pointer'
              } ${
                isSelected
                  ? 'border-[#0E5C44] dark:border-[#3FBF75] bg-emerald-50/40 dark:bg-emerald-950/30 shadow-xs ring-2 ring-emerald-600/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-slate-50/50 shadow-xs'
              }`}
            >
              {/* Icon Badge */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-[#0E5C44] dark:bg-[#3FBF75] text-amber-300 dark:text-slate-900 shadow-md shadow-emerald-700/20'
                    : 'bg-emerald-100/70 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                <IconComp />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">
                  {unit.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{unit.subtext}</p>
              </div>

              {/* Selection Checkmark */}
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-[#0E5C44] dark:bg-[#3FBF75] text-white dark:text-slate-900 flex items-center justify-center shrink-0 shadow-xs">
                  <FiCheck className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button type="button" variant="primary" size="md" disabled={disabled} onClick={handleSelect}>
          Pilih Unit Ini
        </Button>
      </div>
    </Card>
  )
}
