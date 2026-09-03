import { useEffect, useState, useMemo } from 'react'
import ActionDropdown from '../app/ActionDropdown'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  FaKey,
  FaPlus,
  FaSearch,
  FaTimes,
  FaUserCheck,
  FaUserTimes,
  FaGraduationCap,
  FaUserTie,
  FaUserFriends,
  FaUserShield,
  FaCheckCircle,
  FaPrint,
  FaFilePdf,
  FaIdCard,
  FaBuilding,
  FaFilter,
} from 'react-icons/fa'
import { hakAksesService } from '../../services/hakAksesService'
import { employeeService } from '../../services/employeeService'
import { studentService } from '../../services/studentService'

const DEFAULT_SYSTEM_ROLES = [
  'Super Admin',
  'Admin',
  'Pengurus Yayasan',
  'Kepala Sekolah',
  'Divisi Pendidikan',
  'Guru',
  'Musyrif',
  'Wali Kelas',
  'Tata Usaha',
  'Siswa',
  'Orang Tua',
]

const STANDALONE_ADMIN_ROLES = ['Super Admin', 'Admin', 'Pengurus Yayasan', 'Divisi Pendidikan']
const EMPLOYEE_ROLES = ['Guru', 'Pegawai', 'Wali Kelas', 'Musyrif', 'Tata Usaha', 'Kepala Sekolah']
const STUDENT_ROLES = ['Siswa']
const PARENT_ROLES = ['Orang Tua']

// Sample Fallback Entitas
const SAMPLE_EMPLOYEES = [
  { id: 'EMP-101', name: 'Ustadz Abdullah, S.Pd', code: 'NIP: 19850112', unit: 'SDIT', email: 'abdullah@darel-iman.sch.id', phone: '08123456789', defaultRole: 'Guru' },
  { id: 'EMP-102', name: 'Ustadzah Khadijah, M.Pd', code: 'NIP: 19890423', unit: 'TKIT', email: 'khadijah@darel-iman.sch.id', phone: '08129876543', defaultRole: 'Kepala Sekolah' },
  { id: 'EMP-103', name: 'Ahmad Fauzi, S.T', code: 'NIY: 20200815', unit: 'SMPIT', email: 'fauzi@darel-iman.sch.id', phone: '085211223344', defaultRole: 'Wali Kelas' },
  { id: 'EMP-104', name: 'Maryam Nur, S.Pd.I', code: 'NIY: 20210309', unit: 'SMAIT', email: 'maryam@darel-iman.sch.id', phone: '081377889900', defaultRole: 'Musyrif' },
  { id: 'EMP-105', name: 'Hasan Basri, S.E', code: 'NIP: 19910517', unit: 'Yayasan', email: 'hasan.basri@darel-iman.sch.id', phone: '081122334455', defaultRole: 'Tata Usaha' },
]

const SAMPLE_STUDENTS = [
  { id: 'STD-501', name: 'Muhammad Rizky', code: 'NISN: 0081234567', unit: 'SDIT Kelas 5A', email: '0081234567@siswa.darel-iman.sch.id', phone: '081233445566', defaultRole: 'Siswa' },
  { id: 'STD-502', name: 'Aisha Humaira', code: 'NISN: 0092345678', unit: 'SMPIT Kelas 8B', email: '0092345678@siswa.darel-iman.sch.id', phone: '081399887766', defaultRole: 'Siswa' },
  { id: 'STD-503', name: 'Bilal Ramadhan', code: 'NISN: 0073456789', unit: 'SMAIT Kelas 11-IPA', email: '0073456789@siswa.darel-iman.sch.id', phone: '085288990011', defaultRole: 'Siswa' },
]

const SAMPLE_PARENTS = [
  { id: 'PRN-901', name: 'H. Bambang Hidayat', code: 'Wali dari: Muhammad Rizky', unit: 'Orang Tua / Wali', email: 'bambang.hidayat@gmail.com', phone: '081233445566', defaultRole: 'Orang Tua' },
  { id: 'PRN-902', name: 'Hj. Rina Marlina', code: 'Wali dari: Aisha Humaira', unit: 'Orang Tua / Wali', email: 'rina.marlina@gmail.com', phone: '081399887766', defaultRole: 'Orang Tua' },
]

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  role: '',
  is_active: true,
  password: '',
  password_confirmation: '',
  person_type: 'standalone',
  person_id: null,
}

