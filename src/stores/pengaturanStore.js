import { create } from 'zustand'
import { siteSettingService } from '../services/siteSettingService'

const STORAGE_KEY = 'pengaturan_dashboard'

export const INITIAL_FAQS = [
  {
    id: 'faq-1',
    category: 'Keamanan & Akun',
    question: 'Bagaimana cara mengganti kata sandi (password) akun SIMSIT saya?',
    answer: `Anda dapat mengubah kata sandi kapan saja demi keamanan akun:
1. Buka menu Profil Akun di pojok kanan atas topbar.
2. Pilih tab Keamanan & Kata Sandi.
3. Masukkan kata sandi lama, lalu ketikkan kata sandi baru minimal 8 karakter.
4. Klik Simpan Perubahan Kata Sandi.

*Jika Anda lupa kata sandi lama, silakan hubungi Administrator TU Sekolah untuk mengajukan reset password.*`,
    tags: ['password', 'ganti password', 'lupa password', 'profil', 'keamanan', 'akun'],
    actionUrl: '/dashboard/profil-akun',
    actionLabel: 'Buka Profil Akun',
  },
  {
    id: 'faq-2',
    category: 'Absensi Digital',
    question: 'Bagaimana prosedur penanganan siswa yang tidak melakukan tap kartu di gerbang?',
    answer: `Jika siswa lupa membawa kartu NFC/QR atau gerbang sedang dalam perawatan:
1. Wali Kelas atau TU dapat masuk ke menu Absensi > Koreksi & Permohonan Izin.
2. Pilih nama siswa yang bersangkutan pada tanggal berjalan.
3. Ubah status kehadiran secara manual menjadi Hadir (Koreksi TU/Walas) atau masukkan keterangan Izin/Sakit.
4. Simpan data agar sistem merekap kehadiran secara akurat pada laporan harian.`,
    tags: ['absensi', 'gerbang', 'kartu nfc', 'qr code', 'koreksi', 'walas', 'tu'],
    actionUrl: '/absensi/koreksi',
    actionLabel: 'Halaman Koreksi Absensi',
  },
  {
    id: 'faq-3',
    category: 'Tahfizh & Mutabaah',
    question: 'Bagaimana cara input setoran Ziyadah & Murajaah harian santri/siswa?',
    answer: `Guru Tahfizh atau Musyrif dapat mencatat hafalan siswa dengan langkah berikut:
1. Akses menu Tahfizh > Input Setoran.
2. Pilih halaqah, kelas, dan nama santri.
3. Pilih Jenis Setoran (Ziyadah hafalan baru atau Muraja'ah pengulangan).
4. Tentukan Surah, Ayat Awal hingga Ayat Akhir, Nilai/Predikat Kelancaran, serta Catatan Tajwid.
5. Klik Simpan Setoran. Wali murid akan otomatis menerima pemberitahuan di Portal Orang Tua.`,
    tags: ['tahfizh', 'setoran', 'ziyadah', 'murajaah', 'quran', 'halaqah', 'musyrif'],
    actionUrl: '/dashboard/tahfizh',
    actionLabel: 'Kelola Tahfizh',
  },
  {
    id: 'faq-4',
    category: 'Akademik & LMS',
    question: 'Bagaimana cara mencetak Rapor Pembelajaran & LMS siswa?',
    answer: `Untuk mencetak Rapor Semester maupun Rapor Perkembangan:
1. Wali Kelas atau Divisi Akademik masuk ke menu Akademik / LMS > Nilai & Rapor.
2. Pilih Tahun Ajaran, Semester, dan Rombel Kelas.
3. Klik tombol Pratinjau Rapor pada siswa yang diinginkan atau gunakan tombol Cetak Masal (PDF).
4. Pastikan semua nilai formatif, sumatif, dan catatan wali kelas sudah terisi lengkap.`,
    tags: ['rapor', 'lms', 'cetak pdf', 'nilai', 'akademik', 'semester', 'walas'],
    actionUrl: '/dashboard/akademik/nilai-rapor',
    actionLabel: 'Menu Nilai & Rapor',
  },
  {
    id: 'faq-5',
    category: 'Kesiswaan',
    question: 'Bagaimana cara melakukan pengajuan Mutasi Siswa masuk/keluar?',
    answer: `Proses Administrasi Mutasi Siswa dikelola melalui portal Tata Usaha & Yayasan:
1. Masuk ke Kesiswaan > Data Siswa atau Dashboard Yayasan > Mutasi Siswa.
2. Klik tombol Tambah Data Mutasi.
3. Pilih status (Mutasi Masuk atau Mutasi Keluar), masukkan nomor surat keputusan, sekolah tujuan/asal, dan dokumen pendukung.
4. Setelah disetujui oleh Kepala Sekolah & Yayasan, status aktif siswa akan disesuaikan secara otomatis.`,
    tags: ['mutasi', 'siswa', 'kesiswaan', 'pindah sekolah', 'surat', 'yayasan'],
    actionUrl: '/dashboard/yayasan/mutasi-siswa',
    actionLabel: 'Menu Mutasi Siswa',
  },
  {
    id: 'faq-6',
    category: 'Absensi Digital',
    question: 'Bagaimana verifikasi permohonan surat Izin / Sakit siswa dari Orang Tua?',
    answer: `Wali Kelas dapat memverifikasi permohonan izin online yang diajukan orang tua melalui Portal Orang Tua:
1. Buka menu Absensi > Verifikasi Izin.
2. Anda akan melihat daftar surat izin masuk lengkap dengan foto/lampiran surat dokter.
3. Klik tombol Setujui atau Tolak disertai alasan jika diperlukan.
4. Status absensi siswa pada rentang tanggal tersebut akan otomatis berubah di rekap harian & bulanan.`,
    tags: ['izin', 'sakit', 'verifikasi', 'orang tua', 'walas', 'absensi'],
    actionUrl: '/absensi/verifikasi-izin',
    actionLabel: 'Verifikasi Surat Izin',
  },
  {
    id: 'faq-7',
    category: 'Keamanan & Akun',
    question: 'Saya memiliki pesan error "Akses Ditolak / Forbidden", apa artinya?',
    answer: `Pesan "Akses Ditolak" muncul apabila akun Anda tidak memiliki Hak Akses / Permission Role untuk membuka halaman tersebut:
- SIMSIT menerapkan sistem perizinan ketat berdasarkan peran (Super Admin, Yayasan, Kepsek, Guru, TU, Musyrif, Orang Tua, Siswa).
- Jika Anda merasa seharusnya berhak mengakses halaman tersebut, silakan hubungi Operator IT / TU untuk memperbarui Hak Akses akun Anda pada menu Master Hak Akses.`,
    tags: ['akses ditolak', 'forbidden', 'hak akses', 'role', 'permission', 'admin'],
    actionUrl: null,
    actionLabel: null,
  },
  {
    id: 'faq-8',
    category: 'Kepegawaian',
    question: 'Bagaimana cara memperbarui data profil Guru & Pegawai?',
    answer: `Perubahan data mandiri pegawai dapat dilakukan di menu Profil Akun tab Informasi Pribadi.
Untuk perubahan data administratif seperti Nomor NUPTK, SK Pengangkatan, Jabatan Struktural, dan Unit Penugasan, pengubahan harus dilakukan oleh Staf TU / HRD melalui menu Pegawai & SDM.`,
    tags: ['pegawai', 'guru', 'sdm', 'nuptk', 'sk', 'profil', 'tu'],
    actionUrl: '/dashboard/profil-akun',
    actionLabel: 'Kelola Profil Pegawai',
  },
]

