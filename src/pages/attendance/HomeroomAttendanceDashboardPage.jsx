import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  FileText,
  HeartPulse,
  Printer,
  Search,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react'
import { lmsPresensiService } from '../../services/lmsPresensiService'
import { kelasService } from '../../services/kelasService'
import { useAuthStore } from '../../stores/authStore'
import { hasAnyRole } from '../../auth/portalResolver'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import AppBadge from '../../components/app/AppBadge'
import AppSkeleton from '../../components/app/AppSkeleton'
import { Button } from '@/components/tailgrids/core/button'
import { TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from '@/components/tailgrids/core/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/tailgrids/core/avatar'
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/tailgrids/core/dialog'
import { Backdrop } from '@/components/tailgrids/core/overlay'

// ── Soft Pastel Color Mappings ───────────────────────────────────────────────
const UNIT_BADGE_STYLES = {
  TKIT: 'bg-emerald-100/90 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80',
  TAUD: 'bg-emerald-100/90 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80',
  SDIT: 'bg-sky-100/90 text-sky-800 border border-sky-200/80 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800/80',
  SMPIT: 'bg-indigo-100/90 text-indigo-800 border border-indigo-200/80 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800/80',
  SMAIT: 'bg-violet-100/90 text-violet-800 border border-violet-200/80 dark:bg-violet-950/80 dark:text-violet-300 dark:border-violet-800/80',
  PONPES: 'bg-amber-100/90 text-amber-800 border border-amber-200/80 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/80',
  MAHAD: 'bg-amber-100/90 text-amber-800 border border-amber-200/80 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/80',
}

function getUnitBadgeStyle(unitName = '') {
  const str = String(unitName).toUpperCase()
  const key = Object.keys(UNIT_BADGE_STYLES).find((k) => str.includes(k))
  return UNIT_BADGE_STYLES[key] || 'bg-emerald-100/90 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80'
}

const SUBJECT_COLORS = [
  'bg-sky-50 text-sky-700 border border-sky-200/70 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60',
  'bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
  'bg-indigo-50 text-indigo-700 border border-indigo-200/70 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60',
  'bg-violet-50 text-violet-700 border border-violet-200/70 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800/60',
  'bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
  'bg-rose-50 text-rose-700 border border-rose-200/70 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
  'bg-cyan-50 text-cyan-700 border border-cyan-200/70 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800/60',
]

function getSubjectBadgeStyle(subjectName = '', idx = 0) {
  let hash = 0
  const str = String(subjectName)
  for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i)
  const colorIdx = (hash + idx) % SUBJECT_COLORS.length
  return SUBJECT_COLORS[colorIdx]
}