const getUserRoleName = (u) => {
  if (!u) return ''
  if (typeof u.role === 'string' && u.role.trim()) return u.role.trim()
  if (u.role?.name && typeof u.role.name === 'string') return u.role.name.trim()
  if (Array.isArray(u.roles) && u.roles.length > 0) {
    const r0 = u.roles[0]
    if (typeof r0 === 'string') return r0.trim()
    if (r0?.name && typeof r0.name === 'string') return r0.name.trim()
    if (r0?.slug && typeof r0.slug === 'string') return r0.slug.trim()
  }
  return ''
}

// ─────────────────────────────────────────────────────────────────
// MODAL CETAK KREDENSIAL AKUN & PASSWORD (WITH FILTERS)
// ─────────────────────────────────────────────────────────────────
function PrintCredentialsModal({ open, onClose, users = [] }) {
  const [filterUnit, setFilterUnit] = useState('semua')
  const [filterCategory, setFilterCategory] = useState('semua')
  const [printFormat, setPrintFormat] = useState('table') // 'table' | 'cards'

  if (!open) return null

  // Filtering users based on selected criteria
  const filteredUsers = users.filter((user) => {
    const roleName = getUserRoleName(user)
    const personType = user.person_type || (roleName === 'Siswa' ? 'student' : roleName === 'Orang Tua' ? 'parent' : 'employee')

    // Category Filter
    if (filterCategory === 'pegawai' && !(personType === 'employee' && !roleName.toLowerCase().includes('guru'))) return false
    if (filterCategory === 'guru' && !roleName.toLowerCase().includes('guru')) return false
    if (filterCategory === 'siswa' && !(personType === 'student' || roleName === 'Siswa')) return false
    if (filterCategory === 'orangtua' && !(personType === 'parent' || roleName === 'Orang Tua')) return false
    if (filterCategory === 'standalone' && personType !== 'standalone') return false

    // Unit Filter
    if (filterUnit !== 'semua') {
      const userUnitName = (user.unit?.name || user.unit?.nama || '').toLowerCase()
      if (!userUnitName.includes(filterUnit.toLowerCase())) return false
    }

    return true
  })

  const handlePrint = () => {
    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const categoryText =
      filterCategory === 'pegawai'
        ? 'Pegawai / Staf'
        : filterCategory === 'guru'
        ? 'Guru / Tenaga Pendidik'
        : filterCategory === 'siswa'
        ? 'Siswa / Santri'
        : filterCategory === 'orangtua'
        ? 'Orang Tua / Wali Murid'
        : filterCategory === 'standalone'
        ? 'Administrator Standalone'
        : 'Semua Kategori'

    const unitText = filterUnit === 'semua' ? 'Semua Unit Pendidikan' : filterUnit.toUpperCase()

    let contentHtml = ''

    if (printFormat === 'table') {
      contentHtml = `
        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">NO</th>
              <th style="width: 25%;">NAMA LENGKAP PENGGUNA</th>
              <th style="width: 25%;">EMAIL / ID LOGIN</th>
              <th style="width: 15%;">ROLE PENUGASAN</th>
              <th style="width: 15%;">UNIT PENDIDIKAN</th>
              <th style="width: 15%; text-align: center;">PASSCODE / STATUS</th>
            </tr>
          </thead>
          <tbody>
            ${
              filteredUsers.length === 0
                ? '<tr><td colspan="6" style="text-align: center; padding: 20px;">Tidak ada data akun yang sesuai dengan kriteria filter.</td></tr>'
                : filteredUsers
                    .map((u, idx) => {
                      const rName = getUserRoleName(u) || 'Tanpa Role'
                      const passDisplay = u.passcode || u.initial_password || '******** (Aktif)'
                      return `
                    <tr>
                      <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
                      <td><strong>${u.name}</strong></td>
                      <td><code>${u.email}</code></td>
                      <td>${rName}</td>
                      <td>${u.unit?.name || u.unit?.nama || 'Yayasan / General'}</td>
                      <td style="text-align: center; font-weight: bold; color: #0e5c44;">${passDisplay}</td>
                    </tr>
                  `
                    })
                    .join('')
            }
          </tbody>
        </table>
      `
    } else {
      contentHtml = `
        <div class="cards-grid">
          ${filteredUsers
            .map((u) => {
              const rName = getUserRoleName(u) || 'Tanpa Role'
              const passDisplay = u.passcode || u.initial_password || '********'
              return `
              <div class="card-item">
                <div class="card-header">
                  <div class="card-title">SLIP AKUN LOGIN SIMSIT</div>
                  <div class="card-subtitle">Yayasan Dar El-Iman</div>
                </div>
                <div class="card-body">
                  <div class="row"><span>Nama:</span> <strong>${u.name}</strong></div>
                  <div class="row"><span>Email / User:</span> <code>${u.email}</code></div>
                  <div class="row"><span>Password Awal:</span> <strong style="color: #0e5c44;">${passDisplay}</strong></div>
                  <div class="row"><span>Role:</span> ${rName}</div>
                  <div class="row"><span>Unit:</span> ${u.unit?.name || u.unit?.nama || 'Umum'}</div>
                </div>
                <div class="card-footer">
                  Harap jaga kerahasiaan kata sandi Anda.
                </div>
              </div>
            `
            })
            .join('')}
        </div>
      `
    }

    const fullHtmlDocument = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cetak Kredensial Akun Login SIMSIT</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; margin: 0; padding: 0; font-size: 12px; }
          .header-kop { text-align: center; border-bottom: 3px double #0e5c44; padding-bottom: 12px; margin-bottom: 15px; }
          .header-kop h2 { margin: 0; color: #0e5c44; font-size: 18px; font-weight: 900; letter-spacing: 0.5px; }
          .header-kop h4 { margin: 3px 0 0 0; font-size: 13px; font-weight: 700; color: #334155; }
          .header-kop p { margin: 2px 0 0 0; font-size: 10px; color: #64748b; }
          
          .meta-info { margin-bottom: 15px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 8px; display: flex; justify-content: space-between; }
          .meta-info div { font-size: 11px; }

          .report-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .report-table th { background: #0e5c44; color: #ffffff; padding: 8px 10px; font-size: 10px; text-transform: uppercase; font-weight: 800; border: 1px solid #0e5c44; }
          .report-table td { padding: 7px 10px; border: 1px solid #cbd5e1; font-size: 11px; }
          .report-table tr:nth-child(even) { background: #f8fafc; }

          .cards-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
          .card-item { border: 2px solid #0e5c44; border-radius: 10px; overflow: hidden; page-break-inside: avoid; }
          .card-header { background: #0e5c44; color: white; padding: 8px 12px; text-align: center; }
          .card-title { font-weight: 900; font-size: 11px; letter-spacing: 0.5px; }
          .card-subtitle { font-size: 9px; opacity: 0.9; }
          .card-body { padding: 10px 12px; font-size: 11px; }
          .card-body .row { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dashed #e2e8f0; }
          .card-footer { background: #f1f5f9; padding: 5px 12px; font-size: 9px; text-align: center; color: #64748b; font-style: italic; }

          .ttd-section { margin-top: 30px; display: flex; justify-content: space-between; page-break-inside: avoid; }
          .ttd-box { text-align: center; width: 220px; }
          .ttd-space { height: 60px; }

          @media print {
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header-kop">
          <h2>YAYASAN DAR EL-IMAN PADANG</h2>
          <h4>SISTEM MANAJEMEN SEKOLAH TERPADU (SIMSIT)</h4>
          <p>Jl. Gajah Mada No. 28, Padang, Sumatera Barat • Telp: (0751) 123456 • Website: dareliman.sch.id</p>
        </div>

        <div style="text-align: center; margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 14px; text-transform: uppercase; color: #0f172a;">
            LAPORAN KREDENSIAL AKUN LOGIN &amp; PASSWORD PENGGUNA
          </h3>
        </div>

        <div class="meta-info">
          <div><strong>Kriteria Kategori:</strong> ${categoryText}</div>
          <div><strong>Unit Pendidikan:</strong> ${unitText}</div>
          <div><strong>Tanggal Cetak:</strong> ${today}</div>
          <div><strong>Total Akun:</strong> ${filteredUsers.length} Akun</div>
        </div>

        ${contentHtml}

        <div class="ttd-section">
          <div class="ttd-box">
            <p>Mengetahui,<br/><strong>Kepala Tata Usaha</strong></p>
            <div class="ttd-space"></div>
            <p>_______________________<br/>NIP. 19850112 201001 1 002</p>
          </div>
          <div class="ttd-box">
            <p>Padang, ${today}<br/><strong>Pengelola Sistem IT &amp; Akses</strong></p>
            <div class="ttd-space"></div>
            <p><strong>( _______________________ )</strong></p>
          </div>
        </div>
      </body>
      </html>
    `

    // Remove existing print iframe if any
    const existingFrame = document.getElementById('print-credentials-iframe')
    if (existingFrame) {
      existingFrame.remove()
    }

    // Create hidden iframe inside current page to trigger print without opening new tab
    const iframe = document.createElement('iframe')
    iframe.id = 'print-credentials-iframe'
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow.document
    doc.open()
    doc.write(fullHtmlDocument)
    doc.close()

    iframe.contentWindow.focus()
    setTimeout(() => {
      iframe.contentWindow.print()
    }, 250)
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#1B2433] dark:border dark:border-slate-800 my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FaPrint className="text-emerald-600 dark:text-emerald-400" />
              <span>Cetak Kredensial Akun &amp; Password User</span>
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Filter dan pratinjau data cetak secara langsung tanpa membuka tab browser baru.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors"
          >
            <FaTimes className="size-4" />
          </button>
        </div>

        {/* Modal Content / Filters & Live Preview */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Kriteria 1: Unit Pendidikan */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FaBuilding className="text-emerald-600" />
                <span>Kriteria 1: Unit Pendidikan</span>
              </label>
              <select
                value={filterUnit}
                onChange={(e) => setFilterUnit(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="semua">-- Semua Unit Pendidikan --</option>
                <option value="tkit">TKIT Dar El-Iman</option>
                <option value="sdit">SDIT Dar El-Iman</option>
                <option value="smpit">SMPIT Dar El-Iman</option>
                <option value="smait">SMAIT Dar El-Iman</option>
                <option value="ponpes">Pondok Pesantren</option>
                <option value="mahad">Ma'had Aly</option>
                <option value="yayasan">Yayasan / General</option>
              </select>
            </div>

            {/* Kriteria 2: Kategori Pengguna */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FaFilter className="text-emerald-600" />
                <span>Kriteria 2: Kategori Pengguna</span>
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="semua">-- Semua Kategori (Pegawai, Guru, Siswa, Ortu, Admin) --</option>
                <option value="pegawai">Pegawai / Staf Administrasi</option>
                <option value="guru">Guru / Tenaga Pendidik</option>
                <option value="siswa">Siswa / Santri</option>
                <option value="orangtua">Orang Tua / Wali Murid</option>
                <option value="standalone">Administrator Standalone</option>
              </select>
            </div>
          </div>

          {/* Kriteria 3: Format Cetak */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-2">
              Format Tampilan Cetak:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPrintFormat('table')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                  printFormat === 'table'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <FaFilePdf className="size-4" />
                <span>1. Tabel Laporan A4</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('cards')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                  printFormat === 'cards'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <FaIdCard className="size-4" />
                <span>2. Slip Kartu Individual</span>
              </button>
            </div>
          </div>

          {/* Live In-Modal Preview Box */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Pratinjau Dokumen Cetak ({filteredUsers.length} Akun):
              </span>
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                Live Preview
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 font-sans text-slate-800 dark:text-slate-100 text-xs space-y-3">
              <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <div className="font-black text-emerald-800 dark:text-emerald-400 text-sm">YAYASAN DAR EL-IMAN PADANG</div>
                <div className="font-bold text-slate-700 dark:text-slate-300 text-xs">LAPORAN KREDENSIAL AKUN LOGIN &amp; PASSWORD</div>
                <div className="text-[10px] text-slate-500">Unit: {filterUnit.toUpperCase()} | Category: {filterCategory}</div>
              </div>

              {printFormat === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-emerald-800 text-white font-bold">
                        <th className="p-1.5 text-center">NO</th>
                        <th className="p-1.5">NAMA</th>
                        <th className="p-1.5">EMAIL / ID LOGIN</th>
                        <th className="p-1.5">ROLE</th>
                        <th className="p-1.5 text-center">PASSCODE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {filteredUsers.slice(0, 5).map((u, idx) => (
                        <tr key={u.id || idx}>
                          <td className="p-1.5 text-center">{idx + 1}</td>
                          <td className="p-1.5 font-bold">{u.name}</td>
                          <td className="p-1.5 font-mono">{u.email}</td>
                          <td className="p-1.5">{getUserRoleName(u) || 'Role'}</td>
                          <td className="p-1.5 text-center font-bold text-emerald-700 dark:text-emerald-400">********</td>
                        </tr>
                      ))}
                      {filteredUsers.length > 5 && (
                        <tr>
                          <td colSpan={5} className="p-2 text-center text-[10px] italic text-slate-500">
                            ... dan {filteredUsers.length - 5} akun lainnya akan disertakan saat cetak.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {filteredUsers.slice(0, 4).map((u, idx) => (
                    <div key={u.id || idx} className="rounded-xl border border-emerald-600 bg-white dark:bg-slate-800 p-2 text-[10px]">
                      <div className="font-extrabold text-emerald-800 dark:text-emerald-400 border-b pb-1">SLIP AKUN - {u.name}</div>
                      <div className="mt-1 font-mono text-[9px] truncate">User: {u.email}</div>
                      <div className="font-bold text-emerald-700">Pass: ********</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-5 py-2 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30 cursor-pointer transition-all"
          >
            <FaPrint className="size-3.5" />
            <span>Cetak / Print PDF Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function AccountModal({ open, user, roles = [], saving, onClose, onSave, roleOnly = false }) {
  const [method, setMethod] = useState('linked') // 'linked' (Tarik Data) vs 'manual' (Stand-Alone Admin)
  const [entityCategory, setEntityCategory] = useState('employee') // 'employee', 'student', 'parent'
  const [entitySearch, setEntitySearch] = useState('')
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [dynamicEntities, setDynamicEntities] = useState([])
  const [loadingEntities, setLoadingEntities] = useState(false)

  const [form, setForm] = useState(emptyForm)
  const editing = Boolean(user?.id)

  // Fetch real entity list whenever entityCategory or open changes
  useEffect(() => {
    if (!open || editing) return
    setLoadingEntities(true)
    if (entityCategory === 'employee') {
      employeeService
        .getDaftar({ per_page: 50 })
        .then((res) => {
          const raw = res?.data?.data || res?.data || []
          if (Array.isArray(raw) && raw.length > 0) {
            const mapped = raw.map((item) => ({
              id: item.id,
              name: item.name || item.nama || item.full_name,
              code: item.niy ? `NIY: ${item.niy}` : item.nik ? `NIK: ${item.nik}` : `ID: ${item.id}`,
              unit: item.unit?.name || item.unit_name || 'Pegawai Sekolah',
              email: item.email || `${String(item.name).toLowerCase().replace(/\s+/g, '.')}@darel-iman.sch.id`,
              phone: item.no_hp || item.phone || '',
              defaultRole: 'Guru',
            }))
            setDynamicEntities(mapped)
          } else {
            setDynamicEntities(SAMPLE_EMPLOYEES)
          }
        })
        .catch(() => setDynamicEntities(SAMPLE_EMPLOYEES))
        .finally(() => setLoadingEntities(false))
    } else if (entityCategory === 'student') {
      studentService
        .getDaftar({ per_page: 50 })
        .then((res) => {
          const raw = res?.data?.data || res?.data || []
          if (Array.isArray(raw) && raw.length > 0) {
            const mapped = raw.map((item) => ({
              id: item.id,
              name: item.full_name || item.nama || item.name,
              code: item.nisn ? `NISN: ${item.nisn}` : item.nis ? `NIS: ${item.nis}` : `ID: ${item.id}`,
              unit: item.kelas?.nama || item.unit?.name || 'Siswa Active',
              email: item.email || `${item.nisn || item.id}@siswa.darel-iman.sch.id`,
              phone: item.phone || item.no_hp || '',
              defaultRole: 'Siswa',
            }))
            setDynamicEntities(mapped)
          } else {
            setDynamicEntities(SAMPLE_STUDENTS)
          }
        })
        .catch(() => setDynamicEntities(SAMPLE_STUDENTS))
        .finally(() => setLoadingEntities(false))
    } else if (entityCategory === 'parent') {
      setDynamicEntities(SAMPLE_PARENTS)
      setLoadingEntities(false)
    }
  }, [open, entityCategory, editing])

  // Filtered entity search
  const filteredEntities = useMemo(() => {
    if (!entitySearch) return dynamicEntities
    return dynamicEntities.filter(
      (e) =>
        e.name?.toLowerCase().includes(entitySearch.toLowerCase()) ||
        e.code?.toLowerCase().includes(entitySearch.toLowerCase()) ||
        e.unit?.toLowerCase().includes(entitySearch.toLowerCase())
    )
  }, [dynamicEntities, entitySearch])

  // Role options calculation depending on method and entityCategory
  const currentRoles = useMemo(() => {
    if (method === 'manual') {
      return STANDALONE_ADMIN_ROLES
    }
    if (entityCategory === 'employee') return EMPLOYEE_ROLES
    if (entityCategory === 'student') return STUDENT_ROLES
    if (entityCategory === 'parent') return PARENT_ROLES
    return DEFAULT_SYSTEM_ROLES
  }, [method, entityCategory])

  // Sync Form State when Modal opens
  useEffect(() => {
    if (!open) return
    if (editing && user) {
      const userRoleName = getUserRoleName(user)
      setForm({
        ...emptyForm,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: userRoleName || 'Guru',
        is_active: Boolean(user.is_active ?? true),
        person_type: user.person_type || 'standalone',
        person_id: user.person_id || null,
      })
      setMethod('manual')
    } else {
      setForm({
        ...emptyForm,
        role: 'Guru',
        person_type: 'employee',
      })
      setMethod('linked')
      setEntityCategory('employee')
      setSelectedEntity(null)
      setEntitySearch('')
    }
  }, [open, user, editing])

  const handleSwitchMethod = (newMethod) => {
    setMethod(newMethod)
    if (newMethod === 'manual') {
      setSelectedEntity(null)
      setForm((prev) => ({
        ...prev,
        name: '',
        email: '',
        phone: '',
        role: 'Super Admin',
        person_type: 'standalone',
        person_id: null,
      }))
    } else {
      const defaultRole = entityCategory === 'employee' ? 'Guru' : entityCategory === 'student' ? 'Siswa' : 'Orang Tua'
      setForm((prev) => ({
        ...prev,
        role: defaultRole,
        person_type: entityCategory,
      }))
    }
  }

  const handleSwitchCategory = (cat) => {
    setEntityCategory(cat)
    setSelectedEntity(null)
    const defaultRole = cat === 'employee' ? 'Guru' : cat === 'student' ? 'Siswa' : 'Orang Tua'
    setForm((prev) => ({
      ...prev,
      role: defaultRole,
      person_type: cat,
      person_id: null,
    }))
  }

  if (!open) return null

  const handleSelectEntity = (entity) => {
    setSelectedEntity(entity)
    setForm((prev) => ({
      ...prev,
      name: entity.name,
      email: entity.email || prev.email,
      phone: entity.phone || prev.phone,
      role: entity.defaultRole || currentRoles[0],
      person_type: entityCategory,
      person_id: entity.id,
    }))
  }

  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = (event) => {
    event.preventDefault()
    if (!editing && form.password !== form.password_confirmation) {
      Swal.fire('Password Tidak Cocok', 'Password baru dan konfirmasi password harus sama.', 'warning')
      return
    }

    if (!editing && method === 'linked' && !selectedEntity) {
      Swal.fire('Pilih Data Entitas', 'Silakan pilih salah satu nama Pegawai/Guru, Siswa, atau Orang Tua dari daftar.', 'warning')
      return
    }

    const payload = roleOnly
      ? { role: form.role }
      : editing
      ? {
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          role: form.role,
          is_active: form.is_active,
        }
      : {
          ...form,
          creation_method: method,
          person_type: method === 'manual' ? 'standalone' : entityCategory,
          person_id: method === 'manual' ? null : selectedEntity?.id || null,
          employee_id: entityCategory === 'employee' ? selectedEntity?.id : null,
          student_id: entityCategory === 'student' ? selectedEntity?.id : null,
          parent_id: entityCategory === 'parent' ? selectedEntity?.id : null,
        }

    onSave(payload)
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm overflow-y-auto">
      <form onSubmit={submit} className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#1B2433] dark:border dark:border-slate-800 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FaUserShield className="text-emerald-600 dark:text-emerald-400" />
              <span>{roleOnly ? 'Edit Akun Unit' : editing ? 'Edit Akun Login' : 'Tambah Akun Login Baru'}</span>
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {editing
                ? 'Perbarui informasi dan role akses akun login terdaftar.'
                : 'Pilih metode pembuatan akun: tarik dari data terdaftar atau input manual admin standalone.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors"
          >
            <FaTimes className="size-4" />
          </button>
        </div>

        {/* Method Selector Tabs (Only when Creating New Account) */}
        {!editing && !roleOnly && (
          <div className="p-4 pb-0 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-2">
              Metode Pembuatan Akun:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSwitchMethod('linked')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                  method === 'linked'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <FaUserTie className="size-3.5" />
                <span>1. Tarik Data Terdaftar</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMethod('manual')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                  method === 'manual'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <FaUserShield className="size-3.5" />
                <span>2. Manual (Admin Standalone)</span>
              </button>
            </div>
          </div>
        )}

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* METHOD 1: LINKED ENTITY LOOKUP */}
          {!editing && !roleOnly && method === 'linked' && (
            <div className="space-y-3.5 rounded-2xl p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40">
              <label className="block text-xs font-extrabold text-emerald-900 dark:text-emerald-300">
                Langkah 1: Pilih Kategori Entitas Terdaftar
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSwitchCategory('employee')}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                    entityCategory === 'employee'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FaUserTie className="size-4" />
                  <span>Pegawai / Guru</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchCategory('student')}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                    entityCategory === 'student'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FaGraduationCap className="size-4" />
                  <span>Siswa</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchCategory('parent')}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                    entityCategory === 'parent'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FaUserFriends className="size-4" />
                  <span>Orang Tua / Wali</span>
                </button>
              </div>

              {/* Entity Search & Dropdown List */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Langkah 2: Cari &amp; Pilih Nama {entityCategory === 'employee' ? 'Pegawai / Guru' : entityCategory === 'student' ? 'Siswa' : 'Orang Tua'}
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
                  <input
                    type="text"
                    value={entitySearch}
                    onChange={(e) => setEntitySearch(e.target.value)}
                    placeholder={`Cari nama, ${entityCategory === 'employee' ? 'NIP/NIY' : entityCategory === 'student' ? 'NISN' : 'No. HP'}...`}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                  {loadingEntities ? (
                    <div className="p-3 text-center text-xs text-slate-400">Memuat data entitas...</div>
                  ) : filteredEntities.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">Data entitas tidak ditemukan.</div>
                  ) : (
                    filteredEntities.map((entity) => {
                      const isSelected = selectedEntity?.id === entity.id
                      return (
                        <div
                          key={entity.id}
                          onClick={() => handleSelectEntity(entity)}
                          className={`p-2.5 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-emerald-100/90 dark:bg-emerald-950/80 font-bold text-emerald-900 dark:text-emerald-200'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div>
                            <div className="font-extrabold flex items-center gap-1.5">
                              <span>{entity.name}</span>
                              {isSelected && <FaCheckCircle className="text-emerald-600 size-3" />}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                              {entity.code} • {entity.unit}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            Pilih
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FORM FIELDS */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2 text-xs font-extrabold text-slate-700 dark:text-slate-300">
              Nama Pengguna
              <input
                required
                value={form.name}
                onChange={(e) => change('name', e.target.value)}
                placeholder="Masukkan nama pengguna"
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </label>

            <label className="sm:col-span-2 text-xs font-extrabold text-slate-700 dark:text-slate-300">
              Username / Email Login
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => change('email', e.target.value)}
                placeholder="contoh@darel-iman.sch.id"
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </label>

            {!roleOnly && (
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Nomor HP / WhatsApp
                <input
                  value={form.phone}
                  onChange={(e) => change('phone', e.target.value)}
                  placeholder="08123456789"
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </label>
            )}

            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              Role Penugasan
              <select
                required
                value={form.role}
                onChange={(e) => change('role', e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="">-- Pilih Role --</option>
                {currentRoles.map((roleName) => (
                  <option key={roleName} value={roleName}>
                    {roleName}
                  </option>
                ))}
              </select>
            </label>

            {!roleOnly && !editing && (
              <>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Password Awal
                  <input
                    required
                    minLength={8}
                    type="password"
                    value={form.password}
                    onChange={(e) => change('password', e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </label>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Konfirmasi Password
                  <input
                    required
                    minLength={8}
                    type="password"
                    value={form.password_confirmation}
                    onChange={(e) => change('password_confirmation', e.target.value)}
                    placeholder="Ulangi password awal"
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </label>
              </>
            )}

            {!roleOnly && (
              <label className="sm:col-span-2 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 pt-1">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => change('is_active', e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-700 focus:ring-emerald-600"
                />
                Akun aktif dan diizinkan login ke portal
              </label>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-5 py-2 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30 disabled:opacity-50 cursor-pointer transition-all"
          >
            {saving ? 'Menyimpan...' : 'Simpan Akun Login'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function UserAccountManagement({
  roles = [],
  unitId = '',
  canManageGlobalAccess = false,
  canManageUnitAccess = false,
}) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [printModalOpen, setPrintModalOpen] = useState(false)

  const { data = {}, isLoading } = useQuery({
    queryKey: ['hak-akses-users', search, page, unitId],
    queryFn: () => hakAksesService.getUsers({ search, page, unit_id: unitId }),
  })

  const finish = (response) => {
    queryClient.invalidateQueries({ queryKey: ['hak-akses-users'] })
    queryClient.invalidateQueries({ queryKey: ['hak-akses-roles'] })
    setModalOpen(false)
    setSelected(null)

    const isStandalone = response?.data?.person_type === 'standalone' || response?.person_type === 'standalone'
    Swal.fire({
      icon: 'success',
      title: 'Akun Login Berhasil Disimpan',
      text: isStandalone
        ? 'Akun Administrator Mandiri (Standalone) telah dibuat dan langsung aktif.'
        : response?.message || 'Data akun login berhasil terhubung dengan data entitas terdaftar.',
      timer: 2200,
      showConfirmButton: false,
    })
  }

  const fail = (error) =>
    Swal.fire(
      'Gagal',
      error.response?.data?.message || Object.values(error.response?.data?.errors || {})[0]?.[0] || 'Operasi akun gagal.',
      'error'
    )

  const create = useMutation({ mutationFn: hakAksesService.tambahUser, onSuccess: finish, onError: fail })
  const update = useMutation({ mutationFn: hakAksesService.ubahUser, onSuccess: finish, onError: fail })
  const remove = useMutation({ mutationFn: hakAksesService.hapusUser, onSuccess: finish, onError: fail })
  const roleOnly = canManageUnitAccess && !canManageGlobalAccess

  const save = (payload) =>
    selected
      ? update.mutate({ id: selected.id, payload })
      : canManageGlobalAccess && create.mutate(payload)

  const resetPassword = async (user) => {
    const result = await Swal.fire({
      title: `Reset password ${user.name}`,
      html:
        '<input id="new-password" type="password" class="swal2-input" placeholder="Password baru"><input id="confirm-password" type="password" class="swal2-input" placeholder="Konfirmasi password"><p style="font-size:12px;color:#64748b">Minimal 8 karakter: huruf besar-kecil, angka, dan simbol.</p>',
      showCancelButton: true,
      confirmButtonText: 'Reset password',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#065f46',
      preConfirm: () => {
        const password = document.getElementById('new-password').value
        const confirmation = document.getElementById('confirm-password').value
        if (!password || password !== confirmation) {
          Swal.showValidationMessage('Password dan konfirmasi harus sama.')
          return false
        }
        return { password, password_confirmation: confirmation }
      },
    })
    if (!result.isConfirmed) return
    try {
      const response = await hakAksesService.resetPassword({ id: user.id, payload: result.value })
      finish(response)
    } catch (error) {
      fail(error)
    }
  }

  const deleteUser = async (user) => {
    const result = await Swal.fire({
      title: `Hapus akun ${user.name}?`,
      text: 'Akun akan dikeluarkan dari semua sesi dan tidak dapat login lagi.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hapus akun',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
    })
    if (result.isConfirmed) remove.mutate(user.id)
  }

  const users = data.data || []
  const meta = data.meta || {}

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Cari nama atau email login..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Cetak Data Login Button */}
          <button
            type="button"
            onClick={() => setPrintModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-100/90 text-sky-700 hover:bg-sky-600 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-600 dark:hover:text-white px-4 py-2.5 text-xs font-extrabold transition-all duration-200 hover:shadow-md hover:shadow-sky-600/30 cursor-pointer"
          >
            <FaPrint /> Cetak Data Login &amp; Password
          </button>

          {canManageGlobalAccess && (
            <button
              onClick={() => {
                setSelected(null)
                setModalOpen(false)
                setTimeout(() => setModalOpen(true), 10)
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              <FaPlus /> Tambah Akun Login Baru
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Pengguna</th>
              <th className="px-4 py-3">Tipe &amp; Entitas</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-xs text-slate-400">
                  Memuat akun...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-xs text-slate-400">
                  Akun tidak ditemukan.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const roleDisplay = getUserRoleName(user) || 'Tanpa role'
                const personType = user.person_type || (roleDisplay === 'Siswa' ? 'student' : roleDisplay === 'Orang Tua' ? 'parent' : 'employee')

                return (
                  <tr key={user.id} className="hover:bg-emerald-50/30">
                    <td className="px-4 py-3">
                      <p className="font-extrabold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {personType === 'standalone' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <FaUserShield className="size-3" /> Standalone Admin
                        </span>
                      ) : personType === 'student' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                          <FaGraduationCap className="size-3" /> Entitas Siswa
                        </span>
                      ) : personType === 'parent' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
                          <FaUserFriends className="size-3" /> Entitas Orang Tua
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <FaUserTie className="size-3" /> Entitas Pegawai/Guru
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        {roleDisplay}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                          <FaUserCheck /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                          <FaUserTimes /> Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <ActionDropdown
                          onEdit={() => {
                            setSelected(user)
                            setModalOpen(true)
                          }}
                          onDelete={canManageGlobalAccess ? () => deleteUser(user) : undefined}
                          extraItems={
                            canManageGlobalAccess || canManageUnitAccess
                              ? [
                                  {
                                    label: 'Reset Password',
                                    icon: <FaKey className="h-4 w-4 text-amber-500" />,
                                    onClick: () => resetPassword(user),
                                  },
                                ]
                              : []
                          }
                        />
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {meta.last_page > 1 && (
        <div className="flex items-center justify-end gap-3 text-xs">
          <button
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
            className="rounded-lg border px-3 py-2 disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <span>
            {page} / {meta.last_page}
          </span>
          <button
            disabled={page >= meta.last_page}
            onClick={() => setPage((value) => value + 1)}
            className="rounded-lg border px-3 py-2 disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>
      )}

      {/* Modals */}
      <AccountModal
        open={modalOpen}
        user={selected}
        roles={roles}
        roleOnly={roleOnly}
        saving={create.isPending || update.isPending}
        onClose={() => {
          setModalOpen(false)
          setSelected(null)
        }}
        onSave={save}
      />

      <PrintCredentialsModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        users={users}
      />
    </div>
  )
}
