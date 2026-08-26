import { useState, useEffect } from 'react'
import { KeyRound, Eye, EyeOff, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react'
import Swal from 'sweetalert2'
import { familyPortalService } from '../../services/familyPortalService'
import { Button } from '@/components/tailgrids/core/button'
import { Badge } from '@/components/tailgrids/core/badge'
import { Alert, AlertContent, AlertDescription, AlertIndicator } from '@/components/tailgrids/core/alert'
import { Card } from '@/components/tailgrids/core/card'

export default function ChildPasswordManagementCard() {
  const [children, setChildren] = useState([])
  const [selectedChildId, setSelectedChildId] = useState('')
  const [loadingChildren, setLoadingChildren] = useState(true)

  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let active = true
    setLoadingChildren(true)
    familyPortalService
      .children()
      .then((res) => {
        if (!active) return
        const list = res.data || []
        setChildren(list)
        if (list.length > 0) {
          setSelectedChildId(list[0].id)
        }
      })
      .catch(() => {
        if (active) setChildren([])
      })
      .finally(() => {
        if (active) setLoadingChildren(false)
      })

    return () => {
      active = false
    }
  }, [])

  const selectedChild = children.find((c) => String(c.id) === String(selectedChildId)) || children[0]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedChildId) {
      Swal.fire('Pilih Anak', 'Silakan pilih anak terlebih dahulu.', 'warning')
      return
    }

    if (form.password.length < 6) {
      Swal.fire('Password Kurang Panjang', 'Password baru anak minimal harus 6 karakter.', 'warning')
      return
    }

    if (form.password !== form.confirmPassword) {
      Swal.fire('Konfirmasi Password Tidak Cocok', 'Password baru dan konfirmasi password harus sama.', 'warning')
      return
    }

    setSubmitting(true)
    setSuccessMessage('')

    try {
      await familyPortalService.updateChildPassword(selectedChildId, {
        password: form.password,
        password_confirmation: form.confirmPassword,
      })

      const childName = selectedChild?.full_name || selectedChild?.nama_lengkap || 'anak'
      setSuccessMessage(`Password login untuk ${childName} berhasil diperbarui!`)
      setForm({ password: '', confirmPassword: '' })

      Swal.fire({
        icon: 'success',
        title: 'Password Anak Berhasil Diperbarui',
        text: `Password login Portal Siswa untuk ${childName} telah berhasil diperbarui.`,
        timer: 2500,
        showConfirmButton: false,
      })
    } catch (err) {
      console.error('Gagal ganti password anak:', err)
      const msg = err.response?.data?.message || 'Gagal memperbarui password login anak.'
      Swal.fire('Gagal Mengubah Password', msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingChildren) {
    return (
      <Card className="rounded-[18px] border border-slate-200/80 bg-white p-8 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
        <p className="mt-3 text-xs font-semibold text-slate-500">Memuat data anak...</p>
      </Card>
    )
  }

  return (
    <Card className="w-full rounded-[22px] border-2 border-emerald-500/25 bg-white p-6 lg:p-8 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <KeyRound className="h-5 w-5" />
            </span>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Pengaturan Password Login Anak</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Tentukan atau reset password yang digunakan anak Anda untuk login ke Portal Siswa.
          </p>
        </div>

        <Badge color="emerald" size="md">
          Akses Orang Tua Active
        </Badge>
      </div>

      {successMessage && (
        <Alert status="success" className="mt-4 rounded-xl">
          <AlertIndicator>
            <CheckCircle2 className="h-5 w-5" />
          </AlertIndicator>
          <AlertContent>
            <AlertDescription>{successMessage}</AlertDescription>
          </AlertContent>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-5">
        {/* Child Selector */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">Pilih Anak</label>
          {children.length > 0 ? (
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-bold outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.full_name || child.nama_lengkap} — {child.kelas?.nama_kelas || child.unit_name || 'Sekolah'} (NIS: {child.nis || '-'})
                </option>
              ))}
            </select>
          ) : (
            <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
              Belum ada data anak terhubung.
            </p>
          )}
        </div>

        {selectedChild && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-200 font-black text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                {(selectedChild.full_name || 'A')[0]}
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {selectedChild.full_name || selectedChild.nama_lengkap}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {selectedChild.unit_name || 'Sekolah Terpadu'} · Kelas {selectedChild.kelas?.nama_kelas || '-'}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-emerald-200/60 pt-3 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
              <span>Username/Identifier Login: <b>{selectedChild.nis || selectedChild.nisn || selectedChild.full_name}</b></span>
              <span>Role Login: <b>Siswa</b></span>
            </div>
          </div>
        )}

        {/* New Password & Confirmation */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">Password Baru Anak</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimal 6 karakter..."
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">Konfirmasi Password Baru</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Ulangi password baru..."
              required
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          pending={submitting}
          disabled={submitting || !selectedChildId}
          className="flex items-center justify-center gap-2"
        >
          {!submitting && <ShieldCheck className="h-4 w-4" />}
          <span>{submitting ? 'Menyimpan...' : 'Simpan Password Login Anak'}</span>
        </Button>
      </form>
    </Card>
  )
}

