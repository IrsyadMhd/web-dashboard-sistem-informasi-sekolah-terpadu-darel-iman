# AGENTS.md — Web Dashboard SIMS Darel Iman (React SPA)

Panduan kerja wajib untuk agent AI di repo ini. Baca bersama [MEMORY.md](MEMORY.md) dan [TOOLS.md](TOOLS.md). Bahasa komunikasi, teks UI, dan komentar domain: **Bahasa Indonesia**.

## Konteks Sistem (3 repo, satu produk)

| Folder (di `EDU-VENDOR/`) | Peran |
|---|---|
| `backend-sistem-informasi-sekolah-terpadu-darel-iman` | REST API Laravel (`/api`, `/api/v1`). Sumber kebenaran data, role, permission, menu. |
| `web-dashboard-sistem-informasi-sekolah-terpadu-darel-iman` | **Repo ini.** SPA untuk Super Admin, Yayasan, Kepala Sekolah, TU, Guru, Guru Tahfizh, Wali Kelas, portal keluarga/alumni. |
| `web-socket` | Gateway realtime (`ws`). Dashboard subscribe channel `user.{id}`; backend mem-publish. |

Dashboard **tidak punya logika otorisasi sendiri yang final** — backend yang memutuskan. UI hanya menyembunyikan/menampilkan; jangan mengandalkannya untuk keamanan. Jika butuh endpoint/field baru, jangan mengarang: cari di `backend…/routes/api.php` dan controller-nya; bila belum ada, sampaikan ke user bahwa backend perlu diubah.

## Stack

React 19, Vite 8 (rolldown), React Router 7, Tailwind CSS v4 (`@tailwindcss/vite`), HeroUI v3 + React Aria + Base UI, TanStack Query v5 & Table v8, Zustand 5, react-hook-form + zod, axios, Recharts, framer-motion, lucide-react, sonner, xlsx. Linter: **oxlint**. Bahasa: JavaScript/JSX (ada sedikit `.ts`); alias `@` → `src/`.

## Struktur & Konvensi

- `src/pages/*Page.jsx` — satu halaman per rute; didaftarkan **lazy** di `src/routes/index.jsx` (+ `routePrefetch.js` untuk prefetch). Halaman baru = file page + entri rute + (jika perlu) menu via backend `AppNavigationSeeder`.
- `src/services/*Service.js` — seluruh pemanggilan API; memakai instance `api` dari `src/services/api.js` (axios, interceptor token & 401). **Jangan** memanggil `axios`/`fetch` langsung dari komponen.
- `src/components/app/*` — primitif aplikasi (`AppButton`, `AppDataTable`, `AppModal`, `AppPageLayout`, `FormField`, `ConfirmDialog`, `ExportDialog`, `ImportDialog`, dll., diekspor via `index.jsx`). **Pakai ini dulu** sebelum membuat komponen baru. `src/components/ui/*` = primitif gaya shadcn/HeroUI. Komponen domain di subfolder (`siswa`, `pegawai`, `mutabaah`, `tahfizh`, …).
- `src/stores/*` (Zustand): `authStore` (token, sesi), `pengaturanStore`, `unitStore`. Data server → TanStack Query, bukan Zustand.
- `src/hooks/*`, `src/utils/*` (`cn.js` untuk class merging, `exportUtils`, `printHelper`, `spreadsheetParser`), `src/auth/portalResolver.js` (tentukan portal berdasar role).
- Styling: utility Tailwind + `cn()`; tema light/dark lewat class `dark` pada `<html>` (kunci `localStorage.theme`). Dukung dark mode & layar mobile (ada `AppBottomNavigation`, `MobileDataCard`, PWA `public/sw.js`).
- Token tersimpan di `localStorage`/`sessionStorage` kunci `school_erp_token`. Jangan ubah kunci ini.
- Realtime: lewat `src/services/websocketService.js` (singleton). Jangan membuat koneksi WebSocket baru di komponen.
- Konfigurasi runtime hanya lewat `import.meta.env.VITE_*` (`VITE_API_BASE_URL`, `VITE_BACKEND_URL`, `VITE_WS_URL`, `VITE_WS_PORT`). Nilai `VITE_*` **tertanam saat build** → ganti nilai = rebuild.

## Alur Kerja Setiap Sesi

1. Baca `MEMORY.md` ("Jebakan Umum", "Status Terbaru"); `git status` + `git log -5`.
2. Cari pola terdekat: halaman sejenis di `src/pages`, service sejenis di `src/services`, komponen di `components/app`. Tiru, jangan menciptakan pola baru.
3. Ubah seminimal mungkin; tidak ada refactor/format massal di luar permintaan. Teks UI Bahasa Indonesia.
4. Verifikasi: `npm run lint` (oxlint) dan `npm run build` untuk perubahan non-trivial. Untuk perubahan UI, jalankan `npm run dev` dan periksa di browser (golden path + dark mode + lebar mobile) bila memungkinkan; jika tidak bisa, katakan jelas bahwa UI belum diuji visual. Repo belum punya test otomatis.
5. Jika API berubah/dibutuhkan: sebutkan dampak pada backend; bila file backend perlu diubah, itu pekerjaan di repo lain — konfirmasi dulu.
6. Akhir sesi: perbarui `MEMORY.md` bila ada keputusan/jebakan/status baru.

## Aturan Keras

- Hooks harus patuh `react/rules-of-hooks` (error di oxlint). Komponen halaman diekspor `default` agar `lazy()` bekerja.
- Jangan menambah dependensi tanpa alasan; periksa dulu apakah sudah ada (HeroUI, lucide, recharts, xlsx, zod, sonner, dll.). Gunakan `npm ci`/`npm install` sesuai `package-lock.json`; jangan hapus lockfile.
- Jangan commit `dist/`, `node_modules/`, `.env` berisi kredensial/URL privat. (`.env` saat ini hanya URL lokal, tetapi **tidak** ada di `.gitignore` — jangan tambahkan rahasia.)
- Jangan menaruh data pribadi siswa/pegawai, token, atau kredensial uji baru di kode.
- File sampah di root (`oxlint_out.json`, `parse_results.txt`, `tahfizh_parse.txt`, `scratch_buttons_no_click.json`, `src/query_db.js|cjs`) bukan bagian aplikasi — jangan diedit atau dijadikan pola; jangan buat file serupa (pakai scratchpad/tmp).
- Perubahan `vite.config.js` `manualChunks` harus menjaga React/Router/ReactDOM dalam satu chunk (komentar di file menjelaskan alasannya).

## Git

Commit hanya bila diminta. Pesan singkat imperatif. Repo ini bergabung dengan upstream (`Merge branch 'bnwsolusind:main'`): hindari rewrite history, jangan force-push, dan hati-hati dengan konflik merge pada file besar (`routes/index.jsx`, halaman besar).
