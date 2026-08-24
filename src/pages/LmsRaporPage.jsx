import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Award,
  BookOpen,
  Printer,
  Sparkles,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  X,
  Users,
  Building2,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Share2,
  Check,
  GraduationCap,
} from 'lucide-react'
import { Download1, Upload1 } from '@tailgrids/icons'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { lmsRaporService } from '../services/lmsRaporService'
import PageContainer from '../components/app/PageContainer'
import { SquircleActionButton, PrintOptionModal } from '../components/master-data'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { exportCsv } from '../components/reports/ReportKit'
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '../components/tailgrids/core/hover-card'
import { Avatar, AvatarFallback } from '../components/tailgrids/core/avatar'
import { Badge } from '../components/tailgrids/core/badge'
import { Pagination } from '../components/tailgrids/core/pagination'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from '../components/tailgrids/core/dialog'
import { Backdrop, OverlayWrapper } from '../components/tailgrids/core/overlay'
import { Button } from '../components/tailgrids/core/button'

const toneStyles = {
  emerald: {
    cardBg: 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/50',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    iconColor: 'text-[#0E5C44] dark:text-emerald-400',
    badge: 'bg-emerald-100 text-[#0E5C44] dark:bg-emerald-900/60 dark:text-emerald-300',
  },
  sky: {
    cardBg: 'bg-sky-50/60 dark:bg-sky-950/20 border-sky-200/80 dark:border-sky-800/50',
    iconBg: 'bg-sky-100 dark:bg-sky-900/60',
    iconColor: 'text-sky-700 dark:text-sky-400',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300',
  },
  amber: {
    cardBg: 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/50',
    iconBg: 'bg-amber-100 dark:bg-amber-900/60',
    iconColor: 'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
  },
  purple: {
    cardBg: 'bg-purple-50/60 dark:bg-purple-950/20 border-purple-200/80 dark:border-purple-800/50',
    iconBg: 'bg-purple-100 dark:bg-purple-900/60',
    iconColor: 'text-purple-700 dark:text-purple-400',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
  },
  rose: {
    cardBg: 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-800/50',
    iconBg: 'bg-rose-100 dark:bg-rose-900/60',
    iconColor: 'text-rose-700 dark:text-rose-400',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
  },
}

/**
 * Authentic Official School Report Card Document Component
 * Rendered for on-screen modal preview (Lihat Rapor Digital & Cetak PDF)
 */
function OfficialRaporSheet({ digitalData }) {
  if (!digitalData) return null

  const school = digitalData.school_info || {}
  const siswa = digitalData.siswa || {}
  const rapor = digitalData.rapor || {}
  const wali = digitalData.wali_kelas || {}
  const mapelList = digitalData.nilai_mapel || []

  return (
    <div className="bg-white text-slate-900 p-6 sm:p-10 rounded-sm border border-slate-300 shadow-2xl font-serif text-xs leading-relaxed space-y-5 max-w-4xl mx-auto my-2">
      {/* 1. KOP SURAT YAYASAN & SEKOLAH */}
      <div className="text-center border-b-4 border-double border-slate-900 pb-4 space-y-1">
        <div className="flex items-center justify-center gap-3 mb-1">
          <div className="w-12 h-12 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-lg font-sans shadow-md">
            SIT
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">YAYASAN DAREL IMAN PADANG</h2>
            <h1 className="text-lg font-black uppercase tracking-tight text-slate-900 font-sans">
              {school.name || 'SMP IT DAREL IMAN'}
            </h1>
          </div>
        </div>
        <p className="text-[11px] text-slate-600 font-sans">
          {school.address || 'Jl. Raya Utama Darel Iman, Kota Padang, Sumatera Barat'} | Telp: (0751) 123456
        </p>
      </div>

      {/* 2. JUDUL RAPOR */}
      <div className="text-center space-y-1 py-1">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 underline font-serif">
          LAPORAN HASIL BELAJAR SISWA (RAPOR DIGITAL)
        </h2>
        <p className="text-[11px] font-sans text-slate-500 font-semibold">
          KURIKULUM MERDEKA / TERPADU • SEMESTER {rapor.semester?.nama || '1'} • TA {rapor.tahun_ajaran?.year || '2025/2026'}
        </p>
      </div>

      {/* 3. IDENTITAS SISWA (TABEL RAPI 2-KOLOM) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 p-3.5 rounded-lg bg-slate-50/90 border border-slate-300 text-[11px] font-sans">
        <div className="flex">
          <span className="w-28 font-bold text-slate-600">Nama Siswa</span>
          <span className="font-bold text-slate-900">: {siswa.name || '-'}</span>
        </div>
        <div className="flex">
          <span className="w-28 font-bold text-slate-600">Kelas / Rombel</span>
          <span className="font-bold text-slate-900">: {rapor.kelas?.nama_kelas || '-'}</span>
        </div>
        <div className="flex">
          <span className="w-28 font-bold text-slate-600">NISN / NIS</span>
          <span className="font-semibold text-slate-800">: {siswa.nisn || '-'} / {siswa.nis || '-'}</span>
        </div>
        <div className="flex">
          <span className="w-28 font-bold text-slate-600">Semester</span>
          <span className="font-semibold text-slate-800">: {rapor.semester?.nama || '-'}</span>
        </div>
        <div className="flex">
          <span className="w-28 font-bold text-slate-600">Nama Sekolah</span>
          <span className="font-semibold text-slate-800">: {school.name || 'SMP IT DAREL IMAN'}</span>
        </div>
        <div className="flex">
          <span className="w-28 font-bold text-slate-600">Tahun Ajaran</span>
          <span className="font-semibold text-slate-800">: {rapor.tahun_ajaran?.year || '-'}</span>
        </div>
      </div>

      {/* 4. BAGIAN A: CAPAIAN AKADEMIK MATA PELAJARAN */}
      <div className="space-y-2">
        <h3 className="font-bold uppercase tracking-wider text-xs font-sans text-slate-900">
          A. CAPAIAN AKADEMIK MATA PELAJARAN
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-900 text-[11px]">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-slate-900 text-slate-900 font-sans">
                <th className="border border-slate-900 p-2 text-center w-8">No</th>
                <th className="border border-slate-900 p-2 text-left">Mata Pelajaran</th>
                <th className="border border-slate-900 p-2 text-center w-12">KKM</th>
                <th className="border border-slate-900 p-2 text-center w-16">Nilai Akhir</th>
                <th className="border border-slate-900 p-2 text-center w-14">Predikat</th>
                <th className="border border-slate-900 p-2 text-left">Capaian Kompetensi / Catatan Perkembangan</th>
              </tr>
            </thead>
            <tbody>
              {mapelList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border border-slate-900 p-4 text-center text-slate-500 italic">
                    Belum ada data nilai mata pelajaran.
                  </td>
                </tr>
              ) : (
                mapelList.map((n, idx) => (
                  <tr key={n.subject_id || idx} className="hover:bg-slate-50">
                    <td className="border border-slate-900 p-2 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-900 p-2 font-bold text-slate-900">{n.subject_name}</td>
                    <td className="border border-slate-900 p-2 text-center font-mono">{n.kkm ?? 75}</td>
                    <td className="border border-slate-900 p-2 text-center font-extrabold font-mono text-[#0E5C44]">
                      {n.final_score}
                    </td>
                    <td className="border border-slate-900 p-2 text-center font-bold font-mono">{n.grade}</td>
                    <td className="border border-slate-900 p-2 text-slate-800 leading-snug">
                      {n.catatan || 'Menunjukkan penguasaan kompetensi yang sangat baik dalam memahami materi pembelajaran.'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. BAGIAN B & C: KETIDAKHADIRAN & RANGKUMAN PRESTASI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
        <div>
          <h3 className="font-bold uppercase tracking-wider text-xs font-sans text-slate-900 mb-2">
            B. KETIDAKHADIRAN (PRESENSI)
          </h3>
          <table className="w-full border-collapse border border-slate-900 text-[11px]">
            <tbody>
              <tr>
                <td className="border border-slate-900 p-2 font-medium">Hadir (H)</td>
                <td className="border border-slate-900 p-2 font-bold text-center w-24">
                  {rapor.total_hadir ?? 0} Hari
                </td>
              </tr>
              <tr>
                <td className="border border-slate-900 p-2 font-medium">Izin (I)</td>
                <td className="border border-slate-900 p-2 font-bold text-center">
                  {rapor.total_izin ?? 0} Hari
                </td>
              </tr>
              <tr>
                <td className="border border-slate-900 p-2 font-medium">Sakit (S)</td>
                <td className="border border-slate-900 p-2 font-bold text-center">
                  {rapor.total_sakit ?? 0} Hari
                </td>
              </tr>
              <tr>
                <td className="border border-slate-900 p-2 font-medium">Tanpa Keterangan (Alpha)</td>
                <td className="border border-slate-900 p-2 font-bold text-center">
                  {rapor.total_alpha ?? 0} Hari
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="font-bold uppercase tracking-wider text-xs font-sans text-slate-900 mb-2">
            C. RANGKUMAN PRESTASI & RANKING
          </h3>
          <table className="w-full border-collapse border border-slate-900 text-[11px]">
            <tbody>
              <tr>
                <td className="border border-slate-900 p-2 font-medium">Total Skor Kumulatif</td>
                <td className="border border-slate-900 p-2 font-bold text-center w-24">
                  {rapor.total_nilai ?? '-'}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-900 p-2 font-medium">Rata-Rata Nilai Akhir</td>
                <td className="border border-slate-900 p-2 font-black text-center text-sm text-[#0E5C44]">
                  {rapor.rata_rata ?? '-'}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-900 p-2 font-medium">Peringkat di Kelas</td>
                <td className="border border-slate-900 p-2 font-bold text-center">
                  {rapor.peringkat_kelas ? `Ke-${rapor.peringkat_kelas} dari ${rapor.total_siswa_kelas || '-'} Siswa` : '-'}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-900 p-2 font-medium">Status Kelulusan KKM</td>
                <td className="border border-slate-900 p-2 font-bold text-center text-emerald-700">
                  TUNTAS
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. BAGIAN D: CATATAN WALI KELAS */}
      <div className="space-y-1 pt-1">
        <h3 className="font-bold uppercase tracking-wider text-xs font-sans text-slate-900">
          D. CATATAN & REKOMENDASI WALI KELAS
        </h3>
        <div className="border border-slate-900 p-3 rounded-sm bg-slate-50/50 italic text-[11px] leading-relaxed text-slate-800">
          "{rapor.catatan_wali_kelas || 'Tingkatkan terus semangat belajar dan pertahankan prestasi yang membanggakan.'}"
        </div>
      </div>

      {/* 7. LEMBAR TANDA TANGAN 3 PIHAK */}
      <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs font-semibold font-sans">
        <div>
          <p className="text-slate-700">Orang Tua / Wali Siswa</p>
          <div className="h-20"></div>
          <p className="border-b border-slate-900 inline-block px-6 pb-0.5">( ................................ )</p>
        </div>
        <div>
          <p className="text-slate-700">Wali Kelas</p>
          <div className="h-20"></div>
          <p className="font-bold text-slate-900 border-b border-slate-900 inline-block px-4 pb-0.5">
            {wali.name || 'Wali Kelas, S.Pd.'}
          </p>
          <p className="text-[10px] text-slate-600 font-mono mt-0.5">NIP: {wali.nip || '-'}</p>
        </div>
        <div>
          <p className="text-slate-700">Kepala Sekolah</p>
          <div className="h-20"></div>
          <p className="font-bold text-slate-900 border-b border-slate-900 inline-block px-4 pb-0.5">
            {school.kepala_sekolah || 'Kepala Sekolah'}
          </p>
          <p className="text-[10px] text-slate-600 font-mono mt-0.5">NIP: {school.nip_kepsek || '-'}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Print & Download PDF Helper Function
 * Creates a clean, dedicated iframe to trigger A4 print dialog.
 */
export function printRaporDocument(digitalData) {
  if (!digitalData) return

  const school = digitalData.school_info || {}
  const siswa = digitalData.siswa || {}
  const rapor = digitalData.rapor || {}
  const wali = digitalData.wali_kelas || {}
  const mapelList = digitalData.nilai_mapel || []

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow.document
  doc.open()
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Rapor Digital - ${siswa.name || 'Siswa'}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 15mm 12mm 15mm;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 10.5pt;
          color: #000;
          line-height: 1.35;
          margin: 0;
          padding: 0;
        }
        .header {
          text-align: center;
          border-bottom: 3px double #000;
          padding-bottom: 6px;
          margin-bottom: 12px;
        }
        .header-logo {
          font-family: Arial, sans-serif;
          font-size: 11pt;
          font-weight: bold;
          color: #0E5C44;
          letter-spacing: 1px;
          margin-bottom: 2px;
        }
        .header h1 {
          font-size: 13pt;
          font-weight: bold;
          text-transform: uppercase;
          margin: 0;
        }
        .header p {
          font-size: 8.5pt;
          margin: 2px 0 0 0;
          font-family: Arial, sans-serif;
        }
        .title {
          text-align: center;
          font-size: 11.5pt;
          font-weight: bold;
          text-decoration: underline;
          text-transform: uppercase;
          margin: 8px 0 2px 0;
        }
        .subtitle {
          text-align: center;
          font-size: 9.5pt;
          font-family: Arial, sans-serif;
          margin-bottom: 12px;
        }
        .meta-table {
          width: 100%;
          margin-bottom: 12px;
          border-collapse: collapse;
          font-family: Arial, sans-serif;
          background-color: #fafafa;
          border: 1px solid #ccc;
        }
        .meta-table td {
          padding: 4px 8px;
          vertical-align: top;
          font-size: 9.5pt;
        }
        .section-title {
          font-size: 10pt;
          font-weight: bold;
          text-transform: uppercase;
          font-family: Arial, sans-serif;
          margin: 12px 0 5px 0;
        }
        table.data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        table.data-table th, table.data-table td {
          border: 1px solid #000;
          padding: 4px 6px;
          font-size: 9.5pt;
        }
        table.data-table th {
          background-color: #eaeaea;
          font-weight: bold;
          text-align: center;
          font-family: Arial, sans-serif;
        }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        .grid-2 {
          display: table;
          width: 100%;
          margin-top: 6px;
        }
        .grid-2-col {
          display: table-cell;
          width: 49%;
          vertical-align: top;
        }
        .grid-2-gap {
          display: table-cell;
          width: 2%;
        }
        .signatures {
          margin-top: 30px;
          display: table;
          width: 100%;
          text-align: center;
          font-size: 9.5pt;
          font-family: Arial, sans-serif;
        }
        .signatures > div {
          display: table-cell;
          width: 33%;
          vertical-align: top;
        }
        .sig-space {
          height: 50px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-logo">YAYASAN DAREL IMAN PADANG</div>
        <h1>${school.name || 'SMP IT DAREL IMAN'}</h1>
        <p>${school.address || 'Jl. Raya Utama Darel Iman, Kota Padang, Sumatera Barat'}</p>
      </div>

      <div class="title">LAPORAN HASIL BELAJAR SISWA (RAPOR DIGITAL)</div>
      <div class="subtitle">KURIKULUM MERDEKA • SEMESTER ${rapor.semester?.nama || '1'} • TA ${rapor.tahun_ajaran?.year || '2025/2026'}</div>

      <table class="meta-table">
        <tr>
          <td width="15%"><strong>Nama Siswa</strong></td>
          <td width="35%">: <strong>${siswa.name || '-'}</strong></td>
          <td width="18%"><strong>Kelas / Rombel</strong></td>
          <td width="32%">: <strong>${rapor.kelas?.nama_kelas || '-'}</strong></td>
        </tr>
        <tr>
          <td><strong>NISN / NIS</strong></td>
          <td>: ${siswa.nisn || '-'} / ${siswa.nis || '-'}</td>
          <td><strong>Semester / TA</strong></td>
          <td>: ${rapor.semester?.nama || '-'} • ${rapor.tahun_ajaran?.year || '-'}</td>
        </tr>
      </table>

      <div class="section-title">A. CAPAIAN AKADEMIK MATA PELAJARAN</div>
      <table class="data-table">
        <thead>
          <tr>
            <th width="4%">No</th>
            <th width="32%" class="text-left">Mata Pelajaran</th>
            <th width="8%">KKM</th>
            <th width="10%">Nilai</th>
            <th width="9%">Predikat</th>
            <th width="37%" class="text-left">Capaian Kompetensi / Catatan</th>
          </tr>
        </thead>
        <tbody>
          ${mapelList.map((n, idx) => `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td class="font-bold">${n.subject_name || '-'}</td>
              <td class="text-center">${n.kkm ?? 75}</td>
              <td class="text-center font-bold">${n.final_score ?? '-'}</td>
              <td class="text-center font-bold">${n.grade ?? '-'}</td>
              <td>${n.catatan || 'Menunjukkan penguasaan kompetensi yang sangat baik'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="grid-2">
        <div class="grid-2-col">
          <div class="section-title">B. KETIDAKHADIRAN (PRESENSI)</div>
          <table class="data-table">
            <tbody>
              <tr><td>Hadir (H)</td><td class="text-center font-bold" width="35%">${rapor.total_hadir ?? 0} Hari</td></tr>
              <tr><td>Izin (I)</td><td class="text-center font-bold">${rapor.total_izin ?? 0} Hari</td></tr>
              <tr><td>Sakit (S)</td><td class="text-center font-bold">${rapor.total_sakit ?? 0} Hari</td></tr>
              <tr><td>Tanpa Keterangan (Alpha)</td><td class="text-center font-bold">${rapor.total_alpha ?? 0} Hari</td></tr>
            </tbody>
          </table>
        </div>

        <div class="grid-2-gap"></div>

        <div class="grid-2-col">
          <div class="section-title">C. RANGKUMAN PRESTASI & RANKING</div>
          <table class="data-table">
            <tbody>
              <tr><td>Total Skor Kumulatif</td><td class="text-center font-bold" width="35%">${rapor.total_nilai ?? '-'}</td></tr>
              <tr><td>Rata-Rata Nilai Akhir</td><td class="text-center font-bold">${rapor.rata_rata ?? '-'}</td></tr>
              <tr><td>Peringkat di Kelas</td><td class="text-center font-bold">${rapor.peringkat_kelas ? `Ke-${rapor.peringkat_kelas} (${rapor.total_siswa_kelas || '-'} Siswa)` : '-'}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="section-title">D. CATATAN & REKOMENDASI WALI KELAS</div>
      <div style="border: 1px solid #000; padding: 6px 10px; font-style: italic; font-size: 9.5pt; background: #fafafa;">
        "${rapor.catatan_wali_kelas || 'Tingkatkan terus semangat belajar dan pertahankan prestasi yang membanggakan.'}"
      </div>

      <div class="signatures">
        <div>
          <p>Orang Tua / Wali Siswa</p>
          <div class="sig-space"></div>
          <p><u>( ................................ )</u></p>
        </div>
        <div>
          <p>Wali Kelas</p>
          <div class="sig-space"></div>
          <p><u><b>${wali.name || 'Wali Kelas, S.Pd.'}</b></u></p>
          <p style="font-size: 8pt; margin-top: 2px;">NIP: ${wali.nip || '-'}</p>
        </div>
        <div>
          <p>Kepala Sekolah</p>
          <div class="sig-space"></div>
          <p><u><b>${school.kepala_sekolah || 'Kepala Sekolah'}</b></u></p>
          <p style="font-size: 8pt; margin-top: 2px;">NIP: ${school.nip_kepsek || '-'}</p>
        </div>
      </div>
    </body>
    </html>
  `)
  doc.close()

  setTimeout(() => {
    iframe.contentWindow.focus()
    iframe.contentWindow.print()
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 1000)
  }, 300)
}

export default function LmsRaporPage({ tabNav = null }) {
  const [dataList, setDataList] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })
  const [stats, setStats] = useState({
    total_rapor: 0,
    diterbitkan: 0,
    draft: 0,
    final: 0,
    direvisi: 0,
    rata_rata_sekolah: 0,
  })
  const [options, setOptions] = useState({
    students: [],
    kelases: [],
    semesters: [],
    tahun_ajarans: [],
    employees: [],
  })

  const [filters, setFilters] = useState({
    search: '',
    kelas_id: '',
    semester_id: '',
    tahun_ajaran_id: '',
    status_rapor: '',
  })

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showDigitalModal, setShowDigitalModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)

  const [editingItem, setEditingItem] = useState(null)
  const [digitalData, setDigitalData] = useState(null)
  const [loadingDigital, setLoadingDigital] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  // Card Drill-Down Modal State
  const [cardModal, setCardModal] = useState({
    isOpen: false,
    statusKey: 'semua',
    title: '',
    tone: 'emerald',
    searchQuery: '',
    page: 1,
  })

  // Print Filter & Student Selection Modal State
  const [isPrintFilterModalOpen, setIsPrintFilterModalOpen] = useState(false)
  const [selectedStudentIds, setSelectedStudentIds] = useState([])
  const [selectedFields, setSelectedFields] = useState({
    mapel: true,
    rata_rata: true,
    ranking: true,
    presensi: true,
    status: true,
  })
  const [printSearchQuery, setPrintSearchQuery] = useState('')

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const importInputRef = useRef(null)

  // Form State
  const [formData, setFormData] = useState({
    siswa_id: '',
    kelas_id: '',
    semester_id: '',
    tahun_ajaran_id: '',
    guru_wali_id: '',
    catatan_wali_kelas: '',
    catatan_kepala_sekolah: '',
    status_rapor: 'draft',
    tanggal_terbit: new Date().toISOString().split('T')[0],
  })

  // Generate State
  const [generateData, setGenerateData] = useState({
    kelas_id: '',
    semester_id: '',
    tahun_ajaran_id: '',
  })
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchOptions()
    fetchStats()
    fetchData(1)
  }, [])

  useEffect(() => {
    fetchStats()
    fetchData(1)
  }, [filters])

  const showToastNotification = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000)
  }

  const getRowId = useCallback((r, idx) => r.id ?? r.siswa_id ?? r.siswa?.id ?? `rapor-${idx}`, [])

  const fetchOptions = async () => {
    try {
      const res = await lmsRaporService.getOptions()
      if (res.success) {
        setOptions(res.data)
        if (res.data.kelases.length > 0 && res.data.semesters.length > 0 && res.data.tahun_ajarans.length > 0) {
          setGenerateData({
            kelas_id: res.data.kelases[0].id,
            semester_id: res.data.semesters[0].id,
            tahun_ajaran_id: res.data.tahun_ajarans[0].id,
          })
        }
      }
    } catch (err) {
      console.error('Failed to load options', err)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await lmsRaporService.getStats(filters)
      if (res.success) {
        setStats(res.data)
      }
    } catch (err) {
      console.error('Failed to load stats', err)
    }
  }

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const params = {
        page,
        per_page: 15,
        ...filters,
      }
      const res = await lmsRaporService.getDaftar(params)
      if (res.data) {
        setDataList(res.data)
        if (res.meta) {
          setPagination({
            currentPage: res.meta.current_page,
            lastPage: res.meta.last_page,
            total: res.meta.total,
          })
        }
      }
    } catch (err) {
      showToastNotification('Gagal memuat data Rapor Digital.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreateModal = () => {
    setEditingItem(null)
    setFormData({
      siswa_id: options.students[0]?.id || '',
      kelas_id: options.kelases[0]?.id || '',
      semester_id: options.semesters[0]?.id || '',
      tahun_ajaran_id: options.tahun_ajarans[0]?.id || '',
      guru_wali_id: options.employees[0]?.id || '',
      catatan_wali_kelas: 'Tingkatkan semangat belajar dan terus berprestasi.',
      catatan_kepala_sekolah: 'Pertahankan pencapaian yang baik ini.',
      status_rapor: 'draft',
      tanggal_terbit: new Date().toISOString().split('T')[0],
    })
    setShowFormModal(true)
  }

  const handleOpenEditModal = (item) => {
    setEditingItem(item)
    setFormData({
      siswa_id: item.siswa_id || '',
      kelas_id: item.kelas_id || '',
      semester_id: item.semester_id || '',
      tahun_ajaran_id: item.tahun_ajaran_id || '',
      guru_wali_id: item.guru_wali_id || '',
      catatan_wali_kelas: item.catatan_wali_kelas || '',
      catatan_kepala_sekolah: item.catatan_kepala_sekolah || '',
      status_rapor: item.status_rapor || 'draft',
      tanggal_terbit: item.tanggal_terbit || new Date().toISOString().split('T')[0],
    })
    setShowFormModal(true)
  }

  const handleSaveRapor = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        const res = await lmsRaporService.update(editingItem.id, formData)
        if (res.success) {
          showToastNotification('Catatan & Status Rapor Digital berhasil diperbarui.')
        }
      } else {
        const res = await lmsRaporService.create(formData)
        if (res.success) {
          showToastNotification('Rapor Digital Siswa berhasil ditambahkan.')
        }
      }
      setShowFormModal(false)
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (err) {
      showToastNotification('Gagal menyimpan data Rapor.', 'error')
    }
  }

  const handleGenerateClass = async (e) => {
    e.preventDefault()
    setGenerating(true)
    try {
      const res = await lmsRaporService.generateKelas(generateData)
      if (res.success) {
        showToastNotification(`Berhasil membuat Rapor Digital untuk ${res.total_generated || 0} siswa.`)
        setShowGenerateModal(false)
        fetchData(1)
        fetchStats()
      }
    } catch (err) {
      showToastNotification('Gagal melakukan kalkulasi Rapor Kelas.', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data Rapor ini?')) return
    try {
      const res = await lmsRaporService.delete(id)
      if (res.success) {
        showToastNotification('Rapor Digital berhasil dihapus.')
        fetchData(pagination.currentPage)
        fetchStats()
      }
    } catch (err) {
      showToastNotification('Gagal menghapus Rapor.', 'error')
    }
  }

  const handleViewDigitalRapor = async (id) => {
    setLoadingDigital(true)
    setShowDigitalModal(true)
    try {
      const res = await lmsRaporService.getPdf(id)
      if (res.success) {
        setDigitalData(res.data)
      }
    } catch (err) {
      showToastNotification('Gagal memuat Rapor Digital.', 'error')
    } finally {
      setLoadingDigital(false)
    }
  }

  const handleOpenPrintPreview = async (id) => {
    setLoadingDigital(true)
    setShowPrintModal(true)
    try {
      const res = await lmsRaporService.getPdf(id)
      if (res.success) {
        setDigitalData(res.data)
      }
    } catch (err) {
      showToastNotification('Gagal memuat data cetak Rapor.', 'error')
    } finally {
      setLoadingDigital(false)
    }
  }

  const openCardModal = (statusKey, label, tone) => {
    setCardModal({
      isOpen: true,
      statusKey,
      title: `Rincian Rapor Siswa — ${label}`,
      tone,
      searchQuery: '',
      page: 1,
    })
  }

  const closeCardModal = () => {
    setCardModal((prev) => ({ ...prev, isOpen: false }))
  }

  const modalRows = useMemo(() => {
    if (!cardModal.isOpen) return []
    let list = [...dataList]

    if (cardModal.statusKey === 'diterbitkan') {
      list = list.filter((r) => r.status_rapor === 'diterbitkan')
    } else if (cardModal.statusKey === 'draft') {
      list = list.filter((r) => r.status_rapor === 'draft')
    } else if (cardModal.statusKey === 'final') {
      list = list.filter((r) => r.status_rapor === 'final')
    } else if (cardModal.statusKey === 'direvisi') {
      list = list.filter((r) => r.status_rapor === 'direvisi')
    }

    if (cardModal.searchQuery.trim()) {
      const q = cardModal.searchQuery.toLowerCase().trim()
      list = list.filter((r) => {
        const name = (r.siswa?.name || r.siswa?.full_name || '').toLowerCase()
        const nis = (r.siswa?.nis || '').toLowerCase()
        const kelas = (r.kelas?.nama_kelas || '').toLowerCase()
        return name.includes(q) || nis.includes(q) || kelas.includes(q)
      })
    }
    return list
  }, [dataList, cardModal.isOpen, cardModal.statusKey, cardModal.searchQuery])

  const MODAL_PAGE_SIZE = 5
  const modalTotalPages = Math.max(1, Math.ceil(modalRows.length / MODAL_PAGE_SIZE))
  const paginatedModalRows = useMemo(() => {
    return modalRows.slice((cardModal.page - 1) * MODAL_PAGE_SIZE, cardModal.page * MODAL_PAGE_SIZE)
  }, [modalRows, cardModal.page])

  const openPrintFilterModal = () => {
    setSelectedStudentIds(dataList.map((r, idx) => getRowId(r, idx)))
    setPrintSearchQuery('')
    setIsPrintFilterModalOpen(true)
  }

  const filteredPrintStudents = useMemo(() => {
    if (!printSearchQuery.trim()) return dataList
    const q = printSearchQuery.toLowerCase().trim()
    return dataList.filter((r) => {
      const name = (r.siswa?.name || r.siswa?.full_name || '').toLowerCase()
      const nis = (r.siswa?.nis || '').toLowerCase()
      const kelas = (r.kelas?.nama_kelas || '').toLowerCase()
      return name.includes(q) || nis.includes(q) || kelas.includes(q)
    })
  }, [dataList, printSearchQuery])

  const handleSelectAllPrintStudents = (e) => {
    if (e.target.checked) {
      setSelectedStudentIds(dataList.map((r, idx) => getRowId(r, idx)))
    } else {
      setSelectedStudentIds([])
    }
  }

  const handleTogglePrintStudent = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleExecutePrint = (format = 'print') => {
    let targetList = dataList.filter((r, idx) => selectedStudentIds.includes(getRowId(r, idx)))
    if (targetList.length === 0) {
      targetList = dataList
    }

    const columns = [
      { title: 'No', render: (_, idx) => idx + 1 },
      { title: 'NISN / NIS', render: (r) => `${r.siswa?.nisn || '-'}\n${r.siswa?.nis || '-'}` },
      { title: 'Nama Siswa', render: (r) => r.siswa?.name || r.siswa?.full_name || '-' },
      { title: 'Kelas & Semester', render: (r) => `${r.kelas?.nama_kelas || '-'}\n${r.semester?.nama || '-'}` },
    ]

    if (selectedFields.mapel) {
      columns.push({ title: 'Mapel Lulus', render: (r) => `${r.mapel_lulus || 0}/${r.total_mapel || 0}` })
    }
    if (selectedFields.rata_rata) {
      columns.push({ title: 'Rata-Rata', render: (r) => r.rata_rata || 0 })
    }
    if (selectedFields.ranking) {
      columns.push({ title: 'Ranking', render: (r) => (r.peringkat_kelas ? `Ke-${r.peringkat_kelas}` : '-') })
    }
    if (selectedFields.presensi) {
      columns.push({ title: 'Presensi', render: (r) => `${r.total_hadir || 0}H / ${r.total_izin || 0}I / ${r.total_sakit || 0}S / ${r.total_alpha || 0}A` })
    }
    if (selectedFields.status) {
      columns.push({ title: 'Status Rapor', render: (r) => (r.status_rapor || 'draft').toUpperCase() })
    }

    if (format === 'print') {
      printCleanTable({
        title: 'Laporan Rekap Rapor Digital Siswa',
        subtitle: `Dicetak ${targetList.length} Siswa | Sistem Manajemen Sekolah Terpadu`,
        columns,
        data: targetList,
      })
    } else if (format === 'pdf') {
      downloadPdfTable({
        filename: 'rekap-rapor-digital-siswa.pdf',
        title: 'Laporan Rekap Rapor Digital Siswa',
        subtitle: `Dicetak ${targetList.length} Siswa | Sistem Manajemen Sekolah Terpadu`,
        columns,
        data: targetList,
      })
    } else if (format === 'csv') {
      const exportCols = [
        { label: 'NISN', key: 'nisn' },
        { label: 'NIS', key: 'nis' },
        { label: 'Nama Siswa', key: 'name' },
        { label: 'Kelas', key: 'kelas' },
        { label: 'Semester', key: 'semester' },
        { label: 'Rata-Rata', key: 'rata_rata' },
        { label: 'Ranking', key: 'ranking' },
        { label: 'Status Rapor', key: 'status_rapor' },
      ]
      const exportRows = targetList.map((r) => ({
        nisn: r.siswa?.nisn || '-',
        nis: r.siswa?.nis || '-',
        name: r.siswa?.name || r.siswa?.full_name || '-',
        kelas: r.kelas?.nama_kelas || '-',
        semester: r.semester?.nama || '-',
        rata_rata: r.rata_rata || 0,
        ranking: r.peringkat_kelas ? `Ke-${r.peringkat_kelas}` : '-',
        status_rapor: r.status_rapor || 'draft',
      }))
      exportCsv(exportRows, exportCols, 'rekap-rapor-terpilih')
    }

    setIsPrintFilterModalOpen(false)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'diterbitkan':
        return <Badge color="success" size="sm">DITERBITKAN</Badge>
      case 'final':
        return <Badge color="violet" size="sm">FINAL VALIDATED</Badge>
      case 'direvisi':
        return <Badge color="warning" size="sm">DIREVISI</Badge>
      default:
        return <Badge color="gray" size="sm">DRAFT</Badge>
    }
  }

  const cards = useMemo(() => {
    const total = stats.total_rapor || pagination.total || dataList.length || 0
    const calcPercent = (val) => (total > 0 ? (val / total) * 100 : 0)

    return [
      {
        label: 'Total Rapor',
        statusKey: 'semua',
        value: total,
        icon: FileText,
        tone: 'emerald',
        percent: 100,
        subText: 'Dokumen Terdaftar',
      },
      {
        label: 'Diterbitkan',
        statusKey: 'diterbitkan',
        value: stats.diterbitkan || 0,
        icon: CheckCircle2,
        tone: 'sky',
        percent: calcPercent(stats.diterbitkan || 0),
        subText: 'Siap Dilihat Ortum',
      },
      {
        label: 'Draft / Validasi',
        statusKey: 'draft',
        value: stats.draft || 0,
        icon: Clock,
        tone: 'amber',
        percent: calcPercent(stats.draft || 0),
        subText: 'Validasi Wali Kelas',
      },
      {
        label: 'Final Validated',
        statusKey: 'final',
        value: stats.final || 0,
        icon: Check,
        tone: 'purple',
        percent: calcPercent(stats.final || 0),
        subText: 'Disetujui Kepsek',
      },
      {
        label: 'Rata-Rata Sekolah',
        statusKey: 'semua',
        value: stats.rata_rata_sekolah || 0,
        icon: Award,
        tone: 'rose',
        percent: 100,
        subText: 'Indeks Prestasi',
      },
    ]
  }, [stats, pagination.total, dataList.length])

  const chartData = useMemo(() => {
    if (!dataList.length) {
      return [
        { name: 'Kelas 7A', nilai: 85 },
        { name: 'Kelas 7B', nilai: 82 },
        { name: 'Kelas 8A', nilai: 88 },
        { name: 'Kelas 8B', nilai: 84 },
        { name: 'Kelas 9A', nilai: 89 },
      ]
    }
    const grouped = {}
    dataList.forEach((r) => {
      const k = r.kelas?.nama_kelas || 'Lainnya'
      if (!grouped[k]) grouped[k] = { total: 0, count: 0 }
      grouped[k].total += parseFloat(r.rata_rata || 0)
      grouped[k].count += 1
    })
    return Object.keys(grouped).map((k) => ({
      name: k,
      nilai: Number((grouped[k].total / grouped[k].count).toFixed(1)),
    }))
  }, [dataList])

  const pieData = useMemo(() => {
    return [
      { name: 'Diterbitkan', value: stats.diterbitkan || 12, color: '#0EA5E9' },
      { name: 'Final', value: stats.final || 8, color: '#8B5CF6' },
      { name: 'Draft', value: stats.draft || 5, color: '#F59E0B' },
      { name: 'Direvisi', value: stats.direvisi || 2, color: '#F43F5E' },
    ]
  }, [stats])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.04 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  }

  return (
    <PageContainer>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
        {/* Toast Notification */}
        {toast.show && (
          <div
            className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white font-medium transition-all transform duration-300 ${
              toast.type === 'error' ? 'bg-rose-600' : 'bg-[#0E5C44]'
            }`}
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>{toast.message}</span>
          </div>
        )}

        {/* 5-Card KPI Summary Grid */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {cards.map(({ label, statusKey, value, icon: Icon, tone, percent, subText }) => {
              const style = toneStyles[tone] || toneStyles.emerald
              return (
                <motion.article
                  key={label}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => openCardModal(statusKey, label, tone)}
                  role="button"
                  tabIndex={0}
                  className={`group flex flex-col justify-between h-full p-4 rounded-[18px] border shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer ${style.cardBg}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className={`size-10 sm:size-11 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg} ${style.iconColor}`}>
                      <Icon className="size-5 sm:size-6" />
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${style.badge}`}>
                      {percent.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">{label}</span>
                    <strong className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white block">
                      {typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800/80">
                    <span>{subText}</span>
                    <span className="inline-flex items-center gap-0.5 text-emerald-700 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
                      Detail &rarr;
                    </span>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </motion.div>

        {/* Module Tab Navigation & Action Buttons inside Single Card */}
        {tabNav && (
          <motion.div variants={itemVariants}>
            {typeof tabNav === 'function' ? (
              tabNav(
                <>
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(true)}
                    className="group relative flex shrink-0 items-center gap-2.5 rounded-xl border border-slate-200/70 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#111827] dark:hover:bg-slate-800/80 px-3 py-2 cursor-pointer transition-colors duration-150"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-xs bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60">
                      <RefreshCw className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col pr-0.5 text-left">
                      <span className="text-xs font-extrabold tracking-tight text-slate-700 dark:text-slate-200 group-hover:text-slate-900">
                        Auto-Generate Kelas
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">
                        Kalkulasi Otomatis
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenCreateModal}
                    className="group relative flex shrink-0 items-center gap-2.5 rounded-xl border border-slate-200/70 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#111827] dark:hover:bg-slate-800/80 px-3 py-2 cursor-pointer transition-colors duration-150"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-xs bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
                      <Plus className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col pr-0.5 text-left">
                      <span className="text-xs font-extrabold tracking-tight text-slate-700 dark:text-slate-200 group-hover:text-slate-900">
                        Rapor Manual
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">
                        Buat Rapor Baru
                      </span>
                    </div>
                  </button>
                </>
              )
            ) : (
              tabNav
            )}
          </motion.div>
        )}

        {/* 3-Column Equal Grid Section */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {/* Column 1: Filter Laporan Rapor */}
            <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Filter Laporan Rapor</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({ search: '', kelas_id: '', semester_id: '', tahun_ajaran_id: '', status_rapor: '' })
                      fetchData(1)
                    }}
                    className="text-xs font-semibold text-[#0E5C44] dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Pencarian Siswa */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Pencarian Siswa</label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari Siswa / NISN..."
                        value={filters.search}
                        onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                        className="w-full pl-8 pr-3 h-9 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Dropdown Kelas */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Pilihan Kelas</label>
                    <select
                      value={filters.kelas_id}
                      onChange={(e) => setFilters((prev) => ({ ...prev, kelas_id: e.target.value }))}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Semua Kelas</option>
                      {options.kelases.map((k) => (
                        <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dropdown Semester */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Semester</label>
                    <select
                      value={filters.semester_id}
                      onChange={(e) => setFilters((prev) => ({ ...prev, semester_id: e.target.value }))}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Semua Semester</option>
                      {options.semesters.map((s) => (
                        <option key={s.id} value={s.id}>{s.nama}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dropdown Tahun Ajaran */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tahun Ajaran</label>
                    <select
                      value={filters.tahun_ajaran_id}
                      onChange={(e) => setFilters((prev) => ({ ...prev, tahun_ajaran_id: e.target.value }))}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Semua Tahun Ajaran</option>
                      {options.tahun_ajarans.map((t) => (
                        <option key={t.id} value={t.id}>{t.year}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filter Status Rapor */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Status Rapor</label>
                    <select
                      value={filters.status_rapor}
                      onChange={(e) => setFilters((prev) => ({ ...prev, status_rapor: e.target.value }))}
                      className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Semua Status</option>
                      <option value="draft">Draft</option>
                      <option value="final">Final Validated</option>
                      <option value="diterbitkan">Diterbitkan</option>
                      <option value="direvisi">Direvisi</option>
                    </select>
                  </div>
                </div>
              </div>
            </article>

            {/* Column 2: Grafik Tren Utama (BarChart) */}
            <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Analisis Skor per Kelas</h2>
                <span className="text-xs font-semibold text-slate-400">Rata-Rata Nilai</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="nilai" fill="#0E5C44" radius={[6, 6, 0, 0]} maxBarSize={44} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            {/* Column 3: Grafik Distribusi Status Rapor (PieChart) */}
            <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Distribusi Status Rapor</h2>
                <span className="text-xs font-bold text-slate-500">{stats.total_rapor || dataList.length} Total</span>
              </div>
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="relative w-40 h-40 mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={2}>
                        {pieData.map((item) => (
                          <Cell key={item.name} fill={item.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <strong className="text-xl font-black text-slate-900 dark:text-white">{stats.total_rapor || dataList.length}</strong>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total</span>
                  </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-2 text-xs">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                        {item.name}: <b>{item.value}</b>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </motion.div>

        {/* Datatable Outer Container */}
        <motion.div variants={itemVariants}>
          <div className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#1B2433] shadow-xs space-y-4 p-4 md:p-6">
            {/* Datatable Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#0E5C44]" /> Daftar Rapor Digital Siswa
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {pagination.total || dataList.length} Records
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Tambah */}
                <SquircleActionButton
                  variant="primary"
                  onClick={handleOpenCreateModal}
                  label="Tambah Rapor Manual"
                />

                {/* 2. Export */}
                <SquircleActionButton
                  variant="export"
                  onClick={() => exportDatatable(dataList, 'csv')}
                  label="Export Datatable (.csv, .xlsx)"
                />

                {/* 3. Import */}
                <SquircleActionButton
                  variant="import"
                  onClick={() => setIsImportModalOpen(true)}
                  label="Import Data Rapor (.csv, .xlsx)"
                />

                {/* 4. Cetak */}
                <SquircleActionButton
                  variant="view"
                  icon={Printer}
                  onClick={openPrintFilterModal}
                  label="Cetak & Filter Laporan"
                />
              </div>
            </div>

            {/* Table Area */}
            {loading ? (
              <div className="p-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#0E5C44] animate-spin mx-auto" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Memuat Rapor Digital Siswa...</p>
              </div>
            ) : dataList.length === 0 ? (
              <div className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-700 dark:text-slate-300 font-bold">Belum ada data Rapor Digital</p>
                <p className="text-slate-500 text-xs mt-1">
                  Gunakan tombol "Auto-Generate Kelas" untuk mengkalkulasi rapor otomatis dari data penilaian.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Nama Siswa</th>
                      <th className="py-3.5 px-4">Kelas & Periode</th>
                      <th className="py-3.5 px-4 text-center">Mapel (Lulus/Total)</th>
                      <th className="py-3.5 px-4 text-center">Rata-Rata Nilai</th>
                      <th className="py-3.5 px-4 text-center">Ranking Kelas</th>
                      <th className="py-3.5 px-4 text-center">Presensi (H/I/S/A)</th>
                      <th className="py-3.5 px-4 text-center">Status Rapor</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {dataList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors duration-150">
                        {/* Student Info with HoverCard */}
                        <td className="py-3.5 px-4 align-top">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="cursor-pointer group flex items-center gap-2.5">
                                <Avatar size="sm">
                                  <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-bold">
                                    {(item.siswa?.name || 'S').charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                    {item.siswa?.name || 'Siswa Tanpa Nama'}
                                  </div>
                                  <div className="text-[11px] font-mono text-slate-400">
                                    NISN: {item.siswa?.nisn || '-'} | NIS: {item.siswa?.nis || '-'}
                                  </div>
                                </div>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-64 p-3 bg-white dark:bg-[#1B2433] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50">
                              <div className="flex items-center gap-3">
                                <Avatar size="md">
                                  <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold">
                                    {(item.siswa?.name || 'S').charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.siswa?.name}</h4>
                                  <p className="text-xs text-slate-500">NISN: {item.siswa?.nisn || '-'}</p>
                                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                                    {item.kelas?.nama_kelas || 'Kelas'}
                                  </span>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </td>

                        {/* Kelas & Periode */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{item.kelas?.nama_kelas || 'Kelas -'}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.semester?.nama || 'Semester'} • {item.tahun_ajaran?.year || 'Tahun'}
                          </div>
                        </td>

                        {/* Mapel Lulus */}
                        <td className="py-3.5 px-4 text-center align-top font-bold text-emerald-700 dark:text-emerald-400">
                          {item.mapel_lulus} <span className="text-slate-400 font-normal">/ {item.total_mapel}</span>
                        </td>

                        {/* Rata-Rata Nilai */}
                        <td className="py-3.5 px-4 text-center align-top">
                          <span className="inline-block px-3 py-1 rounded-lg bg-emerald-50 text-[#0E5C44] dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold text-base border border-emerald-200 dark:border-emerald-800">
                            {item.rata_rata}
                          </span>
                        </td>

                        {/* Ranking Kelas */}
                        <td className="py-3.5 px-4 text-center align-top">
                          {item.peringkat_kelas ? (
                            <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full text-xs">
                              🏆 Ke-{item.peringkat_kelas}
                              {item.total_siswa_kelas ? ` dari ${item.total_siswa_kelas}` : ''}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>

                        {/* Presensi */}
                        <td className="py-3.5 px-4 text-center align-top">
                          <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            <span className="text-emerald-600 font-bold">{item.total_hadir || 0}H</span> /{' '}
                            <span className="text-blue-600">{item.total_izin || 0}I</span> /{' '}
                            <span className="text-amber-600">{item.total_sakit || 0}S</span> /{' '}
                            <span className="text-rose-600 font-bold">{item.total_alpha || 0}A</span>
                          </div>
                        </td>

                        {/* Status Rapor */}
                        <td className="py-3.5 px-4 text-center align-top">{getStatusBadge(item.status_rapor)}</td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right align-top">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleViewDigitalRapor(item.id)}
                              className="size-8 rounded-xl bg-emerald-50/90 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-emerald-600/30 cursor-pointer shadow-2xs flex items-center justify-center"
                              title="Lihat Rapor Digital"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenPrintPreview(item.id)}
                              className="size-8 rounded-xl bg-indigo-50/90 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-indigo-600/30 cursor-pointer shadow-2xs flex items-center justify-center"
                              title="Export / Cetak PDF"
                            >
                              <Printer className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="size-8 rounded-xl bg-sky-50/90 text-sky-600 hover:bg-sky-600 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-sky-600/30 cursor-pointer shadow-2xs flex items-center justify-center"
                              title="Edit Catatan & Status"
                            >
                              <Edit3 className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="size-8 rounded-xl bg-rose-50/90 text-rose-600 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-rose-600/30 cursor-pointer shadow-2xs flex items-center justify-center"
                              title="Hapus Rapor"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && pagination.lastPage > 1 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.lastPage}
                  onPageChange={(page) => fetchData(page)}
                  sideLayout="full"
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* MODAL 1: Auto-Generate Rapor Kelas */}
        {showGenerateModal && (
          <Dialog isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <RefreshCw className="w-5 h-5 text-amber-500" /> Auto-Generate Rapor Kelas
              </DialogTitle>
              <DialogDescription>
                Hitung nilai akhir & ranking siswa secara otomatis dari data penilaian.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleGenerateClass} className="flex-1 min-h-0 flex flex-col justify-between">
              <DialogBody className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Pilih Kelas
                  </label>
                  <select
                    required
                    value={generateData.kelas_id}
                    onChange={(e) => setGenerateData({ ...generateData, kelas_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0E5C44]"
                  >
                    {options.kelases.map((k) => (
                      <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Semester
                  </label>
                  <select
                    required
                    value={generateData.semester_id}
                    onChange={(e) => setGenerateData({ ...generateData, semester_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0E5C44]"
                  >
                    {options.semesters.map((s) => (
                      <option key={s.id} value={s.id}>{s.nama}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tahun Ajaran
                  </label>
                  <select
                    required
                    value={generateData.tahun_ajaran_id}
                    onChange={(e) => setGenerateData({ ...generateData, tahun_ajaran_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0E5C44]"
                  >
                    {options.tahun_ajarans.map((t) => (
                      <option key={t.id} value={t.id}>{t.year}</option>
                    ))}
                  </select>
                </div>
              </DialogBody>

              <DialogFooter className="flex items-center justify-end gap-2 pt-3">
                <Button variant="ghost" appearance="outline" size="sm" onClick={() => setShowGenerateModal(false)}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={generating}
                  variant="primary"
                  size="sm"
                  className="bg-[#0E5C44] text-white hover:bg-emerald-700"
                >
                  {generating ? 'Mengkalkulasi...' : 'Proses Kalkulasi Rapor'}
                </Button>
              </DialogFooter>
            </form>
          </Dialog>
        )}

        {/* MODAL 2: Form Create / Edit Catatan & Status */}
        {showFormModal && (
          <Dialog isOpen={showFormModal} onClose={() => setShowFormModal(false)} className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <Edit3 className="w-5 h-5 text-[#0E5C44]" />
                {editingItem ? 'Edit Catatan & Status Rapor' : 'Buat Rapor Digital Manual'}
              </DialogTitle>
              <DialogDescription>
                Sesuaikan catatan wali kelas, catatan kepala sekolah, dan status publikasi rapor.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveRapor} className="flex-1 min-h-0 flex flex-col justify-between">
              <DialogBody className="space-y-4">
                {!editingItem && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Pilih Siswa
                      </label>
                      <select
                        required
                        value={formData.siswa_id}
                        onChange={(e) => setFormData({ ...formData, siswa_id: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      >
                        {options.students.map((s) => (
                          <option key={s.id} value={s.id}>{s.name} ({s.nisn})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kelas</label>
                        <select
                          required
                          value={formData.kelas_id}
                          onChange={(e) => setFormData({ ...formData, kelas_id: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                        >
                          {options.kelases.map((k) => (
                            <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                        <select
                          required
                          value={formData.semester_id}
                          onChange={(e) => setFormData({ ...formData, semester_id: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                        >
                          {options.semesters.map((s) => (
                            <option key={s.id} value={s.id}>{s.nama}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Catatan Wali Kelas
                  </label>
                  <textarea
                    rows={3}
                    value={formData.catatan_wali_kelas}
                    onChange={(e) => setFormData({ ...formData, catatan_wali_kelas: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Catatan Kepala Sekolah
                  </label>
                  <textarea
                    rows={2}
                    value={formData.catatan_kepala_sekolah}
                    onChange={(e) => setFormData({ ...formData, catatan_kepala_sekolah: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Rapor</label>
                    <select
                      value={formData.status_rapor}
                      onChange={(e) => setFormData({ ...formData, status_rapor: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    >
                      <option value="draft">Draft</option>
                      <option value="final">Final Validated</option>
                      <option value="diterbitkan">Diterbitkan</option>
                      <option value="direvisi">Direvisi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Terbit</label>
                    <input
                      type="date"
                      value={formData.tanggal_terbit}
                      onChange={(e) => setFormData({ ...formData, tanggal_terbit: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </DialogBody>

              <DialogFooter className="flex items-center justify-end gap-2 pt-3">
                <Button variant="ghost" appearance="outline" size="sm" onClick={() => setShowFormModal(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" className="bg-[#0E5C44] text-white hover:bg-emerald-700">
                  Simpan Rapor
                </Button>
              </DialogFooter>
            </form>
          </Dialog>
        )}

        {/* MODAL 3: Lihat Rapor Digital Modal (Authentic School Report Card View) */}
        {showDigitalModal && (
          <Dialog isOpen={showDigitalModal} onClose={() => setShowDigitalModal(false)} className="max-w-4xl bg-slate-100 dark:bg-slate-900">
            <DialogHeader className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900 dark:text-white font-sans">
                  <GraduationCap className="w-6 h-6 text-[#0E5C44]" /> Pratinjau Dokumen Rapor Digital Siswa
                </DialogTitle>
                <DialogDescription>
                  Tampilan lembaran dokumen resmi Rapor Siswa Kurikulum Merdeka / Terpadu.
                </DialogDescription>
              </div>
            </DialogHeader>

            <DialogBody className="py-4">
              {loadingDigital || !digitalData ? (
                <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-xl">
                  <RefreshCw className="w-8 h-8 text-[#0E5C44] animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Memuat Dokumen Rapor Digital...</p>
                </div>
              ) : (
                <OfficialRaporSheet digitalData={digitalData} />
              )}
            </DialogBody>

            <DialogFooter className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="ghost" appearance="outline" size="sm" onClick={() => setShowDigitalModal(false)}>
                Tutup
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  appearance="outline"
                  size="sm"
                  onClick={() => printRaporDocument(digitalData)}
                  className="gap-1.5 text-blue-700 border-blue-300 dark:text-blue-400 hover:bg-blue-50 cursor-pointer"
                >
                  <Download1 className="w-4 h-4" /> Unduh PDF
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => printRaporDocument(digitalData)}
                  className="gap-1.5 bg-[#0E5C44] hover:bg-emerald-700 text-white cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak Rapor
                </Button>
              </div>
            </DialogFooter>
          </Dialog>
        )}

        {/* MODAL 4: Cetak / Export PDF Modal */}
        {showPrintModal && (
          <Dialog isOpen={showPrintModal} onClose={() => setShowPrintModal(false)} className="max-w-4xl bg-slate-100 dark:bg-slate-900">
            <DialogHeader className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900 dark:text-white font-sans">
                  <Printer className="w-6 h-6 text-[#0E5C44]" /> Cetak PDF Rapor Digital Siswa
                </DialogTitle>
                <DialogDescription>
                  Pratinjau cetakan lembaran Rapor resmi A4 siap cetak & unduh.
                </DialogDescription>
              </div>
            </DialogHeader>

            <DialogBody className="py-4">
              {loadingDigital || !digitalData ? (
                <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-xl">
                  <RefreshCw className="w-8 h-8 text-[#0E5C44] animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Mempersiapkan lembar cetak Rapor...</p>
                </div>
              ) : (
                <OfficialRaporSheet digitalData={digitalData} />
              )}
            </DialogBody>

            <DialogFooter className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="ghost" appearance="outline" size="sm" onClick={() => setShowPrintModal(false)}>
                Tutup
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  appearance="outline"
                  size="sm"
                  onClick={() => printRaporDocument(digitalData)}
                  className="gap-1.5 text-blue-700 border-blue-300 dark:text-blue-400 hover:bg-blue-50 cursor-pointer"
                >
                  <Download1 className="w-4 h-4" /> Unduh PDF
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => printRaporDocument(digitalData)}
                  className="gap-1.5 bg-[#0E5C44] hover:bg-emerald-700 text-white cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak Rapor
                </Button>
              </div>
            </DialogFooter>
          </Dialog>
        )}

        {/* MODAL 5: KPI Card Drill-Down Detail Modal */}
        {cardModal.isOpen && (
          <Dialog isOpen={cardModal.isOpen} onClose={closeCardModal} className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between w-full pr-6">
                <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <Award className="w-5 h-5 text-[#0E5C44]" />
                  {cardModal.title}
                </DialogTitle>
                <Badge color="cyan" size="sm">
                  {modalRows.length} Siswa
                </Badge>
              </div>
              <DialogDescription>
                Daftar rincian status Rapor Digital siswa.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, NIS, kelas..."
                  value={cardModal.searchQuery}
                  onChange={(e) => setCardModal((prev) => ({ ...prev, searchQuery: e.target.value, page: 1 }))}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                      <th className="py-2.5 px-3">Siswa & NIS</th>
                      <th className="py-2.5 px-3">Kelas & Periode</th>
                      <th className="py-2.5 px-3 text-center">Rata-Rata</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedModalRows.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          Tidak ada data siswa untuk kategori ini.
                        </td>
                      </tr>
                    ) : (
                      paginatedModalRows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900 dark:text-white">{row.siswa?.name || 'Siswa'}</div>
                            <div className="text-[10px] text-slate-400 font-mono">NISN: {row.siswa?.nisn || '-'}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-medium text-slate-800 dark:text-slate-200">{row.kelas?.nama_kelas || '-'}</div>
                            <div className="text-[10px] text-slate-400">{row.semester?.nama || '-'}</div>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-[#0E5C44] dark:text-emerald-400">
                            {row.rata_rata}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {getStatusBadge(row.status_rapor)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {modalTotalPages > 1 && (
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                  <span>
                    Halaman {cardModal.page} dari {modalTotalPages} ({modalRows.length} data)
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={cardModal.page <= 1}
                      onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page - 1 }))}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Sebelumnya
                    </button>
                    <button
                      type="button"
                      disabled={cardModal.page >= modalTotalPages}
                      onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page + 1 }))}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </DialogBody>

            <DialogFooter>
              <Button variant="ghost" appearance="outline" size="sm" onClick={closeCardModal}>
                Tutup
              </Button>
            </DialogFooter>
          </Dialog>
        )}

        {/* MODAL 6: Print Filter & Student Selection Modal */}
        {isPrintFilterModalOpen && (
          <Dialog isOpen={isPrintFilterModalOpen} onClose={() => setIsPrintFilterModalOpen(false)} className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between w-full pr-6">
                <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <Printer className="w-5 h-5 text-[#0E5C44]" />
                  Pilih Data Rapor & Siswa Untuk Dicetak
                </DialogTitle>
                <Badge color="cyan" size="sm">
                  {selectedStudentIds.length} dari {dataList.length} Siswa
                </Badge>
              </div>
              <DialogDescription>
                Tentukan komponen nilai dan daftar siswa yang akan dimasukkan ke dalam laporan cetak / PDF.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  1. Pilih Komponen Yang Dicetak
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedFields.mapel}
                      onChange={() => setSelectedFields((p) => ({ ...p, mapel: !p.mapel }))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Mapel Lulus
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedFields.rata_rata}
                      onChange={() => setSelectedFields((p) => ({ ...p, rata_rata: !p.rata_rata }))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Rata-Rata Nilai
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedFields.ranking}
                      onChange={() => setSelectedFields((p) => ({ ...p, ranking: !p.ranking }))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Ranking Kelas
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedFields.presensi}
                      onChange={() => setSelectedFields((p) => ({ ...p, presensi: !p.presensi }))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Presensi Kehadiran
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300 col-span-2">
                    <input
                      type="checkbox"
                      checked={selectedFields.status}
                      onChange={() => setSelectedFields((p) => ({ ...p, status: !p.status }))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Status Rapor (Draft/Final/Diterbitkan)
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    2. Pilih Siswa Yang Dicetak ({selectedStudentIds.length}/{dataList.length})
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.length === dataList.length && dataList.length > 0}
                      onChange={handleSelectAllPrintStudents}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Pilih Semua
                  </label>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari siswa untuk dicetak..."
                    value={printSearchQuery}
                    onChange={(e) => setPrintSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto border border-slate-200/80 dark:border-slate-800 rounded-xl p-2 divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/40">
                  {filteredPrintStudents.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">Tidak ada siswa ditemukan.</div>
                  ) : (
                    filteredPrintStudents.map((r, idx) => {
                      const rowId = getRowId(r, idx)
                      const isChecked = selectedStudentIds.includes(rowId)
                      return (
                        <label
                          key={rowId}
                          className="flex items-center justify-between py-2 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePrintStudent(rowId)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">
                                {r.siswa?.name || 'Siswa'}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                NISN: {r.siswa?.nisn || '-'} | {r.kelas?.nama_kelas || '-'} ({r.semester?.nama || '-'})
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#0E5C44] dark:text-emerald-400">
                            Rata-Rata: {r.rata_rata}
                          </span>
                        </label>
                      )
                    })
                  )}
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="flex flex-wrap items-center justify-between gap-2">
              <Button variant="ghost" appearance="outline" size="sm" onClick={() => setIsPrintFilterModalOpen(false)}>
                Batal
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  appearance="outline"
                  size="sm"
                  onClick={() => handleExecutePrint('csv')}
                  className="gap-1.5 text-amber-700 border-amber-300 dark:text-amber-400 hover:bg-amber-50"
                >
                  <Download1 className="w-4 h-4" /> Export CSV
                </Button>
                <Button
                  variant="ghost"
                  appearance="outline"
                  size="sm"
                  onClick={() => handleExecutePrint('pdf')}
                  className="gap-1.5 text-blue-700 border-blue-300 dark:text-blue-400 hover:bg-blue-50"
                >
                  <FileText className="w-4 h-4" /> Unduh PDF
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleExecutePrint('print')}
                  className="gap-1.5 bg-[#0E5C44] hover:bg-emerald-700 text-white"
                >
                  <Printer className="w-4 h-4" /> Cetak Sekarang
                </Button>
              </div>
            </DialogFooter>
          </Dialog>
        )}

        {/* MODAL 7: Import Data Rapor Modal (.csv, .xlsx, .xls) */}
        {isImportModalOpen && (
          <Dialog
            isOpen={isImportModalOpen}
            onClose={() => { setIsImportModalOpen(false); setImportFile(null); setImportError(''); }}
            className="max-w-lg"
          >
            <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Upload1 className="size-5 text-sky-500" /> Import Data Rapor Digital Siswa
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Upload file spreadsheet (.csv, .xlsx, .xls) berisi data rata-rata nilai, peringkat, dan catatan rapor.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="py-4 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/60">
                <div>
                  <span className="text-xs font-bold text-sky-900 dark:text-sky-200 block">Template Format Import</span>
                  <span className="text-[11px] text-sky-700 dark:text-sky-400 block">Unduh contoh template CSV dengan kolom NISN, Nama, Kelas, Rata-Rata, Ranking.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const templateHeaders = 'nisn,nama_siswa,kelas,semester,rata_rata,peringkat,total_hadir,total_izin,total_sakit,total_alpha,status_rapor\n23001,"Ahmad Zaky","7A","Semester 1",86.5,1,100,0,0,0,"diterbitkan"\n23002,"Aisyah Humaira","7A","Semester 1",88.0,2,98,1,1,0,"final"\n'
                    const blob = new Blob([`\uFEFF${templateHeaders}`], { type: 'text/csv;charset=utf-8' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'template-import-rapor.csv'
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Download className="size-3.5" /> Template
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pilih File (.csv, .xlsx, .xls):
                </label>
                <div
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  onClick={() => importInputRef.current?.click()}
                >
                  <Upload1 className="size-8 text-sky-500 mb-2" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {importFile ? importFile.name : 'Klik untuk memilih atau drag & drop file'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">Format didukung: CSV (.csv), Excel (.xlsx, .xls)</span>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".csv, .xlsx, .xls, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setImportFile(e.target.files[0])
                        setImportError('')
                      }
                    }}
                  />
                </div>
              </div>

              {importError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
                  {importError}
                </div>
              )}
            </DialogBody>

            <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { setIsImportModalOpen(false); setImportFile(null); setImportError(''); }}>
                Batal
              </Button>
              <Button
                variant="primary"
                className="bg-sky-600 hover:bg-sky-700 text-white"
                disabled={!importFile || isImporting}
                onClick={async () => {
                  if (!importFile) return
                  try {
                    setIsImporting(true)
                    setImportError('')
                    const text = await importFile.text()
                    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
                    if (lines.length <= 1) throw new Error('File tidak memiliki data baris untuk diimport.')
                    
                    const newRows = lines.slice(1).map((line, idx) => {
                      const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim())
                      return {
                        id: `imp-rapor-${Date.now()}-${idx}`,
                        siswa: { name: cols[1] || `Siswa Import ${idx + 1}`, nisn: cols[0] || `NISN-${idx + 1}` },
                        kelas: { nama_kelas: cols[2] || 'Kelas' },
                        semester: { nama: cols[3] || 'Semester 1' },
                        rata_rata: parseFloat(cols[4]) || 85.0,
                        peringkat_kelas: parseInt(cols[5]) || (idx + 1),
                        total_mapel: 10,
                        mapel_lulus: 10,
                        total_hadir: parseInt(cols[6]) || 100,
                        total_izin: parseInt(cols[7]) || 0,
                        total_sakit: parseInt(cols[8]) || 0,
                        total_alpha: parseInt(cols[9]) || 0,
                        status_rapor: cols[10] || 'draft',
                      }
                    })

                    setDataList((prev) => [...newRows, ...prev])
                    setIsImportModalOpen(false)
                    setImportFile(null)
                    showToastNotification(`Berhasil mengimport ${newRows.length} data Rapor Digital!`)
                  } catch (err) {
                    setImportError(err.message || 'Gagal memproses file import.')
                  } finally {
                    setIsImporting(false)
                  }
                }}
              >
                {isImporting ? 'Memproses...' : 'Import Data'}
              </Button>
            </DialogFooter>
          </Dialog>
        )}
      </motion.div>
    </PageContainer>
  )
}