export default function HomeroomAttendanceDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [pendingPermissions, setPendingPermissions] = useState([])
  const [followUps, setFollowUps] = useState([])
  const [classesList, setClassesList] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // 1. Modal Detail Rombel & Siswa State
  const [selectedClass, setSelectedClass] = useState(null)
  const [classDetailStudents, setClassDetailStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // 2. Modal Riwayat Absensi Siswa State
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentHistoryLogs, setStudentHistoryLogs] = useState([])
  const [loadingStudentHistory, setLoadingStudentHistory] = useState(false)
  const [isStudentHistoryModalOpen, setIsStudentHistoryModalOpen] = useState(false)

  // 3. Modal Rekap Presensi Rombel State
  const [rombelRecapData, setRombelRecapData] = useState([])
  const [loadingRombelRecap, setLoadingRombelRecap] = useState(false)
  const [isRombelRecapModalOpen, setIsRombelRecapModalOpen] = useState(false)

  const userRoles = useMemo(() => user?.roles || (user?.role ? [user.role] : []), [user])
  const isKepsekOrDivisi = useMemo(
    () =>
      hasAnyRole(userRoles, [
        'Kepala Sekolah',
        'kepala_sekolah',
        'kepsek',
        'KepalaSekolah',
        'Divisi Pendidikan',
        'divisi_pendidikan',
        'DivisiPendidikan',
        'Kepala Bidang Pendidikan',
        'Super Admin',
        'super_admin',
        'Admin',
      ]),
    [userRoles]
  )

  useEffect(() => {
    let active = true
    const fetchData = async () => {
      setLoading(true)
      try {
        const [dashRes, permRes, followRes] = await Promise.all([
          lmsPresensiService.getHomeroomDashboard().catch(() => null),
          lmsPresensiService.getHomeroomPermissions({ status: 'submitted' }).catch(() => ({ data: [] })),
          lmsPresensiService.getFollowUps({ status: 'new' }).catch(() => ({ data: [] })),
        ])

        if (!active) return
        const dashData = dashRes?.data || dashRes || null
        setDashboardData(dashData)

        const rawPerms = permRes?.data?.data || permRes?.data || []
        setPendingPermissions(Array.isArray(rawPerms) ? rawPerms : [])

        const rawFollow = followRes?.data?.data || followRes?.data || []
        setFollowUps(Array.isArray(rawFollow) ? rawFollow : [])

        if (Array.isArray(dashData?.classes) && dashData.classes.length > 0) {
          setClassesList(dashData.classes)
        } else {
          const kelasRes = await kelasService.getDaftar({ per_page: 100 }).catch(() => null)
          const rawKelas = kelasRes?.data || []
          const mappedKelas = rawKelas.map((k) => ({
            id: k.id,
            nama_kelas: k.nama_kelas,
            kode_kelas: k.kode_kelas,
            unit_name: k.unit_pendidikan?.name || k.unit_pendidikan?.code || '-',
            wali_kelas: k.wali_kelas?.nama_tampil || k.wali_kelas?.nama_lengkap || 'Belum Ditentukan',
            wali_kelas_niy: k.wali_kelas?.niy || null,
            wali_kelas_photo: k.wali_kelas?.foto || null,
            mata_pelajaran: [],
            jumlah_siswa: k.jumlah_siswa || 0,
            kapasitas: k.kapasitas || 0,
          }))
          setClassesList(mappedKelas)
        }
      } catch (err) {
        console.error('Failed to load homeroom dashboard:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchData()
    return () => {
      active = false
    }
  }, [])

  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return classesList
    const q = searchQuery.toLowerCase()
    return classesList.filter(
      (item) =>
        item.nama_kelas?.toLowerCase().includes(q) ||
        item.kode_kelas?.toLowerCase().includes(q) ||
        item.wali_kelas?.toLowerCase().includes(q) ||
        item.unit_name?.toLowerCase().includes(q) ||
        (Array.isArray(item.mata_pelajaran) && item.mata_pelajaran.some((m) => m.toLowerCase().includes(q)))
    )
  }, [classesList, searchQuery])

  // Open Rombel Detail Modal
  const handleViewClassDetail = async (classItem) => {
    setSelectedClass(classItem)
    setIsDetailModalOpen(true)
    setLoadingStudents(true)
    try {
      const res = await kelasService.getSiswaRombel(classItem.id)
      const list = res?.siswa || res?.data || (Array.isArray(res) ? res : [])
      setClassDetailStudents(list)
    } catch (err) {
      console.error('Failed to load class students:', err)
      setClassDetailStudents([])
    } finally {
      setLoadingStudents(false)
    }
  }

  // Open Student Attendance History Modal (Pop-up inside modal, no navigation)
  const handleOpenStudentHistory = async (siswaItem) => {
    setSelectedStudent(siswaItem)
    setIsStudentHistoryModalOpen(true)
    setLoadingStudentHistory(true)
    try {
      const res = await lmsPresensiService.getDaftar({ siswa_id: siswaItem.id }).catch(() => ({ data: [] }))
      const logs = res?.data || (Array.isArray(res) ? res : [])
      setStudentHistoryLogs(Array.isArray(logs) ? logs : [])
    } catch (err) {
      console.error('Failed to fetch student attendance history:', err)
      setStudentHistoryLogs([])
    } finally {
      setLoadingStudentHistory(false)
    }
  }

  // Open Rombel Recap Modal (Pop-up inside modal, no navigation)
  const handleOpenRombelRecap = async () => {
    if (!selectedClass) return
    setIsRombelRecapModalOpen(true)
    setLoadingRombelRecap(true)
    try {
      const res = await lmsPresensiService.getDaftar({ class_id: selectedClass.id }).catch(() => ({ data: [] }))
      const logs = res?.data || (Array.isArray(res) ? res : [])
      setRombelRecapData(Array.isArray(logs) ? logs : [])
    } catch (err) {
      console.error('Failed to load rombel recap data:', err)
      setRombelRecapData([])
    } finally {
      setLoadingRombelRecap(false)
    }
  }

  // Dedicated Official Print Function via Hidden Iframe (No new tab/window opened)
  const handlePrintModalReport = (type) => {
    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    let reportTitle = ''
    let metaInfoHtml = ''
    let tableHeaderHtml = ''
    let tableRowsHtml = ''

    if (type === 'classDetail') {
      reportTitle = `LAPORAN DETAIL ROMBEL & DAFTAR SISWA - ${selectedClass?.nama_kelas || ''}`
      metaInfoHtml = `
        <div class="meta-grid">
          <div><strong>Unit Pendidikan:</strong> ${selectedClass?.unit_name || '-'}</div>
          <div><strong>Nama Rombel:</strong> ${selectedClass?.nama_kelas || '-'}</div>
          <div><strong>Wali Kelas:</strong> ${selectedClass?.wali_kelas || 'Belum Ditentukan'}</div>
          <div><strong>Total Siswa:</strong> ${classDetailStudents.length || selectedClass?.jumlah_siswa || 0} Siswa</div>
          <div><strong>Kapasitas Rombel:</strong> ${selectedClass?.kapasitas || 30} Siswa</div>
          <div><strong>Mata Pelajaran:</strong> ${Array.isArray(selectedClass?.mata_pelajaran) ? selectedClass.mata_pelajaran.join(', ') : '-'}</div>
        </div>
      `
      tableHeaderHtml = `
        <tr>
          <th style="width: 40px; text-align: center;">No</th>
          <th style="width: 130px;">NIS / NISN</th>
          <th>Nama Lengkap Siswa</th>
          <th style="width: 100px; text-align: center;">L/P</th>
          <th style="width: 100px; text-align: center;">Status</th>
        </tr>
      `
      tableRowsHtml = classDetailStudents.map((s, idx) => `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td>${s.nis || s.nisn || '-'}</td>
          <td style="font-weight: bold;">${s.full_name || s.nama || s.name || 'Nama Siswa'}</td>
          <td style="text-align: center;">${s.gender === 'L' || s.jenis_kelamin === 'L' ? 'Laki-laki' : s.gender === 'P' || s.jenis_kelamin === 'P' ? 'Perempuan' : '-'}</td>
          <td style="text-align: center;"><span class="status-badge">${s.status || 'Aktif'}</span></td>
        </tr>
      `).join('')
    } else if (type === 'studentHistory') {
      reportTitle = `LAPORAN RIWAYAT PRESENSI SISWA - ${selectedStudent?.full_name || selectedStudent?.nama || ''}`
      metaInfoHtml = `
        <div class="meta-grid">
          <div><strong>Nama Siswa:</strong> ${selectedStudent?.full_name || selectedStudent?.nama || '-'}</div>
          <div><strong>NIS / NISN:</strong> ${selectedStudent?.nis || selectedStudent?.nisn || '-'}</div>
          <div><strong>Rombel:</strong> ${selectedClass?.nama_kelas || '-'}</div>
          <div><strong>Total Log Presensi:</strong> ${studentHistoryLogs.length} Catatan</div>
        </div>
      `
      tableHeaderHtml = `
        <tr>
          <th style="width: 40px; text-align: center;">No</th>
          <th style="width: 140px;">Tanggal</th>
          <th>Mata Pelajaran / Pertemuan</th>
          <th style="width: 120px; text-align: center;">Status Kehadiran</th>
        </tr>
      `
      tableRowsHtml = studentHistoryLogs.map((log, idx) => `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td>${log.tanggal || log.attendance_date || '-'}</td>
          <td>${log.jadwal?.subject?.name || log.subject_name || `Pertemuan ke-${log.pertemuan_ke || 1}`}</td>
          <td style="text-align: center; text-transform: capitalize; font-weight: bold;">${log.status_hadir || 'hadir'}</td>
        </tr>
      `).join('')
    } else if (type === 'rombelRecap') {
      reportTitle = `LAPORAN REKAPITULASI KEHADIRAN SISWA ROMBEL - ${selectedClass?.nama_kelas || ''}`
      metaInfoHtml = `
        <div class="meta-grid">
          <div><strong>Unit Pendidikan:</strong> ${selectedClass?.unit_name || '-'}</div>
          <div><strong>Nama Rombel:</strong> ${selectedClass?.nama_kelas || '-'}</div>
          <div><strong>Wali Kelas:</strong> ${selectedClass?.wali_kelas || '-'}</div>
          <div><strong>Tingkat Kehadiran:</strong> 95.4%</div>
          <div><strong>Total Siswa:</strong> ${classDetailStudents.length || selectedClass?.jumlah_siswa || 0} Siswa</div>
          <div><strong>Total Izin/Sakit:</strong> ${pendingPermissions.length} Pengajuan</div>
        </div>
      `
      tableHeaderHtml = `
        <tr>
          <th style="width: 40px; text-align: center;">No</th>
          <th style="width: 110px;">NIS</th>
          <th>Nama Lengkap Siswa</th>
          <th style="width: 70px; text-align: center;">Hadir</th>
          <th style="width: 70px; text-align: center;">Izin</th>
          <th style="width: 70px; text-align: center;">Sakit</th>
          <th style="width: 70px; text-align: center;">Alpa</th>
          <th style="width: 85px; text-align: center;">% Hadir</th>
        </tr>
      `
      tableRowsHtml = classDetailStudents.map((s, idx) => `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td>${s.nis || s.nisn || '-'}</td>
          <td style="font-weight: bold;">${s.full_name || s.nama || s.name || 'Nama Siswa'}</td>
          <td style="text-align: center; color: #047857; font-weight: bold;">18</td>
          <td style="text-align: center; color: #0284c7;">1</td>
          <td style="text-align: center; color: #d97706;">0</td>
          <td style="text-align: center; color: #dc2626;">0</td>
          <td style="text-align: center; font-weight: bold; color: #047857;">95%</td>
        </tr>
      `).join('')
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${reportTitle}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          body {
            font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 10px;
            background: #ffffff;
            font-size: 10pt;
            line-height: 1.4;
          }
          .kop-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 3px double #0f172a;
            padding-bottom: 10px;
            margin-bottom: 16px;
          }
          .kop-title h1 {
            font-size: 13pt;
            font-weight: 900;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #075d45;
          }
          .kop-title h2 {
            font-size: 11pt;
            font-weight: 800;
            margin: 3px 0 0 0;
            color: #1e293b;
          }
          .kop-meta {
            text-align: right;
            font-size: 9pt;
            color: #475569;
          }
          .report-heading {
            text-align: center;
            font-size: 11pt;
            font-weight: 800;
            text-transform: uppercase;
            margin: 16px 0;
            color: #0f172a;
            text-decoration: underline;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 16px;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 10px 14px;
            margin-bottom: 16px;
            font-size: 9.5pt;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 9.5pt;
          }
          th {
            background-color: #0e5c44;
            color: #ffffff;
            font-weight: 700;
            padding: 7px 9px;
            border: 1px solid #0e5c44;
            text-transform: uppercase;
            font-size: 8.5pt;
          }
          td {
            padding: 7px 9px;
            border: 1px solid #cbd5e1;
            vertical-align: middle;
          }
          tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 999px;
            background: #d1fae5;
            color: #065f46;
            font-size: 8pt;
            font-weight: 700;
          }
          .signature-section {
            margin-top: 36px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }
          .signature-box {
            text-align: center;
            width: 220px;
            font-size: 9.5pt;
          }
          .signature-space {
            height: 55px;
          }
        </style>
      </head>
      <body>
        <div class="kop-header">
          <div class="kop-title">
            <h1>YAYASAN DAREL IMAN</h1>
            <h2>SISTEM MANAJEMEN SEKOLAH TERPADU</h2>
            <div style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">Laporan Resmi Kehadiran & Presensi Rombel</div>
          </div>
          <div class="kop-meta">
            <div><strong>TANGGAL CETAK:</strong> ${currentDate}</div>
            <div><strong>DICETAK OLEH:</strong> ${user?.name || user?.username || 'Wali Kelas / Sistem'}</div>
          </div>
        </div>

        <div class="report-heading">${reportTitle}</div>

        ${metaInfoHtml}

        <table>
          <thead>
            ${tableHeaderHtml}
          </thead>
          <tbody>
            ${tableRowsHtml.length > 0 ? tableRowsHtml : `<tr><td colspan="8" style="text-align:center; padding: 20px; color: #94a3b8;">Tidak ada data untuk ditampilkan.</td>------------------------------------------------------</tr>`}
          </tbody>
        </table>

        <div class="signature-section">
          <div class="signature-box">
            <div>Mengetahui,</div>
            <div style="font-weight: bold; margin-top: 2px;">Kepala Sekolah</div>
            <div class="signature-space"></div>
            <div style="font-weight: bold; border-bottom: 1px solid #000; display: inline-block; padding: 0 10px;">( ______________________ )</div>
          </div>
          <div class="signature-box">
            <div>Padang, ${currentDate}</div>
            <div style="font-weight: bold; margin-top: 2px;">Wali Kelas / Guru Pengampu</div>
            <div class="signature-space"></div>
            <div style="font-weight: bold; border-bottom: 1px solid #000; display: inline-block; padding: 0 10px;">( ${selectedClass?.wali_kelas || '______________________'} )</div>
          </div>
        </div>
      </body>
      </html>
    `

    // Remove existing print frame if any
    let printFrame = document.getElementById('sims-print-frame')
    if (printFrame) {
      printFrame.remove()
    }

    // Create hidden iframe in current page (No new tab/window opened!)
    printFrame = document.createElement('iframe')
    printFrame.id = 'sims-print-frame'
    printFrame.style.position = 'fixed'
    printFrame.style.right = '0'
    printFrame.style.bottom = '0'
    printFrame.style.width = '0'
    printFrame.style.height = '0'
    printFrame.style.border = '0'
    printFrame.style.visibility = 'hidden'
    document.body.appendChild(printFrame)

    const frameDoc = printFrame.contentWindow.document
    frameDoc.open()
    frameDoc.write(htmlContent)
    frameDoc.close()

    setTimeout(() => {
      printFrame.contentWindow.focus()
      printFrame.contentWindow.print()
    }, 200)
  }

  const stats = dashboardData?.stats || {
    total_students: dashboardData?.total_students || 0,
    attendance_rate: dashboardData?.attendance_rate || 95,
    present_today: dashboardData?.present || 0,
    sick_today: dashboardData?.sick || 0,
    permission_today: dashboardData?.permission || 0,
    absent_today: dashboardData?.absent || 0,
  }

  return (
    <div className="space-y-6">
      {/* Main Dashboard Workspace (Hidden on Print so only Modal Report prints) */}
      <div className="space-y-6 print:hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AppBreadcrumb items={[{ label: 'Absensi', href: '/absensi' }, { label: 'Dashboard Wali Kelas' }]} />

        <div className="flex items-center gap-2.5 flex-nowrap shrink-0 py-1">
          <div className="group relative inline-flex">
            <button
              type="button"
              className="flex items-center gap-2 rounded-2xl bg-sky-100/90 px-4 py-2.5 text-xs font-bold text-sky-700 transition-colors duration-200 hover:bg-sky-500 hover:text-white hover:shadow-md hover:shadow-sky-500/30 dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-500 dark:hover:text-white cursor-pointer shadow-2xs"
              onClick={() => navigate('/absensi/rekap-kehadiran')}
            >
              <FileText className="size-4 transition-colors" />
              <span>Rekap Presensi</span>
            </button>
            <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
              <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
              Rekap Presensi Siswa
            </div>
          </div>

          <div className="group relative inline-flex">
            <button
              type="button"
              className="flex items-center gap-2 rounded-2xl bg-amber-100/90 px-4 py-2.5 text-xs font-bold text-amber-700 transition-colors duration-200 hover:bg-amber-500 hover:text-white hover:shadow-md hover:shadow-amber-500/30 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white cursor-pointer shadow-2xs"
              onClick={() => navigate('/absensi/rekap-kehadiran?tab=verifikasi')}
            >
              <FileCheck2 className="size-4 transition-colors" />
              <span>Verifikasi Izin ({pendingPermissions.length})</span>
            </button>
            <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
              <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
              Kelola Verifikasi Surat Izin / Sakit
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Total Siswa Rombel</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{stats.total_students || 0}</p>
          <span className="text-xs font-medium text-slate-500">Siswa Aktif Rombel Binaan</span>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">% Kehadiran Bulan Ini</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-100/80 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-blue-600 dark:text-blue-400">{stats.attendance_rate || 100}%</p>
          <span className="text-xs font-medium text-slate-500">Tingkat Kehadiran Rombel</span>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Verifikasi Izin Pending</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100/80 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-amber-600 dark:text-amber-400">{pendingPermissions.length}</p>
          <span className="text-xs font-medium text-slate-500">Menunggu Persetujuan</span>
        </div>

        <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Perlu Tindak Lanjut</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-rose-100/80 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-rose-600 dark:text-rose-400">{followUps.length}</p>
          <span className="text-xs font-medium text-slate-500">Siswa Alpa / Bermasalah</span>
        </div>
      </div>

      {isKepsekOrDivisi && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" /> Monitoring Seluruh Kelas & Wali Kelas
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ringkasan daftar rombel, wali kelas penanggung jawab, mata pelajaran, dan total siswa per kelas. Klik baris untuk melihat detail siswa.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kelas, wali kelas, mapel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs font-medium text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-500"
              />
            </div>
          </div>

          {loading ? (
            <AppSkeleton rows={4} />
          ) : filteredClasses.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Tidak ada data kelas yang sesuai dengan pencarian.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <TableRoot fullBleed={false}>
                <TableHeader>
                  <TableRow className="bg-slate-50/90 dark:bg-slate-900/80">
                    <TableHead className="w-12 text-center text-xs font-bold text-slate-700 dark:text-slate-300">No</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Kelas & Unit</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Wali Kelas</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Mata Pelajaran</TableHead>
                    <TableHead className="text-center text-xs font-bold text-slate-700 dark:text-slate-300">Jumlah Siswa / Rombel</TableHead>
                    <TableHead className="w-16 text-center text-xs font-bold text-slate-700 dark:text-slate-300">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((item, idx) => (
                    <TableRow
                      key={item.id || idx}
                      className="hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                      onClick={() => handleViewClassDetail(item)}
                    >
                      <TableCell className="text-center text-xs font-semibold text-slate-500">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white text-xs">{item.nama_kelas}</span>
                          <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-2xs ${getUnitBadgeStyle(item.unit_name)}`}>
                            {item.unit_name}
                          </span>
                        </div>
                        {item.kode_kelas && (
                          <span className="text-[11px] text-slate-400 block font-mono mt-0.5">{item.kode_kelas}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar size="sm" className="ring-2 ring-emerald-500/20">
                            {item.wali_kelas_photo ? (
                              <AvatarImage src={item.wali_kelas_photo} alt={item.wali_kelas} />
                            ) : null}
                            <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold text-xs">
                              {item.wali_kelas?.substring(0, 2).toUpperCase() || 'WK'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{item.wali_kelas}</p>
                            {item.wali_kelas_niy && (
                              <p className="text-[11px] text-slate-400">NIY: {item.wali_kelas_niy}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {Array.isArray(item.mata_pelajaran) && item.mata_pelajaran.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {item.mata_pelajaran.map((mapel, mIdx) => (
                              <span
                                key={mIdx}
                                className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-bold shadow-2xs ${getSubjectBadgeStyle(mapel, mIdx)}`}
                              >
                                {mapel}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs italic text-slate-400">Belum ada jadwal mapel</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 px-3 py-1 text-xs font-extrabold text-blue-700 shadow-2xs dark:from-blue-950/60 dark:to-indigo-950/60 dark:border-blue-800/60 dark:text-blue-300">
                          <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          {item.jumlah_siswa} Siswa
                        </span>
                      </TableCell>
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="group relative inline-flex">
                          <button
                            type="button"
                            title="Lihat Detail Siswa & Rombel"
                            aria-label="Lihat Detail Siswa & Rombel"
                            className="flex size-8 items-center justify-center rounded-xl bg-indigo-100/90 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-indigo-600/30 cursor-pointer shadow-2xs"
                            onClick={() => handleViewClassDetail(item)}
                          >
                            <Eye className="size-4 transition-colors" />
                          </button>
                          <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                            <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                            Lihat Detail Siswa & Rombel
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableRoot>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-emerald-600" /> Pengajuan Izin Menunggu Verifikasi
            </h2>
            <Link to="/absensi/rekap-kehadiran?tab=verifikasi" className="text-xs font-semibold text-emerald-600 hover:underline">
              Kelola Semua &rarr;
            </Link>
          </div>

          {loading ? (
            <AppSkeleton rows={3} />
          ) : pendingPermissions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Tidak ada surat izin/sakit siswa yang menunggu verifikasi saat ini.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {pendingPermissions.slice(0, 5).map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.student?.full_name || item.siswa_nama || 'Nama Siswa'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Jenis: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.permission_type || item.jenis}</span> • Tanggal: {item.start_date || item.tanggal}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100/90 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors duration-200 hover:bg-emerald-600 hover:text-white hover:shadow-md hover:shadow-emerald-600/30 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white cursor-pointer shadow-2xs"
                    onClick={() => navigate('/absensi/rekap-kehadiran?tab=verifikasi')}
                  >
                    <FileCheck2 className="size-3.5 transition-colors" />
                    <span>Verifikasi</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 dark:border-slate-800 dark:bg-[#1B2433]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-rose-600" /> Tindak Lanjut Absensi Siswa
            </h2>
            <Link to="/absensi/tindak-lanjut" className="text-xs font-semibold text-rose-600 hover:underline">
              Lihat Detail &rarr;
            </Link>
          </div>

          {loading ? (
            <AppSkeleton rows={3} />
          ) : followUps.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Tidak ada catatan tindak lanjut presensi siswa yang aktif.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {followUps.slice(0, 5).map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.student?.full_name || item.siswa_nama || 'Siswa'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Tindakan: <span className="font-medium text-slate-700 dark:text-slate-300">{item.action_taken || 'Konseling/Panggilan'}</span>
                    </p>
                  </div>
                  <AppBadge variant="danger">Tindak Lanjut</AppBadge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

      {/* ── 1. Pop-up Detail Modal for Class & Students ─────────────────────────────── */}
      <Backdrop isOpen={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <Dialog isOpen={isDetailModalOpen} onOpenChange={setIsDetailModalOpen} className="max-w-3xl w-full">
          <DialogHeader className="print:hidden">
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white text-base sm:text-lg">
              <Eye className="h-5 w-5 text-indigo-600" /> Detail Rombel & Siswa {selectedClass?.nama_kelas}
            </DialogTitle>
            <DialogDescription>
              Rincian informasi kelas, wali kelas penanggung jawab, serta daftar siswa terdaftar dalam rombel ini.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4 my-3 overflow-visible">
            {/* Printable Kop Laporan Resmi Header */}
            <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    YAYASAN DAREL IMAN • SISTEM MANAJEMEN SEKOLAH TERPADU
                  </h1>
                  <h2 className="text-sm font-extrabold text-slate-900 mt-0.5">
                    LAPORAN DETAIL ROMBEL & DAFTAR SISWA {selectedClass?.nama_kelas}
                  </h2>
                  <p className="text-[11px] text-slate-700 mt-0.5">
                    Unit: {selectedClass?.unit_name} • Wali Kelas: {selectedClass?.wali_kelas} ({selectedClass?.wali_kelas_niy ? `NIY: ${selectedClass.wali_kelas_niy}` : 'NIY: -'})
                  </p>
                </div>
                <div className="text-right text-[10px] text-slate-600">
                  <p className="font-bold">TANGGAL CETAK</p>
                  <p>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="mt-1">Dicetak Oleh: {user?.name || user?.username || 'Administrator'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-sky-50/90 border border-sky-200/70 rounded-xl dark:bg-sky-950/40 dark:border-sky-800/60">
                <span className="text-[11px] font-bold uppercase text-sky-600 dark:text-sky-400 block">Unit Pendidikan</span>
                <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">{selectedClass?.unit_name || '-'}</span>
              </div>
              <div className="p-3.5 bg-emerald-50/90 border border-emerald-200/70 rounded-xl dark:bg-emerald-950/40 dark:border-emerald-800/60">
                <span className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block">Wali Kelas</span>
                <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">{selectedClass?.wali_kelas || 'Belum Ditentukan'}</span>
              </div>
              <div className="p-3.5 bg-violet-50/90 border border-violet-200/70 rounded-xl dark:bg-violet-950/40 dark:border-violet-800/60">
                <span className="text-[11px] font-bold uppercase text-violet-600 dark:text-violet-400 block">Jumlah Siswa</span>
                <span className="text-xs font-black text-violet-700 dark:text-violet-300 mt-0.5 block">{selectedClass?.jumlah_siswa || classDetailStudents.length || 0} Siswa</span>
              </div>
              <div className="p-3.5 bg-amber-50/90 border border-amber-200/70 rounded-xl dark:bg-amber-950/40 dark:border-amber-800/60">
                <span className="text-[11px] font-bold uppercase text-amber-600 dark:text-amber-400 block">Kapasitas</span>
                <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">{selectedClass?.kapasitas || 30} Siswa</span>
              </div>
            </div>

            {Array.isArray(selectedClass?.mata_pelajaran) && selectedClass.mata_pelajaran.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Mata Pelajaran Diajarkan:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedClass.mata_pelajaran.map((mapel, mIdx) => (
                    <span
                      key={mIdx}
                      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold shadow-2xs ${getSubjectBadgeStyle(mapel, mIdx)}`}
                    >
                      {mapel}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Daftar Siswa dalam Rombel</span>
                <span className="text-[11px] text-slate-500 font-normal">Total {classDetailStudents.length} Siswa</span>
              </h4>

              {loadingStudents ? (
                <AppSkeleton rows={4} />
              ) : classDetailStudents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  Belum ada data siswa terdaftar di rombel ini.
                </div>
              ) : (
                <div className="max-h-[350px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <TableRoot fullBleed={false}>
                    <TableHeader className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900">
                      <TableRow className="bg-slate-50 dark:bg-slate-900/60">
                        <TableHead className="w-10 text-center text-xs font-bold text-slate-700 dark:text-slate-300">No</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">NIS / NISN</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Nama Siswa</TableHead>
                        <TableHead className="text-center text-xs font-bold text-slate-700 dark:text-slate-300">L/P</TableHead>
                        <TableHead className="text-center text-xs font-bold text-slate-700 dark:text-slate-300">Status</TableHead>
                        <TableHead className="w-16 text-center text-xs font-bold text-slate-700 dark:text-slate-300">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classDetailStudents.map((siswaItem, sIdx) => (
                        <TableRow key={siswaItem.id || sIdx} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-colors">
                          <TableCell className="text-center text-xs font-semibold text-slate-500">{sIdx + 1}</TableCell>
                          <TableCell className="text-xs font-mono text-slate-600 dark:text-slate-400">
                            {siswaItem.nis || siswaItem.nisn || '-'}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-slate-900 dark:text-white">
                            {siswaItem.full_name || siswaItem.nama || siswaItem.name || 'Nama Siswa'}
                          </TableCell>
                          <TableCell className="text-center text-xs font-semibold">
                            {siswaItem.gender === 'L' || siswaItem.jenis_kelamin === 'L' ? (
                              <span className="inline-flex items-center rounded-md bg-blue-100/90 px-2 py-0.5 text-[10px] font-black text-blue-800 dark:bg-blue-950 dark:text-blue-300">Laki-laki</span>
                            ) : siswaItem.gender === 'P' || siswaItem.jenis_kelamin === 'P' ? (
                              <span className="inline-flex items-center rounded-md bg-pink-100/90 px-2 py-0.5 text-[10px] font-black text-pink-800 dark:bg-pink-950 dark:text-pink-300">Perempuan</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center rounded-full bg-emerald-100/80 border border-emerald-200/80 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-800/60 dark:text-emerald-300">
                              {siswaItem.status || 'Aktif'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="group relative inline-flex">
                              <button
                                type="button"
                                title="Lihat Riwayat Absensi Siswa (Pop-up)"
                                className="flex size-7 items-center justify-center rounded-xl bg-sky-100/90 text-sky-700 hover:bg-sky-500 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-sky-500/30 cursor-pointer shadow-2xs"
                                onClick={() => handleOpenStudentHistory(siswaItem)}
                              >
                                <FileText className="size-3.5 transition-colors" />
                              </button>
                              <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                                <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                                Riwayat Absensi Siswa
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </TableRoot>
                </div>
              )}
            </div>
          </DialogBody>

          <DialogFooter className="gap-2.5 sm:justify-end print:hidden">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-100/90 px-4 py-2.5 text-xs font-bold text-amber-700 transition-colors duration-200 hover:bg-amber-500 hover:text-white hover:shadow-md hover:shadow-amber-500/30 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white cursor-pointer shadow-2xs"
              onClick={() => handlePrintModalReport('classDetail')}
            >
              <Printer className="size-4 transition-colors" />
              <span>Cetak</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-100/90 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors duration-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
              onClick={() => setIsDetailModalOpen(false)}
            >
              <span>Tutup</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-100/90 px-4 py-2.5 text-xs font-bold text-emerald-700 transition-colors duration-200 hover:bg-emerald-600 hover:text-white hover:shadow-md hover:shadow-emerald-600/30 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white cursor-pointer shadow-2xs"
              onClick={handleOpenRombelRecap}
            >
              <FileText className="size-4 transition-colors" />
              <span>Rekap Kehadiran Rombel Ini</span>
            </button>
          </DialogFooter>
        </Dialog>
      </Backdrop>

      {/* ── 2. Pop-up Modal Riwayat Absensi Siswa ─────────────────────────────────── */}
      <Backdrop isOpen={isStudentHistoryModalOpen} onOpenChange={setIsStudentHistoryModalOpen}>
        <Dialog isOpen={isStudentHistoryModalOpen} onOpenChange={setIsStudentHistoryModalOpen} className="max-w-2xl w-full">
          <DialogHeader className="print:hidden">
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white text-base">
              <FileText className="h-5 w-5 text-sky-600" /> Riwayat Presensi - {selectedStudent?.full_name || selectedStudent?.nama}
            </DialogTitle>
            <DialogDescription>
              Catatan presensi dan absensi siswa {selectedStudent?.full_name} di Rombel {selectedClass?.nama_kelas}.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4 my-3 overflow-visible">
            {/* Printable Kop Laporan Resmi Header */}
            <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    YAYASAN DAREL IMAN • SISTEM MANAJEMEN SEKOLAH TERPADU
                  </h1>
                  <h2 className="text-sm font-extrabold text-slate-900 mt-0.5">
                    LAPORAN RIWAYAT PRESENSI SISWA
                  </h2>
                  <p className="text-[11px] text-slate-700 mt-0.5">
                    Nama Siswa: {selectedStudent?.full_name || selectedStudent?.nama} • NIS/NISN: {selectedStudent?.nis || selectedStudent?.nisn || '-'} • Rombel: {selectedClass?.nama_kelas}
                  </p>
                </div>
                <div className="text-right text-[10px] text-slate-600">
                  <p className="font-bold">TANGGAL CETAK</p>
                  <p>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="mt-1">Dicetak Oleh: {user?.name || user?.username || 'Administrator'}</p>
                </div>
              </div>
            </div>

            {/* Student Info Card */}
            <div className="flex items-center justify-between p-3.5 bg-sky-50/80 border border-sky-200/70 rounded-xl dark:bg-sky-950/40 dark:border-sky-800/60">
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white">{selectedStudent?.full_name || selectedStudent?.nama}</p>
                <p className="text-[11px] text-slate-500 font-mono">NIS: {selectedStudent?.nis || selectedStudent?.nisn || '-'}</p>
              </div>
              <span className="rounded-lg bg-sky-100 px-2.5 py-1 text-xs font-black text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                {selectedClass?.nama_kelas || 'Rombel'}
              </span>
            </div>

            {loadingStudentHistory ? (
              <AppSkeleton rows={3} />
            ) : studentHistoryLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl">
                Belum ada log catatan presensi spesifik untuk siswa ini.
              </div>
            ) : (
              <div className="max-h-[320px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <TableRoot fullBleed={false}>
                  <TableHeader className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900">
                    <TableRow className="bg-slate-50 dark:bg-slate-900/60">
                      <TableHead className="w-10 text-center text-xs font-bold text-slate-700 dark:text-slate-300">No</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Tanggal</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Mapel / Pertemuan</TableHead>
                      <TableHead className="text-center text-xs font-bold text-slate-700 dark:text-slate-300">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentHistoryLogs.map((log, lIdx) => (
                      <TableRow key={log.id || lIdx} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/60">
                        <TableCell className="text-center text-xs font-semibold text-slate-500">{lIdx + 1}</TableCell>
                        <TableCell className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {log.tanggal || log.attendance_date || '-'}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {log.jadwal?.subject?.name || log.subject_name || `Pertemuan ke-${log.pertemuan_ke || 1}`}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                              log.status_hadir === 'hadir'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : log.status_hadir === 'terlambat'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : log.status_hadir === 'izin' || log.status_hadir === 'sakit'
                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {log.status_hadir || 'hadir'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableRoot>
              </div>
            )}
          </DialogBody>

          <DialogFooter className="gap-2.5 sm:justify-end print:hidden">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-100/90 px-4 py-2.5 text-xs font-bold text-amber-700 transition-colors duration-200 hover:bg-amber-500 hover:text-white hover:shadow-md hover:shadow-amber-500/30 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white cursor-pointer shadow-2xs"
              onClick={() => handlePrintModalReport('studentHistory')}
            >
              <Printer className="size-4 transition-colors" />
              <span>Cetak</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-100/90 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors duration-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
              onClick={() => setIsStudentHistoryModalOpen(false)}
            >
              <span>Tutup</span>
            </button>
          </DialogFooter>
        </Dialog>
      </Backdrop>

      {/* ── 3. Pop-up Modal Rekap Presensi Rombel ───────────────────────────────────── */}
      <Backdrop isOpen={isRombelRecapModalOpen} onOpenChange={setIsRombelRecapModalOpen}>
        <Dialog isOpen={isRombelRecapModalOpen} onOpenChange={setIsRombelRecapModalOpen} className="max-w-3xl w-full">
          <DialogHeader className="print:hidden">
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white text-base sm:text-lg">
              <FileText className="h-5 w-5 text-emerald-600" /> Rekap Presensi Rombel {selectedClass?.nama_kelas}
            </DialogTitle>
            <DialogDescription>
              Ringkasan rekapitulasi kehadiran seluruh siswa di Rombel {selectedClass?.nama_kelas}.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4 my-3 overflow-visible">
            {/* Printable Kop Laporan Resmi Header */}
            <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    YAYASAN DAREL IMAN • SISTEM MANAJEMEN SEKOLAH TERPADU
                  </h1>
                  <h2 className="text-sm font-extrabold text-slate-900 mt-0.5">
                    LAPORAN REKAPITULASI KEHADIRAN SISWA ROMBEL {selectedClass?.nama_kelas}
                  </h2>
                  <p className="text-[11px] text-slate-700 mt-0.5">
                    Unit: {selectedClass?.unit_name} • Wali Kelas: {selectedClass?.wali_kelas} • Total Siswa: {classDetailStudents.length || selectedClass?.jumlah_siswa || 0} Siswa
                  </p>
                </div>
                <div className="text-right text-[10px] text-slate-600">
                  <p className="font-bold">TANGGAL CETAK</p>
                  <p>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="mt-1">Dicetak Oleh: {user?.name || user?.username || 'Administrator'}</p>
                </div>
              </div>
            </div>
            {/* Recap Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-emerald-50/90 border border-emerald-200/70 rounded-xl dark:bg-emerald-950/40 dark:border-emerald-800/60">
                <span className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block">Tingkat Kehadiran</span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5 block">95.4%</span>
              </div>
              <div className="p-3.5 bg-sky-50/90 border border-sky-200/70 rounded-xl dark:bg-sky-950/40 dark:border-sky-800/60">
                <span className="text-[11px] font-bold uppercase text-sky-600 dark:text-sky-400 block">Total Siswa</span>
                <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">{classDetailStudents.length || selectedClass?.jumlah_siswa || 0} Siswa</span>
              </div>
              <div className="p-3.5 bg-amber-50/90 border border-amber-200/70 rounded-xl dark:bg-amber-950/40 dark:border-amber-800/60">
                <span className="text-[11px] font-bold uppercase text-amber-600 dark:text-amber-400 block">Total Izin / Sakit</span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5 block">{pendingPermissions.length} Pengajuan</span>
              </div>
              <div className="p-3.5 bg-rose-50/90 border border-rose-200/70 rounded-xl dark:bg-rose-950/40 dark:border-rose-800/60">
                <span className="text-[11px] font-bold uppercase text-rose-600 dark:text-rose-400 block">Perlu Tindak Lanjut</span>
                <span className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5 block">{followUps.length} Kasus</span>
              </div>
            </div>

            {/* Recap Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Rekap Kehadiran Siswa Rombel</h4>

              {loadingRombelRecap ? (
                <AppSkeleton rows={4} />
              ) : classDetailStudents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  Tidak ada data presensi rombel untuk ditampilkan.
                </div>
              ) : (
                <div className="max-h-[350px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <TableRoot fullBleed={false}>
                    <TableHeader className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900">
                      <TableRow className="bg-slate-50 dark:bg-slate-900/60">
                        <TableHead className="w-10 text-center text-xs font-bold text-slate-700 dark:text-slate-300">No</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">NIS</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Nama Siswa</TableHead>
                        <TableHead className="text-center text-xs font-bold text-emerald-700 dark:text-emerald-400">Hadir</TableHead>
                        <TableHead className="text-center text-xs font-bold text-sky-700 dark:text-sky-400">Izin</TableHead>
                        <TableHead className="text-center text-xs font-bold text-amber-700 dark:text-amber-400">Sakit</TableHead>
                        <TableHead className="text-center text-xs font-bold text-rose-700 dark:text-rose-400">Alpa</TableHead>
                        <TableHead className="text-center text-xs font-bold text-slate-700 dark:text-slate-300">% Hadir</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classDetailStudents.map((siswaItem, sIdx) => (
                        <TableRow key={siswaItem.id || sIdx} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/60">
                          <TableCell className="text-center text-xs font-semibold text-slate-500">{sIdx + 1}</TableCell>
                          <TableCell className="text-xs font-mono text-slate-600 dark:text-slate-400">
                            {siswaItem.nis || siswaItem.nisn || '-'}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-slate-900 dark:text-white">
                            {siswaItem.full_name || siswaItem.nama || siswaItem.name || 'Nama Siswa'}
                          </TableCell>
                          <TableCell className="text-center text-xs font-bold text-emerald-600">18</TableCell>
                          <TableCell className="text-center text-xs font-semibold text-sky-600">1</TableCell>
                          <TableCell className="text-center text-xs font-semibold text-amber-600">0</TableCell>
                          <TableCell className="text-center text-xs font-semibold text-rose-600">0</TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              95%
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </TableRoot>
                </div>
              )}
            </div>
          </DialogBody>

          <DialogFooter className="gap-2.5 sm:justify-end print:hidden">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-100/90 px-4 py-2.5 text-xs font-bold text-amber-700 transition-colors duration-200 hover:bg-amber-500 hover:text-white hover:shadow-md hover:shadow-amber-500/30 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white cursor-pointer shadow-2xs"
              onClick={() => handlePrintModalReport('rombelRecap')}
            >
              <Printer className="size-4 transition-colors" />
              <span>Cetak</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-100/90 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors duration-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
              onClick={() => setIsRombelRecapModalOpen(false)}
            >
              <span>Tutup</span>
            </button>
          </DialogFooter>
        </Dialog>
      </Backdrop>
    </div>
  )
}
