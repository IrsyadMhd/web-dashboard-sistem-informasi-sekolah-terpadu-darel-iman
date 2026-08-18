import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Terapkan tema tersimpan sebelum React dirender agar tidak terjadi kilatan tema
// terang ketika pengguna sebelumnya memilih night mode.
const savedTheme = localStorage.getItem('theme')
document.documentElement.classList.toggle('dark', savedTheme === 'dark')
document.body.classList.toggle('dark', savedTheme === 'dark')
document.documentElement.style.colorScheme = savedTheme === 'dark' ? 'dark' : 'light'

if (import.meta.env.PROD) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    })
  }
} else if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => registrations.forEach((registration) => registration.unregister()))
      .catch(() => {})
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
