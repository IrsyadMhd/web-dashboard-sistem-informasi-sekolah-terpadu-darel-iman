# Web Dashboard - Sistem Manajemen Sekolah Islam Terpadu

Antarmuka web dashboard berbasis modern Single Page Application (SPA) untuk Sistem Manajemen Sekolah Islam Terpadu, melayani berbagai peran pengguna (Super Admin, Pengurus Yayasan, Kepala Sekolah, Tata Usaha, Guru Mapel, Guru Tahfizh, dan Wali Kelas).

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom TailGrids UI System
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Server Cache & Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **UI Primitives**: [React Aria](https://react-spectrum.adobe.com/react-aria/) + [Framer Motion](https://www.framer.com/motion/)
- **Icons**: Lucide React + TailGrids Icons
- **Visualisasi & Grafik**: [Recharts](https://recharts.org/)
- **Linter**: [Oxlint](https://oxc.rs/)

---

## 📋 Prasyarat Sistem

Sebelum memulai instalasi, pastikan sistem Anda telah terpasang:
- **Node.js**: Versi `18.x` atau `20.x` (LTS sangat disarankan). Periksa dengan `node -v`.
- **npm**: Versi `9.x` atau lebih baru. Periksa dengan `npm -v`.
- **Backend API**: Backend Laravel telah terpasang dan berjalan (biasanya di `http://localhost:8000`).

---

## 🚀 Panduan Instalasi & Menjalankan

Ikuti langkah-langkah berikut untuk menginstal dan menjalankan `web-dashboard`:

### 1. Masuk ke Direktori Proyek
Buka terminal dan navigasikan ke folder `web-dashboard`:
```bash
cd web-dashboard
```

### 2. Pasang Dependensi (Install Dependencies)
Jalankan perintah berikut untuk menginstal seluruh pustaka yang dibutuhkan:
```bash
npm install
```

### 3. Konfigurasi Environment (`.env`)
Salin file contoh konfigurasi `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Buka file `.env` dan pastikan URL endpoint backend sesuai dengan konfigurasi Anda:
```env
# Mode Lokal (Default)
VITE_API_BASE_URL=http://localhost:8000/api
VITE_BACKEND_URL=http://localhost:8000

# Port WebSocket untuk notifikasi real-time (opsional)
VITE_WS_PORT=6001
```

> **Catatan Pengujian LAN (Akses HP/Tablet dalam 1 Wi-Fi)**:  
> Jika Anda ingin mengakses aplikasi dari perangkat lain dalam satu jaringan Wi-Fi, ganti `localhost` dengan IP lokal komputer server (contoh: `http://192.168.1.7:8000/api`).

### 4. Menjalankan Server Development
Jalankan development server Vite:
```bash
npm run dev
```

Setelah server aktif, terminal akan menampilkan URL lokal:
```text
  VITE v8.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Buka browser dan akses alamat **`http://localhost:5173/`**.

---

## 🔑 Kredensial Akun Masuk (Login Uji Coba)

Gunakan kredensial default seeder berikut untuk menguji berbagai peran dashboard:

| Peran (Role) | Email Login | Kata Sandi (Password) | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@dareliman.sch.id` | `SuperAdmin@2026!` *(atau `Password123!`)* | Konfigurasi sistem, master unit & pengguna |
| **Pengurus Yayasan** | `yayasan@dareliman.sch.id` | `Yayasan@2026!` *(atau `Password123!`)* | Executive Dashboard & Monitoring lintas unit |
| **Kepala Sekolah** | `kepsek@dareliman.sch.id` | `Kepsek@2026!` | Supervisi akademik, guru, siswa & presensi |
| **Tata Usaha (TU)** | `tu@dareliman.sch.id` | `TU@2026!` | Operasional harian, pendaftaran & persuratan |
| **Guru Mapel** | `guru@dareliman.sch.id` | `Guru@2026!` | LMS, materi ajar, nilai ujian & presensi kelas |
| **Guru Tahfizh** | `guru.tahfizh@dareliman.sch.id` | `Tahfizh@2026!` | Halaqah Al-Qur'an, setoran & mutaba'ah |

---

## 📦 Script npm yang Tersedia

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server development Vite dengan Hot Module Replacement (HMR). |
| `npm run build` | Melakukan kompilasi & bundling aset siap rilis ke folder `dist/`. |
| `npm run preview` | Menjalankan server lokal untuk menguji pratinjau hasil build `dist/`. |
| `npm run lint` | Menjalankan linter Oxlint untuk memeriksa kualitas kode. |

---

## 📂 Struktur Direktori Utama

```text
web-dashboard/
├── public/                 # Aset statis publik (favicon, logo, dll)
├── src/
│   ├── assets/             # Gambar & ikon statis internal
│   ├── components/         # Komponen UI (TailGrids core, cards, tables, modals)
│   │   ├── app/            # Komponen layout aplikasi (Breadcrumb, Shell, Sidebar, dll)
│   │   └── tailgrids/      # TailGrids design system UI primitives
│   ├── hooks/              # Custom React hooks (useDebounce, useAuth, dll)
│   ├── layouts/            # Template layout (DashboardLayout, AuthLayout)
│   ├── pages/              # Halaman-halaman rute aplikasi
│   ├── routes/             # Definisi rute React Router & route prefetching
│   ├── services/           # HTTP API client Axios & endpoint services
│   ├── store/              # Zustand global state management
│   ├── App.jsx             # Root React component
│   ├── index.css           # Konfigurasi Tailwind CSS v4 & tema warna
│   └── main.jsx            # Entry point aplikasi React
├── .env.example            # Template variabel lingkungan
├── package.json            # Daftar dependensi & script npm
└── vite.config.js          # Konfigurasi bundling Vite & manual chunking
```

---

## ⚠️ Troubleshooting Umum

1. **Gagal Fetch / Network Error pada Login**:
   - Pastikan backend Laravel sudah berjalan via `php artisan serve` (port 8000).
   - Periksa apakah URL pada file `.env` sudah benar (`VITE_API_BASE_URL=http://localhost:8000/api`).
   - Pastikan CORS di Laravel sudah mengizinkan origin `http://localhost:5173`.

2. **Port 5173 Sedang Digunakan**:
   - Jika port 5173 sedang dipakai oleh proses lain, Vite secara otomatis akan berpindah ke port berikutnya (misal `5174`), atau Anda dapat menentukan port spesifik dengan flag:
     ```bash
     npm run dev -- --port 3000
     ```

3. **Membersihkan Cache Dependensi**:
   - Jika terjadi kendala modul setelah update paket:
     ```bash
     rm -rf node_modules package-lock.json
     npm install
     ```


---

## 🌐 Panduan Deployment Server: Staging & Production

### 1. Informasi Domain Resmi
- **Staging Web Dashboard**: `https://demoedu.dareliman.sch.id/dashboard` (Root: `https://demoedu.dareliman.sch.id`)
- **Staging Backend API**: `https://demoapi.dareliman.sch.id/api/v1`
- **Production Web Dashboard**: `https://edu.dareliman.sch.id/dashboard`
- **Production Backend API**: `https://api.dareliman.sch.id/api/v1`

### 2. Prosedur Deploy Staging di Server Web

Jika server web saat ini berada di branch `main`, lakukan langkah berikut untuk beralih ke branch `staging` dan melakukan build:

```bash
# 1. Masuk ke folder web-dashboard di server
cd /var/www/dareliman-staging-web

# 2. Amankan perubahan sementara
git stash

# 3. Ambil branch staging terbaru dari GitHub
git fetch origin

# 4. Pindah ke branch staging
git checkout -B staging origin/staging
git pull origin staging

# 5. Pasang dependensi dan build dengan target API staging
npm ci
VITE_API_BASE_URL="https://demoapi.dareliman.sch.id/api/v1" npm run build
```

### 3. Konfigurasi Virtual Host Nginx (`demoedu.dareliman.sch.id`)

```nginx
server {
    listen 80;
    server_name demoedu.dareliman.sch.id;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name demoedu.dareliman.sch.id;

    ssl_certificate /etc/letsencrypt/live/demoedu.dareliman.sch.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/demoedu.dareliman.sch.id/privkey.pem;

    root /var/www/dareliman-staging-web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /dashboard {
        try_files $uri $uri/ /index.html;
    }
}
```