export const INITIAL_MANUALS = [
  {
    id: 'man-1',
    title: 'Buku Panduan Guru & Wali Kelas SIMSIT',
    version: 'v2.4 (Terbaru 2026)',
    size: '3.8 MB',
    format: 'PDF',
    target: 'Guru Mata Pelajaran, Guru Tahfizh, Wali Kelas',
    desc: 'Panduan lengkap penginputan absensi kelas, LMS, kisi-kisi, penugasan, dan pengisian catatan rapor.',
    url: '#',
  },
  {
    id: 'man-2',
    title: 'Buku Panduan Tata Usaha & Staf Administrasi',
    version: 'v2.4 (Terbaru 2026)',
    size: '4.5 MB',
    format: 'PDF',
    target: 'Operator TU, Staf Kepegawaian, Admin Unit',
    desc: 'Petunjuk operasional data kesiswaan, mutasi, master data tahun ajaran, dan pengelolaan akun pengguna.',
    url: '#',
  },
  {
    id: 'man-3',
    title: 'Buku Panduan Musyrif & Guru Tahfizh Al-Qur’an',
    version: 'v2.1 (Terbaru 2026)',
    size: '2.9 MB',
    format: 'PDF',
    target: 'Musyrif Asrama, Ustadz Tahfizh, Pembimbing',
    desc: 'Manual pencatatan setoran ziyadah, muraja’ah, rekap juziyyah, serta absensi ibadah santri.',
    url: '#',
  },
  {
    id: 'man-4',
    title: 'Buku Panduan Portal Orang Tua & Siswa',
    version: 'v1.8 (Terbaru 2026)',
    size: '2.1 MB',
    format: 'PDF',
    target: 'Wali Murid & Santri Yayasan Darel Iman',
    desc: 'Panduan pemantauan kehadiran anak, pengajuan izin online, grafik mutabaah, dan nilai rapor digital.',
    url: '#',
  },
]

