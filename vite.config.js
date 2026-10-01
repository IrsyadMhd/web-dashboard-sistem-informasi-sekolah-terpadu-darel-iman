import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    warmup: {
      clientFiles: [
        './src/main.jsx',
        './src/routes/index.jsx',
        './src/routes/routePrefetch.js',
        './src/layouts/DashboardLayout.jsx',
        './src/pages/DashboardPage.jsx',
        './src/pages/SuperAdminDashboardPage.jsx',
        './src/pages/MonitoringDivisiPage.jsx',
        './src/pages/StudentsPage.jsx',
        './src/pages/EmployeesPage.jsx',
        './src/pages/AttendancePage.jsx',
      ],
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          // 1. React Core & Routing (Wajib satu kelompok untuk mencegah multiple React instances)
          if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('/react/')) {
            return 'vendor-react'
          }

          // 2. Visualisasi Grafik & Charting
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'vendor-chart'
          }

          // 3. Pustaka Animasi Kompleks
          if (id.includes('framer-motion')) {
            return 'vendor-motion'
          }

          // 4. Komponen TailGrids & UI Primitives (React Aria, Base UI, Tailwind Utilities)
          if (
            id.includes('@base-ui') ||
            id.includes('react-aria') ||
            id.includes('@floating-ui') ||
            id.includes('tailwind-merge') ||
            id.includes('class-variance-authority') ||
            id.includes('clsx')
          ) {
            return 'vendor-ui'
          }

          // 5. Ikon (TailGrids & Lucide)
          if (id.includes('lucide-react') || id.includes('@tailgrids/icons')) {
            return 'vendor-icons'
          }

          // 6. Data Fetching, Table Engine, & Cache Management
          if (id.includes('@tanstack') || id.includes('axios')) {
            return 'vendor-query'
          }

          // 7. Form Management, Validasi Schema, & Global State
          if (
            id.includes('react-hook-form') ||
            id.includes('@hookform') ||
            id.includes('zod') ||
            id.includes('sweetalert2') ||
            id.includes('zustand')
          ) {
            return 'vendor-form'
          }

          return 'vendor-misc'
        },
      },
    },
  },
})
