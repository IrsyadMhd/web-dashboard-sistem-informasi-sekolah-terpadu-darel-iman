# TOOLS.md — Web Dashboard (React/Vite)

Jalankan dari root repo dashboard. Shell dev: Windows (PowerShell / Git Bash).

## Prasyarat

Node 20/22 LTS (Dockerfile memakai `node:22-slim`), npm ≥ 9. Backend Laravel harus hidup di `http://localhost:8000` untuk dev.

## Perintah npm

| Perintah | Fungsi |
|---|---|
| `npm ci` | Instal bersih sesuai lockfile (dipakai Docker). Gunakan `npm install` hanya saat menambah dependensi. |
| `npm run dev` | Vite dev server, default `http://localhost:5173` (HMR; pre-warm halaman utama via `server.warmup`). |
| `npm run build` | Build produksi ke `dist/` (target `esnext`, manual chunks vendor-*). |
| `npm run preview` | Pratinjau hasil build. |
| `npm run lint` | `oxlint` (config `.oxlintrc.json`: react + oxc; `rules-of-hooks` = error). |

Tidak ada script test. Verifikasi = lint + build + cek manual di browser.

## Environment (`.env`, semua `VITE_*` tertanam saat build)

| Variabel | Arti |
|---|---|
| `VITE_API_BASE_URL` | Base API, mis. `http://localhost:8000/api`. Jika kosong: port 5173 → `http(s)://<host>:8000/api`, selain itu `<origin>/api`. |
| `VITE_BACKEND_URL` | Origin backend (aset/storage). |
| `VITE_WS_URL` | URL gateway produksi, mis. `wss://ws.domain.com` (wajib `wss://` di HTTPS). |
| `VITE_WS_PORT` | Port WS dev (default 6001) bila `VITE_WS_URL` kosong. |

Akses dari HP/LAN: ganti `localhost` dengan IP LAN mesin dev, jalankan `npm run dev -- --host`. Env di shell mengalahkan `.env`.

## Docker / Deploy

`Dockerfile` multi-stage: build (node:22-slim, `ARG VITE_API_BASE_URL`, `VITE_WS_URL`, heap 4GB) → `nginx:stable-alpine` dengan `nginx.conf` (SPA fallback, gzip, cache aset 1 tahun, `sw.js`/`index.html` no-cache). Target: Easypanel (amd64 & arm64). Mengubah env produksi = **rebuild** dengan Build Args, bukan restart.

## Debug

- 401 → interceptor menghapus sesi & redirect `/masuk?reason=expired` (kecuali token berawalan `dev-test-token`).
- Gagal fetch/CORS: pastikan backend jalan & mengizinkan origin `:5173`.
- Cache modul rusak: hapus `node_modules` + `package-lock.json` hanya jika benar-benar perlu (lebih baik `npm ci`).
- `vite:preloadError` → halaman reload otomatis (normal setelah restart dev server).
- Service worker hanya didaftarkan di produksi; di dev otomatis di-unregister.

## Alat Agent yang Disarankan

- Cari konsumen endpoint: Grep path API di `src/services`.
- Cari komponen reusable: `src/components/app/index.jsx` lebih dulu.
- Pengecekan UI: Claude Preview / browser pane bila tersedia; kalau tidak, nyatakan tidak diuji visual.
- Referensi library (HeroUI v3, React Router 7, TanStack Query 5, Tailwind 4): ambil dokumentasi terkini (Context7) — API-nya berbeda dari versi lama.