export const defaultPengaturan = {
  application_name: 'Sistem Manajemen Sekolah',
  school_name: 'YAYASAN DAR EL - IMAN',
  logo_text: 'YDE',
  logo_url: '',
  favicon_url: '',
  footer_text: 'Jl. Pendidikan No. 1, Kota Padang',
  header_style: 'light',
  header_sticky: true,
  sidebar_style: 'light',
  sidebar_position: 'left',
  sidebar_collapsed: false,
  template: 'modern',
  sidebar_color: '#0E5C44',
  sidebar_accent_color: '#3FBF75',
  body_color: '#F7F9FC',
  header_color: '#FFFFFF',
  custom_faqs: INITIAL_FAQS,
  custom_manuals: INITIAL_MANUALS,
}

function readCached() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return {
      ...defaultPengaturan,
      ...saved,
      custom_faqs: saved.custom_faqs || INITIAL_FAQS,
      custom_manuals: saved.custom_manuals || INITIAL_MANUALS,
    }
  } catch {
    return defaultPengaturan
  }
}

function cache(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export const usePengaturanStore = create((set, get) => ({
  pengaturan: readCached(),
  loading: false,
  initialized: false,
  async muatPengaturan() {
    if (get().loading) return
    set({ loading: true })
    try {
      const fetched = await siteSettingService.get()
      const pengaturan = {
        ...defaultPengaturan,
        ...fetched,
        custom_faqs: fetched.custom_faqs || get().pengaturan.custom_faqs || INITIAL_FAQS,
        custom_manuals: fetched.custom_manuals || get().pengaturan.custom_manuals || INITIAL_MANUALS,
      }
      cache(pengaturan)
      set({ pengaturan, initialized: true })
    } catch {
      set({ initialized: true })
    } finally {
      set({ loading: false })
    }
  },
  previewPengaturan(payload) {
    set({ pengaturan: { ...get().pengaturan, ...payload } })
  },
  async simpanPengaturan(payload, files) {
    let savedBackend = {}
    try {
      savedBackend = await siteSettingService.update(payload, files)
    } catch (e) {
      console.warn('Backend update skipped, saving to store local cache:', e)
    }
    const pengaturan = {
      ...get().pengaturan,
      ...payload,
      ...savedBackend,
    }
    cache(pengaturan)
    set({ pengaturan })
    return pengaturan
  },
}))
