# MEMORY.md — Web Dashboard (React)

Memori proyek lintas sesi (di-commit bersama kode): fakta tahan lama, keputusan, jebakan. Bukan log harian. Ikuti "Aturan Memperbarui" di bawah.

## Gambaran

SPA dashboard SIMS Darel Iman: ~100+ halaman di `src/pages` (master data, siswa/pegawai, presensi, laporan, LMS 15+ modul, Tahfizh, Mutaba'ah, dashboard per-role, portal keluarga & alumni, chat pegawai, kelola navigasi menu, hak akses, maintenance data hub, pengaturan sistem). Mengonsumsi backend Laravel; realtime via `web-socket`.

## Fakta Teknis

- Entry: `src/main.jsx` → `App.jsx` → `routes/index.jsx` (semua halaman `lazy`, ada error boundary & `useSearchParams`).
- Auth: `src/stores/authStore.js` (`checkSessionValidity`, `clearAuthArtifacts`), token `school_erp_token` di local/sessionStorage; `api.js` menolak request bila sesi tak valid & redirect `/masuk`. Halaman login: `/masuk`. Event global `auth-session-cleared`.
- Portal per role ditentukan `src/auth/portalResolver.js`; navigasi/menu datang dari backend (`navigationService.js`, `useNavigation.js`), bukan hard-code.
- WebSocket: `src/services/websocketService.js` — fallback host: jika hostname mengandung `dareliman.sch.id` → `wss://ws.dareliman.sch.id`; selain itu `VITE_WS_URL`, lalu `host:VITE_WS_PORT`. Saat ini hanya subscribe `user.{id}` (`ChatGuruWorkspace.jsx`); `student.{id}` belum (lihat C3 di `../web-socket/CHECKLIST-PERBAIKAN.md`).
- Build: manual chunks (`vendor-react`, `-chart`, `-motion`, `-ui`, `-icons`, `-query`, `-form`, `-misc`). React + router + react-dom wajib satu chunk.
- PWA: `public/sw.js`, `manifest.json`; hanya aktif di produksi.

## Jebakan Umum

1. **README tidak sinkron**: menyebut folder `web-dashboard/`, Vite 8 + "TailGrids/React Aria" sebagai UI. Kenyataan: komponen berbasis **HeroUI v3 + Base UI + React Aria**, dengan primitif sendiri di `components/app` dan `components/ui`. README juga memuat kredensial uji — jangan menyalinnya ke kode/commit baru.
2. **`.env` tidak di-ignore** (`.gitignore` hanya `*.local`). Isinya sekarang hanya URL lokal; jangan pernah isi rahasia. Pertimbangkan menambah `.env` ke `.gitignore` bila user setuju.
3. **`VITE_*` baked-in**: bug "masih memanggil URL lama" di produksi = belum rebuild.
4. `VITE_WS_URL` kosong di produksi → klien memakai `host:6001` yang tidak bisa diakses di Easypanel (HTTPS hanya 443). Mixed-content bila `ws://` di halaman HTTPS.
5. Ada file sampah di root & `src/` (`oxlint_out.json` 800KB, `parse_results.txt`, `tahfizh_parse.txt`, `scratch_buttons_no_click.json`, `src/query_db.*`) — artefak lokal, abaikan.
6. `src/utils/cn.js` dan `cn.ts` ganda; impor yang sudah ada dibiarkan, jangan konsolidasi tanpa diminta.
7. `optionalDependencies` memuat `@rolldown/binding-darwin-x64` (artefak lockfile macOS) — normal, jangan dihapus sembarangan; Docker butuh binding linux-arm64/amd64 (image Debian, bukan Alpine, untuk build).
8. Dev: port `5173` → API otomatis `:8000` pada host yang sama (mendukung akses LAN tanpa set env).

## Keputusan yang Sudah Diambil

- Lazy-load semua halaman + prefetch rute untuk performa.
- Semua HTTP lewat `services/*Service.js` + instance `api`; data server di TanStack Query.
- UI mengikuti sistem desain internal (`components/app`); dark mode via class `dark`.
- Otorisasi final di backend; UI hanya menyesuaikan tampilan menurut menu/permission dari API.

## Status & Keputusan Terbaru

_(Tambah baris baru di atas, format `YYYY-MM-DD — ringkas`. Pangkas yang usang.)_

- 2026-11-06 — AGENTS.md/MEMORY.md/TOOLS.md dibuat. Commit terakhir: "add pengaturan password", "edit styel", merge upstream `bnwsolusind:main`.

## Aturan Memperbarui Berkas Ini

- Catat hanya yang tak bisa diturunkan dari kode/git: keputusan + alasan, jebakan, status lintas-sesi.
- Tanpa secret/password/data pribadi/log sesi. Jangan salin kode.
- Verifikasi fakta sebelum diandalkan; hapus yang sudah salah.
- Perubahan lintas-repo (kontrak API, event realtime): catat juga di MEMORY.md repo terkait.
