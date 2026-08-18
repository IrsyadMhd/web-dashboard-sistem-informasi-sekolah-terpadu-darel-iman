import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  CheckCircle2,
  Target,
  Award,
  Activity,
  Users,
  Building2,
  BookOpen,
  UserCheck,
  HeartHandshake,
  School,
  DollarSign,
  Layers,
  Sparkles,
} from 'lucide-react'
import KpiCard from './app/KpiCard'

const ikonStat = {
  'Total Unit': Building2,
  'Unit Pendidikan': Building2,
  'Total Guru': UserCheck,
  'Guru': UserCheck,
  'Total Pegawai': Users,
  'Pegawai': Users,
  'Total Siswa': GraduationCap,
  'Siswa': GraduationCap,
  'Orang Tua': HeartHandshake,
  'Alumni': Sparkles,
  'Total Kelas': School,
  'Kelas': School,
  'Rombel': Layers,
  'Kehadiran Hari Ini': CheckCircle2,
  'Target Tahfizh Sekolah': Target,
  'Prestasi Siswa': Award,
  'Mutabaah Yaumiyah': Activity,
  'Kurikulum & Mapel': BookOpen,
  'Keuangan': DollarSign,
}

const colorSchemeMap = {
  'Unit Pendidikan': 'emerald',
  'Guru': 'blue',
  'Pegawai': 'violet',
  'Siswa': 'indigo',
  'Orang Tua': 'rose',
  'Alumni': 'amber',
  'Kelas': 'blue',
  'Rombel': 'violet',
}

/**
 * StatCard - adapter kompatibel (DashboardPage superadmin) menuju KpiCard canonical.
 * Semua KPI aplikasi kini memakai KpiCard canonical yang sama.
 */
export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendType = 'up',
  trendText = 'dari bulan lalu',
  onClickTo,
  onClick,
}) {
  const navigate = useNavigate()
  const Icon = ikonStat[title] || Target
  const colorScheme = colorSchemeMap[title] || 'emerald'

  const handleClick = (e) => {
    if (onClick) {
      onClick(e)
    } else if (onClickTo) {
      navigate(onClickTo)
    }
  }

  return (
    <KpiCard
      title={title}
      value={value}
      icon={Icon}
      trend={trend || undefined}
      trendType={trendType}
      trendText={trendText}
      subtitle={subtitle}
      colorScheme={colorScheme}
      onClick={onClickTo || onClick ? handleClick : undefined}
    />
  )
}
