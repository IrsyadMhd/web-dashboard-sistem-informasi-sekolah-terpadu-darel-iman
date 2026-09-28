import React, { useState, useEffect } from 'react'
import { FileSpreadsheet, Save, X, Calendar, CheckCircle2, AlertCircle, FileText, Send } from 'lucide-react'
import Swal from '@/components/tailgrids/compat/swal-tailgrids'
import { OverlayWrapper, Backdrop } from '@/components/tailgrids/core/overlay'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/tailgrids/core/dialog'
import { Button } from '@/components/tailgrids/core/button'
import { TextField } from '@/components/tailgrids/core/text-field'
import { FieldLabel, FieldDescription, FieldError } from '@/components/tailgrids/core/field'
import { Input } from '@/components/tailgrids/core/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/tailgrids/core/select'
import { dashboardPemantauanService } from '../../services/dashboardPemantauanService'

const BULAN_LIST = [
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
]

export default function InputLaporanBulananModal({
  isOpen,
  onClose,
  unitName = 'Unit Sekolah',
  onSuccess,
}) {
  const currentDate = new Date()
  const defaultMonth = String(currentDate.getMonth() + 1)
  const defaultYear = currentDate.getFullYear()

  const [bulan, setBulan] = useState(defaultMonth)
  const [tahun, setTahun] = useState(defaultYear)
  const [judulLaporan, setJudulLaporan] = useState('')
  const [ringkasanLaporan, setRingkasanLaporan] = useState('')
  const [tindakLanjut, setTindakLanjut] = useState('')
  const [statusValidasi, setStatusValidasi] = useState('diajukan')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Update automatic title when month or unit changes
  useEffect(() => {
    if (isOpen) {
      const monthObj = BULAN_LIST.find((b) => b.value === String(bulan))
      const monthName = monthObj ? monthObj.label : ''
      setJudulLaporan(`Laporan Kinerja & Evaluasi Bulanan - ${monthName} ${tahun}`)
      setErrors({})
    }
  }, [isOpen, bulan, tahun])

  const validate = () => {
    const errs = {}
    if (!judulLaporan.trim()) errs.judulLaporan = 'Judul laporan wajib diisi'
    if (!ringkasanLaporan.trim()) errs.ringkasanLaporan = 'Ringkasan laporan kinerja wajib diisi'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const payload = {
        bulan: parseInt(bulan, 10),
        tahun: parseInt(tahun, 10),
        judul_laporan: judulLaporan.trim(),
        ringkasan_laporan: ringkasanLaporan.trim(),
        tindak_lanjut: tindakLanjut.trim() || null,
        status_validasi: statusValidasi,
        data_tambahan: {
          unit_pelapor: unitName,
          waktu_input: new Date().toISOString(),
        },
      }

      await dashboardPemantauanService.tambahLaporanBulanan(payload)

      await Swal.fire({
        icon: 'success',
        title: 'Laporan Berhasil Terkirim!',
        text: `Laporan bulanan ${judulLaporan} telah berhasil disimpan dan diteruskan ke Pengurus Yayasan & Divisi Pendidikan.`,
        confirmButtonColor: '#0E5C44',
      })

      // Reset form
      setRingkasanLaporan('')
      setTindakLanjut('')
      onClose()
      if (onSuccess) onSuccess()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Gagal menyimpan laporan bulanan. Pastikan data valid.'
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan Laporan',
        text: msg,
        confirmButtonColor: '#0E5C44',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <OverlayWrapper isOpen={isOpen}>
      <Backdrop isOpen={isOpen} onOpenChange={onClose} />
      <Dialog
        isOpen={isOpen}
        onOpenChange={onClose}
        className="max-w-2xl w-full p-0 overflow-hidden border-2 border-emerald-500/30 bg-white dark:border-emerald-600/40 dark:bg-[#1B2433] rounded-[24px] shadow-2xl transition-all"
      >
        {/* Header Dialog */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 p-5 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-inner">
                <FileSpreadsheet className="h-6 w-6 text-emerald-100" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-white tracking-tight">
                  Input Laporan Kinerja Bulanan
                </DialogTitle>
                <DialogDescription className="text-xs font-medium text-emerald-100/90 mt-0.5">
                  Laporan resmi operasional kepala sekolah ({unitName}) untuk Divisi Pendidikan & Yayasan
                </DialogDescription>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-emerald-100/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body Dialog */}
        <form onSubmit={handleSubmit}>
          <DialogBody className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Periode Bulan & Tahun */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <FieldLabel className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 block">
                  Bulan Laporan
                </FieldLabel>
                <select
                  value={bulan}
                  onChange={(e) => setBulan(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 transition-all"
                >
                  {BULAN_LIST.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 block">
                  Tahun
                </FieldLabel>
                <input
                  type="number"
                  min="2020"
                  max="2035"
                  value={tahun}
                  onChange={(e) => setTahun(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 transition-all"
                />
              </div>

              <div>
                <FieldLabel className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 block">
                  Status Pengajuan
                </FieldLabel>
                <select
                  value={statusValidasi}
                  onChange={(e) => setStatusValidasi(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 transition-all"
                >
                  <option value="diajukan">Ajukan Sekarang (Diajukan)</option>
                  <option value="draf">Simpan Sebagai Draf</option>
                </select>
              </div>
            </div>

            {/* Judul Laporan */}
            <div>
              <FieldLabel className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 block">
                Judul Laporan <span className="text-rose-500">*</span>
              </FieldLabel>
              <input
                type="text"
                value={judulLaporan}
                onChange={(e) => setJudulLaporan(e.target.value)}
                placeholder="Contoh: Laporan Evaluasi & Kinerja Bulanan - September 2026"
                className={`w-full h-10 px-3.5 rounded-xl border text-xs font-semibold text-slate-800 outline-none transition-all dark:bg-slate-900 dark:text-slate-100 ${
                  errors.judulLaporan
                    ? 'border-rose-400 bg-rose-50/50 dark:border-rose-600'
                    : 'border-slate-200 bg-slate-50 focus:border-emerald-500 focus:bg-white dark:border-slate-700'
                }`}
              />
              {errors.judulLaporan && (
                <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.judulLaporan}</p>
              )}
            </div>

            {/* Ringkasan Laporan Kinerja */}
            <div>
              <FieldLabel className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 block">
                Ringkasan Capaian & Kinerja Unit <span className="text-rose-500">*</span>
              </FieldLabel>
              <textarea
                rows={4}
                value={ringkasanLaporan}
                onChange={(e) => setRingkasanLaporan(e.target.value)}
                placeholder="Tuliskan capaian akademik, perkembangan tahfizh, kedisiplinan guru & siswa, serta program unit yang telah terealisasi..."
                className={`w-full p-3 rounded-xl border text-xs font-medium text-slate-800 outline-none transition-all dark:bg-slate-900 dark:text-slate-100 leading-relaxed ${
                  errors.ringkasanLaporan
                    ? 'border-rose-400 bg-rose-50/50 dark:border-rose-600'
                    : 'border-slate-200 bg-slate-50 focus:border-emerald-500 focus:bg-white dark:border-slate-700'
                }`}
              />
              {errors.ringkasanLaporan ? (
                <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.ringkasanLaporan}</p>
              ) : (
                <FieldDescription className="text-[11px] text-slate-400 mt-1">
                  Mencakup persentase kehadiran, kelulusan juz tahfizh, kegiatan ekstrakurikuler, dan tata kelola unit.
                </FieldDescription>
              )}
            </div>

            {/* Kendala & Rencana Tindak Lanjut */}
            <div>
              <FieldLabel className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 block">
                Kendala Lapangan & Rencana Tindak Lanjut Solutif
              </FieldLabel>
              <textarea
                rows={3}
                value={tindakLanjut}
                onChange={(e) => setTindakLanjut(e.target.value)}
                placeholder="Tuliskan hambatan yang dihadapi unit sekolah dan solusi/bantuan yang diharapkan dari yayasan/divisi..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 transition-all leading-relaxed"
              />
            </div>
          </DialogBody>

          {/* Footer Dialog */}
          <DialogFooter className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-4 text-xs font-bold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="rounded-xl px-5 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Simpan & Kirim Laporan</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </OverlayWrapper>
  )
}
